-- ============================================================================
-- FIX: update_research_area_count() trigger function
-- ============================================================================
-- This function was causing "UPDATE requires a WHERE clause" error
-- The issue: It was trying to UPDATE all research_areas without WHERE clause
-- The fix: Update counts with proper WHERE clause for each research area
-- ============================================================================

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS update_research_area_count() CASCADE;

-- Recreate the function with proper WHERE clause
CREATE OR REPLACE FUNCTION update_research_area_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update publication counts for all research areas
  -- This counts publications that have the research area name in their topics array
  UPDATE research_areas
  SET publication_count = (
    SELECT COUNT(*)
    FROM publications
    WHERE research_areas.name = ANY(publications.topics::text[])
      AND publications.is_published = true
  )
  WHERE id IN (
    -- Only update research areas that might have changed
    SELECT DISTINCT ra.id
    FROM research_areas ra
    WHERE EXISTS (
      SELECT 1
      FROM publications p
      WHERE ra.name = ANY(p.topics::text[])
    )
  );

  RETURN NULL; -- For AFTER trigger
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS trigger_update_research_area_count ON publications;

CREATE TRIGGER trigger_update_research_area_count
AFTER INSERT OR UPDATE OR DELETE ON publications
FOR EACH STATEMENT
EXECUTE FUNCTION update_research_area_count();

-- Verify the fix by manually running the update once
-- This will set correct counts for all research areas
UPDATE research_areas
SET publication_count = (
  SELECT COUNT(*)
  FROM publications
  WHERE research_areas.name = ANY(publications.topics::text[])
    AND publications.is_published = true
);

-- Display updated counts
SELECT
  id,
  name,
  publication_count,
  is_active
FROM research_areas
ORDER BY publication_count DESC, name;
