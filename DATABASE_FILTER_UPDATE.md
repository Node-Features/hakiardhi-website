# Database RPC Function Update for Dashboard Filters

## Overview

The Supabase RPC function `rpc_get_admin_dashboard` needs to be updated to accept and handle the new filter parameters: `year`, `quarter`, `month`, `start_date`, and `end_date`.

## Current Situation

**Backend API**: ✅ Updated to accept new parameters
**Backend Service**: ✅ Updated to pass new parameters to RPC
**Database RPC**: ⚠️ **NEEDS UPDATE**

## Required Database Changes

### Update RPC Function Signature

The `rpc_get_admin_dashboard` function currently accepts:
```sql
rpc_get_admin_dashboard(
  project_uuid UUID,
  region_uuid UUID,
  interval_type TEXT
)
```

It needs to be updated to accept:
```sql
rpc_get_admin_dashboard(
  project_uuid UUID,
  region_uuid UUID,
  interval_type TEXT,
  filter_year INTEGER DEFAULT NULL,
  filter_quarter INTEGER DEFAULT NULL,
  filter_month INTEGER DEFAULT NULL,
  filter_start_date DATE DEFAULT NULL,
  filter_end_date DATE DEFAULT NULL
)
```

## SQL Migration

Here's the SQL to update the RPC function. You'll need to adapt this based on your actual function logic:

