/**
 * Reusable Contact Method Card Component
 * Following COMPONENT_REUSABILITY_GUIDE.md
 */

import Card from '../ui/Card';
import Icon from '../ui/Icon';
import { SPACING, TYPOGRAPHY } from '@/constants/design-tokens';

interface ContactMethodCardProps {
  icon: string;
  title: string;
  lines: string[];
  action?: {
    label: string;
    href: string;
  };
}

export default function ContactMethodCard({ icon, title, lines, action }: ContactMethodCardProps) {
  return (
    <Card variant="elevated" hoverEffect="lift">
      <Card.Body>
        <div className={`${SPACING.margin.element.md} text-center`}>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-hakiardhi-red/10 rounded-full">
            <Icon name={icon as any} size="xl" className="text-hakiardhi-red" />
          </div>
        </div>

        <h3
          className={`${TYPOGRAPHY.heading.h4.size} ${TYPOGRAPHY.heading.h4.weight} text-gray-900 text-center ${SPACING.margin.element.sm}`}
        >
          {title}
        </h3>

        <div className={`${SPACING.component.tight} text-center`}>
          {lines.map((line, index) => (
            <p key={index} className={`${TYPOGRAPHY.body.default.size} text-gray-700`}>
              {line}
            </p>
          ))}
        </div>

        {action && (
          <div className={`${SPACING.margin.element.md} text-center`}>
            <a
              href={action.href}
              target={action.href.startsWith('http') ? '_blank' : undefined}
              rel={action.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="text-hakiardhi-red font-semibold hover:underline inline-flex items-center gap-2"
            >
              {action.label}
              <Icon name="arrow-right" size="sm" />
            </a>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
