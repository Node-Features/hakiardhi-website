-- Migration: Create Materialized Views for Public Portal
-- Description: Creates materialized views for optimized data retrieval
-- Author: Development Team
-- Date: 2024-11-20

-- =====================================================
-- HOME PAGE STATISTICS VIEW
-- =====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_home_page_stats AS
SELECT
  (SELECT COUNT(*) FROM public.projects WHERE status = 'Completed' AND is_published = true) AS completed_projects,
  (SELECT COUNT(*) FROM public.projects WHERE status = 'Ongoing' AND is_published = true) AS ongoing_projects,
  (SELECT COUNT(*) FROM public.cases WHERE status IN ('Resolved', 'Won', 'Closed')) AS cases_resolved,
  (SELECT COUNT(DISTINCT beneficiary_id) FROM public.activity_beneficiaries) AS beneficiaries_reached,
  (SELECT COUNT(*) FROM public.lrm_members WHERE is_active = true) AS active_lrms,
  (SELECT COUNT(DISTINCT region_id) FROM public.project_locations) AS regions_covered,
  (SELECT COUNT(*) FROM public.publications WHERE is_published = true) AS publications_count,
  NOW() AS last_refreshed;

-- Index for the view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_home_stats ON public.mv_home_page_stats (last_refreshed);

-- =====================================================
-- FEATURED PROGRAMS VIEW
-- =====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_featured_programs AS
SELECT
  p.id,
  p.slug,
  p.title,
  p.short_description AS description,
  c.name AS category,
  p.cover_image AS image,
  p.start_date AS date,
  p.status,
  p.participants,
  COALESCE(
    (SELECT r.name FROM public.regions r
     JOIN public.project_locations pl ON r.id = pl.region_id
     WHERE pl.project_id = p.id LIMIT 1),
    p.location
  ) AS location,
  p.created_at
FROM public.projects p
LEFT JOIN public.categories c ON p.category_id = c.id
WHERE p.is_featured = true AND p.is_published = true
ORDER BY p.start_date DESC
LIMIT 6;

-- Index for the view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_featured_programs ON public.mv_featured_programs (id);

-- =====================================================
-- PROGRAMS LIST VIEW
-- =====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_programs_list AS
SELECT
  p.id,
  p.slug,
  p.title,
  p.short_description AS description,
  p.full_description,
  c.name AS category,
  p.cover_image AS image,
  p.start_date,
  p.end_date,
  p.status,
  p.objectives,
  p.outcomes,
  p.impact_metrics,
  p.partners,
  p.gallery,
  p.is_featured,
  COALESCE(
    (SELECT r.name FROM public.regions r
     JOIN public.project_locations pl ON r.id = pl.region_id
     WHERE pl.project_id = p.id LIMIT 1),
    p.location
  ) AS location,
  (SELECT COUNT(DISTINCT ab.beneficiary_id)
   FROM public.activities a
   JOIN public.activity_beneficiaries ab ON a.id = ab.activity_id
   WHERE a.project_id = p.id) AS participants_count,
  p.created_at,
  p.updated_at
FROM public.projects p
LEFT JOIN public.categories c ON p.category_id = c.id
WHERE p.is_published = true
ORDER BY p.start_date DESC;

-- Index for the view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_programs_list ON public.mv_programs_list (id);
CREATE INDEX IF NOT EXISTS idx_mv_programs_category ON public.mv_programs_list (category);
CREATE INDEX IF NOT EXISTS idx_mv_programs_status ON public.mv_programs_list (status);

-- =====================================================
-- NEWS & EVENTS LIST VIEW
-- =====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_news_events_list AS
SELECT
  b.id,
  b.slug,
  b.title,
  b.excerpt,
  b.content,
  b.cover_image AS image,
  b.type,
  c.name AS category,
  COALESCE(b.event_date, b.created_at::date) AS date,
  b.event_location AS location,
  CONCAT(u.first_name, ' ', u.last_name) AS author,
  b.gallery,
  b.related_links,
  b.is_featured,
  b.views_count,
  b.tags,
  b.created_at,
  b.updated_at
FROM public.blogs b
LEFT JOIN public.categories c ON b.category_id = c.id
LEFT JOIN public.users u ON b.author_id = u.id
WHERE b.is_published = true
ORDER BY COALESCE(b.event_date, b.created_at) DESC;

-- Index for the view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_news_events_list ON public.mv_news_events_list (id);
CREATE INDEX IF NOT EXISTS idx_mv_news_type ON public.mv_news_events_list (type);
CREATE INDEX IF NOT EXISTS idx_mv_news_category ON public.mv_news_events_list (category);
CREATE INDEX IF NOT EXISTS idx_mv_news_date ON public.mv_news_events_list (date DESC);

