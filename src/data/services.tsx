/**
 * What We Do Services
 *
 * Core services and programs offered by HakiArdhi
 */

type ServiceCardProps = {
  className?: string;
  icon?: ReactNode;
  title: string;
  description?: string;
  color?: 'brand' | 'blue' | 'orange' | 'success' | string;
};

import type { ReactNode } from 'react';
import Icon from '@/components/ui/Icon';

export const services: Array<Omit<ServiceCardProps, 'className'>> = [
  {
    icon: <Icon name="document" size="md" />,
    title: 'Research & Documentation',
    description: 'We conduct in-depth research on land tenure systems, documenting indigenous knowledge and traditional land rights practices across Tanzania.',
    color: 'brand' as const,
  },
  {
    icon: <Icon name="book" size="md" />,
    title: 'Training & Capacity Building',
    description: 'We empower communities and local organizations through comprehensive training programs on land rights, advocacy, and resource management.',
    color: 'blue' as const,
  },
  {
    icon: <Icon name="scale" size="md" />,
    title: 'Policy Advocacy',
    description: 'We advocate for fair and equitable land policies, working with government bodies and stakeholders to ensure justice in land tenure systems.',
    color: 'orange' as const,
  },
  {
    icon: <Icon name="shield" size="md" />,
    title: 'Legal Aid & Counseling',
    description: 'We provide free legal support and counseling services to communities facing land disputes and rights violations, ensuring access to justice.',
    color: 'success' as const,
  },
];
