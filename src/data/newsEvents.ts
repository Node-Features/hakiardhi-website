// News & Events data structure
export interface NewsEvent {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  fullDescription: string;
  image: string;
  type: 'News' | 'Event' | 'Announcement';
  category: string;
  date: string;
  author?: string;
  location?: string;
  featured?: boolean;
  gallery?: string[];
  relatedLinks?: {
    title: string;
    url: string;
  }[];
}

// Sample news and events data
export const newsEvents: NewsEvent[] = [
  {
    id: 'ne-001',
    slug: 'major-land-rights-victory-supreme-court',
    title: 'Major Land Rights Victory in Supreme Court',
    excerpt: 'Historic ruling affirms community land rights in landmark case affecting thousands of families across Tanzania.',
    fullDescription: 'In a groundbreaking decision, the Supreme Court of Tanzania has ruled in favor of community land rights, setting a precedent that will impact thousands of families across the nation. This landmark case, which HakiArdhi has been supporting for over three years, represents a major victory for land rights advocacy in East Africa.\n\nThe ruling affirms that communities have the right to challenge land acquisitions that were conducted without proper consultation and compensation. This decision strengthens the legal framework protecting community land tenure and establishes clear guidelines for future land governance.\n\nThe case involved a rural community whose ancestral lands were acquired for commercial development without adequate consultation. Working with HakiArdhi\'s legal team, the community successfully demonstrated that proper procedures were not followed, and their rights under the Land Act were violated.',
    image: '/images/legal_aid_1.JPG',
    type: 'News',
    category: 'Legal Updates',
    date: '2024-03-15',
    author: 'HakiArdhi Legal Team',
    featured: true,
    gallery: [
      '/images/legal_aid_1.JPG',
      '/images/legal_aid_2.JPG',
      '/images/legal_aid_3.JPG',
      '/images/legal_aid_4.JPG'
    ],
    relatedLinks: [
      {
        title: 'Read the full court decision',
        url: '#'
      },
      {
        title: 'Learn more about our legal aid services',
        url: '/legal-aid'
      }
    ]
  },
  {
    id: 'ne-002',
    slug: 'annual-community-land-rights-workshop-2024',
    title: 'Annual Community Land Rights Workshop 2024',
    excerpt: 'Join us for our flagship training program on land governance and community empowerment.',
    fullDescription: 'HakiArdhi is proud to announce our Annual Community Land Rights Workshop, bringing together community leaders, paralegals, and land rights advocates from across Tanzania for three days of intensive training and knowledge sharing.\n\nThis flagship event will cover critical topics including land tenure security, community land use planning, legal frameworks for land protection, and strategies for effective advocacy. Participants will gain practical skills and tools to strengthen land rights in their communities.\n\nThe workshop features expert facilitators from HakiArdhi, government officials, international land rights organizations, and successful community land rights defenders. Interactive sessions, case studies, and field visits will provide hands-on learning opportunities.',
    image: '/images/capacity_building_1.jpg',
    type: 'Event',
    category: 'Training & Events',
    date: '2024-04-20',
    location: 'Morogoro',
    featured: true,
    gallery: [
      '/images/capacity_building_1.jpg',
      '/images/capacity_building_2.jpg',
      '/images/capacity_building_3.jpg'
    ]
  },
  {
    id: 'ne-003',
    slug: 'new-gender-land-rights-initiative',
    title: 'New Gender and Land Rights Initiative Launched',
    excerpt: 'HakiArdhi announces comprehensive program to protect women\'s land inheritance rights.',
    fullDescription: 'HakiArdhi is launching a comprehensive three-year initiative focused on protecting and promoting women\'s land inheritance rights across Tanzania. This program addresses the critical gap between legal protections and social practices that often deny women their rightful land inheritance.\n\nThe initiative includes legal aid services, community education campaigns, training for village land councils, and advocacy for policy reforms. We will work in 15 districts across five regions, reaching an estimated 50,000 women and their families.\n\nResearch shows that women\'s land rights are fundamental to poverty reduction, food security, and gender equality. Yet many women in Tanzania face discrimination in land inheritance due to customary practices. This program aims to bridge the gap between law and practice.',
    image: '/images/gender_training_1.JPG',
    type: 'Announcement',
    category: 'Program Updates',
    date: '2024-03-10',
    author: 'Communications Team',
    featured: true,
    gallery: [
      '/images/gender_training_1.JPG',
      '/images/gender_training_2.JPG'
    ]
  },
  {
    id: 'ne-004',
    slug: 'community-paralegals-graduate',
    title: 'Community Paralegals Graduate from Training Program',
    excerpt: '45 community members complete intensive legal training to support their communities.',
    fullDescription: '45 dedicated community members have successfully completed HakiArdhi\'s six-month Community Paralegal Training Program, earning certificates as qualified paralegals ready to provide legal support in their communities.\n\nThe graduates, representing 15 villages across Tanzania, completed rigorous training in land law, legal procedures, mediation skills, and community advocacy. They are now equipped to provide frontline legal guidance, assist community members in navigating land disputes, and connect people with formal legal services when needed.\n\nThis brings the total number of HakiArdhi-trained community paralegals to over 200 across Tanzania, creating a growing network of grassroots legal support that makes justice more accessible to rural communities.',
    image: '/images/capacity_building_2.jpg',
    type: 'News',
    category: 'Success Stories',
    date: '2024-03-05',
    location: 'Dar es Salaam',
    gallery: [
      '/images/capacity_building_2.jpg',
      '/images/capacity_building_1.jpg'
    ]
  },
  {
    id: 'ne-005',
    slug: 'free-legal-clinic-know-your-rights',
    title: 'Free Legal Clinic: Know Your Land Rights',
    excerpt: 'Mobile legal clinic providing free consultations on land rights and inheritance issues.',
    fullDescription: 'HakiArdhi\'s mobile legal clinic is coming to Mbeya! Join us for a full day of free legal consultations, information sessions, and community education on land rights and inheritance issues.\n\nOur experienced legal team will provide confidential one-on-one consultations, answer your questions about land law, review documents, and offer guidance on resolving land disputes. No appointment necessary - just come and speak with our team.\n\nWe will also conduct community education sessions covering topics like land inheritance rights, village land registration, women\'s land rights, and how to protect your land from illegal acquisition.',
    image: '/images/legal_aid_2.JPG',
    type: 'Event',
    category: 'Training & Events',
    date: '2024-04-15',
    location: 'Mbeya',
    gallery: [
      '/images/legal_aid_2.JPG',
      '/images/legal_aid_3.JPG'
    ]
  },
  {
    id: 'ne-006',
    slug: 'women-land-rights-defenders-recognition',
    title: 'Women Land Rights Defenders Receive Recognition',
    excerpt: 'National awards honor grassroots women leaders fighting for land justice.',
    fullDescription: 'Three women land rights defenders supported by HakiArdhi received national recognition at the Tanzania Women\'s Leadership Awards for their outstanding work in advancing land justice in their communities.\n\nThe honorees have demonstrated exceptional courage and leadership in challenging discriminatory land practices, supporting women facing land disputes, and advocating for policy changes at the local and national levels.\n\nThese women exemplify the power of grassroots leadership in driving social change. Their work has directly benefited hundreds of women and families in their communities, and their advocacy has influenced policy discussions at the national level.',
    image: '/images/gender_training_2.JPG',
    type: 'News',
    category: 'Success Stories',
    date: '2024-02-28',
    author: 'Media Team',
    gallery: [
      '/images/gender_training_2.JPG',
      '/images/gender_training_1.JPG'
    ]
  },
  {
    id: 'ne-007',
    slug: 'policy-brief-reforming-land-administration',
    title: 'Policy Brief: Reforming Land Administration',
    excerpt: 'New research publication calls for urgent reforms in land governance systems.',
    fullDescription: 'HakiArdhi has released a comprehensive policy brief calling for urgent reforms in Tanzania\'s land administration systems. Based on extensive research and community consultations, the brief identifies critical gaps and proposes concrete solutions.\n\nKey recommendations include digitizing land records, strengthening village land councils, improving transparency in land allocation processes, and enhancing mechanisms for community participation in land governance decisions.\n\nThe brief draws on data from over 100 communities and incorporates insights from land rights advocates, government officials, and international experts. It provides a roadmap for making land administration more efficient, transparent, and responsive to community needs.',
    image: '/images/capacity_building_3.jpg',
    type: 'Announcement',
    category: 'Publications',
    date: '2024-02-20',
    author: 'Research Department',
    relatedLinks: [
      {
        title: 'Download the full policy brief',
        url: '#'
      },
      {
        title: 'View our other research publications',
        url: '/research'
      }
    ]
  },
  {
    id: 'ne-008',
    slug: 'community-meeting-village-land-use-planning',
    title: 'Community Meeting: Village Land Use Planning',
    excerpt: 'Participatory workshop on sustainable land management and community planning.',
    fullDescription: 'Join HakiArdhi for a participatory workshop on village land use planning in Arusha. This community-led event will bring together village leaders, land committees, and community members to develop a comprehensive land use plan.\n\nThe workshop will use participatory mapping techniques, community consultations, and technical guidance to create a land use plan that balances conservation, agriculture, housing, and community development needs.\n\nThis is an opportunity for community members to have their voices heard in decisions about how village land should be used and managed. All community members are welcome and encouraged to participate.',
    image: '/images/legal_aid_3.JPG',
    type: 'Event',
    category: 'Training & Events',
    date: '2024-04-25',
    location: 'Arusha'
  },
  {
    id: 'ne-009',
    slug: 'legal-aid-services-expansion',
    title: 'Legal Aid Services Expanded to Three New Regions',
    excerpt: 'HakiArdhi brings free legal support to underserved communities in rural areas.',
    fullDescription: 'HakiArdhi is expanding its free legal aid services to three new regions: Lindi, Mtwara, and Ruvuma. This expansion will bring critical legal support to underserved rural communities where access to justice has been severely limited.\n\nThe expansion includes establishing regional offices, recruiting and training local paralegals, and partnering with local civil society organizations. We will provide free legal consultations, representation in land disputes, and community legal education.\n\nThis expansion is made possible through generous support from our partners and reflects our commitment to ensuring that all Tanzanians, regardless of location or economic status, have access to legal support for protecting their land rights.',
    image: '/images/legal_aid_4.JPG',
    type: 'Announcement',
    category: 'Program Updates',
    date: '2024-02-15',
    author: 'Executive Director'
  },
  {
    id: 'ne-010',
    slug: 'international-land-rights-conference-2024',
    title: 'International Land Rights Conference 2024',
    excerpt: 'Join global experts and advocates discussing the future of land governance in Africa.',
    fullDescription: 'HakiArdhi is co-hosting the International Land Rights Conference 2024, bringing together over 300 land rights advocates, policymakers, researchers, and community leaders from across Africa and beyond.\n\nThe three-day conference will feature keynote addresses from international experts, panel discussions on critical land rights issues, workshops on innovative approaches to land advocacy, and opportunities for networking and knowledge sharing.\n\nTopics include climate change and land rights, technology in land administration, women\'s land rights, indigenous peoples\' land rights, and strategies for effective land rights advocacy in the 21st century.',
    image: '/images/hero_1.JPG',
    type: 'Event',
    category: 'Training & Events',
    date: '2024-05-10',
    location: 'Dar es Salaam',
    featured: true,
    gallery: [
      '/images/hero_1.JPG',
      '/images/hero_2.JPG'
    ]
  },
  {
    id: 'ne-011',
    slug: 'climate-change-land-rights-report',
    title: 'Climate Change and Land Rights: New Report',
    excerpt: 'Groundbreaking study examines impacts of climate change on land tenure security.',
    fullDescription: 'HakiArdhi has released a groundbreaking research report examining the intersection of climate change and land tenure security in Tanzania. This comprehensive study documents how climate change is exacerbating land conflicts and threatening the land rights of vulnerable communities.\n\nThe report finds that climate-induced migration, changing agricultural patterns, and increased resource scarcity are creating new pressures on land tenure systems. It calls for climate-responsive land governance policies that protect community land rights while supporting climate adaptation.\n\nKey recommendations include integrating climate considerations into land use planning, strengthening community land rights as a foundation for climate resilience, and ensuring that climate adaptation programs respect and protect existing land rights.',
    image: '/images/hero_2.JPG',
    type: 'News',
    category: 'Publications',
    date: '2024-02-10',
    author: 'Research Team',
    relatedLinks: [
      {
        title: 'Download the full report',
        url: '#'
      }
    ]
  },
  {
    id: 'ne-012',
    slug: 'youth-land-rights-advocacy-training',
    title: 'Youth Land Rights Advocacy Training',
    excerpt: 'Empowering the next generation of land rights defenders through intensive training.',
    fullDescription: 'HakiArdhi is launching a special Youth Land Rights Advocacy Training program designed to empower young people to become effective land rights advocates in their communities.\n\nThis intensive two-week program will cover land law, advocacy strategies, community organizing, digital advocacy tools, and leadership skills. Young participants will learn from experienced advocates, participate in field visits, and develop action plans for land rights work in their communities.\n\nWe are seeking applications from motivated young people aged 18-30 who are passionate about land justice and committed to making a difference in their communities. Training includes accommodation, meals, and certificates.',
    image: '/images/capacity_building_1.jpg',
    type: 'Event',
    category: 'Training & Events',
    date: '2024-04-30',
    location: 'Dodoma',
    gallery: [
      '/images/capacity_building_1.jpg',
      '/images/capacity_building_2.jpg'
    ]
  },
];
