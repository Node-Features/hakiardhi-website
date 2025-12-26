/**
 * Resource Centre Data - Comprehensive Publications Hub
 * Following PAGES_MASTER_DOCUMENTATION.md specifications
 */

export const metadata = {
  title: 'Research & Publications | HakiArdhi',
  description:
    'Explore 30+ years of evidence-based research on land rights, tenure security, and community empowerment in Tanzania. Download reports, policy briefs, and academic publications.',
  keywords: [
    'land rights research',
    'Tanzania research',
    'publications',
    'policy briefs',
    'academic research',
    'land tenure studies',
  ],
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'Research Report' | 'Policy Brief' | 'Newsletter' | 'Legal Guide' | 'Video' | 'Infographic' | 'Case Study' | 'Training Manual' | 'Template';
  category: string[];
  language: 'English' | 'Swahili' | 'Both';
  targetAudience: string[];
  dateAdded: string;
  downloadUrl?: string;
  fileSize?: string;
  format?: string;
  duration?: string; // For videos
  thumbnail?: string;
  downloads: number;
  featured?: boolean;
  issueNumber?: string; // For newsletters
  year?: number;
}

export const RESOURCE_TYPES = [
  'All',
  'Research Report',
  'Policy Brief',
  'Newsletter',
  'Legal Guide',
  'Video',
  'Infographic',
  'Case Study',
  'Training Manual',
  'Template',
] as const;

export const RESOURCE_CATEGORIES = [
  'All Topics',
  'Land Rights & Tenure',
  'Climate Change & Land',
  'Gender & Land Rights',
  'Probate & Inheritance',
  'Policy & Advocacy',
  'Community Organizing',
  'Legal Procedures',
  'Civic Education',
  'Indigenous Rights',
  'Urban Land Issues',
  'Conflict Resolution',
  'Environmental Justice',
] as const;

export const TARGET_AUDIENCES = [
  'All Audiences',
  'Community Members',
  'Legal Practitioners',
  'Researchers',
  'Policymakers',
  'NGO Workers',
  'Students',
  'Media',
  'Judiciary',
] as const;

