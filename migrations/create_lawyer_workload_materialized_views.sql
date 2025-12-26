-- ============================================================================
-- MATERIALIZED VIEWS FOR CASE HANDLER WORKLOAD & AUTO-ASSIGNMENT
-- Optimized views for fast case handler selection based on workload and permissions
-- ============================================================================

/**
 * These materialized views provide high-performance lookups for case handler
 * assignment by pre-calculating workload metrics and sorting by availability.
 *
 * PERMISSION-BASED SELECTION:
 * - Includes ANY user with case handling permissions (case_handle, case_assign, case_close)
 * - Not limited to lawyer_profiles table
 * - Admins, legal staff, lawyers all included if they have permissions
 *
 * Benefits:
 * - Fast lookups (no JOIN overhead at query time)
 * - Pre-calculated metrics
 * - Indexed for optimal performance
 * - Periodic refresh to stay current
 * - Permission-based access control
 */

-- ============================================================================
-- 1. MATERIALIZED VIEW: Case Handler Workload Summary
-- ============================================================================

DROP MATERIALIZED VIEW IF EXISTS mv_lawyer_workload_summary CASCADE;

CREATE MATERIALIZED VIEW mv_lawyer_workload_summary AS
SELECT
  -- User Identity
  u.id as user_id,
  u.first_name || ' ' || u.last_name as lawyer_name,
  u.email,
  u.phone_number,

  -- Optional Lawyer Profile Info (NULL if not a registered lawyer)
  lp.id as lawyer_profile_id,
  lp.bar_number,
  COALESCE(lp.specializations, ARRAY[]::text[]) as specializations,
  COALESCE(lp.years_of_experience, 0) as years_of_experience,

  -- Capacity Metrics (defaults for non-lawyer users)
  COALESCE(lp.max_active_cases, 10) as max_active_cases,
  COALESCE(lp.current_active_cases, 0) as current_active_cases,
  (COALESCE(lp.max_active_cases, 10) - COALESCE(lp.current_active_cases, 0)) as capacity_remaining,
  ROUND(
    (COALESCE(lp.current_active_cases, 0)::numeric / NULLIF(COALESCE(lp.max_active_cases, 10), 0)::numeric) * 100,
    2
  ) as utilization_percentage,

  -- Availability Status (default to available for users without profile)
  COALESCE(lp.is_available, true) as is_available,
  COALESCE(lp.availability_status, 'available') as availability_status,

  -- Actual Case Counts (Verified from cases table)
  COALESCE(
    (SELECT COUNT(*)
     FROM cases c
     WHERE c.assigned_to = u.id
       AND c.status IN ('Open', 'Active', 'Under Review', 'Investigation', 'In Progress')
    ), 0
  ) as verified_active_cases,

  COALESCE(
    (SELECT COUNT(*)
     FROM cases c
     WHERE c.assigned_to = u.id
       AND c.status IN ('Closed', 'Resolved', 'Completed')
    ), 0
  ) as verified_closed_cases,

  -- Performance Metrics (from lawyer profile or calculated from cases)
  COALESCE(lp.total_cases_handled,
    (SELECT COUNT(*) FROM cases c WHERE c.assigned_to = u.id)
  ) as total_cases_handled,

  COALESCE(lp.cases_closed,
    (SELECT COUNT(*) FROM cases c WHERE c.assigned_to = u.id AND c.status IN ('Closed', 'Resolved', 'Completed'))
  ) as cases_closed,

  COALESCE(lp.cases_won, 0) as cases_won,

  ROUND(
    (COALESCE(lp.cases_won, 0)::numeric / NULLIF(COALESCE(lp.cases_closed, 1), 0)::numeric) * 100,
    2
  ) as win_rate_percentage,

  COALESCE(lp.average_case_duration_days, 0) as average_case_duration_days,

  -- Case Statistics by Status
  (SELECT json_agg(
    json_build_object(
      'status', c.status,
      'count', COUNT(*)
    )
  )
   FROM cases c
   WHERE c.assigned_to = u.id
   GROUP BY c.status
  ) as cases_by_status,

  -- Case Statistics by Priority
  (SELECT json_agg(
    json_build_object(
      'priority', ie.priority,
      'count', COUNT(*)
    )
  )
   FROM cases c
   JOIN incident_escalations ie ON c.id = ie.case_id
   WHERE c.assigned_to = u.id
   GROUP BY ie.priority
  ) as cases_by_priority,

  -- Recent Case Activity
  (SELECT MAX(c.created_at)
   FROM cases c
   WHERE c.assigned_to = u.id
  ) as last_case_assigned_at,

  (SELECT MAX(c.updated_at)
   FROM cases c
   WHERE c.assigned_to = u.id
     AND c.status IN ('Closed', 'Resolved')
  ) as last_case_closed_at,

  -- Workload Score (lower is better for assignment)
  -- Formula: (current_cases / max_cases) * 1000 - (years_experience * 10)
  -- Prioritizes: Low workload & High experience
  ROUND(
    (COALESCE(lp.current_active_cases, 0)::numeric / NULLIF(COALESCE(lp.max_active_cases, 10), 0)::numeric * 1000) -
    (COALESCE(lp.years_of_experience, 0) * 10),
    2
  ) as workload_score,

  -- User Permissions (for reference)
  (SELECT json_agg(DISTINCT p.name)
   FROM user_roles ur
   JOIN role_permissions rp ON ur.role_id = rp.role_id
   JOIN permissions p ON rp.permission_id = p.id
   WHERE ur.user_id = u.id
     AND p.name IN ('case_handle', 'case_assign', 'case_close', 'case_create')
  ) as case_permissions,

  -- Timestamps
  COALESCE(lp.created_at, u.created_at) as created_at,
  COALESCE(lp.updated_at, u.updated_at) as updated_at,
  NOW() as last_refreshed

