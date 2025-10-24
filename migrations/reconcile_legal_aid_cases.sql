-- Migration: Reconcile Legal Aid and Cases Modules
-- Purpose: Add linkage between legal_aid_requests and cases tables
-- Date: 2025-10-03
-- Author: Claude Code

-- =====================================================
-- STEP 1: Add columns to legal_aid_requests table
-- =====================================================

-- Add escalation tracking fields
ALTER TABLE legal_aid_requests
ADD COLUMN IF NOT EXISTS escalated_to_case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS escalation_reason TEXT,
ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS escalated_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Add comments for documentation
COMMENT ON COLUMN legal_aid_requests.escalated_to_case_id IS 'Foreign key to cases table if this request was escalated to a formal case';
COMMENT ON COLUMN legal_aid_requests.escalation_reason IS 'Reason why this request was escalated (e.g., litigation required, complex dispute)';
COMMENT ON COLUMN legal_aid_requests.escalated_at IS 'Timestamp when escalation occurred';
COMMENT ON COLUMN legal_aid_requests.escalated_by IS 'User who initiated the escalation';

-- =====================================================
-- STEP 2: Add columns to cases table
-- =====================================================

-- Add source tracking fields
ALTER TABLE cases
ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS legal_aid_request_id UUID REFERENCES legal_aid_requests(id) ON DELETE SET NULL;

-- Add check constraint for source values
ALTER TABLE cases
ADD CONSTRAINT cases_source_check
CHECK (source IN ('manual', 'legal_aid', 'incident', 'whatsapp', 'email'));

-- Add comments
COMMENT ON COLUMN cases.source IS 'Source of case creation: manual, legal_aid, incident, whatsapp, email';
COMMENT ON COLUMN cases.legal_aid_request_id IS 'Foreign key to legal_aid_requests if case originated from legal aid escalation';

-- =====================================================
-- STEP 3: Create indexes for performance
-- =====================================================

-- Index on legal_aid_requests for fast case lookup
CREATE INDEX IF NOT EXISTS idx_legal_aid_escalated_case
ON legal_aid_requests(escalated_to_case_id)
WHERE escalated_to_case_id IS NOT NULL;

-- Index on cases for fast legal aid lookup
CREATE INDEX IF NOT EXISTS idx_cases_legal_aid_source
ON cases(legal_aid_request_id)
WHERE legal_aid_request_id IS NOT NULL;

-- Composite index for filtering cases by source
CREATE INDEX IF NOT EXISTS idx_cases_source_status
ON cases(source, status);

-- =====================================================
-- STEP 4: Create unified view for reporting
-- =====================================================

CREATE OR REPLACE VIEW legal_aid_with_cases AS
SELECT
  -- Legal Aid Information
  la.id AS legal_aid_id,
  la.case_number AS legal_aid_case_number,
  la.name AS beneficiary_name,
  la.phone_number,
  la.email,
  la.current_stage AS legal_aid_stage,
  la.priority AS legal_aid_priority,
  la.case_details->>'case_type' AS case_type,
  la.demographic_details->>'region_id' AS region_id,
  la.demographic_details->>'district_id' AS district_id,
  la.assigned_lawyer_id AS legal_aid_lawyer_id,
  la.created_at AS legal_aid_created_at,
  la.updated_at AS legal_aid_updated_at,

  -- Escalation Information
  la.escalated_to_case_id AS case_id,
  la.escalation_reason,
  la.escalated_at,
  la.escalated_by,

  -- Case Information (if escalated)
  c.reference_number AS case_reference_number,
  c.title AS case_title,
  c.status AS case_status,
  c.assigned_to AS case_officer_id,
  c.created_at AS case_created_at,
  c.updated_at AS case_updated_at,

  -- Status Flag
  CASE
    WHEN la.escalated_to_case_id IS NOT NULL THEN 'Escalated'
    WHEN la.current_stage LIKE 'Completed%' THEN 'Completed (Legal Aid)'
    WHEN la.current_stage LIKE 'Closed%' THEN 'Closed (Legal Aid)'
    ELSE 'Active (Legal Aid)'
  END AS overall_status

FROM legal_aid_requests la
LEFT JOIN cases c ON la.escalated_to_case_id = c.id;

-- Add comment to view
COMMENT ON VIEW legal_aid_with_cases IS 'Unified view showing legal aid requests with their escalated cases (if any)';

-- =====================================================
-- STEP 5: Create reverse view (cases with legal aid)
-- =====================================================

