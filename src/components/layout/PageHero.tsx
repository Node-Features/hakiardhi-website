/**
 * PageHero Component
 *
 * Reusable hero section for all secondary pages
 * Ensures consistent header spacing and styling
 */

import Section from '@/components/ui/Section';
import BackgroundDecor from '@/components/ui/BackgroundDecor';
import { SPACING, TYPOGRAPHY, CONTENT_WIDTHS } from '@/constants/design-tokens';

interface PageHeroProps {
  title: string;
  description: string;
  variant?: 'white' | 'light' | 'gradient-brand';
  showDecorations?: boolean;
}

export default function PageHero({
  title,
  description,
  variant = 'light',
  showDecorations = true,
}: PageHeroProps) {
  const isGradient = variant === 'gradient-brand';

  return (
    <Section variant={variant} spacing="xl" className="pt-44 lg:pt-48">
      {showDecorations && (
        <BackgroundDecor
          orbs={[{ position: 'top-right', size: 'xl', colors: ['brand', 'orange'], animate: true }]}
        />
      )}
      <Section.Content>
        <div className={`${CONTENT_WIDTHS.text.wide} mx-auto text-center`}>
          <h1
            className={`${TYPOGRAPHY.heading.h1.size} ${TYPOGRAPHY.heading.h1.weight} ${SPACING.margin.element.md} ${
              isGradient ? 'text-hakiardhi-red' : 'text-gray-900'
            }`}
          >
            {title}
          </h1>
          <p
            className={`${TYPOGRAPHY.body.lg.size} ${TYPOGRAPHY.body.lg.lineHeight} ${
              isGradient ? 'text-white' : 'text-gray-600'
            }`}
          >
            {description}
          </p>
        </div>
      </Section.Content>
    </Section>
  );
}
