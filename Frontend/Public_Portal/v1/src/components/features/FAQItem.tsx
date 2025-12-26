/**
 * Reusable FAQ Item Component
 * Following COMPONENT_REUSABILITY_GUIDE.md
 */

import Card from '../ui/Card';
import Icon from '../ui/Icon';
import { SPACING, TYPOGRAPHY } from '@/constants/design-tokens';

interface FAQItemProps {
  question: string;
  answer: string;
}

export default function FAQItem({ question, answer }: FAQItemProps) {
  return (
    <Card variant="elevated" className="hover:shadow-md transition-shadow">
      <Card.Body>
        <h4
          className={`${TYPOGRAPHY.heading.h4.size} ${TYPOGRAPHY.heading.h4.weight} text-gray-900 ${SPACING.margin.element.sm} flex items-start gap-2`}
        >
          <Icon name="question-mark-circle" size="md" className="text-hakiardhi-red flex-shrink-0 mt-1" />
          {question}
        </h4>
        <p
          className={`${TYPOGRAPHY.body.default.size} text-gray-700 ${TYPOGRAPHY.body.default.lineHeight} ml-8`}
        >
          {answer}
        </p>
      </Card.Body>
    </Card>
  );
}
