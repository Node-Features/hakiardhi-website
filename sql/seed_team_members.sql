-- ============================================================================
-- TEAM MEMBERS SEED DATA
-- Populates team_members table with leadership, board, and staff members
-- ============================================================================

-- Clear existing data (optional - comment out if you want to preserve existing records)
-- TRUNCATE TABLE public.team_members RESTART IDENTITY CASCADE;

-- ============================================================================
-- LEADERSHIP TEAM (member_type: 'leadership')
-- ============================================================================
INSERT INTO public.team_members (
  name, role, department, bio, image_url, email, phone,
  linkedin_url, twitter_url, member_type, display_order, is_active
) VALUES
(
  'Dr. Yefred Myenzi',
  'Executive Director',
  'Executive Office',
  'Dr. Yefred Myenzi has over 20 years of experience in land rights advocacy, policy development, and community empowerment in Tanzania. He leads HakiArdhi''s strategic direction and organizational management, ensuring the organization remains at the forefront of land rights research and advocacy.',
  '/images/team-1.jpg',
  'executive.director@hakiardhi.or.tz',
  '+255 22 266 3766',
  'https://linkedin.com/in/yefred-myenzi',
  NULL,
  'leadership',
  1,
  true
),
(
  'Anna Mwakasege',
  'Head of Programs',
  'Programs',
  'Anna Mwakasege oversees all program design, implementation, and monitoring activities. With expertise in community development and participatory approaches, she ensures HakiArdhi''s programs effectively reach and empower rural communities across Tanzania.',
  '/images/team-2.JPG',
  'programs@hakiardhi.or.tz',
  '+255 22 266 3766',
  'https://linkedin.com/in/anna-mwakasege',
  NULL,
  'leadership',
  2,
  true
),
(
  'John Mwangamba',
  'Head of Finance & Administration',
  'Finance & Administration',
  'John Mwangamba manages HakiArdhi''s financial operations, ensuring transparency and accountability in all organizational activities. He brings over 15 years of experience in nonprofit financial management and administration.',
  '/images/team-3.JPG',
  'finance@hakiardhi.or.tz',
  '+255 22 266 3766',
  NULL,
  NULL,
  'leadership',
  3,
  true
);

-- ============================================================================
-- BOARD OF DIRECTORS (member_type: 'board')
-- ============================================================================
INSERT INTO public.team_members (
  name, role, department, bio, image_url, email, phone,
  linkedin_url, twitter_url, member_type, display_order, is_active
) VALUES
(
  'Prof. Rwekaza Mukandala',
  'Chairperson',
  'Board of Directors',
  'Prof. Mukandala is a distinguished land rights and policy expert with extensive experience in governance and public policy. He provides strategic oversight and guidance to ensure HakiArdhi achieves its mission of securing land rights for all Tanzanians.',
  '/images/team-1.jpg',
  NULL,
  NULL,
  NULL,
  NULL,
  'board',
  1,
  true
),
(
  'Advocate Mary Tesha',
  'Vice Chairperson',
  'Board of Directors',
  'Advocate Mary Tesha is a legal and human rights specialist with over 25 years of experience in advocacy and legal reform. She brings invaluable expertise in constitutional law and human rights to the board.',
  '/images/team-2.JPG',
  NULL,
  NULL,
  NULL,
  NULL,
  'board',
  2,
  true
),
(
  'Dr. Faustine Bee',
  'Secretary',
  'Board of Directors',
  'Dr. Faustine Bee is a community development professional with expertise in rural development, agriculture, and grassroots mobilization. He ensures effective governance and communication within the board.',
  '/images/team-3.JPG',
  NULL,
  NULL,
  NULL,
  NULL,
  'board',
  3,
  true
),
(
  'CPA Elizabeth Lyimo',
  'Treasurer',
  'Board of Directors',
  'CPA Elizabeth Lyimo is a finance and nonprofit management expert who oversees the organization''s financial governance. She ensures fiscal responsibility and transparency in all HakiArdhi''s financial operations.',
  '/images/team-4.JPG',
  NULL,
  NULL,
  NULL,
  NULL,
  'board',
  4,
  true
),
(
  'Dr. Hussein Sosovele',
  'Board Member',
  'Board of Directors',
  'Dr. Hussein Sosovele is an environmental and natural resources specialist with expertise in climate change, land use planning, and conservation. He advises on environmental sustainability in land governance.',
  '/images/gender_training_1.JPG',
  NULL,
  NULL,
  NULL,
  NULL,
  'board',
  5,
  true
),
(
  'Dr. Opportuna Kweka',
  'Board Member',
  'Board of Directors',
  'Dr. Opportuna Kweka is a gender and social inclusion advocate with extensive research and advocacy experience in women''s land rights. She champions gender equity in all HakiArdhi programs.',
  '/images/gender_training_3.JPG',
  NULL,
  NULL,
  NULL,
  NULL,
  'board',
  6,
  true
),
(
  'Prof. Issa Shivji',
  'Board Member',
  'Board of Directors',
  'Prof. Issa Shivji is a renowned scholar and research representative with pioneering contributions to land law and human rights in Africa. He provides academic and research guidance to the organization.',
  '/images/legal_aid_1.JPG',
  NULL,
  NULL,
  NULL,
  NULL,
  'board',
  7,
  true
);

