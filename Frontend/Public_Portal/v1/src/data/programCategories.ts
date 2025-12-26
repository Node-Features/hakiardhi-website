/**
 * Program Categories Information
 *
 * Detailed descriptions of HakiArdhi's program categories
 */

export interface ProgramCategory {
  id: string;
  name: string;
  description: string;
  focus: string;
  iconName: 'document' | 'book' | 'megaphone' | 'scale';
}

export const programCategories: ProgramCategory[] = [
  {
    id: 'research',
    name: 'Research',
    description: 'Our research programs generate evidence-based knowledge on land tenure systems, customary practices, and policy impacts across Tanzania. We conduct participatory field research, document indigenous land management practices, and analyze land governance frameworks.',
    focus: 'Evidence generation, policy analysis, and community-based documentation',
    iconName: 'document',
  },
  {
    id: 'training',
    name: 'Training',
    description: 'Through the School of HakiArdhi and specialized workshops, we build grassroots capacity on land rights, governance, and advocacy. Our training programs empower community leaders, women groups, youth, paralegals, and local government officials with knowledge and skills to defend land rights.',
    focus: 'Capacity building, legal literacy, and community empowerment',
    iconName: 'book',
  },
  {
    id: 'advocacy',
    name: 'Advocacy',
    description: 'We engage in multi-level advocacy to influence land policies, laws, and practices at local, national, and regional levels. Our advocacy is evidence-based, participatory, and amplifies community voices in policy processes to promote pro-poor land reforms.',
    focus: 'Policy reform, legislative advocacy, and public campaigns',
    iconName: 'megaphone',
  },
  {
    id: 'legal-services',
    name: 'Legal Services',
    description: 'Our legal aid program provides free legal representation, counseling, and mediation services to communities and individuals facing land rights violations. We support communities from initial consultation through court proceedings to secure justice and protect land rights.',
    focus: 'Legal representation, dispute resolution, and access to justice',
    iconName: 'scale',
  },
];
