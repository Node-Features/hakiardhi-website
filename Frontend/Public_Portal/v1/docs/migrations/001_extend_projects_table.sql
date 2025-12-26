-- Migration: Extend Projects Table for Public Portal
-- Description: Adds public portal specific fields to the projects table
-- Author: Development Team
-- Date: 2024-11-20

-- =====================================================
-- EXTEND PROJECTS TABLE
-- =====================================================

-- Add new columns for public portal display
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS full_description TEXT,
ADD COLUMN IF NOT EXISTS cover_image TEXT,
ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id),
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS participants INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS objectives JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS outcomes JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS impact_metrics JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS partners JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_projects_published ON public.projects(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_projects_start_date ON public.projects(start_date DESC);

-- Add comment for documentation
COMMENT ON COLUMN public.projects.slug IS 'URL-friendly identifier for public access';
COMMENT ON COLUMN public.projects.short_description IS 'Brief description for listing pages (max 200 chars)';
COMMENT ON COLUMN public.projects.full_description IS 'Detailed description for detail pages';
COMMENT ON COLUMN public.projects.cover_image IS 'Main image URL for the project';
COMMENT ON COLUMN public.projects.gallery IS 'Array of image URLs for gallery display';
COMMENT ON COLUMN public.projects.objectives IS 'Array of project objectives';
COMMENT ON COLUMN public.projects.outcomes IS 'Array of project outcomes';
COMMENT ON COLUMN public.projects.impact_metrics IS 'Array of impact statistics {label, value, icon}';
COMMENT ON COLUMN public.projects.partners IS 'Array of partner names or objects';
COMMENT ON COLUMN public.projects.is_featured IS 'Flag for featured projects on homepage';
COMMENT ON COLUMN public.projects.is_published IS 'Flag to control public visibility';

-- Function to auto-generate slug from title
CREATE OR REPLACE FUNCTION generate_project_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
    NEW.slug := TRIM(BOTH '-' FROM NEW.slug);
    -- Add suffix if slug exists
    IF EXISTS (SELECT 1 FROM public.projects WHERE slug = NEW.slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) THEN
      NEW.slug := NEW.slug || '-' || EXTRACT(EPOCH FROM NOW())::integer;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating slug
DROP TRIGGER IF EXISTS trigger_generate_project_slug ON public.projects;
CREATE TRIGGER trigger_generate_project_slug
BEFORE INSERT OR UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION generate_project_slug();
