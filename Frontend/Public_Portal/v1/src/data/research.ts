/**
 * Research Publications Data
 * Following PAGES_MASTER_DOCUMENTATION.md specifications
 */

export interface Publication {
  id: string;
  title: string;
  authors: string[];
  publicationDate: string;
  type: 'Report' | 'Policy Brief' | 'Journal Article' | 'Case Study' | 'Working Paper';
  topic: string[];
  abstract: string;
  downloadUrl: string;
  coverImage?: string;
  downloads: number;
  featured?: boolean;
  pdfSize?: string;
  pages?: number;
  citation?: string;
}

export const PUBLICATION_TYPES = [
  'All',
  'Report',
  'Policy Brief',
  'Journal Article',
  'Case Study',
  'Working Paper',
] as const;

export const RESEARCH_TOPICS = [
  'All',
  'Land Tenure Systems',
  'Gender & Land Rights',
  'Policy Analysis',
  'Community Land Management',
  'Climate & Land Use',
  'Legal Frameworks',
  'Indigenous Rights',
  'Urban Land Issues',
] as const;

export const publications: Publication[] = [
  {
    id: 'pub-001',
    title: 'Land Rights and Gender Equality in Tanzania: A Comprehensive Analysis',
    authors: ['Dr. Mary Mwangi', 'Prof. John Kileo', 'HakiArdhi Research Team'],
    publicationDate: '2024-03-15',
    type: 'Report',
    topic: ['Gender & Land Rights', 'Legal Frameworks'],
    abstract: 'This comprehensive report examines the intersection of land rights and gender equality in Tanzania, analyzing legal frameworks, customary practices, and their impact on women\'s land ownership. The study covers over 500 households across 12 districts and provides evidence-based recommendations for policy reform.',
    downloadUrl: '/publications/gender-land-rights-2024.pdf',
    coverImage: '/images/research/gender-land-rights-cover.jpg',
    downloads: 1247,
    featured: true,
    pdfSize: '2.4 MB',
    pages: 156,
    citation: 'Mwangi, M., Kileo, J., & HakiArdhi Research Team (2024). Land Rights and Gender Equality in Tanzania: A Comprehensive Analysis. Dar es Salaam: HakiArdhi Institute.',
  },
  {
    id: 'pub-002',
    title: 'Community Land Tenure Security in Peri-Urban Areas: Case Studies from Morogoro',
    authors: ['HakiArdhi Research Team', 'Dr. Amina Hassan'],
    publicationDate: '2024-01-20',
    type: 'Case Study',
    topic: ['Community Land Management', 'Urban Land Issues'],
    abstract: 'An in-depth case study examining land tenure security challenges in peri-urban Morogoro. The research documents the experiences of five communities facing rapid urbanization and provides insights into effective community-based land management strategies.',
    downloadUrl: '/publications/morogoro-case-study-2024.pdf',
    downloads: 892,
    featured: true,
    pdfSize: '1.8 MB',
    pages: 87,
  },
  {
    id: 'pub-003',
    title: 'The Impact of Climate Change on Pastoral Land Rights',
    authors: ['Dr. James Mollel', 'Sarah Kimaro'],
    publicationDate: '2023-11-10',
    type: 'Report',
    topic: ['Climate & Land Use', 'Indigenous Rights'],
    abstract: 'This report investigates how climate change is affecting pastoral communities\' access to land and traditional grazing areas. It includes data from 300 pastoral households and proposes adaptive land governance mechanisms.',
    downloadUrl: '/publications/climate-pastoral-rights-2023.pdf',
    downloads: 1089,
    pdfSize: '3.1 MB',
    pages: 124,
  },
  {
    id: 'pub-004',
    title: 'Policy Brief: Reforming Village Land Act to Enhance Tenure Security',
    authors: ['HakiArdhi Policy Team'],
    publicationDate: '2023-09-05',
    type: 'Policy Brief',
    topic: ['Policy Analysis', 'Legal Frameworks'],
    abstract: 'A concise policy brief outlining key amendments needed to the Village Land Act to improve tenure security for small-scale farmers. Includes specific recommendations for legislative reform based on 25+ years of field experience.',
    downloadUrl: '/publications/village-land-act-brief-2023.pdf',
    downloads: 2134,
    featured: true,
    pdfSize: '450 KB',
    pages: 12,
  },
  {
    id: 'pub-005',
    title: 'Customary Land Rights vs. Statutory Law: Resolving Conflicts',
    authors: ['Prof. Elizabeth Mgaya', 'Advocate John Masanja'],
    publicationDate: '2023-06-18',
    type: 'Journal Article',
    topic: ['Legal Frameworks', 'Indigenous Rights'],
    abstract: 'Published in the East African Journal of Law and Justice, this article analyzes conflicts between customary land rights and statutory law, proposing a harmonized approach that respects both systems.',
    downloadUrl: '/publications/customary-statutory-2023.pdf',
    downloads: 1567,
    pdfSize: '890 KB',
    pages: 28,
  },
  {
    id: 'pub-006',
    title: 'Land Grabbing in Tanzania: Patterns, Impacts, and Community Responses',
    authors: ['Dr. Peter Nkwame', 'HakiArdhi Research Team'],
    publicationDate: '2023-04-22',
    type: 'Report',
    topic: ['Community Land Management', 'Policy Analysis'],
    abstract: 'A comprehensive investigation into land grabbing incidents across Tanzania, documenting 150 cases and analyzing patterns, impacts on communities, and effective resistance strategies.',
    downloadUrl: '/publications/land-grabbing-2023.pdf',
    downloads: 1876,
    pdfSize: '2.7 MB',
    pages: 142,
  },
  {
    id: 'pub-007',
    title: 'Women\'s Land Inheritance Rights: Bridging Law and Practice',
    authors: ['Dr. Grace Lyimo', 'Advocate Mary John'],
    publicationDate: '2023-02-14',
    type: 'Working Paper',
    topic: ['Gender & Land Rights', 'Legal Frameworks'],
    abstract: 'This working paper examines the gap between legal provisions for women\'s land inheritance rights and actual practice in rural Tanzania, based on research in 8 regions.',
    downloadUrl: '/publications/women-inheritance-2023.pdf',
    downloads: 743,
    pdfSize: '1.2 MB',
    pages: 45,
  },
  {
    id: 'pub-008',
    title: 'Community-Based Land Use Planning: Best Practices Guide',
    authors: ['HakiArdhi Training Team'],
    publicationDate: '2022-12-10',
    type: 'Report',
    topic: ['Community Land Management', 'Land Tenure Systems'],
    abstract: 'A practical guide for communities and practitioners on participatory land use planning processes, featuring successful case studies and step-by-step implementation frameworks.',
    downloadUrl: '/publications/land-use-planning-guide-2022.pdf',
    downloads: 2456,
    featured: true,
    pdfSize: '3.5 MB',
    pages: 98,
  },
  {
    id: 'pub-009',
    title: 'The Role of Traditional Leaders in Land Governance',
    authors: ['Dr. Mohamed Ali', 'Chief Researcher: HakiArdhi'],
    publicationDate: '2022-10-05',
    type: 'Case Study',
    topic: ['Indigenous Rights', 'Community Land Management'],
    abstract: 'Case studies from 10 villages examining how traditional leadership structures interface with formal land governance systems and their role in dispute resolution.',
    downloadUrl: '/publications/traditional-leaders-2022.pdf',
    downloads: 678,
    pdfSize: '1.6 MB',
    pages: 72,
  },
  {
    id: 'pub-010',
    title: 'Land Tenure Security and Agricultural Investment',
    authors: ['Dr. Daniel Mbwambo', 'Economic Research Unit'],
    publicationDate: '2022-08-20',
    type: 'Journal Article',
    topic: ['Land Tenure Systems', 'Policy Analysis'],
    abstract: 'An econometric analysis of the relationship between land tenure security and agricultural investment decisions among small-scale farmers in Tanzania.',
    downloadUrl: '/publications/tenure-investment-2022.pdf',
    downloads: 1234,
    pdfSize: '780 KB',
    pages: 22,
  },
  {
    id: 'pub-011',
    title: 'Policy Brief: Protecting Community Land from Large-Scale Acquisitions',
    authors: ['HakiArdhi Advocacy Team'],
    publicationDate: '2022-06-12',
    type: 'Policy Brief',
    topic: ['Policy Analysis', 'Community Land Management'],
    abstract: 'Evidence-based recommendations for strengthening legal protections against large-scale land acquisitions that threaten community land rights.',
    downloadUrl: '/publications/protecting-community-land-2022.pdf',
    downloads: 1890,
    pdfSize: '520 KB',
    pages: 14,
  },
  {
    id: 'pub-012',
    title: 'Climate Adaptation and Land Use in Coastal Tanzania',
    authors: ['Dr. Fatuma Mtui', 'Coastal Research Team'],
    publicationDate: '2022-04-18',
    type: 'Report',
    topic: ['Climate & Land Use', 'Community Land Management'],
    abstract: 'Research on how coastal communities are adapting their land use practices in response to climate change, sea-level rise, and increased storm frequency.',
    downloadUrl: '/publications/coastal-climate-2022.pdf',
    downloads: 945,
    pdfSize: '2.2 MB',
    pages: 108,
  },
];

