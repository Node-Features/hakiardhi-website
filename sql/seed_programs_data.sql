-- =============================================
-- PROGRAMS DATA SEED SQL
-- =============================================
-- This script inserts dummy data for the programs/projects
-- based on the mv_programs_list materialized view schema
--
-- Tables affected: categories, regions, projects, project_locations,
--                  activities, beneficiaries, activity_beneficiaries
-- =============================================

-- =============================================
-- 1. CATEGORIES TABLE (Program Categories)
-- =============================================
INSERT INTO categories (id, name, type, description)
VALUES
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567801'::uuid,
    'Research',
    'program',
    'Our research programs generate evidence-based knowledge on land tenure systems, customary practices, and policy impacts across Tanzania.'
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567802'::uuid,
    'Training',
    'program',
    'Through the School of HakiArdhi and specialized workshops, we build grassroots capacity on land rights, governance, and advocacy.'
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567803'::uuid,
    'Advocacy',
    'program',
    'We engage in multi-level advocacy to influence land policies, laws, and practices at local, national, and regional levels.'
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567804'::uuid,
    'Legal Services',
    'program',
    'Our legal aid program provides free legal representation, counseling, and mediation services to communities and individuals facing land rights violations.'
  )
ON CONFLICT (name) DO UPDATE SET
  type = EXCLUDED.type,
  description = EXCLUDED.description;


-- =============================================
-- 2. REGIONS TABLE
-- =============================================
INSERT INTO regions (id, name)
VALUES
  ('b1c2d3e4-f5a6-7890-bcde-f12345678901'::uuid, 'Manyara'),
  ('b1c2d3e4-f5a6-7890-bcde-f12345678902'::uuid, 'Arusha'),
  ('b1c2d3e4-f5a6-7890-bcde-f12345678903'::uuid, 'Dar es Salaam'),
  ('b1c2d3e4-f5a6-7890-bcde-f12345678904'::uuid, 'Dodoma'),
  ('b1c2d3e4-f5a6-7890-bcde-f12345678905'::uuid, 'Morogoro'),
  ('b1c2d3e4-f5a6-7890-bcde-f12345678906'::uuid, 'Mwanza'),
  ('b1c2d3e4-f5a6-7890-bcde-f12345678907'::uuid, 'Ngorongoro'),
  ('b1c2d3e4-f5a6-7890-bcde-f12345678908'::uuid, 'Mbeya'),
  ('b1c2d3e4-f5a6-7890-bcde-f12345678909'::uuid, 'Kilimanjaro'),
  ('b1c2d3e4-f5a6-7890-bcde-f12345678910'::uuid, 'Iringa'),
  ('b1c2d3e4-f5a6-7890-bcde-f12345678911'::uuid, 'Pwani')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;


