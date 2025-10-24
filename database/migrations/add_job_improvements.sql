-- Migration: Job System Improvements
-- Adds: Stored procedures, idempotency tracking, dead letter queue, and job events

-- ============================================================================
-- 1. Job Idempotency Tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS job_idempotency (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key TEXT UNIQUE NOT NULL,
  job_table TEXT NOT NULL,
  job_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX idx_job_idempotency_key ON job_idempotency(idempotency_key);
CREATE INDEX idx_job_idempotency_expires ON job_idempotency(expires_at);

COMMENT ON TABLE job_idempotency IS 'Tracks job creation idempotency to prevent duplicates';

-- Auto-cleanup expired idempotency records
CREATE OR REPLACE FUNCTION cleanup_expired_idempotency()
RETURNS void AS $$
BEGIN
  DELETE FROM job_idempotency WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. Dead Letter Queue
-- ============================================================================

CREATE TABLE IF NOT EXISTS job_dead_letter_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_job_id UUID NOT NULL,
  job_type TEXT NOT NULL,
  job_table TEXT NOT NULL,
  payload JSONB NOT NULL,
  error_message TEXT,
  error_details JSONB,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  retry_after TIMESTAMP WITH TIME ZONE,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by TEXT
);

CREATE INDEX idx_dlq_job_id ON job_dead_letter_queue(original_job_id);
CREATE INDEX idx_dlq_created_at ON job_dead_letter_queue(created_at);
CREATE INDEX idx_dlq_resolved ON job_dead_letter_queue(resolved) WHERE NOT resolved;
CREATE INDEX idx_dlq_retry_after ON job_dead_letter_queue(retry_after) WHERE NOT resolved;

COMMENT ON TABLE job_dead_letter_queue IS 'Stores failed jobs for manual review and retry';

-- ============================================================================
-- 3. Job Event Log (Audit Trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS job_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL,
  job_type TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'created', 'started', 'completed', 'failed', 'retried'
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT
);

CREATE INDEX idx_job_events_job_id ON job_events(job_id, created_at DESC);
CREATE INDEX idx_job_events_type ON job_events(event_type, created_at DESC);

COMMENT ON TABLE job_events IS 'Complete audit trail of all job state changes';

-- ============================================================================
-- 4. Stored Procedures for Atomic Operations
-- ============================================================================

-- Update message job counts atomically
CREATE OR REPLACE FUNCTION update_message_job_counts(p_job_id UUID)
RETURNS void AS $$
DECLARE
  v_total INTEGER;
  v_completed INTEGER;
  v_failed INTEGER;
  v_processing INTEGER;
  v_pending INTEGER;
  v_new_status TEXT;
