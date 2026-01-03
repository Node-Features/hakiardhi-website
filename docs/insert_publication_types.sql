-- ============================================================================
-- INSERT PUBLICATION TYPES INTO CATEGORIES TABLE
-- ============================================================================
-- This script inserts all valid publication types as defined in the
-- publications table constraint into the categories table.
-- ============================================================================

-- Insert publication types
-- Using ON CONFLICT to avoid duplicate errors if some types already exist
INSERT INTO public.categories (name, type, description)
VALUES
  ('Report', 'publication', 'Research reports and technical documentation'),
  ('Policy Brief', 'publication', 'Short policy-oriented documents providing analysis and recommendations'),
  ('Journal Article', 'publication', 'Peer-reviewed articles published in academic journals'),
  ('Working Paper', 'publication', 'Preliminary research papers circulated for discussion'),
  ('Positional Paper', 'publication', 'Documents outlining organization stance on specific issues'),
  ('Book', 'publication', 'Published books and monographs'),
  ('Book Chapter', 'publication', 'Individual chapters within edited books or collections'),
  ('Thesis', 'publication', 'Academic theses and dissertations'),
  ('Other', 'publication', 'Other types of publications not covered by standard categories')
ON CONFLICT (name) DO UPDATE
SET
  type = EXCLUDED.type,
  description = EXCLUDED.description;

-- Verify the insertion
SELECT
  id,
  name,
  type,
  description
FROM public.categories
WHERE type = 'publication'
ORDER BY name;
