// Portfolio item data structure
export interface PortfolioItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  category: string;
  type: 'Case Study' | 'Project' | 'Initiative' | 'Success Story';
  year: string;
  location: string;
  beneficiaries?: number;
  duration?: string;
  partner?: string;
  tags?: string[];
  impact?: string[];
  featured?: boolean;

  // Impact Storytelling Fields
  challenge?: string;
  approach?: string;
  timeline?: {
    date: string;
    milestone: string;
    description: string;
  }[];
  testimonials?: {
    name: string;
    role: string;
    quote: string;
    image?: string;
  }[];
  impactMetrics?: {
    label: string;
    value: string | number;
    description: string;
    icon?: string;
  }[];
  gallery?: string[];

  // Fundraising Fields
  totalBudget?: string;
  fundingBreakdown?: {
    category: string;
    amount: string;
    percentage: number;
  }[];
  fundingSources?: string[];
  needsContinuedSupport?: boolean;
  supportMessage?: string;
}

// Sample portfolio data with rich storytelling
export const portfolioItems: PortfolioItem[] = [
  {
    id: 'port-001',
    slug: 'community-land-rights-protection-morogoro',
    title: 'Community Land Rights Protection in Morogoro',
    subtitle: 'Successful defense of community land against large-scale acquisition',
    description: 'Multi-year advocacy campaign that successfully protected 5,000 hectares of community land from unauthorized acquisition, securing land rights for over 2,000 families.',
    image: '/images/capacity_building_1.jpg',
    category: 'Legal Advocacy',
    type: 'Case Study',
    year: '2023',
    location: 'Morogoro Region',
    beneficiaries: 2000,
    duration: '18 months',
    partner: 'Local Community Council',
    tags: ['Land Rights', 'Advocacy', 'Community Protection'],
    impact: [
      'Secured legal title for 2,000+ families',
      'Protected 5,000 hectares of community land',
      'Established precedent for community land rights'
    ],
    featured: true,

    challenge: 'In 2022, the Morogoro community faced an existential threat when a large agricultural company attempted to acquire 5,000 hectares of their ancestral land without proper consultation. Over 2,000 families risked losing their homes, farms, and livelihoods. Many families had lived on this land for generations, but lacked formal documentation of their rights. The acquisition process had been rushed, with minimal community engagement, and proper compensation procedures were not followed.',

    approach: 'HakiArdhi launched a comprehensive legal advocacy campaign combining community organizing, legal representation, and policy advocacy. We conducted extensive community consultations, documented land use patterns, gathered historical evidence, and filed legal challenges. Our team of lawyers represented the community in court while simultaneously working with village leaders to strengthen community land governance. We also engaged with policymakers to ensure proper procedures were followed.',

    timeline: [
      {
        date: 'January 2022',
        milestone: 'Initial Community Consultation',
        description: 'Conducted first meetings with affected families to understand their concerns and gather evidence.'
      },
      {
        date: 'March 2022',
        milestone: 'Legal Challenge Filed',
        description: 'Filed formal legal challenge in the Land Court arguing that proper procedures were not followed.'
      },
      {
        date: 'July 2022',
        milestone: 'Evidence Documentation Complete',
        description: 'Completed comprehensive mapping and documentation of community land use patterns.'
      },
      {
        date: 'December 2022',
        milestone: 'Court Victory',
        description: 'Land Court ruled in favor of the community, halting the acquisition process.'
      },
      {
        date: 'June 2023',
        milestone: 'Land Titles Issued',
        description: 'Community received formal land titles, securing their rights permanently.'
      }
    ],

    testimonials: [
      {
        name: 'Mama Joyce Mwangi',
        role: 'Village Elder & Farmer',
        quote: 'For three generations, my family has farmed this land. When we heard about the acquisition, I thought we would lose everything. HakiArdhi gave us hope and fought alongside us. Today, we have legal documents proving this land is ours. My grandchildren will inherit not just land, but security.'
      },
      {
        name: 'John Kimaro',
        role: 'Village Land Committee Chairman',
        quote: 'We felt powerless against such a large company. HakiArdhi showed us that the law protects communities when we stand together. They taught us our rights and helped us use legal channels effectively. This victory is not just for our village - it sends a message across Tanzania.'
      }
    ],

    impactMetrics: [
      {
        label: 'Families Protected',
        value: '2,000+',
        description: 'Families who retained their land and livelihoods',
        icon: 'users'
      },
      {
        label: 'Land Secured',
        value: '5,000 ha',
        description: 'Hectares of community land protected from acquisition',
        icon: 'map'
      },
      {
        label: 'Legal Precedent',
        value: 'National',
        description: 'Court ruling cited in 15+ subsequent cases nationwide',
        icon: 'scale'
      },
      {
        label: 'Economic Value',
        value: '$8M',
        description: 'Estimated value of land and assets protected for the community',
        icon: 'briefcase'
      }
    ],

    gallery: [
      '/images/capacity_building_1.jpg',
      '/images/capacity_building_2.jpg',
      '/images/capacity_building_3.jpg',
      '/images/legal_aid_1.JPG'
    ],

    totalBudget: '$125,000',
    fundingBreakdown: [
      { category: 'Legal Services & Court Fees', amount: '$45,000', percentage: 36 },
      { category: 'Community Organizing & Consultations', amount: '$30,000', percentage: 24 },
      { category: 'Documentation & Mapping', amount: '$25,000', percentage: 20 },
      { category: 'Capacity Building & Training', amount: '$15,000', percentage: 12 },
      { category: 'Administrative Costs', amount: '$10,000', percentage: 8 }
    ],
    fundingSources: ['International Land Coalition', 'Ford Foundation', 'Community Contributions'],
    needsContinuedSupport: false,
  },

  {
    id: 'port-002',
    slug: 'women-land-inheritance-rights-program',
    title: 'Women\'s Land Inheritance Rights Program',
    subtitle: 'Empowering women through legal education and advocacy',
    description: 'Comprehensive program providing legal training, advocacy support, and documentation assistance to women claiming their rightful inheritance.',
    image: '/images/gender_training_1.JPG',
    category: 'Gender Justice',
    type: 'Initiative',
    year: '2023-2024',
    location: 'Dar es Salaam, Arusha, Mwanza',
    beneficiaries: 1500,
    duration: 'Ongoing',
    partner: 'National Gender Network',
    tags: ['Gender', 'Inheritance', 'Women Rights'],
    impact: [
      'Trained 1,500 women on their inheritance rights',
      'Successfully resolved 300+ inheritance disputes',
      'Registered 500+ women as land owners'
    ],
    featured: true,

    challenge: 'Despite legal protections, thousands of Tanzanian women are denied their rightful land inheritance due to discriminatory customary practices. When a husband or father dies, many women and daughters are excluded from inheritance, leaving them economically vulnerable. This affects not just individual women, but entire families who depend on land for their livelihoods. Cultural barriers, lack of legal knowledge, and inadequate documentation compound these challenges.',

    approach: 'Our holistic program combines legal education, direct legal assistance, and community advocacy. We train women on their legal rights, provide free legal representation in inheritance disputes, and work with traditional leaders to challenge discriminatory practices. The program includes awareness campaigns, paralegal training, documentation support, and ongoing case management. We also facilitate women\'s support groups where beneficiaries share experiences and build collective power.',

    timeline: [
      {
        date: 'January 2023',
        milestone: 'Program Launch',
        description: 'Launched program in three regions with community awareness campaigns.'
      },
      {
        date: 'April 2023',
        milestone: 'First Training Cohort',
        description: '500 women completed intensive training on inheritance rights and legal procedures.'
      },
      {
        date: 'September 2023',
        milestone: '100 Cases Resolved',
        description: 'Milestone achievement as 100 women successfully secured their inheritance.'
      },
      {
        date: 'February 2024',
        milestone: 'Support Groups Established',
        description: 'Created 30 women\'s support groups providing ongoing peer support.'
      }
    ],

    testimonials: [
      {
        name: 'Amina Hassan',
        role: 'Program Beneficiary',
        quote: 'When my husband died, his brothers told me I had no right to our farm. I believed them because that\'s what I\'d always been told. HakiArdhi taught me the law is on my side. They helped me go to court, and now the farm is legally mine. I can support my children and send them to school.'
      },
      {
        name: 'Grace Ndege',
        role: 'Community Paralegal',
        quote: 'I lost my own inheritance before I knew my rights. Now I help other women so they don\'t suffer the same injustice. This program has transformed not just individual lives, but our community\'s understanding of women\'s rights. We are creating lasting change.'
      }
    ],

    impactMetrics: [
      {
        label: 'Women Empowered',
        value: '1,500',
        description: 'Women trained on their land inheritance rights',
        icon: 'users'
      },
      {
        label: 'Disputes Resolved',
        value: '300+',
        description: 'Inheritance disputes successfully settled through legal aid',
        icon: 'scale'
      },
      {
        label: 'Land Ownership',
        value: '500+',
        description: 'Women now registered as legal land owners',
        icon: 'shield-check'
      },
      {
        label: 'Economic Impact',
        value: '$2.5M',
        description: 'Estimated value of land and assets secured for women',
        icon: 'briefcase'
      }
    ],

    gallery: [
      '/images/gender_training_1.JPG',
      '/images/gender_training_2.JPG',
      '/images/capacity_building_1.jpg',
      '/images/capacity_building_2.jpg'
    ],

    totalBudget: '$180,000/year',
    fundingBreakdown: [
      { category: 'Legal Aid Services', amount: '$65,000', percentage: 36 },
      { category: 'Training & Capacity Building', amount: '$50,000', percentage: 28 },
      { category: 'Community Outreach & Awareness', amount: '$35,000', percentage: 19 },
      { category: 'Documentation Support', amount: '$20,000', percentage: 11 },
      { category: 'Program Administration', amount: '$10,000', percentage: 6 }
    ],
    fundingSources: ['UN Women', 'Austrian Development Agency', 'Individual Donors'],
    needsContinuedSupport: true,
    supportMessage: 'This ongoing program requires sustained funding to continue serving women across Tanzania. Your support helps us provide free legal aid, conduct training, and challenge discriminatory practices. Every $500 sponsors legal assistance for one woman to secure her inheritance rights.',
  },

  {
    id: 'port-003',
    slug: 'community-paralegal-training-initiative',
    title: 'Community Paralegal Training Initiative',
    subtitle: 'Building local capacity for land rights advocacy',
    description: 'Intensive training program developing community paralegals who provide legal support and advocacy services in their villages.',
    image: '/images/capacity_building_2.jpg',
    category: 'Capacity Building',
    type: 'Project',
    year: '2023',
    location: 'Nationwide',
    beneficiaries: 5000,
    duration: '12 months',
    partner: 'Legal Aid Network',
    tags: ['Training', 'Paralegals', 'Capacity Building'],
    impact: [
      'Trained 150 community paralegals',
      'Provided services to 5,000+ community members',
      'Established 45 community legal aid centers'
    ],
    featured: true,

    challenge: 'Many rural communities lack access to legal services due to the scarcity of lawyers and the high cost of legal representation. This access to justice gap leaves communities vulnerable to land grabbing, unfair contracts, and exploitation. Traditional legal services are often concentrated in urban areas, creating a geographic and economic barrier for rural populations who face the most severe land rights challenges.',

    approach: 'We train dedicated community members to become paralegals, equipping them with legal knowledge and advocacy skills to serve their communities. The intensive six-month program covers land law, legal procedures, mediation, documentation, and community organizing. Graduates provide frontline legal guidance, assist with paperwork, mediate disputes, and connect complex cases with lawyers. This creates a sustainable, community-based legal support system.',

    impactMetrics: [
      {
        label: 'Paralegals Trained',
        value: '150',
        description: 'Community members trained and certified as paralegals',
        icon: 'education'
      },
      {
        label: 'People Served',
        value: '5,000+',
        description: 'Community members who received legal support',
        icon: 'users'
      },
      {
        label: 'Legal Aid Centers',
        value: '45',
        description: 'Community-based centers established nationwide',
        icon: 'shield'
      },
      {
        label: 'Cost Reduction',
        value: '80%',
        description: 'Average reduction in legal costs for communities',
        icon: 'briefcase'
      }
    ],

    totalBudget: '$95,000',
    needsContinuedSupport: false,
  },

  // Additional portfolio items with basic data
  {
    id: 'port-004',
    slug: 'mobile-legal-clinic-outreach',
    title: 'Mobile Legal Clinic Outreach',
    subtitle: 'Bringing justice to remote communities',
    description: 'Mobile legal clinics providing free legal consultations and documentation support to underserved rural areas.',
    image: '/images/legal_aid_1.JPG',
    category: 'Legal Support',
    type: 'Project',
    year: '2023-2024',
    location: 'Rural Tanzania',
    beneficiaries: 3000,
    duration: 'Ongoing',
    tags: ['Legal Aid', 'Outreach', 'Access to Justice'],
    impact: [
      'Served 3,000+ clients in remote areas',
      'Provided legal documentation for 800+ cases',
      'Conducted 50+ community awareness sessions'
    ],
    featured: false,
  },

  {
    id: 'port-005',
    slug: 'village-land-use-planning-support',
    title: 'Village Land Use Planning Support',
    subtitle: 'Participatory land governance and sustainable management',
    description: 'Supporting villages in developing comprehensive land use plans that protect community rights while promoting sustainable development.',
    image: '/images/capacity_building_3.jpg',
    category: 'Land Governance',
    type: 'Initiative',
    year: '2022-2023',
    location: 'Mbeya, Iringa',
    beneficiaries: 10000,
    duration: '24 months',
    partner: 'District Land Office',
    tags: ['Land Planning', 'Governance', 'Sustainability'],
    impact: [
      'Completed land use plans for 20 villages',
      'Mapped and documented 15,000 hectares',
      'Resolved 100+ land boundary disputes'
    ],
    featured: false,
  },

  {
    id: 'port-006',
    slug: 'climate-resilient-land-management',
    title: 'Climate-Resilient Land Management',
    subtitle: 'Adapting land governance to climate change challenges',
    description: 'Innovative program helping communities adapt their land management practices to climate change impacts while protecting tenure security.',
    image: '/images/legal_aid_2.JPG',
    category: 'Environmental Justice',
    type: 'Project',
    year: '2023',
    location: 'Coastal Regions',
    beneficiaries: 4000,
    duration: '18 months',
    partner: 'Environmental Alliance',
    tags: ['Climate Change', 'Adaptation', 'Resilience'],
    impact: [
      'Supported climate adaptation for 4,000 families',
      'Developed climate-resilient land policies',
      'Protected vulnerable coastal communities'
    ],
    featured: false,
  },

  {
    id: 'port-007',
    slug: 'probate-inheritance-legal-aid',
    title: 'Probate and Inheritance Legal Aid',
    subtitle: 'Simplifying inheritance processes for rural communities',
    description: 'Comprehensive legal support program helping families navigate complex probate procedures and secure their inheritance rights.',
    image: '/images/legal_aid_3.JPG',
    category: 'Legal Support',
    type: 'Success Story',
    year: '2022-2024',
    location: 'Multiple Regions',
    beneficiaries: 2500,
    duration: 'Ongoing',
    tags: ['Probate', 'Inheritance', 'Legal Aid'],
    impact: [
      'Resolved 500+ probate cases',
      'Reduced processing time by 60%',
      'Saved families $200,000 in legal fees'
    ],
    featured: false,
  },

  {
    id: 'port-008',
    slug: 'youth-land-rights-champions',
    title: 'Youth Land Rights Champions',
    subtitle: 'Empowering the next generation of advocates',
    description: 'Youth leadership program training young people in land rights advocacy and community organizing.',
    image: '/images/gender_training_2.JPG',
    category: 'Capacity Building',
    type: 'Initiative',
    year: '2023',
    location: 'Urban Centers',
    beneficiaries: 500,
    duration: '12 months',
    partner: 'Youth Networks',
    tags: ['Youth', 'Leadership', 'Advocacy'],
    impact: [
      'Trained 200 youth advocates',
      'Launched 15 community campaigns',
      'Reached 500+ young people'
    ],
    featured: false,
  },

  {
    id: 'port-009',
    slug: 'pastoral-land-rights-advocacy',
    title: 'Pastoral Land Rights Advocacy',
    subtitle: 'Protecting grazing rights and pastoral livelihoods',
    description: 'Specialized program addressing the unique land tenure challenges faced by pastoralist communities.',
    image: '/images/legal_aid_4.JPG',
    category: 'Indigenous Rights',
    type: 'Case Study',
    year: '2022-2023',
    location: 'Northern Tanzania',
    beneficiaries: 3500,
    duration: '15 months',
    partner: 'Pastoralist Council',
    tags: ['Pastoralists', 'Indigenous Rights', 'Advocacy'],
    impact: [
      'Secured grazing corridors for 3,500 families',
      'Resolved 50+ grazing land conflicts',
      'Documented customary pastoral rights'
    ],
    featured: false,
  },
];