export const resources: Resource[] = [
  // Research Reports
  {
    id: 'res-001',
    title: 'Climate Change Adaptation and Land Rights in Coastal Tanzania',
    description: 'Comprehensive research on how climate change affects land tenure security in coastal regions, examining displacement, adaptation strategies, and policy recommendations for climate-resilient land governance.',
    type: 'Research Report',
    category: ['Climate Change & Land', 'Land Rights & Tenure', 'Environmental Justice'],
    language: 'English',
    targetAudience: ['Researchers', 'Policymakers', 'NGO Workers'],
    dateAdded: '2024-02-15',
    downloadUrl: '/resources/climate-coastal-land-rights-2024.pdf',
    fileSize: '3.2 MB',
    format: 'PDF',
    downloads: 1456,
    featured: true,
    year: 2024,
  },
  {
    id: 'res-002',
    title: 'Women\'s Land Inheritance Rights: Bridging Law and Practice',
    description: 'In-depth analysis of the gap between legal provisions for women\'s inheritance rights and actual practice in rural Tanzania, with case studies from 8 regions and actionable recommendations.',
    type: 'Research Report',
    category: ['Gender & Land Rights', 'Probate & Inheritance', 'Legal Procedures'],
    language: 'English',
    targetAudience: ['Researchers', 'Legal Practitioners', 'Policymakers'],
    dateAdded: '2024-01-20',
    downloadUrl: '/resources/women-inheritance-study-2024.pdf',
    fileSize: '2.8 MB',
    format: 'PDF',
    downloads: 2134,
    featured: true,
    year: 2024,
  },

  // Policy Briefs
  {
    id: 'res-003',
    title: 'Policy Brief: Reforming Probate Procedures for Rural Communities',
    description: 'Evidence-based policy recommendations for simplifying probate procedures to make inheritance processes more accessible and affordable for rural communities.',
    type: 'Policy Brief',
    category: ['Probate & Inheritance', 'Policy & Advocacy', 'Legal Procedures'],
    language: 'Both',
    targetAudience: ['Policymakers', 'Legal Practitioners', 'Judiciary'],
    dateAdded: '2024-02-01',
    downloadUrl: '/resources/probate-reform-brief-2024.pdf',
    fileSize: '850 KB',
    format: 'PDF',
    downloads: 3421,
    featured: true,
    year: 2024,
  },
  {
    id: 'res-004',
    title: 'Strengthening Climate-Resilient Land Governance: Policy Recommendations',
    description: 'Policy brief outlining urgent reforms needed to integrate climate adaptation into land governance frameworks, based on field research and international best practices.',
    type: 'Policy Brief',
    category: ['Climate Change & Land', 'Policy & Advocacy', 'Environmental Justice'],
    language: 'English',
    targetAudience: ['Policymakers', 'NGO Workers', 'Researchers'],
    dateAdded: '2023-12-10',
    downloadUrl: '/resources/climate-resilient-governance-2023.pdf',
    fileSize: '720 KB',
    format: 'PDF',
    downloads: 2876,
    year: 2023,
  },
  {
    id: 'res-005',
    title: 'Enhancing Gender Equity in Land Administration',
    description: 'Policy brief with actionable steps for land administration authorities to eliminate gender discrimination and promote women\'s equal land rights.',
    type: 'Policy Brief',
    category: ['Gender & Land Rights', 'Policy & Advocacy'],
    language: 'Both',
    targetAudience: ['Policymakers', 'NGO Workers'],
    dateAdded: '2023-11-15',
    downloadUrl: '/resources/gender-equity-administration-2023.pdf',
    fileSize: '650 KB',
    format: 'PDF',
    downloads: 1987,
    year: 2023,
  },

  // Newsletters
  {
    id: 'res-006',
    title: 'HakiArdhi Newsletter - Q1 2024',
    description: 'Quarterly update featuring recent cases, policy developments, community success stories, upcoming training programs, and new research findings on land rights.',
    type: 'Newsletter',
    category: ['Civic Education', 'Policy & Advocacy'],
    language: 'Both',
    targetAudience: ['Community Members', 'NGO Workers', 'Media'],
    dateAdded: '2024-03-01',
    downloadUrl: '/resources/newsletter-q1-2024.pdf',
    fileSize: '2.1 MB',
    format: 'PDF',
    downloads: 5432,
    issueNumber: 'Q1 2024',
    year: 2024,
  },
  {
    id: 'res-007',
    title: 'Land Rights Update - December 2023',
    description: 'Monthly newsletter covering legislative updates, court decisions, community workshops, and highlights from our legal aid program.',
    type: 'Newsletter',
    category: ['Civic Education', 'Legal Procedures'],
    language: 'Both',
    targetAudience: ['Community Members', 'Legal Practitioners', 'Media'],
    dateAdded: '2023-12-01',
    downloadUrl: '/resources/newsletter-dec-2023.pdf',
    fileSize: '1.8 MB',
    format: 'PDF',
    downloads: 4123,
    issueNumber: 'December 2023',
    year: 2023,
  },

  // Legal Guides
  {
    id: 'res-008',
    title: 'Community Guide to Probate and Inheritance in Tanzania',
    description: 'Practical guide explaining probate procedures, inheritance laws, and how to navigate the legal system when a family member passes away. Written in accessible language.',
    type: 'Legal Guide',
    category: ['Probate & Inheritance', 'Legal Procedures', 'Civic Education'],
    language: 'Both',
    targetAudience: ['Community Members', 'Legal Practitioners'],
    dateAdded: '2024-01-10',
    downloadUrl: '/resources/probate-guide-2024.pdf',
    fileSize: '1.9 MB',
    format: 'PDF',
    downloads: 6789,
    featured: true,
    year: 2024,
  },
  {
    id: 'res-009',
    title: 'Understanding Land Rights Under Tanzanian Law',
    description: 'Comprehensive guide covering statutory and customary land rights, tenure types, registration procedures, and legal protections available to landholders.',
    type: 'Legal Guide',
    category: ['Land Rights & Tenure', 'Legal Procedures', 'Civic Education'],
    language: 'Both',
    targetAudience: ['Community Members', 'Students', 'NGO Workers'],
    dateAdded: '2023-10-05',
    downloadUrl: '/resources/land-rights-guide-2023.pdf',
    fileSize: '2.4 MB',
    format: 'PDF',
    downloads: 8901,
    year: 2023,
  },

  // Videos
  {
    id: 'res-010',
    title: 'Women\'s Land Rights: Know Your Rights (Video)',
    description: 'Educational video series explaining women\'s land and inheritance rights under Tanzanian law, featuring real community stories and legal expert interviews.',
    type: 'Video',
    category: ['Gender & Land Rights', 'Civic Education', 'Probate & Inheritance'],
    language: 'Swahili',
    targetAudience: ['Community Members', 'NGO Workers'],
    dateAdded: '2024-02-20',
    downloadUrl: 'https://youtube.com/watch?v=example1',
    duration: '35 minutes',
    format: 'Video',
    downloads: 7234,
    featured: true,
    year: 2024,
  },
  {
    id: 'res-011',
    title: 'Climate Change and Pastoral Land: Community Adaptation',
    description: 'Documentary featuring pastoral communities adapting to climate change impacts on traditional grazing lands, with expert analysis on sustainable solutions.',
    type: 'Video',
    category: ['Climate Change & Land', 'Indigenous Rights', 'Environmental Justice'],
    language: 'Swahili',
    targetAudience: ['Community Members', 'Policymakers', 'Researchers'],
    dateAdded: '2023-11-18',
    downloadUrl: 'https://youtube.com/watch?v=example2',
    duration: '42 minutes',
    format: 'Video',
    downloads: 5678,
    year: 2023,
  },

  // Infographics
  {
    id: 'res-012',
    title: 'Women\'s Inheritance Rights Infographic',
    description: 'Visual guide illustrating women\'s inheritance rights, common violations, and steps to protect these rights under Tanzanian law.',
    type: 'Infographic',
    category: ['Gender & Land Rights', 'Probate & Inheritance', 'Civic Education'],
    language: 'Both',
    targetAudience: ['Community Members', 'NGO Workers', 'Media'],
    dateAdded: '2024-01-15',
    downloadUrl: '/resources/womens-inheritance-infographic.pdf',
    fileSize: '1.2 MB',
    format: 'PDF',
    downloads: 4567,
    year: 2024,
  },
  {
    id: 'res-013',
    title: 'Climate Change Impact on Land Rights - Visual Guide',
    description: 'Infographic showing how climate change affects land tenure security, displacement patterns, and community resilience strategies.',
    type: 'Infographic',
    category: ['Climate Change & Land', 'Civic Education', 'Environmental Justice'],
    language: 'Both',
    targetAudience: ['Community Members', 'Policymakers', 'Media'],
    dateAdded: '2023-12-20',
    downloadUrl: '/resources/climate-impact-infographic.pdf',
    fileSize: '980 KB',
    format: 'PDF',
    downloads: 3456,
    year: 2023,
  },

  // Case Studies
  {
    id: 'res-014',
    title: 'Community Land Defense: Success Stories from Morogoro',
    description: 'Case study documenting how five communities successfully defended their land rights against large-scale acquisitions through collective action and legal advocacy.',
    type: 'Case Study',
    category: ['Land Rights & Tenure', 'Community Organizing', 'Legal Procedures'],
    language: 'English',
    targetAudience: ['Researchers', 'NGO Workers', 'Community Members'],
    dateAdded: '2023-10-25',
    downloadUrl: '/resources/morogoro-case-study-2023.pdf',
    fileSize: '2.1 MB',
    format: 'PDF',
    downloads: 2345,
    year: 2023,
  },

  // Training Manuals
  {
    id: 'res-015',
    title: 'Community Paralegal Training Manual',
    description: 'Comprehensive training manual for community paralegals covering land rights law, advocacy techniques, documentation, and community mobilization.',
    type: 'Training Manual',
    category: ['Legal Procedures', 'Community Organizing', 'Civic Education'],
    language: 'Both',
    targetAudience: ['Community Members', 'NGO Workers', 'Legal Practitioners'],
    dateAdded: '2023-09-12',
    downloadUrl: '/resources/paralegal-training-manual.pdf',
    fileSize: '4.5 MB',
    format: 'PDF',
    downloads: 3210,
    year: 2023,
  },
  {
    id: 'res-016',
    title: 'Gender-Responsive Land Advocacy Training Guide',
    description: 'Training manual for civil society organizations on conducting gender-responsive land rights advocacy and supporting women land rights defenders.',
    type: 'Training Manual',
    category: ['Gender & Land Rights', 'Policy & Advocacy', 'Community Organizing'],
    language: 'English',
    targetAudience: ['NGO Workers', 'Community Members'],
    dateAdded: '2023-08-20',
    downloadUrl: '/resources/gender-advocacy-training.pdf',
    fileSize: '3.8 MB',
    format: 'PDF',
    downloads: 1876,
    year: 2023,
  },

  // Templates
  {
    id: 'res-017',
    title: 'Probate Application Template',
    description: 'Step-by-step template and instructions for filing probate applications, including required documents checklist and sample letters.',
    type: 'Template',
    category: ['Probate & Inheritance', 'Legal Procedures'],
    language: 'Both',
    targetAudience: ['Community Members', 'Legal Practitioners'],
    dateAdded: '2024-02-05',
    downloadUrl: '/resources/probate-application-template.docx',
    fileSize: '420 KB',
    format: 'DOCX',
    downloads: 5234,
    year: 2024,
  },
  {
    id: 'res-018',
    title: 'Land Dispute Documentation Template',
    description: 'Template for systematically documenting land disputes including evidence collection, witness statements, and chronology of events.',
    type: 'Template',
    category: ['Conflict Resolution', 'Legal Procedures'],
    language: 'Both',
    targetAudience: ['Community Members', 'Legal Practitioners', 'NGO Workers'],
    dateAdded: '2023-11-30',
    downloadUrl: '/resources/dispute-documentation-template.docx',
    fileSize: '380 KB',
    format: 'DOCX',
    downloads: 4123,
    year: 2023,
  },

  // More Policy Briefs
  {
    id: 'res-019',
    title: 'Urban Land Rights: Addressing Peri-Urban Tenure Insecurity',
    description: 'Policy brief examining tenure insecurity in rapidly urbanizing areas and proposing reforms to protect peri-urban communities.',
    type: 'Policy Brief',
    category: ['Urban Land Issues', 'Policy & Advocacy', 'Land Rights & Tenure'],
    language: 'English',
    targetAudience: ['Policymakers', 'Researchers', 'NGO Workers'],
    dateAdded: '2023-10-15',
    downloadUrl: '/resources/urban-tenure-policy-brief.pdf',
    fileSize: '780 KB',
    format: 'PDF',
    downloads: 2456,
    year: 2023,
  },
  {
    id: 'res-020',
    title: 'Indigenous Peoples\' Land Rights: Legal Protections and Gaps',
    description: 'Policy brief analyzing legal protections for indigenous communities\' land rights and recommending strengthened safeguards.',
    type: 'Policy Brief',
    category: ['Indigenous Rights', 'Policy & Advocacy', 'Legal Procedures'],
    language: 'English',
    targetAudience: ['Policymakers', 'Legal Practitioners', 'NGO Workers'],
    dateAdded: '2023-09-28',
    downloadUrl: '/resources/indigenous-rights-brief.pdf',
    fileSize: '690 KB',
    format: 'PDF',
    downloads: 1789,
    year: 2023,
  },

  // Additional Civic Education
  {
    id: 'res-021',
    title: 'Civic Guide: Your Rights as a Landholder',
    description: 'Simple guide explaining basic land rights, how to protect them, where to get help, and how to participate in land governance processes.',
    type: 'Legal Guide',
    category: ['Civic Education', 'Land Rights & Tenure'],
    language: 'Both',
    targetAudience: ['Community Members'],
    dateAdded: '2023-08-10',
    downloadUrl: '/resources/landholder-rights-guide.pdf',
    fileSize: '1.5 MB',
    format: 'PDF',
    downloads: 7890,
    year: 2023,
  },
];

