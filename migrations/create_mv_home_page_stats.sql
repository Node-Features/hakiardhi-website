-- ============================================================================
-- Migration: Create Materialized View for Home Page Impact Stats
-- File: create_mv_home_page_stats.sql
-- Description: Comprehensive stats for "Impact at a Glance" section on home page
-- ============================================================================

-- Drop existing view if it exists
DROP MATERIALIZED VIEW IF EXISTS public.mv_home_page_stats;

-- ============================================================================
-- Materialized View: mv_home_page_stats
-- Purpose: Provides real-time impact statistics for the public portal home page
-- Used by: /api/public/stats/home, ImpactBanner component
-- ============================================================================

CREATE MATERIALIZED VIEW public.mv_home_page_stats AS
SELECT
  -- ========================================
  -- CORE IMPACT METRICS (displayed in banner)
  -- ========================================

  -- Years of Impact (HakiArdhi founded in 1994)
  EXTRACT(YEAR FROM NOW())::integer - 1994 AS years_of_impact,

  -- Communities/Villages Served (unique villages with beneficiaries or project activities)
  (
    SELECT COUNT(DISTINCT v.id)
    FROM public.villages v
    WHERE EXISTS (
      SELECT 1 FROM public.beneficiaries b WHERE b.village_id = v.id
    ) OR EXISTS (
      SELECT 1 FROM public.project_locations pl WHERE pl.village_id = v.id
    ) OR EXISTS (
      SELECT 1 FROM public.activity_locations al WHERE al.village_id = v.id
    )
  ) AS communities_served,

  -- Total Publications (published research, reports, etc.)
  (
    SELECT COUNT(*)
    FROM public.publications
    WHERE is_published = true
  ) AS publications_count,

  -- Total Beneficiaries Reached (unique individuals impacted)
  (
    SELECT COUNT(*)
    FROM public.beneficiaries
    WHERE status = 'Active'
  ) AS beneficiaries_reached,

  -- Regions Covered (Tanzania has 31 regions)
  (
    SELECT COUNT(DISTINCT region_id)
    FROM (
      SELECT region_id FROM public.project_locations WHERE region_id IS NOT NULL
      UNION
      SELECT region_id FROM public.beneficiaries WHERE region_id IS NOT NULL
      UNION
      SELECT region_id FROM public.lrm_members WHERE region_id IS NOT NULL
    ) AS all_regions
  ) AS regions_covered,

  -- Legal Aid: Cases Resolved
  (
    SELECT COUNT(*)
    FROM public.cases
    WHERE status = 'Completed'
  ) AS cases_resolved,

  -- ========================================
  -- NETWORK METRICS
  -- ========================================

  -- Active Land Rights Monitors (LRMs)
  (
    SELECT COUNT(*)
    FROM public.lrm_members
    WHERE is_active = true
  ) AS active_lrms,

  -- Active Women Grassroot Councils (WGC) members
  (
    SELECT COUNT(*)
    FROM public.wgc_members
    WHERE is_active = true
  ) AS active_wgc_members,

  -- Total LRM + WGC Network
  (
    SELECT
      (SELECT COUNT(*) FROM public.lrm_members WHERE is_active = true) +
      (SELECT COUNT(*) FROM public.wgc_members WHERE is_active = true)
  ) AS total_network_members,

  -- ========================================
  -- PROJECT METRICS
  -- ========================================

  -- Active Projects
  (
    SELECT COUNT(*)
    FROM public.projects
    WHERE status = 'Active' AND is_published = true
  ) AS active_projects,

  -- Completed Projects
  (
    SELECT COUNT(*)
    FROM public.projects
    WHERE status = 'Completed' AND is_published = true
  ) AS completed_projects,

  -- Total Projects (all published)
  (
    SELECT COUNT(*)
    FROM public.projects
    WHERE is_published = true
  ) AS total_projects,

  -- ========================================
  -- ACTIVITY METRICS
  -- ========================================

  -- Total Activities Conducted
  (
    SELECT COUNT(*)
    FROM public.activities
    WHERE status = 'Completed'
  ) AS activities_completed,

  -- Training Sessions (activities in training category)
  (
    SELECT COUNT(*)
    FROM public.activities a
    JOIN public.categories c ON a.category_id = c.id
    WHERE c.type = 'training' OR c.name ILIKE '%training%'
  ) AS training_sessions,

  -- ========================================
  -- GEOGRAPHIC REACH
  -- ========================================

  -- Districts Reached
  (
    SELECT COUNT(DISTINCT district_id)
    FROM (
      SELECT district_id FROM public.project_locations WHERE district_id IS NOT NULL
      UNION
      SELECT district_id FROM public.beneficiaries WHERE district_id IS NOT NULL
      UNION
      SELECT district_id FROM public.lrm_members WHERE district_id IS NOT NULL
    ) AS all_districts
  ) AS districts_reached,

  -- ========================================
  -- CASE MANAGEMENT METRICS
  -- ========================================

  -- Total Cases Handled
  (
    SELECT COUNT(*)
    FROM public.cases
  ) AS total_cases,

  -- Open/Pending Cases
  (
    SELECT COUNT(*)
    FROM public.cases
    WHERE status IN ('Open', 'In Progress')
  ) AS open_cases,

  -- Case Success Rate (percentage)
  (
    SELECT
      CASE
        WHEN COUNT(*) > 0
        THEN ROUND((COUNT(*) FILTER (WHERE status = 'Completed')::numeric / COUNT(*)::numeric) * 100, 1)
        ELSE 0
      END
    FROM public.cases
  ) AS case_success_rate,

  -- Disputes Resolved by LRMs (sum of all LRM disputes resolved)
  (
    SELECT COALESCE(SUM(disputes_resolved), 0)
    FROM public.lrm_members
    WHERE is_active = true
  ) AS lrm_disputes_resolved,

  -- ========================================
  -- CONTENT METRICS
  -- ========================================

  -- News & Blog Posts
  (
    SELECT COUNT(*)
    FROM public.blogs
    WHERE is_published = true
  ) AS news_posts_count,

  -- Featured Stories
  (
    SELECT COUNT(*)
    FROM public.blogs
    WHERE is_published = true AND is_featured = true
  ) AS featured_stories_count,

  -- ========================================
  -- GENDER METRICS
  -- ========================================

  -- Female Beneficiaries
  (
    SELECT COUNT(*)
    FROM public.beneficiaries
    WHERE sex = 'female' AND status = 'Active'
  ) AS female_beneficiaries,

  -- Male Beneficiaries
  (
    SELECT COUNT(*)
    FROM public.beneficiaries
    WHERE sex = 'male' AND status = 'Active'
  ) AS male_beneficiaries,

  -- Female LRMs
  (
    SELECT COUNT(*)
    FROM public.lrm_members
    WHERE is_active = true
    -- Add gender field check if available
  ) AS female_lrms,

  -- ========================================
  -- META
  -- ========================================
  NOW() AS last_refreshed;

-- ============================================================================
-- Create unique index for concurrent refresh
-- ============================================================================
CREATE UNIQUE INDEX idx_mv_home_page_stats_unique ON public.mv_home_page_stats (last_refreshed);

-- ============================================================================
-- Function to refresh the materialized view
-- ============================================================================

CREATE OR REPLACE FUNCTION refresh_mv_home_page_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_home_page_stats;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Grant permissions for public access
-- ============================================================================

GRANT SELECT ON public.mv_home_page_stats TO anon;
GRANT SELECT ON public.mv_home_page_stats TO authenticated;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON MATERIALIZED VIEW public.mv_home_page_stats IS
  'Comprehensive impact statistics for the home page Impact Banner section.
   Includes metrics for: years of operation, communities served, publications,
   beneficiaries, regions, LRM/WGC network, projects, cases, and more.';

COMMENT ON FUNCTION refresh_mv_home_page_stats() IS
  'Refreshes the mv_home_page_stats materialized view concurrently';

-- ============================================================================
-- Initial refresh
-- ============================================================================

REFRESH MATERIALIZED VIEW public.mv_home_page_stats;