FROM users u
LEFT JOIN lawyer_profiles lp ON u.id = lp.user_id
WHERE u.status = 'Active'
  AND EXISTS (
    -- Only include users with case handling permissions
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = u.id
      AND p.name IN ('case_handle', 'case_assign', 'case_close')
  );

-- Create indexes for fast lookups
CREATE UNIQUE INDEX idx_mv_lawyer_workload_user_id
  ON mv_lawyer_workload_summary(user_id);

CREATE INDEX idx_mv_lawyer_workload_availability
  ON mv_lawyer_workload_summary(is_available, availability_status)
  WHERE is_available = true;

CREATE INDEX idx_mv_lawyer_workload_capacity
  ON mv_lawyer_workload_summary(capacity_remaining DESC, workload_score ASC)
  WHERE is_available = true;

CREATE INDEX idx_mv_lawyer_workload_specializations
  ON mv_lawyer_workload_summary USING gin(specializations)
  WHERE is_available = true;

CREATE INDEX idx_mv_lawyer_workload_utilization
  ON mv_lawyer_workload_summary(utilization_percentage ASC);

COMMENT ON MATERIALIZED VIEW mv_lawyer_workload_summary IS
  'Pre-calculated workload metrics for all users with case handling permissions. ' ||
  'Includes lawyers, admins, legal staff - anyone with case_handle, case_assign, or case_close permissions. ' ||
  'Refreshed periodically for fast case assignment lookups.';

-- ============================================================================
-- 2. MATERIALIZED VIEW: Available Lawyers for Assignment
-- ============================================================================

DROP MATERIALIZED VIEW IF EXISTS mv_available_lawyers_ranked CASCADE;

CREATE MATERIALIZED VIEW mv_available_lawyers_ranked AS
SELECT
  -- Lawyer Info
  user_id,
  lawyer_name,
  email,
  phone_number,
  bar_number,
  specializations,
  years_of_experience,

  -- Capacity
  max_active_cases,
  current_active_cases,
  verified_active_cases,
  capacity_remaining,
  utilization_percentage,

  -- Performance
  total_cases_handled,
  cases_closed,
  win_rate_percentage,
  average_case_duration_days,

  -- Scoring
  workload_score,

  -- Assignment Rank (ROW_NUMBER for each specialization)
  ROW_NUMBER() OVER (
    ORDER BY
      capacity_remaining DESC,
      workload_score ASC,
      years_of_experience DESC
  ) as overall_rank,

  -- Last activity
  last_case_assigned_at,
  last_case_closed_at,

  NOW() as last_refreshed