-- =====================================================
-- PORTFOLIO LIST VIEW
-- =====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_portfolio_list AS
SELECT
  pi.id,
  pi.slug,
  pi.title,
  pi.subtitle,
  pi.description,
  pi.cover_image,
  pi.category,
  pi.type,
  pi.year,
  pi.location,
  pi.beneficiaries,
  pi.tags,
  pi.impact,
  pi.is_featured,
  pi.created_at
FROM public.portfolio_items pi
WHERE pi.is_published = true
ORDER BY pi.created_at DESC;

-- Index for the view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_portfolio_list ON public.mv_portfolio_list (id);
CREATE INDEX IF NOT EXISTS idx_mv_portfolio_category ON public.mv_portfolio_list (category);
CREATE INDEX IF NOT EXISTS idx_mv_portfolio_type ON public.mv_portfolio_list (type);
CREATE INDEX IF NOT EXISTS idx_mv_portfolio_year ON public.mv_portfolio_list (year);

-- =====================================================
-- RESEARCH STATISTICS VIEW
-- =====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_research_stats AS
SELECT
  COUNT(*) AS total_publications,
  COALESCE(SUM(downloads), 0) AS total_downloads,
  COALESCE(SUM(views), 0) AS total_views,
  (SELECT COUNT(DISTINCT topic) FROM public.publications, jsonb_array_elements_text(topics) AS topic WHERE is_published = true) AS topic_count,
  (SELECT COUNT(*) FROM public.publications WHERE publication_date > NOW() - INTERVAL '1 year' AND is_published = true) AS recent_publications,
  NOW() AS last_refreshed
FROM public.publications
WHERE is_published = true;

-- Index for the view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_research_stats ON public.mv_research_stats (last_refreshed);

-- =====================================================
-- LEGAL AID STATISTICS VIEW
-- =====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_legal_aid_stats AS
SELECT
  (SELECT COUNT(*) FROM public.cases) AS total_cases,
  (SELECT COUNT(*) FROM public.cases WHERE status IN ('Resolved', 'Won', 'Closed')) AS resolved_cases,
  (SELECT COUNT(*) FROM public.cases WHERE status = 'Open') AS open_cases,
  (SELECT COUNT(*) FROM public.cases WHERE status = 'In Progress') AS in_progress_cases,
  (SELECT COUNT(DISTINCT submitted_by) FROM public.cases) AS unique_clients,
  (SELECT COUNT(DISTINCT region_id) FROM public.beneficiaries WHERE id IN
    (SELECT DISTINCT submitted_by FROM public.cases)) AS regions_served,
  ROUND(
    (SELECT COUNT(*)::numeric FROM public.cases WHERE status IN ('Resolved', 'Won', 'Closed')) /
    NULLIF((SELECT COUNT(*)::numeric FROM public.cases), 0) * 100, 1
  ) AS resolution_rate,
  NOW() AS last_refreshed
FROM (SELECT 1) AS dummy;

-- Index for the view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_legal_aid_stats ON public.mv_legal_aid_stats (last_refreshed);

-- =====================================================
-- LRM BY REGION VIEW
-- =====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_lrm_by_region AS
SELECT
  r.id AS region_id,
  r.name AS region_name,
  COUNT(DISTINCT lm.id) AS lrm_count,
  COUNT(DISTINCT d.id) AS districts_count,
  COUNT(DISTINCT v.id) AS villages_count,
  COALESCE(SUM(lm.disputes_resolved), 0) AS disputes_resolved,
  COALESCE(SUM(lm.families_educated), 0) AS families_educated,
  COALESCE(SUM(lm.cases_handled), 0) AS cases_handled
FROM public.regions r
LEFT JOIN public.lrm_members lm ON r.id = lm.region_id AND lm.is_active = true
LEFT JOIN public.districts d ON r.id = d.region_id
LEFT JOIN public.villages v ON d.id = v.district_id
GROUP BY r.id, r.name
ORDER BY lrm_count DESC;

-- Index for the view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_lrm_by_region ON public.mv_lrm_by_region (region_id);