BEGIN
  -- Get counts by status
  SELECT
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*) FILTER (WHERE status = 'failed'),
    COUNT(*) FILTER (WHERE status = 'processing'),
    COUNT(*) FILTER (WHERE status = 'pending'),
    COUNT(*)
  INTO v_completed, v_failed, v_processing, v_pending, v_total
  FROM message_job_recipients
  WHERE job_id = p_job_id;

  -- Determine overall job status
  IF v_completed + v_failed = v_total THEN
    v_new_status := 'completed';
  ELSIF v_processing > 0 OR v_pending > 0 THEN
    v_new_status := 'processing';
  ELSIF v_failed > 0 THEN
    v_new_status := 'failed';
  ELSE
    v_new_status := 'pending';
  END IF;

  -- Update job record atomically
  UPDATE message_jobs
  SET
    success_count = v_completed,
    failed_count = v_failed,
    status = v_new_status,
    updated_at = NOW()
  WHERE id = p_job_id;

  -- Log event
  INSERT INTO job_events (job_id, job_type, event_type, event_data)
  VALUES (
    p_job_id,
    'message',
    'status_updated',
    jsonb_build_object(
      'status', v_new_status,
      'success_count', v_completed,
      'failed_count', v_failed
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Update upload job counts atomically
CREATE OR REPLACE FUNCTION update_upload_job_counts(p_job_id UUID)
RETURNS void AS $$
DECLARE
  v_total INTEGER;
  v_completed INTEGER;
  v_failed INTEGER;
  v_processing INTEGER;
  v_pending INTEGER;
  v_new_status TEXT;
BEGIN
  -- Get counts by status
  SELECT
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*) FILTER (WHERE status = 'failed'),
    COUNT(*) FILTER (WHERE status = 'processing'),
    COUNT(*) FILTER (WHERE status = 'pending'),
    COUNT(*)
  INTO v_completed, v_failed, v_processing, v_pending, v_total
  FROM upload_job_files
  WHERE job_id = p_job_id;

  -- Determine overall job status
  IF v_completed + v_failed = v_total THEN
    v_new_status := 'completed';
  ELSIF v_processing > 0 OR v_pending > 0 THEN
    v_new_status := 'processing';
  ELSIF v_failed > 0 THEN
    v_new_status := 'failed';
  ELSE
    v_new_status := 'pending';
  END IF;

  -- Update job record atomically
  UPDATE upload_jobs
  SET
    success_count = v_completed,
    failed_count = v_failed,
    status = v_new_status,
    updated_at = NOW()
  WHERE id = p_job_id;

  -- Log event
  INSERT INTO job_events (job_id, job_type, event_type, event_data)
  VALUES (
    p_job_id,
    'upload',
    'status_updated',
    jsonb_build_object(
      'status', v_new_status,
      'success_count', v_completed,
      'failed_count', v_failed
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Create job with items in a transaction
CREATE OR REPLACE FUNCTION create_message_job_with_items(
  p_job_data JSONB,
  p_recipients JSONB[]
)
RETURNS UUID AS $$
DECLARE
  v_job_id UUID;
  v_recipient JSONB;
BEGIN
  -- Insert job
  INSERT INTO message_jobs (
    entity_type,
    entity_id,
    job_type,
    title,
    total_recipients,
    status,
    payload
  )
  SELECT
    (p_job_data->>'entity_type')::TEXT,
    (p_job_data->>'entity_id')::UUID,
    (p_job_data->>'job_type')::TEXT,
    (p_job_data->>'title')::TEXT,
    array_length(p_recipients, 1),
    'pending',
    p_job_data
  RETURNING id INTO v_job_id;

  -- Insert all recipients
  FOREACH v_recipient IN ARRAY p_recipients
  LOOP
    INSERT INTO message_job_recipients (
      job_id,
      recipient_id,
      phone_number,
      message,
      status
    )
    VALUES (
      v_job_id,
      (v_recipient->>'recipient_id')::UUID,
      v_recipient->>'phone_number',
      v_recipient->>'message',
      'pending'
    );
  END LOOP;

  -- Log creation event
  INSERT INTO job_events (job_id, job_type, event_type, event_data)
  VALUES (
    v_job_id,
    'message',
    'created',
    jsonb_build_object('recipient_count', array_length(p_recipients, 1))
  );

  RETURN v_job_id;
END;
$$ LANGUAGE plpgsql;

-- Similar function for upload jobs
CREATE OR REPLACE FUNCTION create_upload_job_with_files(
  p_job_data JSONB,
  p_files JSONB[]
)
RETURNS UUID AS $$
DECLARE
  v_job_id UUID;
  v_file JSONB;
BEGIN
  -- Insert job
  INSERT INTO upload_jobs (
    entity_type,
    entity_id,
    job_type,
    title,
    total_files,
    status,
    payload
  )
  SELECT
    (p_job_data->>'entity_type')::TEXT,
    (p_job_data->>'entity_id')::UUID,
    (p_job_data->>'job_type')::TEXT,
    (p_job_data->>'title')::TEXT,
    array_length(p_files, 1),
    'pending',
    p_job_data
  RETURNING id INTO v_job_id;

  -- Insert all files
  FOREACH v_file IN ARRAY p_files
  LOOP
    INSERT INTO upload_job_files (
      job_id,
      original_filename,
      file_path,
      mime_type,
      size,
      status
    )
    VALUES (
      v_job_id,
      v_file->>'original_filename',
      v_file->>'file_path',
      v_file->>'mime_type',
      (v_file->>'size')::INTEGER,
      'pending'
    );
  END LOOP;

  -- Log creation event
  INSERT INTO job_events (job_id, job_type, event_type, event_data)
  VALUES (
    v_job_id,
    'upload',
    'created',
    jsonb_build_object('file_count', array_length(p_files, 1))
  );

  RETURN v_job_id;
END;
$$ LANGUAGE plpgsql;

-- Move failed job to dead letter queue
CREATE OR REPLACE FUNCTION move_to_dlq(
  p_job_id UUID,
  p_job_type TEXT,
  p_job_table TEXT,
  p_error_message TEXT,
  p_error_details JSONB,
  p_attempts INTEGER
)
RETURNS UUID AS $$
DECLARE
  v_dlq_id UUID;
  v_job_payload JSONB;
BEGIN
  -- Get job payload
  EXECUTE format('SELECT row_to_json(t) FROM %I t WHERE id = $1', p_job_table)
  INTO v_job_payload
  USING p_job_id;

  -- Insert into DLQ
  INSERT INTO job_dead_letter_queue (
    original_job_id,
    job_type,
    job_table,
    payload,
    error_message,
    error_details,
    attempts,
    retry_after
  )
  VALUES (
    p_job_id,
    p_job_type,
    p_job_table,
    v_job_payload,
    p_error_message,
    p_error_details,
    p_attempts,
    NOW() + INTERVAL '1 hour' -- Can retry after 1 hour
  )
  RETURNING id INTO v_dlq_id;

  -- Log event
  INSERT INTO job_events (job_id, job_type, event_type, event_data)
  VALUES (
    p_job_id,
    p_job_type,
    'moved_to_dlq',
    jsonb_build_object(
      'dlq_id', v_dlq_id,
      'error', p_error_message
    )
  );

  RETURN v_dlq_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. Add Priority Support
-- ============================================================================

ALTER TABLE message_jobs ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 5;
ALTER TABLE upload_jobs ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 5;

CREATE INDEX IF NOT EXISTS idx_message_jobs_priority ON message_jobs(priority DESC, created_at);
CREATE INDEX IF NOT EXISTS idx_upload_jobs_priority ON upload_jobs(priority DESC, created_at);

COMMENT ON COLUMN message_jobs.priority IS 'Job priority (1=highest, 10=lowest, 5=default)';
COMMENT ON COLUMN upload_jobs.priority IS 'Job priority (1=highest, 10=lowest, 5=default)';

-- ============================================================================
-- 6. Add Payload Column for Job Context
-- ============================================================================

ALTER TABLE message_jobs ADD COLUMN IF NOT EXISTS payload JSONB;
ALTER TABLE upload_jobs ADD COLUMN IF NOT EXISTS payload JSONB;

CREATE INDEX IF NOT EXISTS idx_message_jobs_payload ON message_jobs USING GIN (payload);
CREATE INDEX IF NOT EXISTS idx_upload_jobs_payload ON upload_jobs USING GIN (payload);

-- ============================================================================
-- 7. Triggers for Auto-updating Counts
-- ============================================================================

-- Trigger for message recipients
CREATE OR REPLACE FUNCTION trigger_update_message_job_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update counts when recipient status changes
  IF (TG_OP = 'UPDATE' AND OLD.status != NEW.status) OR TG_OP = 'INSERT' THEN
    PERFORM update_message_job_counts(NEW.job_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_message_recipient_status_changed ON message_job_recipients;
CREATE TRIGGER trg_message_recipient_status_changed
  AFTER INSERT OR UPDATE OF status ON message_job_recipients
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_message_job_counts();

-- Trigger for upload files
CREATE OR REPLACE FUNCTION trigger_update_upload_job_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update counts when file status changes
  IF (TG_OP = 'UPDATE' AND OLD.status != NEW.status) OR TG_OP = 'INSERT' THEN
    PERFORM update_upload_job_counts(NEW.job_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_upload_file_status_changed ON upload_job_files;
CREATE TRIGGER trg_upload_file_status_changed
  AFTER INSERT OR UPDATE OF status ON upload_job_files
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_upload_job_counts();

-- ============================================================================
-- 8. Cleanup Functions
-- ============================================================================

-- Cleanup old completed jobs (optional, run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_jobs(p_days_old INTEGER DEFAULT 90)
RETURNS TABLE(deleted_message_jobs INTEGER, deleted_upload_jobs INTEGER) AS $$
DECLARE
  v_cutoff TIMESTAMP;
  v_deleted_message INTEGER;
  v_deleted_upload INTEGER;
BEGIN
  v_cutoff := NOW() - (p_days_old || ' days')::INTERVAL;

  -- Delete old message jobs and their recipients
  WITH deleted AS (
    DELETE FROM message_jobs
    WHERE status = 'completed' AND updated_at < v_cutoff
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deleted_message FROM deleted;

  -- Delete old upload jobs and their files
  WITH deleted AS (
    DELETE FROM upload_jobs
    WHERE status = 'completed' AND updated_at < v_cutoff
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deleted_upload FROM deleted;

  RETURN QUERY SELECT v_deleted_message, v_deleted_upload;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 9. Helpful Views
-- ============================================================================

-- View for job health dashboard
CREATE OR REPLACE VIEW job_health_summary AS
SELECT
  'message' AS job_type,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending,
  COUNT(*) FILTER (WHERE status = 'processing') AS processing,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) FILTER (WHERE status = 'completed') AS avg_duration_seconds
FROM message_jobs
WHERE created_at > NOW() - INTERVAL '24 hours'

UNION ALL

SELECT
  'upload' AS job_type,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending,
  COUNT(*) FILTER (WHERE status = 'processing') AS processing,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) FILTER (WHERE status = 'completed') AS avg_duration_seconds
FROM upload_jobs
WHERE created_at > NOW() - INTERVAL '24 hours';

-- View for dead letter queue summary
CREATE OR REPLACE VIEW dlq_summary AS
SELECT
  job_type,
  COUNT(*) AS total_failed,
  COUNT(*) FILTER (WHERE NOT resolved) AS unresolved,
  COUNT(*) FILTER (WHERE retry_after < NOW() AND NOT resolved) AS ready_for_retry,
  MIN(created_at) AS oldest_failure,
  MAX(created_at) AS latest_failure
FROM job_dead_letter_queue
GROUP BY job_type;

-- Grant permissions
GRANT SELECT ON job_health_summary TO authenticated;
GRANT SELECT ON dlq_summary TO authenticated;
GRANT EXECUTE ON FUNCTION update_message_job_counts TO authenticated;
GRANT EXECUTE ON FUNCTION update_upload_job_counts TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_idempotency TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_jobs TO authenticated;