export const researchAreas = [
  {
    id: 'area-001',
    name: 'Land Tenure Systems',
    description: 'Research on formal and informal land tenure arrangements, their evolution, and impact on land rights security.',
    iconName: 'document-text',
    publicationCount: 15,
  },
  {
    id: 'area-002',
    name: 'Gender & Land Rights',
    description: 'Investigating gender disparities in land ownership, inheritance, and decision-making processes.',
    iconName: 'users',
    publicationCount: 12,
  },
  {
    id: 'area-003',
    name: 'Policy Analysis',
    description: 'Critical analysis of land policies, laws, and their implementation, with evidence-based reform recommendations.',
    iconName: 'scale',
    publicationCount: 18,
  },
  {
    id: 'area-004',
    name: 'Community Land Management',
    description: 'Participatory approaches to land management, community land use planning, and collective tenure.',
    iconName: 'user-group',
    publicationCount: 14,
  },
  {
    id: 'area-005',
    name: 'Climate & Land Use',
    description: 'Intersection of climate change, environmental degradation, and land rights, with adaptive strategies.',
    iconName: 'globe-alt',
    publicationCount: 10,
  },
];

export const impactStats = [
  {
    id: 'stat-001',
    value: '150+',
    label: 'Publications',
    description: 'Researches & policy briefs',
  },
  {
    id: 'stat-002',
    value: '30+',
    label: 'Years',
    description: 'Of research excellence',
  },
  {
    id: 'stat-003',
    value: '25K+',
    label: 'Citations',
    description: 'In academic literature',
  },
  {
    id: 'stat-004',
    value: '13+',
    label: 'Active Studies',
    description: 'Ongoing research projects',
  },
];

export interface ResearchPartner {
  name: string;
  logo: string;
}

export const researchPartners: ResearchPartner[] = [
  {
    name: 'University of Dar es Salaam',
    logo: '/images/research-patner-udsm-logo.png',
  },
  {
    name: 'Ardhi University',
    logo: '/images/research-patner-aru-logo.jpg',
  },
  {
    name: 'International Land Coalition',
    logo: '/images/international-land-coalition.png',
  },
  {
    name: 'IPIS Research',
    logo: '/images/research-patner-IPIS-logo.png',
  },
  {
    name: 'Horizont3000',
    logo: '/images/donor_horizont3000_logo.jpg',
  },
  {
    name: 'Government of Tanzania',
    logo: '/images/government-emblem.png',
  },
];
