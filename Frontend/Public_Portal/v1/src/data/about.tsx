/**
 * About Page Data
 *
 * Content and data for the About Us page
 */

// Hero Section
export const aboutHero = {
  title: 'About HakiArdhi',
  description: 'Empowering communities through research, education, and advocacy for equitable land rights across Tanzania.',
};

// Who We Are Section
export const whoWeAre = {
  title: 'Who We Are',
  content: [
    'HakiArdhi – The Land Rights Research and Resources Institute is a non-profit organization promoting and protecting land rights for rural and peri-urban communities in Tanzania. Our work advances social justice, equitable land tenure systems, and inclusive land governance through research, capacity building, advocacy, and community empowerment.',
  ],
};

// Vision & Mission
export const visionMission = {
  vision: {
    title: 'Vision',
    content: 'A Tanzania where all people enjoy a socially just, inclusive, and equitable land tenure system that secures their livelihoods and sustainable development.',
    iconName: 'eye' as const,
  },
  mission: {
    title: 'Mission',
    content: 'To research, train, advocate for, and promote land rights of rural and peri-urban communities, strengthen land governance systems, and build grassroots capacity for informed participation.',
    iconName: 'target' as const,
  },
};

// What We Do
export interface WhatWeDoItem {
  title: string;
  description: string;
  iconName: 'document' | 'book' | 'scale' | 'megaphone' | 'users' | 'globe';
}

export const whatWeDo: WhatWeDoItem[] = [
  {
    title: 'Research & Evidence Generation',
    description: 'Conducting comprehensive studies on land tenure systems, policies, and community practices to inform advocacy.',
    iconName: 'document',
  },
  {
    title: 'Public Education & Training',
    description: 'Empowering communities with knowledge about their land rights, governance, and advocacy strategies.',
    iconName: 'book',
  },
  {
    title: 'Legal Empowerment & Dispute Support',
    description: 'Providing free legal aid and support for land rights cases, disputes, and community representation.',
    iconName: 'scale',
  },
  {
    title: 'Advocacy & Policy Influence',
    description: 'Working with policymakers to strengthen land laws and governance frameworks at local and national levels.',
    iconName: 'megaphone',
  },
  {
    title: "Women's Land Rights",
    description: 'Championing gender equity in land ownership, inheritance, and access to natural resources.',
    iconName: 'users',
  },
  {
    title: 'Pastoralists & Customary Land Use Support',
    description: 'Protecting traditional land use systems, pastoralist rights, and indigenous community practices.',
    iconName: 'globe',
  },
];

// Community-Centered Approach
export const approachPrinciples = [
  { title: 'Participation', description: 'Communities lead, we support' },
  { title: 'Evidence-based decisions', description: 'Research drives our advocacy' },
  { title: 'Rights-focused programming', description: 'Human rights at the center' },
  { title: 'Climate justice', description: 'Sustainable land management' },
  { title: 'Long-term sustainability', description: 'Building lasting solutions' },
  { title: 'Community empowerment', description: 'Strengthening grassroots capacity' },
];

// Impact Statistics
export interface ImpactStat {
  value: string;
  label: string;
  description?: string;
}

export const impactStats: ImpactStat[] = [
  {
    value: '500+',
    label: 'Villages Reached',
    description: 'Across all regions of Tanzania'
  },
  {
    value: '10,000+',
    label: 'Women Trained & Represented',
    description: 'In land governance bodies'
  },
  {
    value: '2,500+',
    label: 'Legal Cases Supported',
    description: 'Securing land rights for communities'
  },
  {
    value: '150+',
    label: 'Research Publications',
    description: 'Evidence-based policy advocacy'
  },
];

// Core Values
export interface CoreValue {
  title: string;
  description: string;
}

export const coreValues: CoreValue[] = [
  {
    title: 'Equity & Justice',
    description: 'Ensuring fair access to land rights for all community members, regardless of gender, ethnicity, or social status.',
  },
  {
    title: 'Transparency',
    description: 'Operating with openness and accountability in all our activities, decisions, and use of resources.',
  },
  {
    title: 'Community Empowerment',
    description: 'Strengthening grassroots capacity for self-advocacy, informed participation, and decision-making.',
  },
  {
    title: 'Integrity',
    description: 'Upholding ethical standards, honesty, and professional conduct in all aspects of our work.',
  },
  {
    title: 'Environmental Sustainability',
    description: 'Promoting land use practices that protect natural resources and support climate resilience.',
  },
  {
    title: 'Social Sustainability',
    description: 'Building lasting solutions that benefit current and future generations of Tanzanians.',
  },
];

// Team Structure
export interface TeamMember {
  name: string;
  role: string;
  image: string;
  department?: string;
}

