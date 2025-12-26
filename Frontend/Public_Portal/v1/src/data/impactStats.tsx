/**
 * Impact Statistics Data
 *
 * HakiArdhi's measurable impact metrics
 */

import Icon from '@/components/ui/Icon';

export interface ImpactStat {
  number: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

export const impactStats: ImpactStat[] = [
  {
    number: '30+',
    label: 'Years of Impact',
    description: 'Three decades of dedicated service to land rights and social justice in Tanzania',
    icon: <Icon name="clock" size="lg" />,
  },
  {
    number: '1000+',
    label: 'Communities Served',
    description: 'Empowering rural and peri-urban communities across all regions of Tanzania',
    icon: <Icon name="users" size="lg" />,
  },
  {
    number: '500+',
    label: 'Research Publications',
    description: 'Comprehensive documentation of land tenure systems and indigenous practices',
    icon: <Icon name="book" size="lg" />,
  },
  {
    number: '24/7',
    label: 'Legal Aid Available',
    description: 'Round-the-clock support for communities facing land rights challenges',
    icon: <Icon name="shield" size="lg" />,
  },
];
