-- ============================================================================
-- Seed Data: Blogs (News & Events)
-- File: seed_blogs_data.sql
-- Description: INSERT statements for blogs table with proper FK references
-- ============================================================================

-- ============================================================================
-- STEP 1: First, check/create required categories for blogs
-- ============================================================================

-- Insert categories for blogs if they don't exist
INSERT INTO public.categories (name, type, description)
VALUES
  ( 'Land Rights', 'blog', 'News and events related to land rights'),
  ( 'Legal Aid', 'blog', 'Legal aid services and updates'),
  ( 'Community Development', 'blog', 'Community development initiatives'),
  ( 'Advocacy', 'blog', 'Advocacy campaigns and policy updates'),
  ( 'Training', 'blog', 'Training events and workshops'),
  ( 'Research', 'blog', 'Research findings and publications')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- STEP 2: Insert blog entries using existing category and user references
-- ============================================================================

-- Example 1: News article using a subquery to get category_id
INSERT INTO public.blogs (
  title,
  content,
  slug,
  excerpt,
  cover_image,
  type,
  category_id,
  author_id,
  tags,
  gallery,
  related_links,
  is_featured,
  is_published
)
VALUES (
  'HakiArdhi Launches New Land Rights Awareness Campaign',
  '<p>HakiArdhi has launched a comprehensive awareness campaign aimed at educating rural communities about their land rights...</p><p>The campaign will cover 15 districts in Tanzania and reach over 50,000 beneficiaries.</p>',
  'hakiardhi-launches-land-rights-campaign-2024',
  'HakiArdhi launches comprehensive land rights awareness campaign targeting rural communities across Tanzania.',
  'https://example.com/images/campaign-launch.jpg',
  'News',
  -- Reference category by name using subquery
  (SELECT id FROM public.categories WHERE name = 'Land Rights' LIMIT 1),
  -- Reference author by email using subquery
  (SELECT id FROM public.users WHERE email = 'salum@example.com' LIMIT 1),
  '["land rights", "awareness", "rural communities", "campaign"]'::jsonb,
  '["https://example.com/images/campaign-1.jpg", "https://example.com/images/campaign-2.jpg"]'::jsonb,
  '[{"title": "Campaign Details", "url": "https://hakiardhi.or.tz/campaigns"}]'::jsonb,
  true,
  true
);

-- Example 2: Event with event_date and event_location
INSERT INTO public.blogs (
  title,
  content,
  slug,
  excerpt,
  cover_image,
  type,
  event_date,
  event_location,
  category_id,
  author_id,
  tags,
  is_featured,
  is_published
)
VALUES (
  'Annual Land Rights Conference 2024',
  '<p>Join us for the Annual Land Rights Conference bringing together stakeholders, policymakers, and community leaders...</p>',
  'annual-land-rights-conference-2024',
  'The Annual Land Rights Conference will bring together stakeholders from across Tanzania to discuss land policy reforms.',
  'https://example.com/images/conference-2024.jpg',
  'Event',
  '2024-06-15',
  'Julius Nyerere International Convention Centre, Dar es Salaam',
  (SELECT id FROM public.categories WHERE name = 'Advocacy' LIMIT 1),
  (SELECT id FROM public.users WHERE email = 'admin@hakiardhi.or.tz' LIMIT 1),
  '["conference", "land rights", "policy", "stakeholders"]'::jsonb,
  true,
  true
);

-- Example 3: Announcement type
INSERT INTO public.blogs (
  title,
  content,
  slug,
  excerpt,
  cover_image,
  type,
  category_id,
  author_id,
  tags,
  is_published
)
VALUES (
  'New Partnership with Tanzania Land Authority',
  '<p>HakiArdhi is pleased to announce a new strategic partnership with the Tanzania Land Authority...</p>',
  'partnership-tanzania-land-authority-2024',
  'HakiArdhi announces strategic partnership with Tanzania Land Authority to improve land registration processes.',
  'https://example.com/images/partnership.jpg',
  'Announcement',
  (SELECT id FROM public.categories WHERE name = 'Legal Aid' LIMIT 1),
  (SELECT id FROM public.users WHERE email = 'admin@hakiardhi.or.tz' LIMIT 1),
  '["partnership", "land authority", "government"]'::jsonb,
  true
);