```sql
-- Drop the existing function
DROP FUNCTION IF EXISTS rpc_get_admin_dashboard(UUID, UUID, TEXT);

-- Create updated function with new parameters
CREATE OR REPLACE FUNCTION rpc_get_admin_dashboard(
  project_uuid UUID DEFAULT NULL,
  region_uuid UUID DEFAULT NULL,
  interval_type TEXT DEFAULT 'month',
  filter_year INTEGER DEFAULT NULL,
  filter_quarter INTEGER DEFAULT NULL,
  filter_month INTEGER DEFAULT NULL,
  filter_start_date DATE DEFAULT NULL,
  filter_end_date DATE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  date_filter_start DATE;
  date_filter_end DATE;
BEGIN
  -- Calculate date range based on interval type and parameters
  CASE interval_type
    WHEN 'year' THEN
      -- Filter by specific year
      IF filter_year IS NOT NULL THEN
        date_filter_start := make_date(filter_year, 1, 1);
        date_filter_end := make_date(filter_year, 12, 31);
      END IF;

    WHEN 'quarter' THEN
      -- Filter by specific quarter
      IF filter_year IS NOT NULL AND filter_quarter IS NOT NULL THEN
        CASE filter_quarter
          WHEN 1 THEN
            date_filter_start := make_date(filter_year, 1, 1);
            date_filter_end := make_date(filter_year, 3, 31);
          WHEN 2 THEN
            date_filter_start := make_date(filter_year, 4, 1);
            date_filter_end := make_date(filter_year, 6, 30);
          WHEN 3 THEN
            date_filter_start := make_date(filter_year, 7, 1);
            date_filter_end := make_date(filter_year, 9, 30);
          WHEN 4 THEN
            date_filter_start := make_date(filter_year, 10, 1);
            date_filter_end := make_date(filter_year, 12, 31);
        END CASE;
      END IF;

    WHEN 'month' THEN
      -- Filter by specific month
      IF filter_year IS NOT NULL AND filter_month IS NOT NULL THEN
        date_filter_start := make_date(filter_year, filter_month, 1);
        date_filter_end := (date_filter_start + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
      END IF;

    WHEN 'date' THEN
      -- Use custom date range
      date_filter_start := filter_start_date;
      date_filter_end := filter_end_date;
  END CASE;

  -- Build the dashboard data with date filters applied
  -- This is where your existing query logic goes
  -- You'll need to add WHERE clauses to filter by date_filter_start and date_filter_end

  -- Example structure (adapt to your actual schema):
  SELECT jsonb_build_object(
    'summary', jsonb_build_object(
      'global', (
        SELECT jsonb_build_object(
          'beneficiaries', (
            SELECT jsonb_build_object(
              'total', COALESCE(COUNT(*), 0),
              'male', COALESCE(COUNT(*) FILTER (WHERE gender = 'male'), 0),
              'female', COALESCE(COUNT(*) FILTER (WHERE gender = 'female'), 0),
              'other', COALESCE(COUNT(*) FILTER (WHERE gender NOT IN ('male', 'female')), 0),
              'percent_male', CASE WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE gender = 'male')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2) ELSE 0 END,
              'percent_female', CASE WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE gender = 'female')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2) ELSE 0 END,
              'percent_other', CASE WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE gender NOT IN ('male', 'female'))::NUMERIC / COUNT(*)::NUMERIC) * 100, 2) ELSE 0 END
            )
            FROM public.beneficiaries
            WHERE (project_uuid IS NULL OR beneficiaries.project_id = project_uuid)
              AND (region_uuid IS NULL OR beneficiaries.region_id = region_uuid)
              AND (date_filter_start IS NULL OR beneficiaries.created_at >= date_filter_start)
              AND (date_filter_end IS NULL OR beneficiaries.created_at <= date_filter_end)
          ),
          'incidents', (
            SELECT jsonb_build_object(
              'total', COALESCE(COUNT(*), 0),
              'land_conflict', COALESCE(COUNT(*) FILTER (WHERE incident_type = 'land_conflict'), 0),
              'eviction', COALESCE(COUNT(*) FILTER (WHERE incident_type = 'eviction'), 0),
              'boundary_dispute', COALESCE(COUNT(*) FILTER (WHERE incident_type = 'boundary_dispute'), 0),
              'other', COALESCE(COUNT(*) FILTER (WHERE incident_type NOT IN ('land_conflict', 'eviction', 'boundary_dispute')), 0),
              'percent_land_conflict', CASE WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE incident_type = 'land_conflict')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2) ELSE 0 END,
              'percent_eviction', CASE WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE incident_type = 'eviction')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2) ELSE 0 END,
              'percent_boundary_dispute', CASE WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE incident_type = 'boundary_dispute')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2) ELSE 0 END,
              'percent_other', CASE WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE incident_type NOT IN ('land_conflict', 'eviction', 'boundary_dispute'))::NUMERIC / COUNT(*)::NUMERIC) * 100, 2) ELSE 0 END
            )
            FROM public.incidents
            WHERE (project_uuid IS NULL OR incidents.project_id = project_uuid)
              AND (region_uuid IS NULL OR incidents.region_id = region_uuid)
              AND (date_filter_start IS NULL OR incidents.created_at >= date_filter_start)
              AND (date_filter_end IS NULL OR incidents.created_at <= date_filter_end)
          ),
          'cases', (
            -- Similar structure for cases
            SELECT jsonb_build_object(
              'total', COALESCE(COUNT(*), 0),
              'advocacy', COALESCE(COUNT(*) FILTER (WHERE case_type = 'advocacy'), 0),
              'mediation', COALESCE(COUNT(*) FILTER (WHERE case_type = 'mediation'), 0),
              'legal_support', COALESCE(COUNT(*) FILTER (WHERE case_type = 'legal_support'), 0),
              'other', COALESCE(COUNT(*) FILTER (WHERE case_type NOT IN ('advocacy', 'mediation', 'legal_support')), 0),
              'percent_advocacy', CASE WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE case_type = 'advocacy')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2) ELSE 0 END,
              'percent_mediation', CASE WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE case_type = 'mediation')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2) ELSE 0 END,
              'percent_legal_support', CASE WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE case_type = 'legal_support')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2) ELSE 0 END,
              'percent_other', CASE WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE case_type NOT IN ('advocacy', 'mediation', 'legal_support'))::NUMERIC / COUNT(*)::NUMERIC) * 100, 2) ELSE 0 END
            )
            FROM public.cases
            WHERE (project_uuid IS NULL OR cases.project_id = project_uuid)
              AND (region_uuid IS NULL OR cases.region_id = region_uuid)
              AND (date_filter_start IS NULL OR cases.created_at >= date_filter_start)
              AND (date_filter_end IS NULL OR cases.created_at <= date_filter_end)
          ),
          'geography', (
            -- Geography stats
            SELECT jsonb_build_object(
              'total_regions', COUNT(DISTINCT region_id),
              'districts', COUNT(DISTINCT district_id),
              'villages', COUNT(DISTINCT village_id),
              'percent_districts', 50, -- Calculate actual percentage
              'percent_villages', 50
            )
            FROM public.project_locations
            WHERE (project_uuid IS NULL OR project_locations.project_id = project_uuid)
              AND (region_uuid IS NULL OR project_locations.region_id = region_uuid)
          ),
          'others', jsonb_build_object(
            'users', (SELECT COUNT(*) FROM public.users),
            'projects', (SELECT COUNT(*) FROM public.projects WHERE (project_uuid IS NULL OR id = project_uuid))
          )
        )
      ),
      'projects', (
        -- Project summaries with date filters
        SELECT jsonb_agg(
          jsonb_build_object(
            'project_id', p.id,
            'title', p.title,
            'total_activities', COALESCE(activity_counts.total, 0),
            'completed_activities', COALESCE(activity_counts.completed, 0),
            'total_beneficiaries', COALESCE(beneficiary_counts.total, 0),
            'start_date', p.start_date,
            'end_date', p.end_date,
            'status', p.status
          )
        )
        FROM public.projects p
        LEFT JOIN LATERAL (
          SELECT
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'completed') as completed
          FROM public.activities
          WHERE activities.project_id = p.id
            AND (date_filter_start IS NULL OR activities.created_at >= date_filter_start)
            AND (date_filter_end IS NULL OR activities.created_at <= date_filter_end)
        ) activity_counts ON true
        LEFT JOIN LATERAL (
          SELECT COUNT(*) as total
          FROM public.beneficiaries
          WHERE beneficiaries.project_id = p.id
            AND (date_filter_start IS NULL OR beneficiaries.created_at >= date_filter_start)
            AND (date_filter_end IS NULL OR beneficiaries.created_at <= date_filter_end)
        ) beneficiary_counts ON true
        WHERE (project_uuid IS NULL OR p.id = project_uuid)
      ),
      'regions', (
        -- Region summaries with date filters
        SELECT jsonb_agg(
          jsonb_build_object(
            'region_id', r.id,
            'region_name', r.name,
            'beneficiaries', COALESCE(region_stats.beneficiaries, 0),
            'incidents', COALESCE(region_stats.incidents, 0),
            'cases', COALESCE(region_stats.cases, 0),
            'projects', COALESCE(region_stats.projects, 0)
          )
        )
        FROM public.regions r
        LEFT JOIN LATERAL (
          SELECT
            COUNT(DISTINCT b.id) as beneficiaries,
            COUNT(DISTINCT i.id) as incidents,
            COUNT(DISTINCT c.id) as cases,
            COUNT(DISTINCT pl.project_id) as projects
          FROM public.project_locations pl
          LEFT JOIN public.beneficiaries b ON b.region_id = r.id
            AND (date_filter_start IS NULL OR b.created_at >= date_filter_start)
            AND (date_filter_end IS NULL OR b.created_at <= date_filter_end)
          LEFT JOIN public.incidents i ON i.region_id = r.id
            AND (date_filter_start IS NULL OR i.created_at >= date_filter_start)
            AND (date_filter_end IS NULL OR i.created_at <= date_filter_end)
          LEFT JOIN public.cases c ON c.region_id = r.id
            AND (date_filter_start IS NULL OR c.created_at >= date_filter_start)
            AND (date_filter_end IS NULL OR c.created_at <= date_filter_end)
          WHERE pl.region_id = r.id
            AND (project_uuid IS NULL OR pl.project_id = project_uuid)
        ) region_stats ON true
        WHERE (region_uuid IS NULL OR r.id = region_uuid)
      )
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION rpc_get_admin_dashboard TO authenticated;

-- Add comment
COMMENT ON FUNCTION rpc_get_admin_dashboard IS 'Get admin dashboard overview with optional project, region, and time filters';
```

