import { Header, Footer, WhatWeDoSection, ImageOverlaySection } from '@/components';
import Section from '@/components/ui/Section';
import Grid from '@/components/ui/Grid';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Image from 'next/image';
import { SPACING, TYPOGRAPHY, CONTENT_WIDTHS } from '@/constants/design-tokens';
import { serviceDetails, approachSection, ctaSection } from '@/data/whatWeDo';

export const metadata = {
  title: 'What We Do | HakiArdhi',
  description: 'Learn about HakiArdhi\'s comprehensive programs in research, training, policy advocacy, and legal aid supporting land rights across Tanzania.',
};

export default function WhatWeDoPage() {
  return (
    <main className="min-h-screen">
      <Header />

      {/* What We Do Section */}
      <div className="pt-44 lg:pt-48 bg-white">
        <WhatWeDoSection />
      </div>

      {/* Detailed Services */}
      {serviceDetails.map((service, index) => (
        <Section
          key={service.id}
          variant={index % 2 === 0 ? 'white' : 'light'}
          spacing="lg"
        >
          <Section.Content>
            <Grid
              cols={{ base: 1, lg: 2 }}
              gap="xl"
              className={index % 2 === 1 ? 'flex-row-reverse' : ''}
            >
              {/* Image */}
              <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex flex-col justify-center">
                <h2 className={`${TYPOGRAPHY.heading.h2.size} ${TYPOGRAPHY.heading.h2.weight} text-gray-900 ${SPACING.margin.element.md}`}>
                  {service.title}
                </h2>
                <p className={`${TYPOGRAPHY.body.lg.size} text-gray-700 ${TYPOGRAPHY.body.lg.lineHeight} ${SPACING.margin.element.lg}`}>
                  {service.longDescription}
                </p>

                {/* Key Activities */}
                <h3 className={`${TYPOGRAPHY.heading.h4.size} ${TYPOGRAPHY.heading.h4.weight} text-gray-900 ${SPACING.margin.element.sm}`}>
                  Key Activities
                </h3>
                <ul className={`${SPACING.component.tight} ${SPACING.margin.element.lg}`}>
                  {service.keyActivities.map((activity, idx) => (
                    <li
                      key={idx}
                      className={`flex items-start ${SPACING.gap.sm} ${TYPOGRAPHY.body.default.size} text-gray-700`}
                    >
                      <span className="text-hakiardhi-red mt-1 flex-shrink-0">•</span>
                      <span>{activity}</span>
                    </li>
                  ))}
                </ul>

                {/* Impact */}
                <div className={`bg-hakiardhi-red/10 ${SPACING.padding.md} rounded-xl border-l-4 border-hakiardhi-red`}>
                  <div className={`${TYPOGRAPHY.heading.h3.size} ${TYPOGRAPHY.heading.h3.weight} text-hakiardhi-red ${SPACING.margin.element.xs}`}>
                    {service.impact.stat}
                  </div>
                  <p className={`${TYPOGRAPHY.body.default.size} text-gray-700`}>
                    {service.impact.description}
                  </p>
                </div>
              </div>
            </Grid>
          </Section.Content>
        </Section>
      ))}

      {/* CTA Section */}
      <Section variant="light" spacing="lg">
        <Section.Content>
          <div className={`${CONTENT_WIDTHS.text.body} mx-auto text-center`}>
            <h2 className={`${TYPOGRAPHY.heading.h2.size} ${TYPOGRAPHY.heading.h2.weight} text-gray-900 ${SPACING.margin.element.lg}`}>
              {ctaSection.title}
            </h2>
            <p className={`${TYPOGRAPHY.body.lg.size} text-gray-600 ${TYPOGRAPHY.body.lg.lineHeight} ${SPACING.margin.element.lg}`}>
              {ctaSection.description}
            </p>
            <div className={`flex flex-wrap ${SPACING.gap.md} justify-center`}>
              <Button href={ctaSection.primaryButton.link} variant="primary" size="lg">
                {ctaSection.primaryButton.text}
              </Button>
              <Button href={ctaSection.secondaryButton.link} variant="secondary" size="lg">
                {ctaSection.secondaryButton.text}
              </Button>
            </div>
          </div>
        </Section.Content>
      </Section>

      <Footer />
    </main>
  );
}
