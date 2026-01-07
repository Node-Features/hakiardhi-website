-- ============================================================================
-- CATEGORY TYPES TABLE
-- Manages reusable types for categories (e.g., blog, incident, project, etc.)
-- ============================================================================

-- Create category_types table
CREATE TABLE IF NOT EXISTS public.category_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_category_types_name ON public.category_types(name);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_category_types_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_category_types_updated_at
  BEFORE UPDATE ON public.category_types
  FOR EACH ROW
  EXECUTE FUNCTION update_category_types_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.category_types ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to read category types"
  ON public.category_types
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert category types"
  ON public.category_types
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update category types"
  ON public.category_types
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete category types"
  ON public.category_types
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert default category types
INSERT INTO public.category_types (name, description) VALUES
  ('blog', 'Blog posts and articles'),
  ('incident', 'Incident reports and tracking'),
  ('project', 'Projects and initiatives'),
  ('activity', 'Activities and events'),
  ('case', 'Legal cases and matters'),
  ('publication', 'Publications and documents'),
  ('faq', 'Frequently asked questions')
ON CONFLICT (name) DO NOTHING;

-- Add comment to table
COMMENT ON TABLE public.category_types IS 'Stores reusable category types for various content in the system';