## How to Apply

### Option 1: Supabase Dashboard
1. Go to Supabase Dashboard → SQL Editor
2. Paste the SQL above (adapted to your schema)
3. Click "Run"

### Option 2: Migration File
1. Create a new migration file in your migrations folder
2. Add the SQL above
3. Run the migration

### Option 3: Supabase CLI
```bash
supabase migration new update_admin_dashboard_rpc
# Edit the migration file with the SQL above
supabase db push
```

## Important Notes

1. **Schema Adaptation Required**: The SQL above is a template. You need to adapt it to match your actual database schema:
   - Table names
   - Column names
   - Relationships
   - Data types

2. **Date Filtering**: The key changes are:
   - Accept the new filter parameters
   - Calculate `date_filter_start` and `date_filter_end` based on interval type
   - Apply these date filters in all WHERE clauses

3. **Testing**: After updating, test with various filter combinations:
   ```bash
   # Test year filter
   curl "http://localhost:3001/api/admin/analytics/overview?interval_type=year&year=2025"

   # Test quarter filter
   curl "http://localhost:3001/api/admin/analytics/overview?interval_type=quarter&year=2025&quarter=2"

   # Test month filter
   curl "http://localhost:3001/api/admin/analytics/overview?interval_type=month&year=2025&month=6"

   # Test date range filter
   curl "http://localhost:3001/api/admin/analytics/overview?interval_type=date&start_date=2025-01-01&end_date=2025-06-30"
   ```

4. **Performance**: Consider adding indexes on date columns if queries are slow:
   ```sql
   CREATE INDEX IF NOT EXISTS idx_beneficiaries_created_at ON public.beneficiaries(created_at);
   CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON public.incidents(created_at);
   CREATE INDEX IF NOT EXISTS idx_cases_created_at ON public.cases(created_at);
   CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at);
   ```

## Date Column Mapping

Make sure to use the correct date columns in your WHERE clauses. Common options:
- `created_at` - When the record was created
- `updated_at` - When the record was last modified
- `recorded_date` - When the incident/case occurred
- `start_date` / `end_date` - Project or activity dates

Choose the column that makes most sense for filtering in your context.

## Troubleshooting

### Error: "function rpc_get_admin_dashboard does not exist"
- The RPC function hasn't been created or updated yet
- Apply the SQL migration above

### Error: "column does not exist"
- Check that all table and column names match your schema
- Verify the date column names are correct

### Error: "invalid input syntax for type date"
- Verify that date strings are in ISO format (YYYY-MM-DD)
- Check that year, quarter, and month are valid integers

### No data returned but no error
- Check that the date filters aren't excluding all data
- Verify that your data has proper timestamps
- Test without date filters first, then add them incrementally

---

**Status**: ⚠️ Requires Database Update
**Priority**: High
**Impact**: Blocks dashboard filter functionality
