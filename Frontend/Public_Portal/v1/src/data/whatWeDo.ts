/**
 * What We Do Page Data
 *
 * Detailed content expanding on the services from the landing page
 */

export const whatWeDoHero = {
  title: 'What We Do',
  description: 'For over 30 years, HakiArdhi has been at the forefront of protecting land rights and empowering communities across Tanzania through comprehensive programs.',
};

export interface ServiceDetail {
  id: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  image: string;
  keyActivities: string[];
  impact: {
    stat: string;
    description: string;
  };
}

export const serviceDetails: ServiceDetail[] = [
  {
    id: 'research',
    title: 'Research & Documentation',
    shortDescription: 'We conduct in-depth research on land tenure systems, documenting indigenous knowledge and traditional land rights practices across Tanzania.',
    longDescription: 'Our research program generates evidence-based knowledge on land tenure systems, customary practices, and policy impacts. We document indigenous land management practices and analyze land governance frameworks to inform advocacy and policy reform. Through rigorous field research and community participation, we build a comprehensive understanding of land rights issues across Tanzania.',
    image: '/images/hero_1.JPG',
    keyActivities: [
      'Land tenure systems research and analysis',
      'Indigenous knowledge documentation',
      'Policy analysis and impact assessments',
      'Customary land rights documentation',
      'Gender and land rights research',
      'Community land use mapping',
    ],
    impact: {
      stat: '150+',
      description: 'Research publications informing national land policy and supporting community land claims',
    },
  },
  {
    id: 'training',
    title: 'Training & Capacity Building',
    shortDescription: 'We empower communities and local organizations through comprehensive training programs on land rights, advocacy, and resource management.',
    longDescription: 'The School of HakiArdhi provides structured training programs to build grassroots capacity on land rights, governance, and advocacy. We train community leaders, women groups, youth, local government officials, and civil society organizations. Our training combines legal education, advocacy skills, and practical tools for defending land rights at community level.',
    image: '/images/capacity_building_1.jpg',
    keyActivities: [
      'Community leadership training programs',
      'Land rights education and legal literacy',
      'Advocacy and campaign planning skills',
      'Women\'s land rights empowerment',
      'Youth engagement and education',
      'Paralegal training for community members',
    ],
    impact: {
      stat: '10,000+',
      description: 'Community members trained, including 3,500+ women leaders in land governance',
    },
  },
  {
    id: 'advocacy',
    title: 'Policy Advocacy',
    shortDescription: 'We advocate for fair and equitable land policies, working with government bodies and stakeholders to ensure justice in land tenure systems.',
    longDescription: 'We engage in multi-level advocacy to influence land policies, laws, and practices at local, national, and regional levels. Our advocacy is evidence-based, participatory, and focused on ensuring community voices shape land governance reforms. We work with parliamentarians, government ministries, civil society coalitions, and international partners to advance pro-poor land policies.',
    image: '/images/nalaf-1.JPG',
    keyActivities: [
      'National policy dialogue facilitation',
      'Legislative reform advocacy campaigns',
      'Community-led advocacy initiatives',
      'Coalition building and networking',
      'Policy briefs and position papers',
      'Media engagement and public awareness',
    ],
    impact: {
      stat: 'Major Influence',
      description: 'Contributed to land law reforms and influenced national policy frameworks',
    },
  },
  {
    id: 'legal-aid',
    title: 'Legal Aid & Counseling',
    shortDescription: 'We provide free legal support and counseling services to communities facing land disputes and rights violations, ensuring access to justice.',
    longDescription: 'Our legal aid program offers free legal representation, counseling, and mediation services to communities and individuals facing land rights violations. We support communities through all stages of dispute resolution—from initial counseling to court representation. Our team of lawyers and trained paralegals work closely with communities to secure their land rights and achieve justice.',
    image: '/images/legal_aid_1.JPG',
    keyActivities: [
      'Free legal representation in court',
      'Community legal counseling services',
      'Dispute mediation and alternative resolution',
      'Strategic litigation for precedent-setting cases',
      'Legal rights awareness and education',
      '24/7 legal aid hotline: 0800 711 555',
    ],
    impact: {
      stat: '2,500+',
      description: 'Legal cases supported with 75% success rate in securing land rights',
    },
  },
];

export const approachSection = {
  title: 'Our Approach',
  description: 'We believe in a participatory, rights-based, and evidence-driven approach to land rights work.',
  image: '/images/gender_training_2.JPG',
  principles: [
    {
      title: 'Community-Centered',
      description: 'Communities are partners and decision-makers, not passive beneficiaries',
    },
    {
      title: 'Evidence-Based',
      description: 'All advocacy grounded in rigorous research and documentation',
    },
    {
      title: 'Rights-Focused',
      description: 'Land issues addressed as fundamental human rights concerns',
    },
    {
      title: 'Gender-Responsive',
      description: 'Prioritizing women\'s land rights and gender equity',
    },
    {
      title: 'Inclusive & Participatory',
      description: 'Engaging diverse stakeholders and marginalized voices',
    },
    {
      title: 'Long-Term Commitment',
      description: 'Building lasting relationships and sustainable solutions',
    },
  ],
};

export const ctaSection = {
  title: 'Need Support or Want to Learn More?',
  description: 'Whether you need legal aid, training, or want to partner with us, we\'re here to help.',
  primaryButton: {
    text: 'Get Legal Aid',
    link: '/legal-aid',
  },
  secondaryButton: {
    text: 'Contact Us',
    link: '/contact',
  },
};