FROM mv_lawyer_workload_summary
WHERE is_available = true
  AND availability_status = 'available'
  AND capacity_remaining > 0
ORDER BY
  workload_score ASC,
  years_of_experience DESC;

-- Indexes
CREATE UNIQUE INDEX idx_mv_available_lawyers_user_id
  ON mv_available_lawyers_ranked(user_id);

CREATE INDEX idx_mv_available_lawyers_rank
  ON mv_available_lawyers_ranked(overall_rank ASC);

CREATE INDEX idx_mv_available_lawyers_specialization
  ON mv_available_lawyers_ranked USING gin(specializations);

COMMENT ON MATERIALIZED VIEW mv_available_lawyers_ranked IS
  'Pre-ranked list of available case handlers (lawyers, admins, legal staff) sorted by workload and experience. ' ||
  'Filtered to only users with case handling permissions. ' ||
  'Used for fast auto-assignment without complex queries.';

-- ============================================================================
-- 3. MATERIALIZED VIEW: Lawyer Performance Metrics
-- ============================================================================

DROP MATERIALIZED VIEW IF EXISTS mv_lawyer_performance_dashboard CASCADE;

CREATE MATERIALIZED VIEW mv_lawyer_performance_dashboard AS
SELECT
  -- Lawyer Info
  user_id,
  lawyer_name,
  bar_number,
  years_of_experience,
  specializations,

  -- Current Workload
  current_active_cases,
  max_active_cases,
  utilization_percentage,
  is_available,
  availability_status,

  -- Performance Metrics
  total_cases_handled,
  cases_closed,
  cases_won,
  win_rate_percentage,
  average_case_duration_days,

  -- Case breakdown
  verified_active_cases,
  verified_closed_cases,
  cases_by_status,

  -- Recent Activity
  last_case_assigned_at,
  last_case_closed_at,

  -- Time-based metrics
  CASE
    WHEN last_case_assigned_at IS NOT NULL THEN
      EXTRACT(EPOCH FROM (NOW() - last_case_assigned_at)) / 86400
    ELSE NULL
  END as days_since_last_assignment,

  CASE
    WHEN last_case_closed_at IS NOT NULL THEN
      EXTRACT(EPOCH FROM (NOW() - last_case_closed_at)) / 86400
    ELSE NULL
  END as days_since_last_closure,

  -- Productivity Score
  -- Higher is better: (cases_closed / years_experience) * win_rate
  ROUND(
    (cases_closed::numeric / NULLIF(years_of_experience, 0)) *
    (win_rate_percentage / 100),
    2
  ) as productivity_score,

  NOW() as last_refreshed

FROM mv_lawyer_workload_summary
ORDER BY productivity_score DESC NULLS LAST;

-- Indexes
CREATE UNIQUE INDEX idx_mv_lawyer_performance_user_id
  ON mv_lawyer_performance_dashboard(user_id);

CREATE INDEX idx_mv_lawyer_performance_score
  ON mv_lawyer_performance_dashboard(productivity_score DESC NULLS LAST);

CREATE INDEX idx_mv_lawyer_performance_utilization
  ON mv_lawyer_performance_dashboard(utilization_percentage ASC);

COMMENT ON MATERIALIZED VIEW mv_lawyer_performance_dashboard IS
  'Comprehensive performance metrics for all case handlers (lawyers, admins, legal staff) for management dashboard and reporting. ' ||
  'Includes only users with case handling permissions.';