export const resourceCategories = [
  {
    id: 'cat-001',
    name: 'Research & Reports',
    description: 'In-depth research reports and academic studies on land rights issues',
    iconName: 'academic-cap',
    count: resources.filter(r => r.type === 'Research Report').length,
  },
  {
    id: 'cat-002',
    name: 'Policy Briefs',
    description: 'Evidence-based policy recommendations for reform and advocacy',
    iconName: 'document-text',
    count: resources.filter(r => r.type === 'Policy Brief').length,
  },
  {
    id: 'cat-003',
    name: 'Newsletters',
    description: 'Regular updates on land rights news, cases, and developments',
    iconName: 'newspaper',
    count: resources.filter(r => r.type === 'Newsletter').length,
  },
  {
    id: 'cat-004',
    name: 'Legal Guides',
    description: 'Practical guides for understanding and exercising your rights',
    iconName: 'scale',
    count: resources.filter(r => r.type === 'Legal Guide').length,
  },
  {
    id: 'cat-005',
    name: 'Videos & Media',
    description: 'Educational videos and multimedia resources',
    iconName: 'video-camera',
    count: resources.filter(r => r.type === 'Video').length,
  },
  {
    id: 'cat-006',
    name: 'Training Materials',
    description: 'Manuals and guides for trainers and advocates',
    iconName: 'book-open',
    count: resources.filter(r => r.type === 'Training Manual').length,
  },
];

// Helper function to get resources by category
export const getResourcesByCategory = (category: string) => {
  if (category === 'All Topics') return resources;
  return resources.filter(r => r.category.includes(category));
};

// Helper function to get resources by type
export const getResourcesByType = (type: string) => {
  if (type === 'All') return resources;
  return resources.filter(r => r.type === type);
};

// Helper function to get featured resources
export const getFeaturedResources = () => {
  return resources.filter(r => r.featured);
};
