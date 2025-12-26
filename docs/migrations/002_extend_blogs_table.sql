-- Migration: Extend Blogs Table for Public Portal
-- Description: Adds public portal specific fields to the blogs table
-- Author: Development Team
-- Date: 2024-11-20

-- =====================================================
-- EXTEND BLOGS TABLE
-- =====================================================

-- Add new columns for public portal display
ALTER TABLE public.blogs
ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS excerpt TEXT,
ADD COLUMN IF NOT EXISTS cover_image TEXT,
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'News', -- 'News', 'Event', 'Announcement'
ADD COLUMN IF NOT EXISTS event_date DATE,
ADD COLUMN IF NOT EXISTS event_location VARCHAR(255),
ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS related_links JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON public.blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_type ON public.blogs(type);
CREATE INDEX IF NOT EXISTS idx_blogs_event_date ON public.blogs(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_featured ON public.blogs(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_blogs_published ON public.blogs(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_blogs_created ON public.blogs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_tags ON public.blogs USING GIN(tags);

-- Add constraints
ALTER TABLE public.blogs
ADD CONSTRAINT chk_blogs_type CHECK (type IN ('News', 'Event', 'Announcement', 'Update'));

-- Add comments
COMMENT ON COLUMN public.blogs.slug IS 'URL-friendly identifier for public access';
COMMENT ON COLUMN public.blogs.excerpt IS 'Short summary for listing pages (max 200 chars)';
COMMENT ON COLUMN public.blogs.cover_image IS 'Main image URL for the blog post';
COMMENT ON COLUMN public.blogs.type IS 'Content type: News, Event, Announcement';
COMMENT ON COLUMN public.blogs.event_date IS 'Date of event (if type is Event)';
COMMENT ON COLUMN public.blogs.event_location IS 'Location of event (if type is Event)';
COMMENT ON COLUMN public.blogs.gallery IS 'Array of additional image URLs';
COMMENT ON COLUMN public.blogs.related_links IS 'Array of {title, url} objects';
COMMENT ON COLUMN public.blogs.is_featured IS 'Flag for featured content on homepage';
COMMENT ON COLUMN public.blogs.is_published IS 'Flag to control public visibility';
COMMENT ON COLUMN public.blogs.views_count IS 'Number of times the blog has been viewed';
COMMENT ON COLUMN public.blogs.tags IS 'Array of tag strings for categorization';

-- Function to auto-generate slug from title
CREATE OR REPLACE FUNCTION generate_blog_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
    NEW.slug := TRIM(BOTH '-' FROM NEW.slug);
    -- Add suffix if slug exists
    IF EXISTS (SELECT 1 FROM public.blogs WHERE slug = NEW.slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) THEN
      NEW.slug := NEW.slug || '-' || EXTRACT(EPOCH FROM NOW())::integer;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating slug
DROP TRIGGER IF EXISTS trigger_generate_blog_slug ON public.blogs;
CREATE TRIGGER trigger_generate_blog_slug
BEFORE INSERT OR UPDATE ON public.blogs
FOR EACH ROW
EXECUTE FUNCTION generate_blog_slug();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_blog_views(blog_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.blogs
  SET views_count = views_count + 1
  WHERE id = blog_id;
END;
$$ LANGUAGE plpgsql;