-- ============================================================================
-- 4. FUNCTION: Get Next Available Lawyer (Using Materialized View)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_next_available_lawyer(
  p_specialization text DEFAULT NULL
)
RETURNS TABLE (
  lawyer_user_id uuid,
  lawyer_name text,
  current_workload integer,
  max_capacity integer,
  capacity_left integer,
  utilization_pct numeric,
  rank bigint
) AS $$
BEGIN
  -- Use the pre-ranked materialized view for instant results
  RETURN QUERY
  SELECT
    mal.user_id as lawyer_user_id,
    mal.lawyer_name,
    mal.current_active_cases as current_workload,
    mal.max_active_cases as max_capacity,
    mal.capacity_remaining as capacity_left,
    mal.utilization_percentage as utilization_pct,
    mal.overall_rank as rank
  FROM mv_available_lawyers_ranked mal
  WHERE
    -- Optional specialization filter
    (p_specialization IS NULL OR p_specialization = ANY(mal.specializations))
  ORDER BY
    mal.overall_rank ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_next_available_lawyer IS
  'Fast lookup for next available case handler (lawyer, admin, legal staff) using pre-ranked materialized view. ' ||
  'Only returns users with case handling permissions. Returns immediately without complex joins.';

-- ============================================================================
-- 5. REFRESH FUNCTIONS
-- ============================================================================

-- Refresh all lawyer workload views
CREATE OR REPLACE FUNCTION refresh_lawyer_workload_views()
RETURNS void AS $$
BEGIN
  -- Refresh in dependency order
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_lawyer_workload_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_available_lawyers_ranked;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_lawyer_performance_dashboard;

  RAISE NOTICE 'Lawyer workload materialized views refreshed at %', NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_lawyer_workload_views IS
  'Refreshes all lawyer workload materialized views. ' ||
  'Call this periodically (e.g., every 5-15 minutes) or after bulk case updates.';

-- Create a scheduled refresh function (to be called by cron job or pg_cron)
CREATE OR REPLACE FUNCTION schedule_lawyer_workload_refresh()
RETURNS void AS $$
BEGIN
  -- This will be called by pg_cron or external scheduler
  PERFORM refresh_lawyer_workload_views();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. TRIGGER: Auto-refresh on significant changes
-- ============================================================================

-- Function to refresh views when cases are assigned/closed
CREATE OR REPLACE FUNCTION trigger_refresh_lawyer_views()
RETURNS TRIGGER AS $$
BEGIN
  -- Only refresh if lawyer assignment changed or case status changed
  IF (TG_OP = 'UPDATE' AND (
    OLD.assigned_lawyer_id IS DISTINCT FROM NEW.assigned_lawyer_id OR
    OLD.status IS DISTINCT FROM NEW.status
  )) OR TG_OP = 'INSERT' THEN
    -- Schedule async refresh (non-blocking)
    PERFORM pg_notify('refresh_lawyer_views', json_build_object(
      'case_id', NEW.id,
      'lawyer_id', NEW.assigned_lawyer_id,
      'action', TG_OP
    )::text);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_refresh_lawyer_views_on_case_change ON cases;

CREATE TRIGGER trigger_refresh_lawyer_views_on_case_change
  AFTER INSERT OR UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION trigger_refresh_lawyer_views();

COMMENT ON TRIGGER trigger_refresh_lawyer_views_on_case_change ON cases IS
  'Sends notification to refresh materialized views when case assignments or status changes';

-- ============================================================================
-- 7. HELPER VIEWS (Regular views, not materialized)
-- ============================================================================

-- Quick view for lawyer assignment (uses materialized view)
CREATE OR REPLACE VIEW v_lawyer_quick_assign AS
SELECT
  user_id,
  lawyer_name,
  capacity_remaining,
  utilization_percentage,
  overall_rank,
  specializations
FROM mv_available_lawyers_ranked
WHERE capacity_remaining > 0
ORDER BY overall_rank
LIMIT 10;

COMMENT ON VIEW v_lawyer_quick_assign IS
  'Top 10 available case handlers (with case handling permissions) for quick assignment UI dropdown';