export const leadershipTeam: TeamMember[] = [
  {
    name: 'Executive Director',
    role: 'Strategic Leadership & Organizational Management',
    image: '/images/team-1.jpg',
  },
  {
    name: 'Head of Programs',
    role: 'Program Design, Implementation & Monitoring',
    image: '/images/team-2.JPG',
  },
  {
    name: 'Head of Finance & Administration',
    role: 'Financial Management & Operations',
    image: '/images/team-3.JPG',
  },
];

export const coreTeamRoles: TeamMember[] = [
  {
    name: 'Programs',
    role: 'Program Design, Implementation & Community Engagement',
    image: '/images/capacity_building_1.jpg',
  },
  {
    name: 'Communications',
    role: 'Advocacy, Public Relations & Stakeholder Engagement',
    image: '/images/public_debate_2.JPG',
  },
  {
    name: 'Finance',
    role: 'Financial Management, Budgeting & Resource Allocation',
    image: '/images/team-4.JPG',
  },
  {
    name: 'Board of Directors',
    role: 'Governance, Strategic Oversight & Policy Direction',
    image: '/images/team-1.jpg',
  },
  {
    name: 'Members and Institutional Management',
    role: 'Membership Coordination & Organizational Development',
    image: '/images/gender_training_2.JPG',
  },
  {
    name: 'Program Support',
    role: 'Logistics, Administration & Operational Support',
    image: '/images/capacity_building_2.jpg',
  },
];

// Board of Directors
export const boardMembers: TeamMember[] = [
  {
    name: 'Chairperson',
    role: 'Land Rights & Policy Expert',
    image: '/images/team-1.jpg',
  },
  {
    name: 'Vice Chairperson',
    role: 'Legal & Human Rights Specialist',
    image: '/images/team-2.JPG',
  },
  {
    name: 'Secretary',
    role: 'Community Development Professional',
    image: '/images/team-3.JPG',
  },
  {
    name: 'Treasurer',
    role: 'Finance & Nonprofit Management Expert',
    image: '/images/team-4.JPG',
  },
  {
    name: 'Board Member',
    role: 'Environmental & Natural Resources Specialist',
    image: '/images/gender_training_1.JPG',
  },
  {
    name: 'Board Member',
    role: 'Gender & Social Inclusion Advocate',
    image: '/images/gender_training_3.JPG',
  },
  {
    name: 'Board Member',
    role: 'Research & Academic Representative',
    image: '/images/legal_aid_1.JPG',
  },
];

// Journey/Timeline
export interface Milestone {
  year: string;
  title: string;
  description: string;
}

export const journey: Milestone[] = [
  {
    year: '1994',
    title: 'Foundation',
    description: 'HakiArdhi established as LARRRI to address land rights challenges facing rural communities in Tanzania.',
  },
  {
    year: '2000-2010',
    title: 'Growth & Expansion',
    description: 'Expanded programs across Tanzania, launched the School of HakiArdhi, and established regional offices.',
  },
  {
    year: '2011-2020',
    title: 'Policy Impact',
    description: 'Influenced major land policy reforms, trained thousands of community leaders, and supported landmark legal cases.',
  },
  {
    year: '2020-Present',
    title: 'Innovation & Scale',
    description: "Integrating technology, expanding women's land rights programs, and leading climate-smart land governance initiatives.",
  },
];

// Partners & Networks
export interface Partner {
  name: string;
  logo: string;
  category?: 'donor' | 'research' | 'network';
}

export const partners: Partner[] = [
  {
    name: 'International Land Coalition',
    logo: '/images/international-land-coalition.png',
    category: 'network',
  },
  {
    name: 'Austrian Development Agency',
    logo: '/images/austrian-development-agency-logo.jpg',
    category: 'donor',
  },
  {
    name: 'Horizont3000',
    logo: '/images/donor_horizont3000_logo.jpg',
    category: 'donor',
  },
  {
    name: 'Ardhi University',
    logo: '/images/research-patner-aru-logo.jpg',
    category: 'research',
  },
  {
    name: 'IPIS Research',
    logo: '/images/research-patner-IPIS-logo.png',
    category: 'research',
  },
  {
    name: 'University of Dar es Salaam',
    logo: '/images/research-patner-udsm-logo.png',
    category: 'research',
  },
];

// Legal Aid Hotline
export const legalAidHotline = {
  title: 'Need Legal Support?',
  description: 'Free legal aid hotline for land rights issues',
  phone: '0800 711 555',
  availability: 'Available Monday - Friday, 8:00 AM - 5:00 PM',
};

// Call to Action
export const ctaSection = {
  title: 'Partner with Us to Strengthen Land Rights Across Tanzania',
  description: 'Join us in our mission to secure land rights, empower communities, and promote equitable land governance.',
  primaryButton: {
    text: 'Contact Us',
    link: '/contact',
  },
  secondaryButton: {
    text: 'Work With Us',
    link: '/work-with-us',
  },
};
