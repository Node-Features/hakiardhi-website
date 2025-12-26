-- ============================================================================
-- LAWYER CAPACITY TRACKING & AUTO-ASSIGNMENT
-- Tracks lawyer workload and enables automatic case assignment
-- ============================================================================

/**
 * This migration adds lawyer capacity tracking to enable automatic
 * assignment of cases to lawyers based on their current workload.
 *
 * Flow: Escalation → Case Created → Auto-Assign to Available Lawyer
 */

-- ============================================================================
-- 1. LAWYER PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.lawyer_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,

  -- Lawyer Information
  bar_number text,
  specializations text[], -- Array of specialization areas
  years_of_experience integer DEFAULT 0,

  -- Capacity Management
  max_active_cases integer NOT NULL DEFAULT 10,
  current_active_cases integer NOT NULL DEFAULT 0,
  is_available boolean DEFAULT true,
  availability_status text DEFAULT 'available' CHECK (
    availability_status IN ('available', 'at_capacity', 'on_leave', 'unavailable')
  ),

  -- Performance Metrics (optional)
  total_cases_handled integer DEFAULT 0,
  cases_won integer DEFAULT 0,
  cases_closed integer DEFAULT 0,
  average_case_duration_days numeric(10, 2),

  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  -- Constraints
  CONSTRAINT lawyer_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT lawyer_profiles_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT lawyer_profiles_capacity_check CHECK (current_active_cases >= 0),
  CONSTRAINT lawyer_profiles_max_capacity_check CHECK (max_active_cases > 0)
);

-- Indexes
CREATE INDEX idx_lawyer_profiles_user_id ON public.lawyer_profiles(user_id);
CREATE INDEX idx_lawyer_profiles_availability ON public.lawyer_profiles(is_available, availability_status);
CREATE INDEX idx_lawyer_profiles_capacity ON public.lawyer_profiles(current_active_cases, max_active_cases);

-- Comments
COMMENT ON TABLE public.lawyer_profiles IS 'Tracks lawyer capacity and availability for automatic case assignment';
COMMENT ON COLUMN public.lawyer_profiles.max_active_cases IS 'Maximum number of active cases this lawyer can handle';
COMMENT ON COLUMN public.lawyer_profiles.current_active_cases IS 'Current number of active cases assigned to this lawyer';
COMMENT ON COLUMN public.lawyer_profiles.is_available IS 'Quick flag for availability (updated by triggers)';
COMMENT ON COLUMN public.lawyer_profiles.availability_status IS 'Detailed availability status';

-- ============================================================================
-- 2. UPDATE CASES TABLE - ADD LAWYER ASSIGNMENT TRACKING
-- ============================================================================

-- Add lawyer assignment columns to cases table (if not exists)
DO $$
BEGIN
  -- Add assigned_lawyer column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cases' AND column_name = 'assigned_lawyer_id'
  ) THEN
    ALTER TABLE public.cases
    ADD COLUMN assigned_lawyer_id uuid,
    ADD COLUMN assigned_lawyer_name text,
    ADD COLUMN lawyer_assigned_at timestamp with time zone,
    ADD COLUMN assignment_method text DEFAULT 'auto' CHECK (
      assignment_method IN ('auto', 'manual', 'escalation')
    );

    -- Add foreign key
    ALTER TABLE public.cases
    ADD CONSTRAINT cases_assigned_lawyer_id_fkey
    FOREIGN KEY (assigned_lawyer_id) REFERENCES public.users(id) ON DELETE SET NULL;

    -- Add index
    CREATE INDEX idx_cases_assigned_lawyer ON public.cases(assigned_lawyer_id);

    -- Add comments
    COMMENT ON COLUMN public.cases.assigned_lawyer_id IS 'Lawyer assigned to handle this case';
    COMMENT ON COLUMN public.cases.assignment_method IS 'How the lawyer was assigned (auto/manual/escalation)';
  END IF;
END $$;

-- ============================================================================
-- 3. LAWYER CAPACITY TRACKING FUNCTIONS
-- ============================================================================

