/**
 * Programs Page Data
 *
 * Detailed information about HakiArdhi's programs expanding on landing page content
 */

export const programsHero = {
  title: 'Our Programs',
  description: 'Comprehensive initiatives designed to protect land rights and empower communities through education, legal support, and advocacy.',
};

export interface ProgramDetail {
  id: string;
  title: string;
  tagline: string;
  description: string;
  image: string;
  objectives: string[];
  whoWeServe: string[];
  howItWorks: string;
  impact: {
    stat: string;
    description: string;
  };
}

export const programDetails: ProgramDetail[] = [
  {
    id: 'school',
    title: 'School of HakiArdhi',
    tagline: 'Empowering Communities Through Education',
    description: 'Comprehensive training programs for community leaders, land rights monitors, and activists on land rights, advocacy, and resource management. The School of HakiArdhi is our flagship capacity-building initiative that has trained thousands of community members across Tanzania.',
    image: '/images/capacity_building_2.jpg',
    objectives: [
      'Build grassroots capacity on land rights and governance',
      'Train community paralegals and land rights monitors',
      'Empower women and youth in land advocacy',
      'Develop local leadership for land rights protection',
      'Strengthen community-based organizations',
    ],
    whoWeServe: [
      'Community leaders and village representatives',
      'Women\'s groups and gender advocates',
      'Youth and emerging leaders',
      'Local government officials',
      'Civil society organizations',
      'Traditional leaders and elders',
    ],
    howItWorks: 'The School offers modular training courses covering land laws, tenure systems, advocacy strategies, and dispute resolution. Participants engage in classroom learning, field visits, and practical exercises. Graduates become community resource persons who support land rights education in their communities.',
    impact: {
      stat: '10,000+',
      description: 'Community members trained since inception, with graduates serving as land rights champions in over 500 villages',
    },
  },
  {
    id: 'legal-aid',
    title: 'Legal Aid & Counseling',
    tagline: 'Access to Justice for All',
    description: '24/7 free legal support for communities facing land disputes, providing expert guidance and representation in court cases. Our legal aid program ensures that lack of resources is not a barrier to justice for communities defending their land rights.',
    image: '/images/legal_aid_2.JPG',
    objectives: [
      'Provide free legal representation to communities',
      'Offer legal counseling and rights education',
      'Mediate land disputes at community level',
      'Support strategic litigation for policy change',
      'Build community paralegal networks',
    ],
    whoWeServe: [
      'Communities facing land grabbing',
      'Individuals in land inheritance disputes',
      'Women denied land rights',
      'Pastoralists facing land conflicts',
      'Villages with boundary disputes',
      'Communities affected by large-scale investments',
    ],
    howItWorks: 'Communities access our services through the 24/7 hotline (0800 711 555), walk-in consultations, or referrals from partner organizations. Our team of lawyers and paralegals assess cases, provide counseling, and offer representation from mediation through to court proceedings.',
    impact: {
      stat: '2,500+',
      description: 'Legal cases supported with 75% success rate in securing or protecting land rights for communities',
    },
  },
  {
    id: 'research',
    title: 'Research & Documentation',
    tagline: 'Evidence for Advocacy',
    description: 'In-depth studies on land tenure systems, indigenous practices, and policy analysis to inform evidence-based advocacy. Our research provides the factual foundation for policy reform and community empowerment across Tanzania.',
    image: '/images/hero_1.JPG',
    objectives: [
      'Generate evidence on land tenure and governance',
      'Document indigenous knowledge and practices',
      'Analyze land policies and their impacts',
      'Support community land documentation',
      'Build knowledge resources for advocacy',
    ],
    whoWeServe: [
      'Policymakers and legislators',
      'Civil society organizations',
      'Communities seeking land documentation',
      'Academic and research institutions',
      'Development partners and donors',
      'Media and journalists',
    ],
    howItWorks: 'We conduct participatory field research, policy analysis, and documentation projects in partnership with communities. Research findings are published in accessible formats—reports, policy briefs, factsheets—and disseminated to inform advocacy, policy debates, and community action.',
    impact: {
      stat: '150+',
      description: 'Research publications and policy briefs informing national land debates and supporting community land claims',
    },
  },
  {
    id: 'advocacy',
    title: 'Policy Advocacy',
    tagline: 'Influencing Change for Justice',
    description: 'Working with government bodies and stakeholders to promote fair land policies and reforms that ensure social justice. Our advocacy ensures that community voices and experiences shape the laws and policies governing land in Tanzania.',
    image: '/images/public_debate_2.JPG',
    objectives: [
      'Influence pro-poor land policy reforms',
      'Amplify community voices in policy processes',
      'Build civil society coalitions for advocacy',
      'Engage with Parliament and government ministries',
      'Promote implementation of progressive land laws',
    ],
    whoWeServe: [
      'Communities affected by unjust land policies',
      'Women and marginalized groups',
      'Pastoralist communities',
      'Small-scale farmers and producers',
      'Civil society advocacy networks',
      'Progressive policymakers and champions',
    ],
    howItWorks: 'We use evidence from research and community experiences to engage in policy dialogue, legislative advocacy, and public campaigns. We facilitate community participation in policy processes, submit policy briefs, organize public debates, and work with media to raise awareness.',
    impact: {
      stat: 'National Impact',
      description: 'Contributed to major land law reforms including Village Land Act of 1999 amendments and influenced national land policy frameworks (1995) ',
    },
  },
];

export const ctaSection = {
  title: 'Get Involved in Our Programs',
  description: 'Whether you need support, want training, or wish to partner with us, join our programs making a difference.',
  buttons: [
    {
      text: 'Apply for Training',
      link: '/contact',
      variant: 'primary' as const,
    },
    {
      text: 'Request Legal Aid',
      link: '/legal-aid',
      variant: 'secondary' as const,
    },
  ],
};