-- Lawyer workload alerts
CREATE OR REPLACE VIEW v_lawyer_workload_alerts AS
SELECT
  lawyer_name,
  current_active_cases,
  max_active_cases,
  utilization_percentage,
  CASE
    WHEN utilization_percentage >= 100 THEN 'At Capacity'
    WHEN utilization_percentage >= 90 THEN 'Nearly Full'
    WHEN utilization_percentage >= 75 THEN 'High Load'
    WHEN utilization_percentage <= 25 THEN 'Underutilized'
    ELSE 'Normal'
  END as alert_level,
  days_since_last_assignment
FROM mv_lawyer_performance_dashboard
WHERE is_available = true
ORDER BY utilization_percentage DESC;

COMMENT ON VIEW v_lawyer_workload_alerts IS
  'Workload alerts for all case handlers (with case handling permissions) for capacity planning and management';

-- ============================================================================
-- 8. USAGE EXAMPLES & TESTING
-- ============================================================================

/*
-- Example 1: Get next available lawyer for any case
SELECT * FROM get_next_available_lawyer(NULL);

-- Example 2: Get next available lawyer with land_rights specialization
SELECT * FROM get_next_available_lawyer('land_rights');

-- Example 3: View all available lawyers ranked
SELECT
  lawyer_name,
  capacity_remaining,
  utilization_percentage,
  overall_rank
FROM mv_available_lawyers_ranked
LIMIT 10;

-- Example 4: View lawyer performance dashboard
SELECT
  lawyer_name,
  cases_closed,
  win_rate_percentage,
  productivity_score
FROM mv_lawyer_performance_dashboard
ORDER BY productivity_score DESC
LIMIT 10;

-- Example 5: View workload alerts
SELECT * FROM v_lawyer_workload_alerts;

-- Example 6: Manual refresh
SELECT refresh_lawyer_workload_views();

-- Example 7: Find lawyers with specific capacity
SELECT lawyer_name, capacity_remaining
FROM mv_available_lawyers_ranked
WHERE capacity_remaining >= 5
ORDER BY overall_rank;

-- Example 8: Get workload summary for specific lawyer
SELECT *
FROM mv_lawyer_workload_summary
WHERE email = 'lawyer@example.com';
*/

-- ============================================================================
-- 9. INITIAL DATA LOAD
-- ============================================================================

-- Refresh views with initial data
SELECT refresh_lawyer_workload_views();

-- ============================================================================
-- 10. GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT ON mv_lawyer_workload_summary TO authenticated;
GRANT SELECT ON mv_available_lawyers_ranked TO authenticated;
GRANT SELECT ON mv_lawyer_performance_dashboard TO authenticated;
GRANT SELECT ON v_lawyer_quick_assign TO authenticated;
GRANT SELECT ON v_lawyer_workload_alerts TO authenticated;
GRANT EXECUTE ON FUNCTION get_next_available_lawyer TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_lawyer_workload_views TO authenticated;

-- ============================================================================
-- 11. MAINTENANCE RECOMMENDATIONS
-- ============================================================================

/*
RECOMMENDED REFRESH SCHEDULE:

1. Real-time Critical (Use Triggers):
   - When case assigned to lawyer
   - When case status changes to/from active

2. Periodic Refresh (Every 5-15 minutes):
   - Using pg_cron or external scheduler
   - Call: SELECT refresh_lawyer_workload_views();

3. Off-peak Full Refresh (Daily at 2 AM):
   - REFRESH MATERIALIZED VIEW mv_lawyer_workload_summary;
   - REFRESH MATERIALIZED VIEW mv_available_lawyers_ranked;
   - REFRESH MATERIALIZED VIEW mv_lawyer_performance_dashboard;

4. Manual Refresh:
   - After bulk case imports
   - After manual data corrections
   - When data seems stale

EXAMPLE pg_cron setup:
SELECT cron.schedule(
  'refresh-lawyer-views',
  '*/10 * * * *',  -- Every 10 minutes
  'SELECT refresh_lawyer_workload_views();'
);
*/