-- Function to get available lawyers sorted by capacity
CREATE OR REPLACE FUNCTION get_available_lawyers(
  p_specialization text DEFAULT NULL,
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  lawyer_id uuid,
  user_id uuid,
  name text,
  current_cases integer,
  max_cases integer,
  capacity_remaining integer,
  utilization_percentage numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    lp.id as lawyer_id,
    lp.user_id,
    u.name,
    lp.current_active_cases as current_cases,
    lp.max_active_cases as max_cases,
    (lp.max_active_cases - lp.current_active_cases) as capacity_remaining,
    ROUND((lp.current_active_cases::numeric / lp.max_active_cases::numeric) * 100, 2) as utilization_percentage
  FROM lawyer_profiles lp
  JOIN users u ON lp.user_id = u.id
  WHERE
    lp.is_available = true
    AND lp.availability_status = 'available'
    AND lp.current_active_cases < lp.max_active_cases
    AND (p_specialization IS NULL OR p_specialization = ANY(lp.specializations))
  ORDER BY
    lp.current_active_cases ASC,  -- Least loaded first
    lp.years_of_experience DESC    -- Most experienced first if tied
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-assign case to available lawyer
CREATE OR REPLACE FUNCTION auto_assign_case_to_lawyer(
  p_case_id uuid,
  p_specialization text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_lawyer_record RECORD;
  v_lawyer_user_id uuid;
  v_lawyer_name text;
BEGIN
  -- Get the most available lawyer
  SELECT * INTO v_lawyer_record
  FROM get_available_lawyers(p_specialization, 1)
  LIMIT 1;

  IF v_lawyer_record IS NULL THEN
    RAISE NOTICE 'No available lawyers found for case %', p_case_id;
    RETURN NULL;
  END IF;

  v_lawyer_user_id := v_lawyer_record.user_id;
  v_lawyer_name := v_lawyer_record.name;

  -- Assign the case
  UPDATE cases
  SET
    assigned_lawyer_id = v_lawyer_user_id,
    assigned_lawyer_name = v_lawyer_name,
    lawyer_assigned_at = NOW(),
    assignment_method = 'auto',
    assigned_to = v_lawyer_user_id,  -- Also set general assigned_to field
    updated_at = NOW()
  WHERE id = p_case_id;

  -- Increment lawyer's active case count
  UPDATE lawyer_profiles
  SET
    current_active_cases = current_active_cases + 1,
    updated_at = NOW()
  WHERE user_id = v_lawyer_user_id;

  -- Log the assignment
  RAISE NOTICE 'Auto-assigned case % to lawyer % (% active cases)',
    p_case_id, v_lawyer_name, v_lawyer_record.current_cases + 1;

  RETURN v_lawyer_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. TRIGGERS FOR AUTOMATIC LAWYER WORKLOAD TRACKING
-- ============================================================================

-- Trigger to update lawyer availability when capacity changes
CREATE OR REPLACE FUNCTION update_lawyer_availability()
RETURNS TRIGGER AS $$
BEGIN
  -- Update is_available flag based on current capacity
  NEW.is_available := (NEW.current_active_cases < NEW.max_active_cases);

  -- Update availability_status
  NEW.availability_status := CASE
    WHEN NEW.current_active_cases >= NEW.max_active_cases THEN 'at_capacity'
    WHEN NEW.is_available = false THEN 'unavailable'
    ELSE 'available'
  END;

  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_lawyer_availability ON lawyer_profiles;

CREATE TRIGGER trigger_update_lawyer_availability
  BEFORE INSERT OR UPDATE ON lawyer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_lawyer_availability();

-- Trigger to update lawyer workload when case status changes
CREATE OR REPLACE FUNCTION sync_lawyer_workload_from_case()
RETURNS TRIGGER AS $$
DECLARE
  v_old_lawyer_id uuid;
  v_new_lawyer_id uuid;
  v_case_closed boolean;
BEGIN
  v_old_lawyer_id := OLD.assigned_lawyer_id;
  v_new_lawyer_id := NEW.assigned_lawyer_id;

  -- Check if case was closed
  v_case_closed := (
    OLD.status NOT IN ('Closed', 'Resolved', 'Completed') AND
    NEW.status IN ('Closed', 'Resolved', 'Completed')
  );

  -- If case was closed, decrement old lawyer's count
  IF v_case_closed AND v_old_lawyer_id IS NOT NULL THEN
    UPDATE lawyer_profiles
    SET
      current_active_cases = GREATEST(current_active_cases - 1, 0),
      cases_closed = cases_closed + 1,
      updated_at = NOW()
    WHERE user_id = v_old_lawyer_id;

    RAISE NOTICE 'Decremented case count for lawyer % (case closed)', v_old_lawyer_id;
  END IF;

  -- If lawyer was reassigned
  IF v_old_lawyer_id IS DISTINCT FROM v_new_lawyer_id THEN
    -- Decrement old lawyer's count
    IF v_old_lawyer_id IS NOT NULL AND NOT v_case_closed THEN
      UPDATE lawyer_profiles
      SET
        current_active_cases = GREATEST(current_active_cases - 1, 0),
        updated_at = NOW()
      WHERE user_id = v_old_lawyer_id;
    END IF;

    -- Increment new lawyer's count
    IF v_new_lawyer_id IS NOT NULL AND NEW.status NOT IN ('Closed', 'Resolved', 'Completed') THEN
      UPDATE lawyer_profiles
      SET
        current_active_cases = current_active_cases + 1,
        updated_at = NOW()
      WHERE user_id = v_new_lawyer_id;

      RAISE NOTICE 'Incremented case count for lawyer %', v_new_lawyer_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_lawyer_workload_from_case ON cases;

CREATE TRIGGER trigger_sync_lawyer_workload_from_case
  AFTER UPDATE ON cases
  FOR EACH ROW
  WHEN (
    OLD.assigned_lawyer_id IS DISTINCT FROM NEW.assigned_lawyer_id OR
    OLD.status IS DISTINCT FROM NEW.status
  )
  EXECUTE FUNCTION sync_lawyer_workload_from_case();

-- ============================================================================
-- 5. SAMPLE DATA (FOR TESTING)
-- ============================================================================

-- Insert sample lawyer profiles (adjust user_ids to match your users table)
/*
INSERT INTO lawyer_profiles (user_id, bar_number, specializations, max_active_cases, years_of_experience)
VALUES
  ('lawyer-uuid-1', 'BAR-001', ARRAY['land_rights', 'property_law'], 15, 10),
  ('lawyer-uuid-2', 'BAR-002', ARRAY['land_rights', 'civil_litigation'], 12, 7),
  ('lawyer-uuid-3', 'BAR-003', ARRAY['property_law', 'criminal_law'], 10, 5),
  ('lawyer-uuid-4', 'BAR-004', ARRAY['land_rights', 'environmental_law'], 20, 15);
*/

-- ============================================================================
-- 6. HELPER VIEWS
-- ============================================================================

-- View for lawyer workload dashboard
CREATE OR REPLACE VIEW lawyer_workload_dashboard AS
SELECT
  lp.id as lawyer_profile_id,
  lp.user_id,
  u.name as lawyer_name,
  u.email,
  lp.bar_number,
  lp.specializations,
  lp.current_active_cases,
  lp.max_active_cases,
  (lp.max_active_cases - lp.current_active_cases) as capacity_remaining,
  ROUND((lp.current_active_cases::numeric / lp.max_active_cases::numeric) * 100, 2) as utilization_percentage,
  lp.availability_status,
  lp.total_cases_handled,
  lp.cases_closed,
  lp.years_of_experience,
  (
    SELECT COUNT(*)
    FROM cases c
    WHERE c.assigned_lawyer_id = lp.user_id
      AND c.status IN ('Open', 'Active', 'Under Review')
  ) as verified_active_cases
FROM lawyer_profiles lp
JOIN users u ON lp.user_id = u.id
ORDER BY lp.current_active_cases ASC, lp.years_of_experience DESC;

COMMENT ON VIEW lawyer_workload_dashboard IS 'Real-time view of lawyer workload and availability for capacity planning';

-- ============================================================================
-- 7. GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON lawyer_profiles TO authenticated;
GRANT SELECT ON lawyer_workload_dashboard TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_lawyers TO authenticated;
GRANT EXECUTE ON FUNCTION auto_assign_case_to_lawyer TO authenticated;

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

/*
-- Example 1: Get available lawyers
SELECT * FROM get_available_lawyers(NULL, 10);

-- Example 2: Get lawyers specialized in land rights
SELECT * FROM get_available_lawyers('land_rights', 5);

-- Example 3: Auto-assign a case
SELECT auto_assign_case_to_lawyer('case-uuid-here');

-- Example 4: View lawyer workload
SELECT * FROM lawyer_workload_dashboard;

-- Example 5: Manually assign and track
UPDATE cases
SET assigned_lawyer_id = 'lawyer-uuid',
    assignment_method = 'manual'
WHERE id = 'case-uuid';
-- Trigger will automatically update lawyer's workload

-- Example 6: Close case (automatically decrements lawyer count)
UPDATE cases SET status = 'Closed' WHERE id = 'case-uuid';
*/
