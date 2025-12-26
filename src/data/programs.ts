/**
 * Programs Gallery Data
 *
 * HakiArdhi's programs and initiatives
 */

export interface Program {
  id: number;
  slug: string;
  title: string;
  description: string;
  fullDescription: string;
  category: string;
  image: string;
  date: string; // ISO format: YYYY-MM-DD
  location?: string;
  participants?: number;
  duration?: string;
  status?: 'Completed' | 'Ongoing' | 'Upcoming';
  objectives?: string[];
  impact?: {
    label: string;
    value: string;
  }[];
  gallery?: string[];
  partners?: string[];
  outcomes?: string[];
}

export const programs: Program[] = [
  {
    id: 1,
    slug: 'land-tenure-systems-research-manyara',
    title: 'Land Tenure Systems Research - Manyara',
    description: 'Comprehensive research on customary land tenure in Manyara region',
    fullDescription: 'This groundbreaking research project examines the intricate customary land tenure systems in the Manyara region, documenting traditional land governance practices and their intersection with formal legal frameworks. The study aims to provide evidence-based recommendations for policy reforms that respect customary rights while ensuring land security for rural communities.',
    category: 'Research',
    image: '/images/hero_1.JPG',
    date: '2024-11-15',
    location: 'Manyara',
    participants: 45,
    duration: '6 months',
    status: 'Ongoing',
    objectives: [
      'Document customary land tenure practices in Manyara region',
      'Analyze conflicts between customary and statutory land laws',
      'Develop policy recommendations for harmonizing land governance systems',
      'Build local capacity in participatory land research methodologies'
    ],
    impact: [
      { label: 'Villages Covered', value: '25' },
      { label: 'Research Reports', value: '3' },
      { label: 'Policy Briefs', value: '5' },
      { label: 'Community Members Engaged', value: '450+' }
    ],
    gallery: ['/images/hero_1.JPG', '/images/hero_2.JPG', '/images/team-1.jpg', '/images/farmers.png'],
    partners: ['University of Dar es Salaam', 'International Land Coalition'],
    outcomes: [
      'Comprehensive documentation of 25 village land tenure systems',
      'Training of 45 community researchers in participatory methods',
      'Publication of 3 peer-reviewed research reports',
      'Presentation of findings to district and regional authorities'
    ]
  },
  {
    id: 2,
    slug: 'community-paralegals-training',
    title: 'Community Paralegals Training',
    description: 'Building capacity of community paralegals on land rights',
    fullDescription: 'This intensive capacity-building program equips community paralegals with comprehensive knowledge and skills to provide legal support to communities facing land rights challenges. Participants learn about land laws, legal procedures, mediation techniques, and community mobilization strategies to become effective advocates for justice in their communities.',
    category: 'Training',
    image: '/images/capacity_building_1.jpg',
    date: '2024-10-20',
    location: 'Arusha',
    participants: 120,
    duration: '3 weeks',
    status: 'Completed',
    objectives: [
      'Train community members to become effective paralegals',
      'Build understanding of land laws and legal procedures',
      'Develop skills in legal documentation and case management',
      'Strengthen community-based legal aid networks'
    ],
    impact: [
      { label: 'Paralegals Trained', value: '120' },
      { label: 'Districts Covered', value: '15' },
      { label: 'Legal Cases Handled', value: '200+' },
      { label: 'Communities Served', value: '50+' }
    ],
    gallery: ['/images/capacity_building_1.jpg', '/images/capacity_building_2.jpg', '/images/capacity_building_3.jpg', '/images/team-2.JPG'],
    partners: ['Austrian Development Agency', 'Horizont3000'],
    outcomes: [
      '120 community paralegals certified and deployed',
      'Establishment of 15 community legal aid desks',
      'Over 200 land dispute cases handled within first year',
      'Development of comprehensive paralegal training manual'
    ]
  },
  {
    id: 3,
    slug: 'women-land-rights-workshop',
    title: 'Women Land Rights Workshop',
    description: 'Empowering women with knowledge on inheritance and land ownership',
    fullDescription: 'This transformative workshop addresses the critical challenge of women\'s land rights in Tanzania, focusing on inheritance laws, property ownership, and overcoming cultural barriers. Through interactive sessions, women learn about their legal rights, share experiences, and develop strategies to secure land tenure and economic independence.',
    category: 'Training',
    image: '/images/gender_training_1.JPG',
    date: '2024-09-10',
    location: 'Dar es Salaam',
    participants: 85,
    duration: '5 days',
    status: 'Completed',
    objectives: [
      'Educate women on land inheritance and ownership rights',
      'Address cultural and legal barriers to women\'s land access',
      'Develop advocacy strategies for gender-equitable land policies',
      'Create peer support networks for women land rights defenders'
    ],
    impact: [
      { label: 'Women Empowered', value: '85' },
      { label: 'Support Groups Formed', value: '12' },
      { label: 'Legal Consultations', value: '150+' },
      { label: 'Success Stories', value: '40+' }
    ],
    gallery: ['/images/gender_training_1.JPG', '/images/gender_training_2.JPG', '/images/gender_training_3.JPG', '/images/team-3.JPG'],
    partners: ['UN Women Tanzania', 'Tanzania Gender Networking Programme'],
    outcomes: [
      '85 women trained on land rights and legal procedures',
      'Formation of 12 women\'s land rights support groups',
      '40+ successful land ownership documentation cases',
      'Development of gender-responsive land rights advocacy toolkit'
    ]
  },
  {
    id: 4,
    slug: 'national-land-policy-dialogue',
    title: 'National Land Policy Dialogue',
    description: 'Multi-stakeholder dialogue on land policy reforms',
    fullDescription: 'A landmark national convening bringing together government officials, civil society organizations, traditional leaders, and community representatives to discuss critical land policy reforms. The dialogue provides a platform for evidence-based discussions on land governance challenges and collaborative solutions for equitable and sustainable land management.',
    category: 'Advocacy',
    image: '/images/public_debate_1.JPG',
    date: '2024-08-05',
    location: 'Dodoma',
    participants: 200,
    duration: '3 days',
    status: 'Completed',
    objectives: [
      'Facilitate multi-stakeholder dialogue on land policy reforms',
      'Present research evidence on land governance challenges',
      'Build consensus on priority policy recommendations',
      'Strengthen collaboration between government and civil society'
    ],
    impact: [
      { label: 'Stakeholders Engaged', value: '200+' },
      { label: 'Policy Recommendations', value: '15' },
      { label: 'Government Officials', value: '45' },
      { label: 'Media Coverage', value: '25+ outlets' }
    ],
    gallery: ['/images/public_debate_1.JPG', '/images/public_debate_2.JPG', '/images/nalaf-1.JPG', '/images/nalaf-2.JPG'],
    partners: ['Ministry of Lands', 'National Land Forum', 'Parliament of Tanzania'],
    outcomes: [
      'Adoption of 15 policy recommendations by government',
      'Establishment of multi-stakeholder land policy task force',
      'Extensive media coverage reaching 2 million+ citizens',
      'Publication of national land policy reform roadmap'
    ]
  },
  {
    id: 5,
    slug: 'legal-aid-clinic-morogoro',
    title: 'Legal Aid Clinic - Morogoro',
    description: 'Free legal consultation and support for land disputes',
    fullDescription: 'Our mobile legal aid clinic provides free legal consultation and representation to rural communities facing land disputes and tenure insecurity. Legal professionals and paralegals work directly with communities to resolve conflicts through mediation, legal documentation, and court representation when necessary.',
    category: 'Legal Services',
    image: '/images/legal_aid_2.JPG',
    date: '2024-11-01',
    location: 'Morogoro',
    participants: 65,
    duration: '2 weeks',
    status: 'Completed',
    objectives: [
      'Provide free legal consultation to rural communities',
      'Resolve land disputes through mediation and legal processes',
      'Assist with land documentation and registration',
      'Build community awareness of legal rights and remedies'
    ],
    impact: [
      { label: 'Cases Resolved', value: '48' },
      { label: 'Legal Consultations', value: '65' },
      { label: 'Mediation Sessions', value: '32' },
      { label: 'Land Documents Processed', value: '25' }
    ],
    gallery: ['/images/legal_aid_2.JPG', '/images/legal_aid_1.JPG', '/images/legal_aid_3.JPG', '/images/legal_aid_4.JPG'],
    partners: ['Tanzania Legal Aid Society', 'Morogoro District Council'],
    outcomes: [
      '48 land dispute cases successfully resolved',
      '25 families received assistance with land title documentation',
      '32 successful community mediation sessions conducted',
      'Establishment of permanent legal aid desk in Morogoro'
    ]
  },
  {
    id: 6,
    slug: 'school-hakiardhi-graduation',
    title: 'School HakiArdhi Graduation',
    description: 'Graduation of 150 trained land rights monitors',
    fullDescription: 'The School HakiArdhi is our flagship training program that transforms community members into skilled land rights monitors and advocates. This graduation ceremony celebrates the achievement of 150 graduates who have completed intensive training in land rights, monitoring methodologies, and community advocacy techniques.',
    category: 'Training',
    image: '/images/capacity_building_2.jpg',
    date: '2024-07-25',
    location: 'Mwanza',
    participants: 150,
    duration: '6 months',
    status: 'Completed',
    objectives: [
      'Train community members as land rights monitors',
      'Build capacity in land rights monitoring and documentation',
      'Develop advocacy and community mobilization skills',
      'Create network of trained land rights defenders'
    ],
    impact: [
      { label: 'Graduates Certified', value: '150' },
      { label: 'Monitoring Reports', value: '200+' },
      { label: 'Villages Covered', value: '75' },
      { label: 'Land Rights Violations Documented', value: '350+' }
    ],
    gallery: ['/images/capacity_building_2.jpg', '/images/capacity_building_1.jpg', '/images/capacity_building_3.jpg', '/images/team-4.JPG'],
    partners: ['Austrian Development Agency', 'Horizont3000', 'National Land Forum'],
    outcomes: [
      '150 certified land rights monitors deployed across Tanzania',
      '200+ monitoring reports documenting land rights violations',
      'Coverage of 75 villages with active monitoring systems',
      'Formation of national network of land rights monitors'
    ]
  },
  {
    id: 7,
    slug: 'pastoralist-land-rights-research',
    title: 'Pastoralist Land Rights Research',
    description: 'Documentation of pastoralist land use and customary practices',
    fullDescription: 'This research project focuses on documenting and analyzing the traditional land use patterns and customary tenure systems of pastoralist communities in Northern Tanzania. The study provides critical evidence on the importance of rangelands for pastoralist livelihoods and recommends policies to protect pastoralist land rights.',
    category: 'Research',
    image: '/images/hero_2.JPG',
    date: '2024-06-12',
    location: 'Ngorongoro',
    participants: 30,
    duration: '8 months',
    status: 'Ongoing',
    objectives: [
      'Document pastoralist land use and customary tenure practices',
      'Analyze threats to pastoralist land rights and livelihoods',
      'Develop policy recommendations for protecting rangeland rights',
      'Build capacity of pastoralist communities in advocacy'
    ],
    impact: [
      { label: 'Pastoralist Groups Engaged', value: '15' },
      { label: 'Grazing Areas Mapped', value: '40+' },
      { label: 'Research Publications', value: '4' },
      { label: 'Policy Briefs', value: '6' }
    ],
    gallery: ['/images/hero_2.JPG', '/images/pastoralists.png', '/images/team-1.jpg', '/images/hero_1.JPG'],
    partners: ['International Land Coalition', 'University of Dar es Salaam', 'Pastoralist Council'],
    outcomes: [
      'Comprehensive mapping of 40+ traditional grazing areas',
      'Documentation of customary land governance systems',
      'Publication of 4 research reports on pastoralist land rights',
      'Development of pastoralist land rights advocacy strategy'
    ]
  },
  {
    id: 8,
    slug: 'gender-training-local-leaders',
    title: 'Gender Training for Local Leaders',
    description: 'Training local leaders on gender-responsive land governance',
    fullDescription: 'This specialized training program targets local government leaders, village council members, and traditional authorities to promote gender-responsive land governance. Participants learn about gender equality principles, women\'s land rights under Tanzanian law, and practical strategies for ensuring women\'s participation in land decision-making.',
    category: 'Training',
    image: '/images/gender_training_2.JPG',
    date: '2024-10-08',
    location: 'Mbeya',
    participants: 95,
    duration: '1 week',
    status: 'Completed',
    objectives: [
      'Build capacity of local leaders in gender-responsive governance',
      'Promote understanding of women\'s land rights frameworks',
      'Develop strategies for women\'s participation in land decisions',
      'Address harmful cultural practices affecting women\'s land access'
    ],
    impact: [
      { label: 'Leaders Trained', value: '95' },
      { label: 'Districts Reached', value: '12' },
      { label: 'Policy Changes', value: '8' },
      { label: 'Women Beneficiaries', value: '500+' }
    ],
    gallery: ['/images/gender_training_2.JPG', '/images/gender_training_3.JPG', '/images/gender_training_1.JPG', '/images/team-3.JPG'],
    partners: ['UN Women Tanzania', 'Ministry of Community Development'],
    outcomes: [
      '95 local leaders committed to gender-responsive land governance',
      '8 villages adopted gender-equitable land allocation policies',
      '500+ women benefited from improved land governance practices',
      'Development of gender mainstreaming toolkit for local governments'
    ]
  },
  {
    id: 9,
    slug: 'parliamentary-advocacy-campaign',
    title: 'Parliamentary Advocacy Campaign',
    description: 'Advocacy for Village Land Act amendments',
    fullDescription: 'This strategic advocacy campaign engages Members of Parliament, government ministries, and key stakeholders to advance critical amendments to the Village Land Act. Through evidence-based policy briefs, stakeholder consultations, and parliamentary lobbying, the campaign seeks to strengthen protections for community land rights and improve land governance frameworks.',
    category: 'Advocacy',
    image: '/images/public_debate_2.JPG',
    date: '2024-09-20',
    location: 'Dodoma',
    participants: 180,
    duration: '4 months',
    status: 'Ongoing',
    objectives: [
      'Advocate for amendments to Village Land Act',
      'Build parliamentary support for land rights reforms',
      'Engage civil society in policy advocacy efforts',
      'Strengthen legal protections for community land rights'
    ],
    impact: [
      { label: 'MPs Engaged', value: '120' },
      { label: 'Policy Briefs Submitted', value: '8' },
      { label: 'Parliamentary Sessions', value: '15' },
      { label: 'CSO Partners', value: '45' }
    ],
    gallery: ['/images/public_debate_2.JPG', '/images/nalaf-2.JPG', '/images/public_debate_1.JPG', '/images/nalaf-1.JPG'],
    partners: ['National Land Forum', 'Tanzania Coalition on Land Rights', 'Parliament of Tanzania'],
    outcomes: [
      'Engagement of 120 Members of Parliament on land rights issues',
      'Submission of 8 comprehensive policy briefs to parliament',
      'Formation of cross-party parliamentary caucus on land rights',
      'Widespread media coverage of land reform advocacy'
    ]
  },
  {
    id: 10,
    slug: 'community-land-documentation',
    title: 'Community Land Documentation',
    description: 'Supporting villages to document customary land rights',
    fullDescription: 'This technical assistance program supports rural villages in documenting and formalizing their customary land rights through participatory mapping, boundary demarcation, and certificate of customary right of occupancy (CCRO) processes. The program ensures communities have legal recognition and protection of their traditional land holdings.',
    category: 'Legal Services',
    image: '/images/legal_aid_3.JPG',
    date: '2024-08-18',
    location: 'Kilimanjaro',
    participants: 50,
    duration: '5 months',
    status: 'Ongoing',
    objectives: [
      'Support villages in documenting customary land rights',
      'Facilitate participatory land use planning processes',
      'Assist with CCRO application and registration',
      'Build village capacity in land administration'
    ],
    impact: [
      { label: 'Villages Supported', value: '10' },
      { label: 'Land Parcels Mapped', value: '250+' },
      { label: 'CCROs Issued', value: '180' },
      { label: 'Hectares Documented', value: '5,000+' }
    ],
    gallery: ['/images/legal_aid_3.JPG', '/images/farmers.png', '/images/team-1.jpg', '/images/legal_aid_1.JPG'],
    partners: ['Ministry of Lands', 'Kilimanjaro District Council', 'USAID Tanzania'],
    outcomes: [
      '180 certificates of customary rights issued to families',
      'Documentation of over 5,000 hectares of community land',
      'Completion of participatory land use plans for 10 villages',
      'Training of village land committees in land administration'
    ]
  },
  {
    id: 11,
    slug: 'youth-leadership-training',
    title: 'Youth Leadership Training',
    description: 'Building next generation of land rights advocates',
    fullDescription: 'This transformative leadership program empowers young people to become effective land rights advocates and community leaders. Through intensive training in advocacy, research, policy analysis, and community mobilization, youth participants develop the skills and confidence to lead land rights campaigns in their communities.',
    category: 'Training',
    image: '/images/capacity_building_3.jpg',
    date: '2024-11-10',
    location: 'Iringa',
    participants: 75,
    duration: '2 weeks',
    status: 'Completed',
    objectives: [
      'Build youth capacity in land rights advocacy',
      'Develop leadership and community mobilization skills',
      'Create network of young land rights advocates',
      'Empower youth participation in land governance'
    ],
    impact: [
      { label: 'Youth Trained', value: '75' },
      { label: 'Youth-Led Initiatives', value: '12' },
      { label: 'Communities Reached', value: '30+' },
      { label: 'Advocacy Campaigns', value: '8' }
    ],
    gallery: ['/images/capacity_building_3.jpg', '/images/team-4.JPG', '/images/capacity_building_1.jpg', '/images/team-2.JPG'],
    partners: ['Youth for Land Justice Network', 'African Youth Initiative on Climate Change'],
    outcomes: [
      '75 young leaders certified in land rights advocacy',
      'Launch of 12 youth-led land rights initiatives',
      '8 successful community advocacy campaigns led by youth',
      'Formation of national youth land rights network'
    ]
  },
  {
    id: 12,
    slug: 'legal-aid-eviction-cases',
    title: 'Legal Aid for Eviction Cases',
    description: 'Representing communities facing illegal evictions',
    fullDescription: 'This critical legal aid intervention provides pro bono legal representation to communities and individuals facing illegal evictions and forced displacement. Our legal team works to protect vulnerable communities from unlawful land grabbing, ensure due process, and secure compensation when evictions are lawful but inadequately compensated.',
    category: 'Legal Services',
    image: '/images/legal_aid_4.JPG',
    date: '2024-07-05',
    location: 'Coastal Region',
    participants: 40,
    duration: '3 months',
    status: 'Completed',
    objectives: [
      'Provide legal representation to communities facing evictions',
      'Challenge illegal evictions through court proceedings',
      'Secure fair compensation for lawful evictions',
      'Document patterns of forced displacement for advocacy'
    ],
    impact: [
      { label: 'Families Represented', value: '40' },
      { label: 'Cases Won', value: '28' },
      { label: 'Evictions Stopped', value: '15' },
      { label: 'Compensation Secured', value: 'TZS 850M+' }
    ],
    gallery: ['/images/legal_aid_4.JPG', '/images/legal_aid_2.JPG', '/images/fisher_folks.png', '/images/legal_aid_1.JPG'],
    partners: ['Legal and Human Rights Centre', 'Tanzania Human Rights Defenders Coalition'],
    outcomes: [
      '28 successful court cases protecting community land rights',
      '15 illegal evictions halted through legal intervention',
      'Over TZS 850 million secured in compensation for affected families',
      'Documentation of forced displacement patterns for policy advocacy'
    ]
  },
];

export const PROGRAM_CATEGORIES = ['All', 'Research', 'Training', 'Advocacy', 'Legal Services'] as const;