-- =============================================
-- 3. PROJECTS TABLE (Main Programs)
-- =============================================
INSERT INTO projects (
  id, slug, title, short_description, full_description, category_id,
  cover_image, start_date, end_date, status, location,
  objectives, outcomes, impact_metrics, partners, gallery,
  is_featured, is_published, participants, created_at, updated_at
)
VALUES
  -- Program 1: Land Tenure Systems Research - Manyara
  (
    'c1d2e3f4-a5b6-7890-cdef-123456789001'::uuid,
    'land-tenure-systems-research-manyara',
    'Land Tenure Systems Research - Manyara',
    'Comprehensive research on customary land tenure in Manyara region',
    'This groundbreaking research project examines the intricate customary land tenure systems in the Manyara region, documenting traditional land governance practices and their intersection with formal legal frameworks. The study aims to provide evidence-based recommendations for policy reforms that respect customary rights while ensuring land security for rural communities.',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567801'::uuid,
    '/images/hero_1.JPG',
    '2024-05-15',
    '2024-11-15',
    'Ongoing',
    'Manyara',
    '["Document customary land tenure practices in Manyara region", "Analyze conflicts between customary and statutory land laws", "Develop policy recommendations for harmonizing land governance systems", "Build local capacity in participatory land research methodologies"]'::jsonb,
    '["Comprehensive documentation of 25 village land tenure systems", "Training of 45 community researchers in participatory methods", "Publication of 3 peer-reviewed research reports", "Presentation of findings to district and regional authorities"]'::jsonb,
    '{"villages_covered": 25, "research_reports": 3, "policy_briefs": 5, "community_members_engaged": 450}'::jsonb,
    '["University of Dar es Salaam", "International Land Coalition"]'::jsonb,
    '["/images/hero_1.JPG", "/images/hero_2.JPG", "/images/team-1.jpg", "/images/farmers.png"]'::jsonb,
    true,
    true,
    45,
    '2024-05-15',
    NOW()
  ),

  -- Program 2: Community Paralegals Training
  (
    'c1d2e3f4-a5b6-7890-cdef-123456789002'::uuid,
    'community-paralegals-training',
    'Community Paralegals Training',
    'Building capacity of community paralegals on land rights',
    'This intensive capacity-building program equips community paralegals with comprehensive knowledge and skills to provide legal support to communities facing land rights challenges. Participants learn about land laws, legal procedures, mediation techniques, and community mobilization strategies to become effective advocates for justice in their communities.',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567802'::uuid,
    '/images/capacity_building_1.jpg',
    '2024-09-20',
    '2024-10-20',
    'Completed',
    'Arusha',
    '["Train community members to become effective paralegals", "Build understanding of land laws and legal procedures", "Develop skills in legal documentation and case management", "Strengthen community-based legal aid networks"]'::jsonb,
    '["120 community paralegals certified and deployed", "Establishment of 15 community legal aid desks", "Over 200 land dispute cases handled within first year", "Development of comprehensive paralegal training manual"]'::jsonb,
    '{"paralegals_trained": 120, "districts_covered": 15, "legal_cases_handled": 200, "communities_served": 50}'::jsonb,
    '["Austrian Development Agency", "Horizont3000"]'::jsonb,
    '["/images/capacity_building_1.jpg", "/images/capacity_building_2.jpg", "/images/capacity_building_3.jpg", "/images/team-2.JPG"]'::jsonb,
    true,
    true,
    120,
    '2024-09-20',
    NOW()
  ),

  -- Program 3: Women Land Rights Workshop
  (
    'c1d2e3f4-a5b6-7890-cdef-123456789003'::uuid,
    'women-land-rights-workshop',
    'Women Land Rights Workshop',
    'Empowering women with knowledge on inheritance and land ownership',
    'This transformative workshop addresses the critical challenge of women''s land rights in Tanzania, focusing on inheritance laws, property ownership, and overcoming cultural barriers. Through interactive sessions, women learn about their legal rights, share experiences, and develop strategies to secure land tenure and economic independence.',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567802'::uuid,
    '/images/gender_training_1.JPG',
    '2024-09-05',
    '2024-09-10',
    'Completed',
    'Dar es Salaam',
    '["Educate women on land inheritance and ownership rights", "Address cultural and legal barriers to women''s land access", "Develop advocacy strategies for gender-equitable land policies", "Create peer support networks for women land rights defenders"]'::jsonb,
    '["85 women trained on land rights and legal procedures", "Formation of 12 women''s land rights support groups", "40+ successful land ownership documentation cases", "Development of gender-responsive land rights advocacy toolkit"]'::jsonb,
    '{"women_empowered": 85, "support_groups_formed": 12, "legal_consultations": 150, "success_stories": 40}'::jsonb,
    '["UN Women Tanzania", "Tanzania Gender Networking Programme"]'::jsonb,
    '["/images/gender_training_1.JPG", "/images/gender_training_2.JPG", "/images/gender_training_3.JPG", "/images/team-3.JPG"]'::jsonb,
    false,
    true,
    85,
    '2024-09-05',
    NOW()
  ),

  -- Program 4: National Land Policy Dialogue
  (
    'c1d2e3f4-a5b6-7890-cdef-123456789004'::uuid,
    'national-land-policy-dialogue',
    'National Land Policy Dialogue',
    'Multi-stakeholder dialogue on land policy reforms',
    'A landmark national convening bringing together government officials, civil society organizations, traditional leaders, and community representatives to discuss critical land policy reforms. The dialogue provides a platform for evidence-based discussions on land governance challenges and collaborative solutions for equitable and sustainable land management.',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567803'::uuid,
    '/images/public_debate_1.JPG',
    '2024-08-02',
    '2024-08-05',
    'Completed',
    'Dodoma',
    '["Facilitate multi-stakeholder dialogue on land policy reforms", "Present research evidence on land governance challenges", "Build consensus on priority policy recommendations", "Strengthen collaboration between government and civil society"]'::jsonb,
    '["Adoption of 15 policy recommendations by government", "Establishment of multi-stakeholder land policy task force", "Extensive media coverage reaching 2 million+ citizens", "Publication of national land policy reform roadmap"]'::jsonb,
    '{"stakeholders_engaged": 200, "policy_recommendations": 15, "government_officials": 45, "media_outlets": 25}'::jsonb,
    '["Ministry of Lands", "National Land Forum", "Parliament of Tanzania"]'::jsonb,
    '["/images/public_debate_1.JPG", "/images/public_debate_2.JPG", "/images/nalaf-1.JPG", "/images/nalaf-2.JPG"]'::jsonb,
    true,
    true,
    200,
    '2024-08-02',
    NOW()
  ),

  -- Program 5: Legal Aid Clinic - Morogoro
  (
    'c1d2e3f4-a5b6-7890-cdef-123456789005'::uuid,
    'legal-aid-clinic-morogoro',
    'Legal Aid Clinic - Morogoro',
    'Free legal consultation and support for land disputes',
    'Our mobile legal aid clinic provides free legal consultation and representation to rural communities facing land disputes and tenure insecurity. Legal professionals and paralegals work directly with communities to resolve conflicts through mediation, legal documentation, and court representation when necessary.',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567804'::uuid,
    '/images/legal_aid_2.JPG',
    '2024-10-18',
    '2024-11-01',
    'Completed',
    'Morogoro',
    '["Provide free legal consultation to rural communities", "Resolve land disputes through mediation and legal processes", "Assist with land documentation and registration", "Build community awareness of legal rights and remedies"]'::jsonb,
    '["48 land dispute cases successfully resolved", "25 families received assistance with land title documentation", "32 successful community mediation sessions conducted", "Establishment of permanent legal aid desk in Morogoro"]'::jsonb,
    '{"cases_resolved": 48, "legal_consultations": 65, "mediation_sessions": 32, "land_documents_processed": 25}'::jsonb,
    '["Tanzania Legal Aid Society", "Morogoro District Council"]'::jsonb,
    '["/images/legal_aid_2.JPG", "/images/legal_aid_1.JPG", "/images/legal_aid_3.JPG", "/images/legal_aid_4.JPG"]'::jsonb,
    false,
    true,
    65,
    '2024-10-18',
    NOW()
  ),

  -- Program 6: School HakiArdhi Graduation
  (
    'c1d2e3f4-a5b6-7890-cdef-123456789006'::uuid,
    'school-hakiardhi-graduation',
    'School HakiArdhi Graduation',
    'Graduation of 150 trained land rights monitors',
    'The School HakiArdhi is our flagship training program that transforms community members into skilled land rights monitors and advocates. This graduation ceremony celebrates the achievement of 150 graduates who have completed intensive training in land rights, monitoring methodologies, and community advocacy techniques.',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567802'::uuid,
    '/images/capacity_building_2.jpg',
    '2024-01-25',
    '2024-07-25',
    'Completed',
    'Mwanza',
    '["Train community members as land rights monitors", "Build capacity in land rights monitoring and documentation", "Develop advocacy and community mobilization skills", "Create network of trained land rights defenders"]'::jsonb,
    '["150 certified land rights monitors deployed across Tanzania", "200+ monitoring reports documenting land rights violations", "Coverage of 75 villages with active monitoring systems", "Formation of national network of land rights monitors"]'::jsonb,
    '{"graduates_certified": 150, "monitoring_reports": 200, "villages_covered": 75, "violations_documented": 350}'::jsonb,
    '["Austrian Development Agency", "Horizont3000", "National Land Forum"]'::jsonb,
    '["/images/capacity_building_2.jpg", "/images/capacity_building_1.jpg", "/images/capacity_building_3.jpg", "/images/team-4.JPG"]'::jsonb,
    true,
    true,
    150,
    '2024-01-25',
    NOW()
  ),

  -- Program 7: Pastoralist Land Rights Research
  (
    'c1d2e3f4-a5b6-7890-cdef-123456789007'::uuid,
    'pastoralist-land-rights-research',
    'Pastoralist Land Rights Research',
    'Documentation of pastoralist land use and customary practices',
    'This research project focuses on documenting and analyzing the traditional land use patterns and customary tenure systems of pastoralist communities in Northern Tanzania. The study provides critical evidence on the importance of rangelands for pastoralist livelihoods and recommends policies to protect pastoralist land rights.',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567801'::uuid,
    '/images/hero_2.JPG',
    '2023-10-12',
    '2024-06-12',
    'Ongoing',
    'Ngorongoro',
    '["Document pastoralist land use and customary tenure practices", "Analyze threats to pastoralist land rights and livelihoods", "Develop policy recommendations for protecting rangeland rights", "Build capacity of pastoralist communities in advocacy"]'::jsonb,
    '["Comprehensive mapping of 40+ traditional grazing areas", "Documentation of customary land governance systems", "Publication of 4 research reports on pastoralist land rights", "Development of pastoralist land rights advocacy strategy"]'::jsonb,
    '{"pastoralist_groups_engaged": 15, "grazing_areas_mapped": 40, "research_publications": 4, "policy_briefs": 6}'::jsonb,
    '["International Land Coalition", "University of Dar es Salaam", "Pastoralist Council"]'::jsonb,
    '["/images/hero_2.JPG", "/images/pastoralists.png", "/images/team-1.jpg", "/images/hero_1.JPG"]'::jsonb,
    false,
    true,
    30,
    '2023-10-12',
    NOW()
  ),

  -- Program 8: Gender Training for Local Leaders
  (
    'c1d2e3f4-a5b6-7890-cdef-123456789008'::uuid,
    'gender-training-local-leaders',
    'Gender Training for Local Leaders',
    'Training local leaders on gender-responsive land governance',
    'This specialized training program targets local government leaders, village council members, and traditional authorities to promote gender-responsive land governance. Participants learn about gender equality principles, women''s land rights under Tanzanian law, and practical strategies for ensuring women''s participation in land decision-making.',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567802'::uuid,
    '/images/gender_training_2.JPG',
    '2024-10-01',
    '2024-10-08',
    'Completed',
    'Mbeya',
    '["Build capacity of local leaders in gender-responsive governance", "Promote understanding of women''s land rights frameworks", "Develop strategies for women''s participation in land decisions", "Address harmful cultural practices affecting women''s land access"]'::jsonb,
    '["95 local leaders committed to gender-responsive land governance", "8 villages adopted gender-equitable land allocation policies", "500+ women benefited from improved land governance practices", "Development of gender mainstreaming toolkit for local governments"]'::jsonb,
    '{"leaders_trained": 95, "districts_reached": 12, "policy_changes": 8, "women_beneficiaries": 500}'::jsonb,
    '["UN Women Tanzania", "Ministry of Community Development"]'::jsonb,
    '["/images/gender_training_2.JPG", "/images/gender_training_3.JPG", "/images/gender_training_1.JPG", "/images/team-3.JPG"]'::jsonb,
    false,
    true,
    95,
    '2024-10-01',
    NOW()
  ),

  -- Program 9: Parliamentary Advocacy Campaign
  (
    'c1d2e3f4-a5b6-7890-cdef-123456789009'::uuid,
    'parliamentary-advocacy-campaign',
    'Parliamentary Advocacy Campaign',
    'Advocacy for Village Land Act amendments',
    'This strategic advocacy campaign engages Members of Parliament, government ministries, and key stakeholders to advance critical amendments to the Village Land Act. Through evidence-based policy briefs, stakeholder consultations, and parliamentary lobbying, the campaign seeks to strengthen protections for community land rights and improve land governance frameworks.',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567803'::uuid,
    '/images/public_debate_2.JPG',
    '2024-05-20',
    '2024-09-20',
    'Ongoing',
    'Dodoma',
    '["Advocate for amendments to Village Land Act", "Build parliamentary support for land rights reforms", "Engage civil society in policy advocacy efforts", "Strengthen legal protections for community land rights"]'::jsonb,
    '["Engagement of 120 Members of Parliament on land rights issues", "Submission of 8 comprehensive policy briefs to parliament", "Formation of cross-party parliamentary caucus on land rights", "Widespread media coverage of land reform advocacy"]'::jsonb,
    '{"mps_engaged": 120, "policy_briefs_submitted": 8, "parliamentary_sessions": 15, "cso_partners": 45}'::jsonb,
    '["National Land Forum", "Tanzania Coalition on Land Rights", "Parliament of Tanzania"]'::jsonb,
    '["/images/public_debate_2.JPG", "/images/nalaf-2.JPG", "/images/public_debate_1.JPG", "/images/nalaf-1.JPG"]'::jsonb,
    true,
    true,
    180,
    '2024-05-20',
    NOW()
  ),

  -- Program 10: Community Land Documentation
  (
    'c1d2e3f4-a5b6-7890-cdef-123456789010'::uuid,
    'community-land-documentation',
    'Community Land Documentation',
    'Supporting villages to document customary land rights',
    'This technical assistance program supports rural villages in documenting and formalizing their customary land rights through participatory mapping, boundary demarcation, and certificate of customary right of occupancy (CCRO) processes. The program ensures communities have legal recognition and protection of their traditional land holdings.',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567804'::uuid,
    '/images/legal_aid_3.JPG',
    '2024-03-18',
    '2024-08-18',
    'Ongoing',
    'Kilimanjaro',
    '["Support villages in documenting customary land rights", "Facilitate participatory land use planning processes", "Assist with CCRO application and registration", "Build village capacity in land administration"]'::jsonb,
    '["180 certificates of customary rights issued to families", "Documentation of over 5,000 hectares of community land", "Completion of participatory land use plans for 10 villages", "Training of village land committees in land administration"]'::jsonb,
    '{"villages_supported": 10, "land_parcels_mapped": 250, "ccros_issued": 180, "hectares_documented": 5000}'::jsonb,
    '["Ministry of Lands", "Kilimanjaro District Council", "USAID Tanzania"]'::jsonb,
    '["/images/legal_aid_3.JPG", "/images/farmers.png", "/images/team-1.jpg", "/images/legal_aid_1.JPG"]'::jsonb,
    false,
    true,
    50,
    '2024-03-18',
    NOW()
  ),

  -- Program 11: Youth Leadership Training
  (
    'c1d2e3f4-a5b6-7890-cdef-123456789011'::uuid,
    'youth-leadership-training',
    'Youth Leadership Training',
    'Building next generation of land rights advocates',
    'This transformative leadership program empowers young people to become effective land rights advocates and community leaders. Through intensive training in advocacy, research, policy analysis, and community mobilization, youth participants develop the skills and confidence to lead land rights campaigns in their communities.',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567802'::uuid,
    '/images/capacity_building_3.jpg',
    '2024-10-27',
    '2024-11-10',
    'Completed',
    'Iringa',
    '["Build youth capacity in land rights advocacy", "Develop leadership and community mobilization skills", "Create network of young land rights advocates", "Empower youth participation in land governance"]'::jsonb,
    '["75 young leaders certified in land rights advocacy", "Launch of 12 youth-led land rights initiatives", "8 successful community advocacy campaigns led by youth", "Formation of national youth land rights network"]'::jsonb,
    '{"youth_trained": 75, "youth_led_initiatives": 12, "communities_reached": 30, "advocacy_campaigns": 8}'::jsonb,
    '["Youth for Land Justice Network", "African Youth Initiative on Climate Change"]'::jsonb,
    '["/images/capacity_building_3.jpg", "/images/team-4.JPG", "/images/capacity_building_1.jpg", "/images/team-2.JPG"]'::jsonb,
    false,
    true,
    75,
    '2024-10-27',
    NOW()
  ),

  -- Program 12: Legal Aid for Eviction Cases
  (
    'c1d2e3f4-a5b6-7890-cdef-123456789012'::uuid,
    'legal-aid-eviction-cases',
    'Legal Aid for Eviction Cases',
    'Representing communities facing illegal evictions',
    'This critical legal aid intervention provides pro bono legal representation to communities and individuals facing illegal evictions and forced displacement. Our legal team works to protect vulnerable communities from unlawful land grabbing, ensure due process, and secure compensation when evictions are lawful but inadequately compensated.',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567804'::uuid,
    '/images/legal_aid_4.JPG',
    '2024-04-05',
    '2024-07-05',
    'Completed',
    'Coastal Region',
    '["Provide legal representation to communities facing evictions", "Challenge illegal evictions through court proceedings", "Secure fair compensation for lawful evictions", "Document patterns of forced displacement for advocacy"]'::jsonb,
    '["28 successful court cases protecting community land rights", "15 illegal evictions halted through legal intervention", "Over TZS 850 million secured in compensation for affected families", "Documentation of forced displacement patterns for policy advocacy"]'::jsonb,
    '{"families_represented": 40, "cases_won": 28, "evictions_stopped": 15, "compensation_secured_tzs": 850000000}'::jsonb,
    '["Legal and Human Rights Centre", "Tanzania Human Rights Defenders Coalition"]'::jsonb,
    '["/images/legal_aid_4.JPG", "/images/legal_aid_2.JPG", "/images/fisher_folks.png", "/images/legal_aid_1.JPG"]'::jsonb,
    true,
    true,
    40,
    '2024-04-05',
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  full_description = EXCLUDED.full_description,
  cover_image = EXCLUDED.cover_image,
  status = EXCLUDED.status,
  objectives = EXCLUDED.objectives,
  outcomes = EXCLUDED.outcomes,
  impact_metrics = EXCLUDED.impact_metrics,
  partners = EXCLUDED.partners,
  gallery = EXCLUDED.gallery,
  is_featured = EXCLUDED.is_featured,
  participants = EXCLUDED.participants,
  updated_at = NOW();


-- =============================================
-- 4. PROJECT_LOCATIONS TABLE
-- =============================================
INSERT INTO project_locations (id, project_id, region_id, updated_at)
VALUES
  ('d1e2f3a4-b5c6-7890-def1-234567890001'::uuid, 'c1d2e3f4-a5b6-7890-cdef-123456789001'::uuid, 'b1c2d3e4-f5a6-7890-bcde-f12345678901'::uuid, NOW()),
  ('d1e2f3a4-b5c6-7890-def1-234567890002'::uuid, 'c1d2e3f4-a5b6-7890-cdef-123456789002'::uuid, 'b1c2d3e4-f5a6-7890-bcde-f12345678902'::uuid, NOW()),
  ('d1e2f3a4-b5c6-7890-def1-234567890003'::uuid, 'c1d2e3f4-a5b6-7890-cdef-123456789003'::uuid, 'b1c2d3e4-f5a6-7890-bcde-f12345678903'::uuid, NOW()),
  ('d1e2f3a4-b5c6-7890-def1-234567890004'::uuid, 'c1d2e3f4-a5b6-7890-cdef-123456789004'::uuid, 'b1c2d3e4-f5a6-7890-bcde-f12345678904'::uuid, NOW()),
  ('d1e2f3a4-b5c6-7890-def1-234567890005'::uuid, 'c1d2e3f4-a5b6-7890-cdef-123456789005'::uuid, 'b1c2d3e4-f5a6-7890-bcde-f12345678905'::uuid, NOW()),
  ('d1e2f3a4-b5c6-7890-def1-234567890006'::uuid, 'c1d2e3f4-a5b6-7890-cdef-123456789006'::uuid, 'b1c2d3e4-f5a6-7890-bcde-f12345678906'::uuid, NOW()),
  ('d1e2f3a4-b5c6-7890-def1-234567890007'::uuid, 'c1d2e3f4-a5b6-7890-cdef-123456789007'::uuid, 'b1c2d3e4-f5a6-7890-bcde-f12345678907'::uuid, NOW()),
  ('d1e2f3a4-b5c6-7890-def1-234567890008'::uuid, 'c1d2e3f4-a5b6-7890-cdef-123456789008'::uuid, 'b1c2d3e4-f5a6-7890-bcde-f12345678908'::uuid, NOW()),
  ('d1e2f3a4-b5c6-7890-def1-234567890009'::uuid, 'c1d2e3f4-a5b6-7890-cdef-123456789009'::uuid, 'b1c2d3e4-f5a6-7890-bcde-f12345678904'::uuid, NOW()),
  ('d1e2f3a4-b5c6-7890-def1-234567890010'::uuid, 'c1d2e3f4-a5b6-7890-cdef-123456789010'::uuid, 'b1c2d3e4-f5a6-7890-bcde-f12345678909'::uuid, NOW()),
  ('d1e2f3a4-b5c6-7890-def1-234567890011'::uuid, 'c1d2e3f4-a5b6-7890-cdef-123456789011'::uuid, 'b1c2d3e4-f5a6-7890-bcde-f12345678910'::uuid, NOW()),
  ('d1e2f3a4-b5c6-7890-def1-234567890012'::uuid, 'c1d2e3f4-a5b6-7890-cdef-123456789012'::uuid, 'b1c2d3e4-f5a6-7890-bcde-f12345678911'::uuid, NOW())
ON CONFLICT (id) DO NOTHING;


-- =============================================
-- 5. ACTIVITIES TABLE
-- =============================================
INSERT INTO activities (id, name, project_id, start_date, end_date, status, created_at, updated_at)
VALUES
  -- Project 1 Activities
  ('e1f2a3b4-c5d6-7890-ef12-345678900101'::uuid, 'Field Research & Documentation', 'c1d2e3f4-a5b6-7890-cdef-123456789001'::uuid, '2024-05-15', '2024-08-15', 'Completed', NOW(), NOW()),
  ('e1f2a3b4-c5d6-7890-ef12-345678900102'::uuid, 'Community Researcher Training', 'c1d2e3f4-a5b6-7890-cdef-123456789001'::uuid, '2024-06-01', '2024-06-30', 'Completed', NOW(), NOW()),

  -- Project 2 Activities
  ('e1f2a3b4-c5d6-7890-ef12-345678900201'::uuid, 'Legal Framework Training', 'c1d2e3f4-a5b6-7890-cdef-123456789002'::uuid, '2024-09-20', '2024-10-01', 'Completed', NOW(), NOW()),
  ('e1f2a3b4-c5d6-7890-ef12-345678900202'::uuid, 'Paralegal Certification', 'c1d2e3f4-a5b6-7890-cdef-123456789002'::uuid, '2024-10-01', '2024-10-20', 'Completed', NOW(), NOW()),

  -- Project 3 Activities
  ('e1f2a3b4-c5d6-7890-ef12-345678900301'::uuid, 'Rights Awareness Sessions', 'c1d2e3f4-a5b6-7890-cdef-123456789003'::uuid, '2024-09-05', '2024-09-10', 'Completed', NOW(), NOW()),

  -- Project 4 Activities
  ('e1f2a3b4-c5d6-7890-ef12-345678900401'::uuid, 'Policy Dialogue Sessions', 'c1d2e3f4-a5b6-7890-cdef-123456789004'::uuid, '2024-08-02', '2024-08-05', 'Completed', NOW(), NOW()),

  -- Project 5 Activities
  ('e1f2a3b4-c5d6-7890-ef12-345678900501'::uuid, 'Legal Consultations', 'c1d2e3f4-a5b6-7890-cdef-123456789005'::uuid, '2024-10-18', '2024-11-01', 'Completed', NOW(), NOW()),

  -- Project 6 Activities
  ('e1f2a3b4-c5d6-7890-ef12-345678900601'::uuid, 'Intensive Training Program', 'c1d2e3f4-a5b6-7890-cdef-123456789006'::uuid, '2024-01-25', '2024-07-25', 'Completed', NOW(), NOW()),

  -- Project 7 Activities
  ('e1f2a3b4-c5d6-7890-ef12-345678900701'::uuid, 'Pastoralist Engagement', 'c1d2e3f4-a5b6-7890-cdef-123456789007'::uuid, '2023-10-12', '2024-02-12', 'Completed', NOW(), NOW()),

  -- Project 8 Activities
  ('e1f2a3b4-c5d6-7890-ef12-345678900801'::uuid, 'Gender Sensitization Training', 'c1d2e3f4-a5b6-7890-cdef-123456789008'::uuid, '2024-10-01', '2024-10-08', 'Completed', NOW(), NOW()),

  -- Project 9 Activities
  ('e1f2a3b4-c5d6-7890-ef12-345678900901'::uuid, 'Parliamentary Lobbying', 'c1d2e3f4-a5b6-7890-cdef-123456789009'::uuid, '2024-05-20', '2024-09-20', 'Ongoing', NOW(), NOW()),

  -- Project 10 Activities
  ('e1f2a3b4-c5d6-7890-ef12-345678901001'::uuid, 'Participatory Mapping', 'c1d2e3f4-a5b6-7890-cdef-123456789010'::uuid, '2024-03-18', '2024-05-18', 'Completed', NOW(), NOW()),

  -- Project 11 Activities
  ('e1f2a3b4-c5d6-7890-ef12-345678901101'::uuid, 'Youth Leadership Training', 'c1d2e3f4-a5b6-7890-cdef-123456789011'::uuid, '2024-10-27', '2024-11-10', 'Completed', NOW(), NOW()),

  -- Project 12 Activities
  ('e1f2a3b4-c5d6-7890-ef12-345678901201'::uuid, 'Legal Representation', 'c1d2e3f4-a5b6-7890-cdef-123456789012'::uuid, '2024-04-05', '2024-07-05', 'Completed', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  updated_at = NOW();


-- =============================================
-- 6. BENEFICIARIES TABLE
-- =============================================
-- Create sample beneficiaries for participant counts
DO $$
DECLARE
  i INTEGER;
  region_id UUID;
  sex_val TEXT;
  age_group_val TEXT;
BEGIN
  FOR i IN 1..1000 LOOP
    -- Determine region based on range
    IF i <= 45 THEN
      region_id := 'b1c2d3e4-f5a6-7890-bcde-f12345678901'::uuid; -- Manyara
    ELSIF i <= 165 THEN
      region_id := 'b1c2d3e4-f5a6-7890-bcde-f12345678902'::uuid; -- Arusha
    ELSIF i <= 250 THEN
      region_id := 'b1c2d3e4-f5a6-7890-bcde-f12345678903'::uuid; -- Dar
    ELSIF i <= 450 THEN
      region_id := 'b1c2d3e4-f5a6-7890-bcde-f12345678904'::uuid; -- Dodoma
    ELSIF i <= 515 THEN
      region_id := 'b1c2d3e4-f5a6-7890-bcde-f12345678905'::uuid; -- Morogoro
    ELSIF i <= 665 THEN
      region_id := 'b1c2d3e4-f5a6-7890-bcde-f12345678906'::uuid; -- Mwanza
    ELSIF i <= 695 THEN
      region_id := 'b1c2d3e4-f5a6-7890-bcde-f12345678907'::uuid; -- Ngorongoro
    ELSIF i <= 790 THEN
      region_id := 'b1c2d3e4-f5a6-7890-bcde-f12345678908'::uuid; -- Mbeya
    ELSIF i <= 840 THEN
      region_id := 'b1c2d3e4-f5a6-7890-bcde-f12345678909'::uuid; -- Kilimanjaro
    ELSIF i <= 915 THEN
      region_id := 'b1c2d3e4-f5a6-7890-bcde-f12345678910'::uuid; -- Iringa
    ELSE
      region_id := 'b1c2d3e4-f5a6-7890-bcde-f12345678911'::uuid; -- Pwani
    END IF;

    -- Randomize sex
    IF i % 3 = 0 THEN sex_val := 'male';
    ELSIF i % 3 = 1 THEN sex_val := 'female';
    ELSE sex_val := 'female';
    END IF;

    -- Randomize age group
    IF i % 4 = 0 THEN age_group_val := '18-25';
    ELSIF i % 4 = 1 THEN age_group_val := '26-35';
    ELSIF i % 4 = 2 THEN age_group_val := '36-45';
    ELSE age_group_val := '46+';
    END IF;

    INSERT INTO beneficiaries (id, first_name, last_name, sex, age_group, region_id, status, created_at, updated_at)
    VALUES (
      ('f1a2b3c4-d5e6-7890-fa12-' || LPAD(i::text, 12, '0'))::uuid,
      'Beneficiary',
      'Number ' || i,
      sex_val,
      age_group_val,
      region_id,
      'Active',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;


-- =============================================
-- 7. ACTIVITY_BENEFICIARIES TABLE
-- =============================================
-- Link beneficiaries to activities for participant counts

-- Project 1: 45 participants (Activity 1)
INSERT INTO activity_beneficiaries (id, activity_id, beneficiary_id, attended, created_at, updated_at)
SELECT
  ('ab12c3d4-e5f6-7890-ab01-' || LPAD(n::text, 12, '0'))::uuid,
  'e1f2a3b4-c5d6-7890-ef12-345678900101'::uuid,
  ('f1a2b3c4-d5e6-7890-fa12-' || LPAD(n::text, 12, '0'))::uuid,
  true,
  NOW(),
  NOW()
FROM generate_series(1, 45) n
ON CONFLICT (id) DO NOTHING;

-- Project 2: 120 participants (Activity 1)
INSERT INTO activity_beneficiaries (id, activity_id, beneficiary_id, attended, created_at, updated_at)
SELECT
  ('ab12c3d4-e5f6-7890-ab02-' || LPAD(n::text, 12, '0'))::uuid,
  'e1f2a3b4-c5d6-7890-ef12-345678900201'::uuid,
  ('f1a2b3c4-d5e6-7890-fa12-' || LPAD((n + 45)::text, 12, '0'))::uuid,
  true,
  NOW(),
  NOW()
FROM generate_series(1, 120) n
ON CONFLICT (id) DO NOTHING;

-- Project 3: 85 participants
INSERT INTO activity_beneficiaries (id, activity_id, beneficiary_id, attended, created_at, updated_at)
SELECT
  ('ab12c3d4-e5f6-7890-ab03-' || LPAD(n::text, 12, '0'))::uuid,
  'e1f2a3b4-c5d6-7890-ef12-345678900301'::uuid,
  ('f1a2b3c4-d5e6-7890-fa12-' || LPAD((n + 165)::text, 12, '0'))::uuid,
  true,
  NOW(),
  NOW()
FROM generate_series(1, 85) n
ON CONFLICT (id) DO NOTHING;

-- Project 4: 200 participants
INSERT INTO activity_beneficiaries (id, activity_id, beneficiary_id, attended, created_at, updated_at)
SELECT
  ('ab12c3d4-e5f6-7890-ab04-' || LPAD(n::text, 12, '0'))::uuid,
  'e1f2a3b4-c5d6-7890-ef12-345678900401'::uuid,
  ('f1a2b3c4-d5e6-7890-fa12-' || LPAD((n + 250)::text, 12, '0'))::uuid,
  true,
  NOW(),
  NOW()
FROM generate_series(1, 200) n
ON CONFLICT (id) DO NOTHING;

-- Project 5: 65 participants
INSERT INTO activity_beneficiaries (id, activity_id, beneficiary_id, attended, created_at, updated_at)
SELECT
  ('ab12c3d4-e5f6-7890-ab05-' || LPAD(n::text, 12, '0'))::uuid,
  'e1f2a3b4-c5d6-7890-ef12-345678900501'::uuid,
  ('f1a2b3c4-d5e6-7890-fa12-' || LPAD((n + 450)::text, 12, '0'))::uuid,
  true,
  NOW(),
  NOW()
FROM generate_series(1, 65) n
ON CONFLICT (id) DO NOTHING;

-- Project 6: 150 participants
INSERT INTO activity_beneficiaries (id, activity_id, beneficiary_id, attended, created_at, updated_at)
SELECT
  ('ab12c3d4-e5f6-7890-ab06-' || LPAD(n::text, 12, '0'))::uuid,
  'e1f2a3b4-c5d6-7890-ef12-345678900601'::uuid,
  ('f1a2b3c4-d5e6-7890-fa12-' || LPAD((n + 515)::text, 12, '0'))::uuid,
  true,
  NOW(),
  NOW()
FROM generate_series(1, 150) n
ON CONFLICT (id) DO NOTHING;

-- Project 7: 30 participants
INSERT INTO activity_beneficiaries (id, activity_id, beneficiary_id, attended, created_at, updated_at)
SELECT
  ('ab12c3d4-e5f6-7890-ab07-' || LPAD(n::text, 12, '0'))::uuid,
  'e1f2a3b4-c5d6-7890-ef12-345678900701'::uuid,
  ('f1a2b3c4-d5e6-7890-fa12-' || LPAD((n + 665)::text, 12, '0'))::uuid,
  true,
  NOW(),
  NOW()
FROM generate_series(1, 30) n
ON CONFLICT (id) DO NOTHING;

-- Project 8: 95 participants
INSERT INTO activity_beneficiaries (id, activity_id, beneficiary_id, attended, created_at, updated_at)
SELECT
  ('ab12c3d4-e5f6-7890-ab08-' || LPAD(n::text, 12, '0'))::uuid,
  'e1f2a3b4-c5d6-7890-ef12-345678900801'::uuid,
  ('f1a2b3c4-d5e6-7890-fa12-' || LPAD((n + 695)::text, 12, '0'))::uuid,
  true,
  NOW(),
  NOW()
FROM generate_series(1, 95) n
ON CONFLICT (id) DO NOTHING;

-- Project 9: 180 participants (for MPs and stakeholders - reuse Dodoma beneficiaries)
INSERT INTO activity_beneficiaries (id, activity_id, beneficiary_id, attended, created_at, updated_at)
SELECT
  ('ab12c3d4-e5f6-7890-ab09-' || LPAD(n::text, 12, '0'))::uuid,
  'e1f2a3b4-c5d6-7890-ef12-345678900901'::uuid,
  ('f1a2b3c4-d5e6-7890-fa12-' || LPAD((n + 270)::text, 12, '0'))::uuid,
  true,
  NOW(),
  NOW()
FROM generate_series(1, 180) n
ON CONFLICT (id) DO NOTHING;

-- Project 10: 50 participants
INSERT INTO activity_beneficiaries (id, activity_id, beneficiary_id, attended, created_at, updated_at)
SELECT
  ('ab12c3d4-e5f6-7890-ab10-' || LPAD(n::text, 12, '0'))::uuid,
  'e1f2a3b4-c5d6-7890-ef12-345678901001'::uuid,
  ('f1a2b3c4-d5e6-7890-fa12-' || LPAD((n + 790)::text, 12, '0'))::uuid,
  true,
  NOW(),
  NOW()
FROM generate_series(1, 50) n
ON CONFLICT (id) DO NOTHING;

-- Project 11: 75 participants
INSERT INTO activity_beneficiaries (id, activity_id, beneficiary_id, attended, created_at, updated_at)
SELECT
  ('ab12c3d4-e5f6-7890-ab11-' || LPAD(n::text, 12, '0'))::uuid,
  'e1f2a3b4-c5d6-7890-ef12-345678901101'::uuid,
  ('f1a2b3c4-d5e6-7890-fa12-' || LPAD((n + 840)::text, 12, '0'))::uuid,
  true,
  NOW(),
  NOW()
FROM generate_series(1, 75) n
ON CONFLICT (id) DO NOTHING;

-- Project 12: 40 participants
INSERT INTO activity_beneficiaries (id, activity_id, beneficiary_id, attended, created_at, updated_at)
SELECT
  ('ab12c3d4-e5f6-7890-ab12-' || LPAD(n::text, 12, '0'))::uuid,
  'e1f2a3b4-c5d6-7890-ef12-345678901201'::uuid,
  ('f1a2b3c4-d5e6-7890-fa12-' || LPAD((n + 915)::text, 12, '0'))::uuid,
  true,
  NOW(),
  NOW()
FROM generate_series(1, 40) n
ON CONFLICT (id) DO NOTHING;


-- =============================================
-- 8. REFRESH MATERIALIZED VIEW (if exists)
-- =============================================
-- Uncomment to refresh the materialized view after data insertion
-- REFRESH MATERIALIZED VIEW mv_programs_list;


-- =============================================
-- VERIFICATION QUERIES
-- =============================================
-- Run these queries to verify the data was inserted correctly:

-- SELECT COUNT(*) as category_count FROM categories WHERE type = 'program';
-- SELECT COUNT(*) as region_count FROM regions;
-- SELECT COUNT(*) as project_count FROM projects WHERE is_published = true;
-- SELECT COUNT(*) as location_count FROM project_locations;
-- SELECT COUNT(*) as activity_count FROM activities;
-- SELECT COUNT(*) as beneficiary_count FROM beneficiaries;
-- SELECT COUNT(*) as ab_count FROM activity_beneficiaries;

-- Verify participant counts through the materialized view:
-- SELECT title, location, participants_count FROM mv_programs_list ORDER BY start_date DESC;
