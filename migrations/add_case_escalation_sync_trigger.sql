-- ============================================================================
-- AUTO-SYNC ESCALATION STATUS FROM CASE STATUS
-- Automatically updates escalation status when linked case status changes
-- ============================================================================

/**
 * This trigger ensures that escalations automatically sync their status
 * from the linked legal case. This maintains a single source of truth
 * where the legal case drives the resolution status.
 *
 * Flow: Incident → Escalation → Legal Case → Resolution
 *       Escalation status auto-syncs ← Case status changes
 */

-- Function to sync escalation status from case status
CREATE OR REPLACE FUNCTION sync_escalation_status_from_case()
RETURNS TRIGGER AS $$
BEGIN
  -- Only sync if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN

    UPDATE incident_escalations
    SET
      -- Map case status to escalation status
      status = CASE
        -- Case opened or pending → escalation acknowledged
        WHEN NEW.status IN ('Open', 'Pending') THEN 'acknowledged'::escalation_status

        -- Case active or under review → escalation in_review
        WHEN NEW.status IN ('Active', 'Under Review', 'Investigation', 'In Progress') THEN 'in_review'::escalation_status

        -- Case closed or resolved → escalation resolved
        WHEN NEW.status IN ('Closed', 'Resolved', 'Completed') THEN 'resolved'::escalation_status

        -- Case rejected or dismissed → escalation rejected
        WHEN NEW.status IN ('Rejected', 'Dismissed', 'Withdrawn') THEN 'rejected'::escalation_status

        -- Default: keep current status
        ELSE status
      END,

      -- Auto-populate resolution notes when case is closed
      resolution_notes = CASE
        WHEN NEW.status IN ('Closed', 'Resolved', 'Completed') THEN
          COALESCE(resolution_notes, '') ||
          E'\n\nResolved through formal legal case proceedings (Case #' ||
          COALESCE(NEW.reference_number, 'N/A') || ').'
        WHEN NEW.status IN ('Rejected', 'Dismissed', 'Withdrawn') THEN
          COALESCE(resolution_notes, '') ||
          E'\n\nCase ' || NEW.status || ' (Case #' ||
          COALESCE(NEW.reference_number, 'N/A') || ').'
        ELSE resolution_notes
      END,

      -- Set resolved_at timestamp when case is closed
      resolved_at = CASE
        WHEN NEW.status IN ('Closed', 'Resolved', 'Completed', 'Rejected', 'Dismissed', 'Withdrawn')
             AND OLD.status NOT IN ('Closed', 'Resolved', 'Completed', 'Rejected', 'Dismissed', 'Withdrawn')
        THEN NOW()
        ELSE resolved_at
      END,

      -- Always update the timestamp
      updated_at = NOW()

    WHERE case_id = NEW.id;

    -- Log the sync (optional, for debugging)
    RAISE NOTICE 'Synced escalation status from case % (% → %)',
      NEW.reference_number,
      OLD.status,
      NEW.status;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on cases table
DROP TRIGGER IF EXISTS trigger_sync_escalation_from_case ON cases;

CREATE TRIGGER trigger_sync_escalation_from_case
  AFTER UPDATE ON cases
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION sync_escalation_status_from_case();

-- Add comments for documentation
COMMENT ON FUNCTION sync_escalation_status_from_case() IS
  'Automatically syncs escalation status from linked case status changes. ' ||
  'Maintains single source of truth where legal case drives resolution.';

COMMENT ON TRIGGER trigger_sync_escalation_from_case ON cases IS
  'Syncs linked escalation status whenever case status changes';

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

/*
Example 1: Case moves to active review

UPDATE cases
SET status = 'Under Review'
WHERE id = 'case-uuid';

Result:
- Linked escalation status → 'in_review'
- Escalation updated_at → NOW()

---

Example 2: Case is closed

UPDATE cases
SET status = 'Closed'
WHERE id = 'case-uuid';

Result:
- Linked escalation status → 'resolved'
- Escalation resolution_notes → "Resolved through formal legal case proceedings (Case #2025-001234)."
- Escalation resolved_at → NOW()
- Escalation updated_at → NOW()

---

Example 3: Case is rejected

UPDATE cases
SET status = 'Rejected'
WHERE id = 'case-uuid';

Result:
- Linked escalation status → 'rejected'
- Escalation resolution_notes → "Case Rejected (Case #2025-001234)."
- Escalation resolved_at → NOW()
- Escalation updated_at → NOW()
*/

-- ============================================================================
-- TESTING
-- ============================================================================

/*
To test the trigger:

1. Create a test incident
INSERT INTO incidents (name, description, category_id, reported_by)
VALUES ('Test Incident', 'Test', 'cat-uuid', 'user-uuid')
RETURNING id;

2. Create an escalation
INSERT INTO incident_escalations (
  incident_id, escalated_by, escalated_by_name,
  escalation_level, reason, reason_label,
  description, priority
) VALUES (
  'incident-uuid', 'user-uuid', 'Test User',
  'admin', 'legal_complexity', 'Legal Complexity',
  'Test escalation', 'high'
) RETURNING id;

3. Create a case linked to escalation
INSERT INTO cases (
  title, description, category_id,
  submitted_by, status, reference_number
) VALUES (
  'Test Case', 'Test', 'cat-uuid',
  'user-uuid', 'Open', 'CASE-TEST-001'
) RETURNING id;

4. Link case to escalation
UPDATE incident_escalations
SET case_id = 'case-uuid'
WHERE id = 'escalation-uuid';

5. Test status sync - Close the case
UPDATE cases
SET status = 'Closed'
WHERE id = 'case-uuid';

6. Verify escalation was updated
SELECT status, resolution_notes, resolved_at
FROM incident_escalations
WHERE id = 'escalation-uuid';

Expected:
- status = 'resolved'
- resolution_notes contains "Resolved through formal legal case proceedings"
- resolved_at is set to current timestamp
*/

-- ============================================================================
-- ROLLBACK
-- ============================================================================

/*
To remove this trigger:

DROP TRIGGER IF EXISTS trigger_sync_escalation_from_case ON cases;
DROP FUNCTION IF EXISTS sync_escalation_status_from_case();
*/