-- Example 4: Update type
INSERT INTO public.blogs (
  title,
  content,
  slug,
  excerpt,
  cover_image,
  type,
  category_id,
  author_id,
  is_published
)
VALUES (
  'Q1 2024 Program Progress Update',
  '<p>We are pleased to share our Q1 2024 progress report highlighting key achievements in our programs...</p>',
  'q1-2024-program-progress-update',
  'Quarterly update on HakiArdhi program achievements and milestones for Q1 2024.',
  'https://example.com/images/q1-update.jpg',
  'Update',
  (SELECT id FROM public.categories WHERE name = 'Community Development' LIMIT 1),
  (SELECT id FROM public.users WHERE email = 'admin@hakiardhi.or.tz' LIMIT 1),
  true
);

-- ============================================================================
-- STEP 3: Insert using specific UUID references (if you know the IDs)
-- ============================================================================

-- Example using direct UUID references
INSERT INTO public.blogs (
  title,
  content,
  slug,
  excerpt,
  type,
  -- Use direct UUID if you know the category ID
  category_id,
  -- Use direct UUID if you know the user ID
  author_id,
  is_published
)
SELECT
  'LRM Training Workshop in Mwanza',
  '<p>A three-day training workshop for Land Rights Monitors was successfully conducted in Mwanza region...</p>',
  'lrm-training-workshop-mwanza-2024',
  'Successful LRM training workshop conducted in Mwanza region with 45 participants.',
  'News',
  c.id,
  u.id,
  true
FROM public.categories c, public.users u
WHERE c.name = 'Training'
  AND u.email = 'admin@hakiardhi.or.tz'
LIMIT 1;

-- ============================================================================
-- STEP 4: Bulk insert multiple records
-- ============================================================================

INSERT INTO public.blogs (
  title,
  content,
  slug,
  excerpt,
  type,
  event_date,
  event_location,
  category_id,
  author_id,
  is_featured,
  is_published
)
SELECT
  blog.title,
  blog.content,
  blog.slug,
  blog.excerpt,
  blog.type,
  blog.event_date::date,
  blog.event_location,
  (SELECT id FROM public.categories WHERE name = blog.category_name LIMIT 1),
  (SELECT id FROM public.users WHERE status = 'Active' LIMIT 1),
  blog.is_featured,
  true
FROM (
  VALUES
    (
      'Community Legal Clinic in Arusha',
      '<p>Free legal clinic providing land rights consultation to community members...</p>',
      'community-legal-clinic-arusha-2024',
      'Free legal clinic for land rights consultation in Arusha region.',
      'Event',
      '2024-07-20',
      'Arusha Community Center',
      'Legal Aid',
      false
    ),
    (
      'Women Land Rights Workshop',
      '<p>Empowering women with knowledge about their land ownership rights...</p>',
      'women-land-rights-workshop-2024',
      'Workshop focused on women''s land ownership rights and inheritance.',
      'Event',
      '2024-08-10',
      'Dodoma Regional Hall',
      'Land Rights',
      true
    ),
    (
      'Publication: Land Tenure Security Report 2024',
      '<p>HakiArdhi releases comprehensive report on land tenure security in Tanzania...</p>',
      'land-tenure-security-report-2024',
      'New research report on land tenure security challenges and solutions.',
      'News',
      NULL,
      NULL,
      'Research',
      false
    )
) AS blog(title, content, slug, excerpt, type, event_date, event_location, category_name, is_featured);

-- ============================================================================
-- STEP 5: Update existing records with category/author references
-- ============================================================================

-- Update a blog post to assign a category
UPDATE public.blogs
SET category_id = (SELECT id FROM public.categories WHERE name = 'Land Rights' LIMIT 1)
WHERE slug = 'some-existing-slug'
  AND category_id IS NULL;

-- Update a blog post to assign an author
UPDATE public.blogs
SET author_id = (SELECT id FROM public.users WHERE email = 'admin@hakiardhi.or.tz' LIMIT 1)
WHERE slug = 'some-existing-slug'
  AND author_id IS NULL;

-- ============================================================================
-- STEP 6: Verify the inserts
-- ============================================================================

-- Check inserted blogs with their category and author names
SELECT
  b.id,
  b.title,
  b.type,
  b.slug,
  c.name AS category_name,
  CONCAT(u.first_name, ' ', u.last_name) AS author_name,
  b.is_published,
  b.created_at
FROM public.blogs b
LEFT JOIN public.categories c ON b.category_id = c.id
LEFT JOIN public.users u ON b.author_id = u.id
ORDER BY b.created_at DESC;

-- ============================================================================
-- STEP 7: Refresh the materialized view after inserting data
-- ============================================================================

-- Refresh the materialized view to include new data
REFRESH MATERIALIZED VIEW public.mv_news_events_list;

-- Verify the materialized view
SELECT * FROM public.mv_news_events_list ORDER BY date DESC LIMIT 10;