CREATE OR REPLACE VIEW cases_with_legal_aid AS
SELECT
  -- Case Information
  c.id AS case_id,
  c.reference_number AS case_reference_number,
  c.title,
  c.description,
  c.status AS case_status,
  c.source,
  c.assigned_to AS case_officer_id,
  c.submitted_by,
  c.created_at AS case_created_at,
  c.updated_at AS case_updated_at,

  -- Legal Aid Information (if from legal aid)
  la.id AS legal_aid_id,
  la.case_number AS legal_aid_case_number,
  la.name AS beneficiary_name,
  la.phone_number,
  la.current_stage AS legal_aid_final_stage,
  la.priority AS legal_aid_priority,
  la.case_details AS legal_aid_case_details,
  la.beneficiary_details AS beneficiary_demographics,
  la.demographic_details AS location_details,
  la.created_at AS legal_aid_created_at

FROM cases c
LEFT JOIN legal_aid_requests la ON c.legal_aid_request_id = la.id;

-- Add comment
COMMENT ON VIEW cases_with_legal_aid IS 'Shows cases with their originating legal aid request data (if applicable)';

-- =====================================================
-- STEP 6: Create statistics view
-- =====================================================

CREATE OR REPLACE VIEW legal_matters_statistics AS
SELECT
  -- Overall Counts
  (SELECT COUNT(*) FROM legal_aid_requests) AS total_legal_aid_requests,
  (SELECT COUNT(*) FROM cases) AS total_cases,

  -- Active Counts
  (SELECT COUNT(*) FROM legal_aid_requests
   WHERE current_stage NOT LIKE 'Completed%'
     AND current_stage NOT LIKE 'Closed%') AS active_legal_aid,

  (SELECT COUNT(*) FROM cases
   WHERE status NOT IN ('Resolved', 'Closed')) AS active_cases,

  -- Escalation Metrics
  (SELECT COUNT(*) FROM legal_aid_requests
   WHERE escalated_to_case_id IS NOT NULL) AS escalated_requests,

  (SELECT COUNT(*) FROM cases
   WHERE source = 'legal_aid') AS cases_from_legal_aid,

  -- Success Metrics
  (SELECT COUNT(*) FROM legal_aid_requests
   WHERE current_stage LIKE 'Completed%') AS completed_legal_aid,

  (SELECT COUNT(*) FROM cases
   WHERE status = 'Resolved') AS resolved_cases,

  -- Calculate escalation rate
  ROUND(
    (SELECT COUNT(*) FROM legal_aid_requests WHERE escalated_to_case_id IS NOT NULL)::NUMERIC /
    NULLIF((SELECT COUNT(*) FROM legal_aid_requests)::NUMERIC, 0) * 100,
    2
  ) AS escalation_rate_percentage;

-- Add comment
COMMENT ON VIEW legal_matters_statistics IS 'Aggregated statistics across legal aid and cases modules';

-- =====================================================
-- STEP 7: Create function to auto-link on case creation
-- =====================================================

CREATE OR REPLACE FUNCTION link_case_to_legal_aid()
RETURNS TRIGGER AS $$
BEGIN
  -- If a case is created with a legal_aid_request_id,
  -- automatically update the legal aid request
  IF NEW.legal_aid_request_id IS NOT NULL THEN
    UPDATE legal_aid_requests
    SET
      escalated_to_case_id = NEW.id,
      escalated_at = NEW.created_at,
      current_stage = 'Escalated to Formal Case'
    WHERE id = NEW.legal_aid_request_id
      AND escalated_to_case_id IS NULL; -- Prevent overwriting existing escalation
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_link_case_to_legal_aid ON cases;
CREATE TRIGGER trigger_link_case_to_legal_aid
  AFTER INSERT ON cases
  FOR EACH ROW
  EXECUTE FUNCTION link_case_to_legal_aid();

-- Add comment
COMMENT ON FUNCTION link_case_to_legal_aid IS 'Automatically links new cases to their originating legal aid requests';

-- =====================================================
-- STEP 8: Create function to prevent circular references
-- =====================================================

CREATE OR REPLACE FUNCTION prevent_circular_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent escalating an already-escalated request
  IF NEW.escalated_to_case_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM legal_aid_requests
      WHERE id = NEW.id
        AND escalated_to_case_id IS NOT NULL
        AND escalated_to_case_id <> NEW.escalated_to_case_id
    ) THEN
      RAISE EXCEPTION 'Legal aid request % is already escalated to case %',
        NEW.id, OLD.escalated_to_case_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_prevent_circular_escalation ON legal_aid_requests;
CREATE TRIGGER trigger_prevent_circular_escalation
  BEFORE UPDATE ON legal_aid_requests
  FOR EACH ROW
  WHEN (NEW.escalated_to_case_id IS DISTINCT FROM OLD.escalated_to_case_id)
  EXECUTE FUNCTION prevent_circular_escalation();

-- =====================================================
-- STEP 9: Add audit logging
-- =====================================================