-- =====================================================
-- LRM IMPACT STATISTICS VIEW
-- =====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_lrm_impact_stats AS
SELECT
  (SELECT COUNT(*) FROM public.lrm_members WHERE is_active = true) AS total_lrms,
  (SELECT COUNT(DISTINCT region_id) FROM public.lrm_members WHERE is_active = true) AS regions_covered,
  (SELECT COUNT(DISTINCT district_id) FROM public.lrm_members WHERE is_active = true) AS districts_covered,
  (SELECT COALESCE(SUM(disputes_resolved), 0) FROM public.lrm_members WHERE is_active = true) AS total_disputes_resolved,
  (SELECT COALESCE(SUM(families_educated), 0) FROM public.lrm_members WHERE is_active = true) AS total_families_educated,
  (SELECT COALESCE(SUM(cases_handled), 0) FROM public.lrm_members WHERE is_active = true) AS total_cases_handled,
  (SELECT COUNT(*) FROM public.lrm_activities) AS total_activities,
  NOW() AS last_refreshed
FROM (SELECT 1) AS dummy;

-- Index for the view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_lrm_impact_stats ON public.mv_lrm_impact_stats (last_refreshed);

-- =====================================================
-- ABOUT PAGE CONTENT VIEW
-- =====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_about_page_content AS
SELECT
  'organization_content' AS source,
  oc.id,
  oc.content_type,
  oc.title,
  oc.content,
  oc.icon_name,
  oc.display_order,
  NULL::text AS image_url,
  NULL::text AS department
FROM public.organization_content oc
WHERE oc.is_active = true

UNION ALL

SELECT
  'team_members' AS source,
  tm.id,
  tm.member_type AS content_type,
  tm.name AS title,
  tm.bio AS content,
  NULL::varchar AS icon_name,
  tm.display_order,
  tm.image_url,
  tm.department
FROM public.team_members tm
WHERE tm.is_active = true

ORDER BY source, display_order;

-- Index for the view
CREATE INDEX IF NOT EXISTS idx_mv_about_content ON public.mv_about_page_content (source, content_type);

-- =====================================================
-- REFRESH FUNCTIONS
-- =====================================================

-- Function to refresh all public portal views
CREATE OR REPLACE FUNCTION refresh_public_portal_views()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_home_page_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_featured_programs;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_programs_list;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_news_events_list;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_portfolio_list;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_research_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_legal_aid_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_lrm_by_region;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_lrm_impact_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_about_page_content;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh specific view
CREATE OR REPLACE FUNCTION refresh_view(view_name TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('REFRESH MATERIALIZED VIEW CONCURRENTLY public.%I', view_name);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SCHEDULED REFRESH (pg_cron - if available)
-- =====================================================

-- Note: Run this only if pg_cron extension is available
-- SELECT cron.schedule('refresh-daily-views', '0 3 * * *', $$SELECT refresh_public_portal_views()$$);

-- =====================================================
-- TRIGGER-BASED REFRESH FOR CONTENT CHANGES
-- =====================================================

-- Refresh programs list when projects change
CREATE OR REPLACE FUNCTION trigger_refresh_programs_view()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM refresh_view('mv_programs_list');
  PERFORM refresh_view('mv_featured_programs');
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS refresh_programs_view_trigger ON public.projects;
CREATE TRIGGER refresh_programs_view_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.projects
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_programs_view();

-- Refresh news events when blogs change
CREATE OR REPLACE FUNCTION trigger_refresh_news_view()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM refresh_view('mv_news_events_list');
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS refresh_news_view_trigger ON public.blogs;
CREATE TRIGGER refresh_news_view_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.blogs
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_news_view();

-- Refresh portfolio when items change
CREATE OR REPLACE FUNCTION trigger_refresh_portfolio_view()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM refresh_view('mv_portfolio_list');
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS refresh_portfolio_view_trigger ON public.portfolio_items;
CREATE TRIGGER refresh_portfolio_view_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.portfolio_items
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_portfolio_view();

-- =====================================================
-- GRANT PERMISSIONS (for public access)
-- =====================================================

-- Grant read access to authenticated users
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant read access to anonymous users for public views
GRANT SELECT ON public.mv_home_page_stats TO anon;
GRANT SELECT ON public.mv_featured_programs TO anon;
GRANT SELECT ON public.mv_programs_list TO anon;
GRANT SELECT ON public.mv_news_events_list TO anon;
GRANT SELECT ON public.mv_portfolio_list TO anon;
GRANT SELECT ON public.mv_research_stats TO anon;
GRANT SELECT ON public.mv_legal_aid_stats TO anon;
GRANT SELECT ON public.mv_lrm_by_region TO anon;
GRANT SELECT ON public.mv_lrm_impact_stats TO anon;
GRANT SELECT ON public.mv_about_page_content TO anon;

-- =====================================================
-- INITIAL REFRESH
-- =====================================================

-- Note: Run this after all data migrations are complete
-- SELECT refresh_public_portal_views();
