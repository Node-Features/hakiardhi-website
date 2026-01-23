-- ============================================================================
-- Migration: Create Materialized View for News & Events
-- File: create_mv_news_events_list.sql
-- Description: Creates mv_news_events_list materialized view for public portal API
-- ============================================================================

-- Drop existing view if it exists
DROP MATERIALIZED VIEW IF EXISTS public.mv_news_events_list;

-- ============================================================================
-- Materialized View: mv_news_events_list
-- Purpose: Provides a unified view of news and events for the public portal
-- Used by: /api/public/news, /api/public/news/featured, /api/public/events/upcoming
-- ============================================================================

CREATE MATERIALIZED VIEW public.mv_news_events_list AS
SELECT
  b.id,
  b.title,
  b.slug,
  b.excerpt,
  b.content,
  b.cover_image,
  b.type,
  b.event_date,
  b.event_location,
  b.gallery,
  b.related_links,
  b.tags,
  b.is_featured,
  b.is_published,
  b.views_count,
  b.created_at,
  b.updated_at,
  -- Category information
  b.category_id,
  c.name AS category,
  c.description AS category_description,
  -- Author information
  b.author_id,
  CONCAT(u.first_name, ' ', u.last_name) AS author_name,
  u.image_url AS author_image,
  -- Computed fields
  COALESCE(b.event_date, b.created_at::date) AS date,
  CASE
    WHEN b.type = 'Event' AND b.event_date >= CURRENT_DATE THEN true
    ELSE false
  END AS is_upcoming,
  CASE
    WHEN b.type = 'Event' AND b.event_date < CURRENT_DATE THEN true
    ELSE false
  END AS is_past_event,
  -- Image count from gallery
  COALESCE(jsonb_array_length(b.gallery), 0) AS gallery_count
FROM public.blogs b
LEFT JOIN public.categories c ON b.category_id = c.id
LEFT JOIN public.users u ON b.author_id = u.id
WHERE b.is_published = true
ORDER BY
  CASE WHEN b.type = 'Event' THEN b.event_date ELSE b.created_at::date END DESC;

-- ============================================================================
-- Indexes for performance
-- ============================================================================

CREATE INDEX idx_mv_news_events_slug ON public.mv_news_events_list (slug);
CREATE INDEX idx_mv_news_events_type ON public.mv_news_events_list (type);
CREATE INDEX idx_mv_news_events_category ON public.mv_news_events_list (category);
CREATE INDEX idx_mv_news_events_date ON public.mv_news_events_list (date DESC);
CREATE INDEX idx_mv_news_events_featured ON public.mv_news_events_list (is_featured) WHERE is_featured = true;
CREATE INDEX idx_mv_news_events_upcoming ON public.mv_news_events_list (is_upcoming, event_date) WHERE is_upcoming = true;

-- ============================================================================
-- Function to refresh the materialized view
-- ============================================================================

CREATE OR REPLACE FUNCTION refresh_mv_news_events_list()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.mv_news_events_list;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Trigger to refresh view when blogs table changes
-- Note: For production, consider using pg_cron for scheduled refreshes instead
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_refresh_news_events_view()
RETURNS trigger AS $$
BEGIN
  -- Refresh asynchronously to avoid blocking the transaction
  PERFORM refresh_mv_news_events_list();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (disabled by default - enable in production if needed)
-- DROP TRIGGER IF EXISTS refresh_news_events_on_change ON public.blogs;
-- CREATE TRIGGER refresh_news_events_on_change
--   AFTER INSERT OR UPDATE OR DELETE ON public.blogs
--   FOR EACH STATEMENT
--   EXECUTE FUNCTION trigger_refresh_news_events_view();

-- ============================================================================
-- Grant permissions for public access
-- ============================================================================

GRANT SELECT ON public.mv_news_events_list TO anon;
GRANT SELECT ON public.mv_news_events_list TO authenticated;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON MATERIALIZED VIEW public.mv_news_events_list IS
  'Materialized view for news and events, used by public portal API endpoints';

COMMENT ON FUNCTION refresh_mv_news_events_list() IS
  'Refreshes the mv_news_events_list materialized view';