-- ============================================================================
-- STAFF MEMBERS (member_type: 'staff')
-- ============================================================================
INSERT INTO public.team_members (
  name, role, department, bio, image_url, email, phone,
  linkedin_url, twitter_url, member_type, display_order, is_active
) VALUES
(
  'Grace Minja',
  'Senior Program Officer',
  'Programs',
  'Grace Minja leads community engagement initiatives and ensures effective implementation of land rights programs across target regions. She has over 10 years of experience in participatory development.',
  '/images/capacity_building_1.jpg',
  'programs@hakiardhi.or.tz',
  '+255 22 266 3766',
  NULL,
  NULL,
  'staff',
  1,
  true
),
(
  'Peter Kimambo',
  'Communications Officer',
  'Communications',
  'Peter Kimambo manages HakiArdhi''s communications, advocacy campaigns, and stakeholder engagement. He ensures the organization''s message reaches target audiences effectively.',
  '/images/public_debate_2.JPG',
  'communications@hakiardhi.or.tz',
  '+255 22 266 3766',
  NULL,
  'https://twitter.com/hakiardhi',
  'staff',
  2,
  true
),
(
  'Sarah Mwakyusa',
  'Finance Officer',
  'Finance & Administration',
  'Sarah Mwakyusa handles day-to-day financial management, budgeting, and resource allocation. She ensures financial compliance and accurate reporting.',
  '/images/team-4.JPG',
  'finance@hakiardhi.or.tz',
  '+255 22 266 3766',
  NULL,
  NULL,
  'staff',
  3,
  true
),
(
  'Daniel Mbwambo',
  'Research & Documentation Officer',
  'Research',
  'Daniel Mbwambo leads research activities, evidence generation, and documentation of HakiArdhi''s work. He ensures research findings inform policy advocacy.',
  '/images/gender_training_2.JPG',
  'research@hakiardhi.or.tz',
  '+255 22 266 3766',
  NULL,
  NULL,
  'staff',
  4,
  true
),
(
  'Rehema Msuya',
  'Legal Aid Coordinator',
  'Legal Aid',
  'Rehema Msuya coordinates the legal aid program, providing support to communities facing land disputes. She connects communities with legal resources and representation.',
  '/images/legal_aid_1.JPG',
  'legalaid@hakiardhi.or.tz',
  '+255 22 266 3766',
  NULL,
  NULL,
  'staff',
  5,
  true
),
(
  'Joseph Mwita',
  'Program Support Officer',
  'Programs',
  'Joseph Mwita provides logistics, administration, and operational support for all program activities. He ensures smooth implementation of field operations.',
  '/images/capacity_building_2.jpg',
  'support@hakiardhi.or.tz',
  '+255 22 266 3766',
  NULL,
  NULL,
  'staff',
  6,
  true
),
(
  'Amina Hassan',
  'Gender & Social Inclusion Officer',
  'Programs',
  'Amina Hassan leads women''s land rights initiatives and ensures gender mainstreaming across all HakiArdhi programs. She advocates for women''s equal access to land.',
  '/images/gender_training_1.JPG',
  'gender@hakiardhi.or.tz',
  '+255 22 266 3766',
  NULL,
  NULL,
  'staff',
  7,
  true
),
(
  'Emmanuel Shirima',
  'IT & Digital Officer',
  'Administration',
  'Emmanuel Shirima manages HakiArdhi''s digital infrastructure, website, and technology systems. He drives digital transformation initiatives.',
  '/images/team-3.JPG',
  'it@hakiardhi.or.tz',
  '+255 22 266 3766',
  NULL,
  NULL,
  'staff',
  8,
  true
),
(
  'Neema Mwakipesile',
  'Membership & Outreach Coordinator',
  'Administration',
  'Neema Mwakipesile coordinates membership activities and organizational outreach. She manages relationships with members and partner organizations.',
  '/images/gender_training_3.JPG',
  'membership@hakiardhi.or.tz',
  '+255 22 266 3766',
  NULL,
  NULL,
  'staff',
  9,
  true
),
(
  'Frank Massawe',
  'Field Coordinator - Northern Zone',
  'Programs',
  'Frank Massawe coordinates HakiArdhi''s field activities in the Northern Zone, working directly with communities and local government authorities.',
  '/images/public_debate_2.JPG',
  'northern@hakiardhi.or.tz',
  '+255 22 266 3766',
  NULL,
  NULL,
  'staff',
  10,
  true
);

-- ============================================================================
-- ADVISORS (member_type: 'advisor')
-- ============================================================================
INSERT INTO public.team_members (
  name, role, department, bio, image_url, email, phone,
  linkedin_url, twitter_url, member_type, display_order, is_active
) VALUES
(
  'Prof. Marjorie Mbilinyi',
  'Senior Advisor - Gender & Land Rights',
  'Advisory',
  'Prof. Marjorie Mbilinyi is a renowned scholar and activist in gender studies and women''s land rights. She provides strategic guidance on gender mainstreaming and women''s empowerment.',
  '/images/gender_training_1.JPG',
  NULL,
  NULL,
  NULL,
  NULL,
  'advisor',
  1,
  true
),
(
  'Dr. Felician Kilahama',
  'Technical Advisor - Natural Resources',
  'Advisory',
  'Dr. Felician Kilahama is an expert in natural resource management and climate-smart land governance. He advises on environmental sustainability and climate adaptation.',
  '/images/team-1.jpg',
  NULL,
  NULL,
  NULL,
  NULL,
  'advisor',
  2,
  true
);

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this to verify the data was inserted correctly:
SELECT member_type, COUNT(*) as count FROM public.team_members GROUP BY member_type ORDER BY member_type;
