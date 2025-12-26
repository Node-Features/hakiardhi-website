export interface TanzaniaRegion {
  id: string;
  name: string;
  lrmCount: number;
  districts: number;
  villages: number;
  achievements: string[];
  gridPosition: string; // CSS grid positioning class
}

export interface LRMRole {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface ImpactStat {
  id: string;
  value: string;
  label: string;
  icon: string;
}

export interface HowToBecomeSection {
  steps: {
    id: string;
    title: string;
    description: string;
  }[];
  requirements: string[];
}

// Tanzania Regions with LRM Distribution
export const tanzaniaRegions: TanzaniaRegion[] = [
  {
    id: '1',
    name: 'Dar es Salaam',
    lrmCount: 87,
    districts: 5,
    villages: 145,
    achievements: [
      'Resolved 234 land disputes',
      '12 community libraries established',
      '1,800+ families educated'
    ],
    gridPosition: 'col-start-3 row-start-3'
  },
  {
    id: '2',
    name: 'Mwanza',
    lrmCount: 64,
    districts: 7,
    villages: 198,
    achievements: [
      'Mediated 180 boundary conflicts',
      '8 study groups active',
      'Legal aid for 450+ cases'
    ],
    gridPosition: 'col-start-1 row-start-2'
  },
  {
    id: '3',
    name: 'Arusha',
    lrmCount: 72,
    districts: 6,
    villages: 167,
    achievements: [
      'Protected 5,000+ hectares',
      'Women land rights advocacy',
      '15 community forums held'
    ],
    gridPosition: 'col-start-3 row-start-1'
  },
  {
    id: '4',
    name: 'Dodoma',
    lrmCount: 58,
    districts: 7,
    villages: 203,
    achievements: [
      'Capital region coverage',
      '190 disputes resolved',
      'Policy advocacy initiatives'
    ],
    gridPosition: 'col-start-2 row-start-2'
  },
  {
    id: '5',
    name: 'Mbeya',
    lrmCount: 69,
    districts: 8,
    villages: 221,
    achievements: [
      'Highland communities reached',
      '11 libraries operational',
      '2,100+ families supported'
    ],
    gridPosition: 'col-start-1 row-start-4'
  },
  {
    id: '6',
    name: 'Morogoro',
    lrmCount: 61,
    districts: 7,
    villages: 189,
    achievements: [
      'Pastoral land rights focus',
      '156 cases mediated',
      'Cross-border coordination'
    ],
    gridPosition: 'col-start-3 row-start-2'
  },
  {
    id: '7',
    name: 'Tanga',
    lrmCount: 53,
    districts: 11,
    villages: 214,
    achievements: [
      'Coastal zone protection',
      '9 active study groups',
      'Youth LRM training program'
    ],
    gridPosition: 'col-start-4 row-start-1'
  },
  {
    id: '8',
    name: 'Kagera',
    lrmCount: 47,
    districts: 8,
    villages: 176,
    achievements: [
      'Border region coverage',
      '123 disputes resolved',
      'Cross-cultural mediation'
    ],
    gridPosition: 'col-start-1 row-start-1'
  },
  {
    id: '9',
    name: 'Shinyanga',
    lrmCount: 44,
    districts: 5,
    villages: 148,
    achievements: [
      'Mining area advocacy',
      '98 land cases handled',
      'Displacement prevention'
    ],
    gridPosition: 'col-start-2 row-start-1'
  },
  {
    id: '10',
    name: 'Mara',
    lrmCount: 41,
    districts: 7,
    villages: 161,
    achievements: [
      'Wildlife corridor protection',
      '7 community libraries',
      'Pastoralist rights advocacy'
    ],
    gridPosition: 'col-start-1 row-start-3'
  },
  {
    id: '11',
    name: 'Tabora',
    lrmCount: 38,
    districts: 7,
    villages: 193,
    achievements: [
      'Central corridor coverage',
      '89 disputes mediated',
      'Agricultural land protection'
    ],
    gridPosition: 'col-start-2 row-start-3'
  },
  {
    id: '12',
    name: 'Iringa',
    lrmCount: 35,
    districts: 5,
    villages: 134,
    achievements: [
      'Southern highlands focus',
      '67 cases resolved',
      'Community mapping projects'
    ],
    gridPosition: 'col-start-2 row-start-4'
  },
  {
    id: '13',
    name: 'Kilimanjaro',
    lrmCount: 52,
    districts: 7,
    villages: 158,
    achievements: [
      'Mountain communities',
      '145 disputes resolved',
      'Indigenous land rights'
    ],
    gridPosition: 'col-start-4 row-start-2'
  },
  {
    id: '14',
    name: 'Ruvuma',
    lrmCount: 32,
    districts: 6,
    villages: 127,
    achievements: [
      'Southern region expansion',
      '54 cases mediated',
      'Cross-border coordination'
    ],
    gridPosition: 'col-start-3 row-start-4'
  },
  {
    id: '15',
    name: 'Singida',
    lrmCount: 29,
    districts: 6,
    villages: 112,
    achievements: [
      'Agro-pastoral communities',
      '43 disputes resolved',
      'Drought resilience advocacy'
    ],
    gridPosition: 'col-start-1 row-start-5'
  },
  {
    id: '16',
    name: 'Pwani',
    lrmCount: 36,
    districts: 8,
    villages: 143,
    achievements: [
      'Coastal land protection',
      '76 cases handled',
      'Tourism impact mitigation'
    ],
    gridPosition: 'col-start-4 row-start-3'
  }
];

// What LRMs Do
export const lrmRoles: LRMRole[] = [
  {
    id: '1',
    title: 'Community Education',
    description: 'Establish study groups and discussion forums to educate communities about land rights, laws, and documentation processes.',
    icon: 'education'
  },
  {
    id: '2',
    title: 'Dispute Resolution',
    description: 'Mediate land conflicts at the village level using traditional and legal mechanisms, ensuring fair outcomes for all parties.',
    icon: 'scale'
  },
  {
    id: '3',
    title: 'Legal Aid Connection',
    description: 'Escalate complex cases to HakiArdhi lawyers and provide initial support to families navigating land rights issues.',
    icon: 'briefcase'
  },
  {
    id: '4',
    title: 'Documentation & Reporting',
    description: 'Document land-related incidents, violations, and disputes, creating a comprehensive record for advocacy and legal action.',
    icon: 'document'
  },
  {
    id: '5',
    title: 'Community Mobilization',
    description: 'Organize community members for collective action, awareness campaigns, and engagement with local government on land issues.',
    icon: 'users'
  },
  {
    id: '6',
    title: 'Resource Libraries',
    description: 'Establish and manage local libraries with land rights publications, legal resources, and educational materials for community access.',
    icon: 'book'
  },
  {
    id: '7',
    title: 'Advocacy & Representation',
    description: 'Represent community interests in local forums, advocate for vulnerable groups, and push for policy changes at district level.',
    icon: 'megaphone'
  },
  {
    id: '8',
    title: 'Data Collection',
    description: 'Conduct community mapping, surveys, and data collection to support evidence-based advocacy and policy recommendations.',
    icon: 'map'
  },
  {
    id: '9',
    title: 'Customary Rights Support',
    description: 'Document and protect customary land tenure systems, ensuring traditional rights are recognized and respected.',
    icon: 'shield'
  },
  {
    id: '10',
    title: 'Conflict Prevention',
    description: 'Identify potential land conflicts early and implement preventive measures through community dialogue and awareness.',
    icon: 'eye'
  },
  {
    id: '11',
    title: 'Vulnerable Groups Protection',
    description: 'Special focus on protecting land rights of women, youth, elderly, and marginalized communities facing discrimination.',
    icon: 'heart'
  },
  {
    id: '12',
    title: 'Network Coordination',
    description: 'Collaborate with other LRMs, local officials, and civil society organizations to strengthen land rights protection networks.',
    icon: 'share'
  }
];

// Impact Statistics
export const lrmImpactStats: ImpactStat[] = [
  {
    id: '1',
    value: '3,200+',
    label: 'Disputes Resolved',
    icon: 'check-circle'
  },
  {
    id: '2',
    value: '85%',
    label: 'Success Rate',
    icon: 'trending-up'
  },
  {
    id: '3',
    value: '120+',
    label: 'Community Libraries',
    icon: 'library'
  },
  {
    id: '4',
    value: '45K+',
    label: 'Families Educated',
    icon: 'users'
  },
  {
    id: '5',
    value: '250+',
    label: 'Study Groups',
    icon: 'academic-cap'
  },
  {
    id: '6',
    value: '1,800+',
    label: 'Legal Aid Referrals',
    icon: 'briefcase'
  },
  {
    id: '7',
    value: '500+',
    label: 'Community Forums',
    icon: 'megaphone'
  },
  {
    id: '8',
    value: '15K+',
    label: 'Hectares Protected',
    icon: 'globe'
  }
];

// How to Become an LRM
export const howToBecomeLRM: HowToBecomeSection = {
  steps: [
    {
      id: '1',
      title: 'Community Nomination',
      description: 'Be nominated by your village assembly as a trusted community member committed to land rights protection and social justice.'
    },
    {
      id: '2',
      title: 'HakiArdhi Training',
      description: 'Complete our comprehensive training program covering land law, dispute resolution, mediation techniques, documentation, and advocacy skills.'
    },
    {
      id: '3',
      title: 'Certification',
      description: 'Receive official certification as a Land Rights Monitor after successfully completing the training modules and practical assessments.'
    },
    {
      id: '4',
      title: 'Community Service',
      description: 'Return to your community to establish study groups, resolve disputes, document cases, and connect families with legal aid when needed.'
    },
    {
      id: '5',
      title: 'Continuous Learning',
      description: 'Participate in ongoing training, regional network meetings, and skill development programs to stay updated on land rights issues.'
    },
    {
      id: '6',
      title: 'Impact Reporting',
      description: 'Submit regular reports to HakiArdhi on cases handled, disputes resolved, and community impact, contributing to national advocacy efforts.'
    }
  ],
  requirements: [
    'Appointed by village assembly',
    'Strong community standing and trust',
    'Commitment to land rights and justice',
    'Basic literacy and communication skills',
    'Willingness to volunteer time for community service',
    'Ability to maintain confidentiality',
    'Passion for community empowerment',
    'Available for 2-week intensive training'
  ]
};
