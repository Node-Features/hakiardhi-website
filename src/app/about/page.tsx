import { Header, Footer, ImageOverlaySection } from '@/components';
import PageHero from '@/components/layout/PageHero';
import VisionMissionSection from '@/components/sections/VisionMissionSection';
import CoreValuesSection from '@/components/sections/CoreValuesSection';
import DonorSection from '@/components/sections/DonorSection';
import Section from '@/components/ui/Section';
import Button from '@/components/ui/Button';
import Grid from '@/components/ui/Grid';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import Image from 'next/image';
import { SPACING, TYPOGRAPHY, CONTENT_WIDTHS } from '@/constants/design-tokens';
import {
  aboutHero,
  approachPrinciples,
  leadershipTeam,
  coreTeamRoles,
  boardMembers,
  partners,
  legalAidHotline,
  ctaSection,
} from '@/data/about';

export const metadata = {
  title: 'About Us | HakiArdhi',
  description:
    'Learn about HakiArdhi - Land Rights Research and Resources Institute, promoting and protecting land rights for rural and peri-urban communities in Tanzania.',
};

export default function AboutPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <PageHero title={aboutHero.title} description={aboutHero.description} />

      {/* History, Vision, Mission, and Target Beneficiaries from Landing Page */}
      <VisionMissionSection />

      {/* Core Values from Landing Page */}
      <CoreValuesSection />

      {/* Our Approach - LIGHT THEME WITH GRADIENT ORBS */}
      <section className="relative overflow-hidden bg-gray-50 py-12 sm:py-16 lg:py-24 xl:py-32">
        {/* Elegant decorative gradient orbs */}
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-gradient-to-br from-orange-500/10 to-brand-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-brand-500/10 to-success-500/10 rounded-full blur-3xl"></div>

        <Section.Content className="relative z-10">
          <h2 className={`${TYPOGRAPHY.heading.h2.size} ${TYPOGRAPHY.heading.h2.weight} text-hakiardhi-red ${SPACING.margin.element.lg} text-center`}>
            Our Community-Centered Approach
          </h2>
          <p className={`${TYPOGRAPHY.body.lg.size} text-gray-700 ${TYPOGRAPHY.body.lg.lineHeight} text-center ${SPACING.margin.element.xl} max-w-3xl mx-auto`}>
            Communities are partners, not beneficiaries. We work alongside communities to ensure
            their voices lead the change.
          </p>

          <Grid cols={{ base: 1, lg: 2 }} gap="xl" className="items-stretch mt-12">
              {/* Approach Principles */}
              <div>
                <Grid cols={{ base: 1 }} gap="md">
                  {approachPrinciples.map((principle, index) => (
                    <Card
                      key={index}
                      variant="elevated"
                      hoverEffect="lift"
                      className="h-full"
                    >
                      <Card.Body>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-2 h-2 mt-2 bg-hakiardhi-red rounded-full"></div>
                          <div>
                            <h4 className={`${TYPOGRAPHY.body.lg.size} font-bold text-hakiardhi-red ${SPACING.margin.element.xs}`}>
                              {principle.title}
                            </h4>
                            <p className={`${TYPOGRAPHY.body.default.size} text-gray-600`}>
                              {principle.description}
                            </p>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </Grid>
              </div>

              {/* Community Image */}
              <div className="relative h-96 lg:h-full min-h-[500px] rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/images/capacity_building_3.jpg"
                  alt="Community engagement"
                  fill
                  className="object-cover"
                />
              </div>
            </Grid>
        </Section.Content>
      </section>

      {/* Team Section - LIGHT THEME */}
      <Section variant="white" spacing="lg">
        <Section.Content>
          <div className="text-center mb-12">
            <h2 className={`${TYPOGRAPHY.heading.h2.size} ${TYPOGRAPHY.heading.h2.weight} text-hakiardhi-red ${SPACING.margin.element.md}`}>
              Our Team
            </h2>
            <p className={`${TYPOGRAPHY.body.lg.size} text-gray-600 max-w-3xl mx-auto`}>
              Dedicated professionals committed to advancing land rights in Tanzania
            </p>
          </div>

          <h3 className={`${TYPOGRAPHY.heading.h3.size} ${TYPOGRAPHY.heading.h3.weight} text-gray-900 ${SPACING.margin.element.lg}`}>
            Leadership
          </h3>
          <Grid layout="thirds" className={SPACING.margin.element.xl}>
            {leadershipTeam.map((member, index) => (
              <Card
                key={index}
                variant="elevated"
                hoverEffect="lift"
                className="overflow-hidden h-full"
              >
                <div className="aspect-square bg-gray-200 relative">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <Card.Body>
                  <h4 className={`${TYPOGRAPHY.heading.h4.size} ${TYPOGRAPHY.heading.h4.weight} text-gray-900 ${SPACING.margin.element.xs}`}>
                    {member.name}
                  </h4>
                  <p className={`${TYPOGRAPHY.body.default.size} text-gray-600`}>{member.role}</p>
                </Card.Body>
              </Card>
            ))}
          </Grid>

          <h3 className={`${TYPOGRAPHY.heading.h3.size} ${TYPOGRAPHY.heading.h3.weight} text-gray-900 ${SPACING.margin.element.lg}`}>
            Departments
          </h3>
          <Grid layout="thirds">
            {coreTeamRoles.map((department, index) => (
              <Card
                key={index}
                variant="elevated"
                hoverEffect="lift"
                className="overflow-hidden h-full"
              >
                <div className="aspect-square bg-gray-200 relative">
                  <Image
                    src={department.image}
                    alt={department.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <Card.Body>
                  <h4 className={`${TYPOGRAPHY.heading.h4.size} ${TYPOGRAPHY.heading.h4.weight} text-gray-900 ${SPACING.margin.element.xs}`}>
                    {department.name}
                  </h4>
                  <p className={`${TYPOGRAPHY.body.default.size} text-gray-600`}>{department.role}</p>
                </Card.Body>
              </Card>
            ))}
          </Grid>
        </Section.Content>
      </Section>

      {/* Board of Directors */}
      <Section variant="white" spacing="lg">
        <Section.Content>
          <h2 className={`${TYPOGRAPHY.heading.h2.size} ${TYPOGRAPHY.heading.h2.weight} text-hakiardhi-red ${SPACING.margin.element.lg} text-center`}>
            Board of Directors
          </h2>
          <p className={`${TYPOGRAPHY.body.lg.size} text-gray-700 ${TYPOGRAPHY.body.lg.lineHeight} text-center ${SPACING.margin.element.xl} max-w-3xl mx-auto`}>
            Our Board provides strategic governance and brings diverse expertise in land rights,
            law, development, and community advocacy.
          </p>

          <Grid layout="thirds">
            {boardMembers.map((member, index) => (
              <Card
                key={index}
                variant="elevated"
                hoverEffect="lift"
                className="overflow-hidden h-full"
              >
                <div className="aspect-square bg-gray-200 relative">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <Card.Body>
                  <h4 className={`${TYPOGRAPHY.heading.h4.size} ${TYPOGRAPHY.heading.h4.weight} text-gray-900 ${SPACING.margin.element.xs}`}>
                    {member.name}
                  </h4>
                  <p className={`${TYPOGRAPHY.body.default.size} text-gray-600`}>{member.role}</p>
                </Card.Body>
              </Card>
            ))}
          </Grid>
        </Section.Content>
      </Section>

      {/* Partners & Networks */}
      <DonorSection partners={partners} />

      {/* Legal Aid Hotline - LIGHT THEME WITH GRADIENT ORBS */}
      <section className="relative overflow-hidden bg-gray-50 py-12 sm:py-16 lg:py-24">
        {/* Elegant decorative gradient orbs */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-gradient-to-br from-hakiardhi-red/15 to-orange-500/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-br from-brand-500/15 to-hakiardhi-red/15 rounded-full blur-3xl"></div>

        <Section.Content className="relative z-10">
          <Card variant="elevated" className="max-w-4xl mx-auto">
            <Card.Body className={`${SPACING.padding.xl} text-center`}>
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-hakiardhi-red to-red-600 rounded-full flex items-center justify-center">
                <Icon name="phone" size="xl" className="text-white" />
              </div>
              <h3 className={`${TYPOGRAPHY.heading.h2.size} ${TYPOGRAPHY.heading.h2.weight} text-hakiardhi-red ${SPACING.margin.element.md}`}>
                {legalAidHotline.title}
              </h3>
              <p className={`${TYPOGRAPHY.body.lg.size} ${SPACING.margin.element.lg} text-gray-700`}>
                {legalAidHotline.description}
              </p>
              <div className={`flex items-center justify-center ${SPACING.gap.sm} ${SPACING.margin.element.lg}`}>
                <span className={`${TYPOGRAPHY.display.md.size} ${TYPOGRAPHY.display.md.weight} text-hakiardhi-red`}>
                  {legalAidHotline.phone}
                </span>
              </div>
              <p className={`${TYPOGRAPHY.body.sm.size} text-gray-600`}>{legalAidHotline.availability}</p>
            </Card.Body>
          </Card>
        </Section.Content>
      </section>

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
              <Button href={ctaSection.secondaryButton.link} variant="primary" size="lg">
                {ctaSection.secondaryButton.text}
              </Button>
              <Button href={ctaSection.primaryButton.link} variant="secondary" size="lg">
                {ctaSection.primaryButton.text}
              </Button>
            </div>
          </div>
        </Section.Content>
      </Section>

      <Footer />
    </main>
  );
}