-- Create audit table for escalations
CREATE TABLE IF NOT EXISTS legal_aid_escalation_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legal_aid_request_id UUID REFERENCES legal_aid_requests(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  escalated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  escalation_reason TEXT NOT NULL,
  escalated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Add index
CREATE INDEX idx_escalation_audit_legal_aid ON legal_aid_escalation_audit(legal_aid_request_id);
CREATE INDEX idx_escalation_audit_case ON legal_aid_escalation_audit(case_id);
CREATE INDEX idx_escalation_audit_date ON legal_aid_escalation_audit(escalated_at);

-- Add comment
COMMENT ON TABLE legal_aid_escalation_audit IS 'Audit trail of all legal aid to case escalations';

-- =====================================================
-- STEP 10: Create helper functions
-- =====================================================

-- Function to get escalation history
CREATE OR REPLACE FUNCTION get_legal_aid_escalation_history(
  p_legal_aid_id UUID
)
RETURNS TABLE (
  escalation_date TIMESTAMPTZ,
  case_reference VARCHAR,
  case_status VARCHAR,
  escalated_by_name TEXT,
  escalation_reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    audit.escalated_at,
    c.reference_number,
    c.status,
    CONCAT(u.first_name, ' ', u.last_name),
    audit.escalation_reason
  FROM legal_aid_escalation_audit audit
  LEFT JOIN cases c ON audit.case_id = c.id
  LEFT JOIN users u ON audit.escalated_by = u.id
  WHERE audit.legal_aid_request_id = p_legal_aid_id
  ORDER BY audit.escalated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate escalation metrics
CREATE OR REPLACE FUNCTION get_escalation_metrics(
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  total_legal_aid INT,
  total_escalated INT,
  escalation_rate NUMERIC,
  avg_days_to_escalation NUMERIC,
  top_escalation_reasons JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH date_filtered AS (
    SELECT *
    FROM legal_aid_requests
    WHERE (p_start_date IS NULL OR created_at >= p_start_date)
      AND (p_end_date IS NULL OR created_at <= p_end_date)
  ),
  escalation_stats AS (
    SELECT
      COUNT(*) AS total,
      COUNT(escalated_to_case_id) AS escalated,
      AVG(EXTRACT(EPOCH FROM (escalated_at - created_at))/86400) AS avg_days
    FROM date_filtered
  ),
  reason_stats AS (
    SELECT
      jsonb_object_agg(
        escalation_reason,
        reason_count
      ) AS reasons
    FROM (
      SELECT
        escalation_reason,
        COUNT(*) AS reason_count
      FROM legal_aid_escalation_audit
      WHERE (p_start_date IS NULL OR escalated_at >= p_start_date)
        AND (p_end_date IS NULL OR escalated_at <= p_end_date)
      GROUP BY escalation_reason
      ORDER BY reason_count DESC
      LIMIT 5
    ) top_reasons
  )
  SELECT
    es.total::INT,
    es.escalated::INT,
    ROUND((es.escalated::NUMERIC / NULLIF(es.total, 0)) * 100, 2),
    ROUND(es.avg_days, 1),
    COALESCE(rs.reasons, '{}'::jsonb)
  FROM escalation_stats es, reason_stats rs;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 11: Grant appropriate permissions
-- =====================================================

-- Grant SELECT on views to authenticated users
GRANT SELECT ON legal_aid_with_cases TO authenticated;
GRANT SELECT ON cases_with_legal_aid TO authenticated;
GRANT SELECT ON legal_matters_statistics TO authenticated;

-- Grant access to helper functions
GRANT EXECUTE ON FUNCTION get_legal_aid_escalation_history TO authenticated;
GRANT EXECUTE ON FUNCTION get_escalation_metrics TO authenticated;

-- =====================================================
-- STEP 12: Data validation
-- =====================================================

-- Check for orphaned references (should return 0)
DO $$
DECLARE
  orphaned_count INT;
BEGIN
  SELECT COUNT(*) INTO orphaned_count
  FROM legal_aid_requests
  WHERE escalated_to_case_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM cases WHERE id = escalated_to_case_id);

  IF orphaned_count > 0 THEN
    RAISE WARNING 'Found % orphaned escalation references', orphaned_count;
  END IF;
END $$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Legal Aid & Cases Reconciliation Migration completed successfully!';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '  - 4 new columns in legal_aid_requests';
  RAISE NOTICE '  - 2 new columns in cases';
  RAISE NOTICE '  - 3 views (legal_aid_with_cases, cases_with_legal_aid, legal_matters_statistics)';
  RAISE NOTICE '  - 2 triggers (link and prevent circular)';
  RAISE NOTICE '  - 1 audit table (legal_aid_escalation_audit)';
  RAISE NOTICE '  - 2 helper functions';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Deploy escalation API endpoint';
  RAISE NOTICE '  2. Update frontend to show linkage';
  RAISE NOTICE '  3. Train staff on escalation workflow';
END $$;
