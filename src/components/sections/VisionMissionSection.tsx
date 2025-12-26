'use client';

import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { THRESHOLDS, SPACING, CONTENT_WIDTHS, RESPONSIVE } from '@/constants/design-tokens';
import Section from '../ui/Section';
import BackgroundDecor from '../ui/BackgroundDecor';
import Card from '../ui/Card';
import Grid from '../ui/Grid';
import Icon from '../ui/Icon';
import Image from 'next/image';

export interface VisionMissionSectionProps {
  className?: string;
}

export default function VisionMissionSection({ className = '' }: VisionMissionSectionProps) {
  // Use optimized intersection observer hook
  const [sectionRef, isVisible] = useIntersectionObserver({
    threshold: THRESHOLDS.intersection.low,
    freezeOnceVisible: true,
  });

  return (
    <section
      ref={sectionRef}
      id="vision-mission-section"
      className={`relative ${RESPONSIVE.section} overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-zinc-50 ${className}`}
    >
      {/* Enhanced decorative gradient orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-hakiardhi-red/10 to-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-1/4 w-[32rem] h-[32rem] bg-gradient-to-br from-brand-500/10 to-hakiardhi-red/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-gradient-to-br from-success-500/5 to-brand-500/5 rounded-full blur-3xl"></div>

      <div className={`container mx-auto ${RESPONSIVE.container} relative z-10`}>
        {/* Enhanced History Section */}
        <div
          className={`${SPACING.margin.section.lg} text-center ${CONTENT_WIDTHS.text.full} mx-auto transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className={SPACING.component.relaxed}>
            {/* Decorative top element */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-2">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-hakiardhi-red"></div>
                <div className="w-2 h-2 rounded-full bg-hakiardhi-red"></div>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-hakiardhi-red"></div>
              </div>
            </div>

            <h2 className="text-3xl lg:text-5xl xl:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-hakiardhi-red to-brand-500 mb-4">
              Our History
            </h2>

            {/* Decorative underline */}
            <div className="flex justify-center mb-6">
              <div className="h-1.5 w-24 bg-gradient-to-r from-hakiardhi-red via-brand-500 to-hakiardhi-red rounded-full"></div>
            </div>

            <div className="relative">
              {/* Background card for history text */}
              <div className="absolute -inset-4 bg-gradient-to-br from-hakiardhi-red/5 to-brand-500/5 rounded-3xl blur-sm"></div>
              <Card variant="elevated" className="relative bg-white/80 backdrop-blur-sm border border-gray-100">
                <Card.Body className="p-8 lg:p-10">
                  <p className="text-lg lg:text-xl text-gray-800 leading-relaxed">
                    The Land Rights Research & Resources Institute (LARRRI/HAKIARDHI) was founded in{' '}
                    <span className="inline-flex items-center justify-center px-3 py-1 text-hakiardhi-red font-black text-xl bg-gradient-to-br from-hakiardhi-red/10 to-brand-500/10 rounded-lg border-2 border-hakiardhi-red/20">
                      1994
                    </span>{' '}
                    and registered as a non-governmental organization. The Institute was established in recognition of the need
                    to generate and sustain public debates and participation of small producers in villages
                    and peri-urban areas on land tenure and other important related issues.
                  </p>
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>

        {/* Vision and Mission Grid */}
        <Grid cols={{ base: 1, lg: 2 }} gap="xl" className="mt-8 lg:mt-12">
          {/* Vision - Enhanced */}
          <div
            className={`transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-10 scale-95'
            }`}
          >
            <div className="relative h-full group">
              {/* Outer glow */}
              <div className="absolute -inset-2 bg-gradient-to-br from-brand-500/20 to-hakiardhi-red/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <Card variant="elevated" className="relative h-full bg-white/90 backdrop-blur-sm border border-gray-100 group-hover:shadow-2xl group-hover:border-brand-500/30 transition-all duration-500">
                <Card.Body className="p-8 lg:p-10">
                  {/* Icon badge */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/30 to-hakiardhi-red/30 rounded-2xl blur-lg"></div>
                      <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/10 to-hakiardhi-red/10 border-2 border-brand-500/30 flex items-center justify-center">
                        <Icon name="eye" size="xl" className="text-brand-500" />
                      </div>
                    </div>
                    <h3 className="text-2xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-hakiardhi-red">
                      Our Vision
                    </h3>
                  </div>

                  {/* Main statement */}
                  <div className="bg-gradient-to-br from-brand-50/50 to-hakiardhi-red/5 rounded-2xl p-6 mb-6 border border-brand-100">
                    <p className="text-xl lg:text-2xl font-black text-gray-900 leading-relaxed">
                      A society with a socially just and equitable land tenure system.
                    </p>
                  </div>

                  {/* Key points */}
                  <div className="space-y-4">
                    {[
                      'Emphasizes social justice in land ownership and access',
                      'Advocates for equity in land tenure across all communities',
                      'Future-oriented approach to land rights reform',
                      'Inclusive vision encompassing rural and peri-urban populations'
                    ].map((point, idx) => (
                      <div key={idx} className="flex items-start gap-3 group/item">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-success-500 flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300 shadow-md">
                            <Icon name="check" size="sm" className="text-white" />
                          </div>
                        </div>
                        <p className="text-gray-700 text-base leading-relaxed">{point}</p>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>

          {/* Mission - Enhanced */}
          <div
            className={`transition-all duration-1000 delay-400 ${
              isVisible ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-10 scale-95'
            }`}
          >
            <div className="relative h-full group">
              {/* Outer glow */}
              <div className="absolute -inset-2 bg-gradient-to-br from-hakiardhi-red/20 to-brand-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <Card variant="elevated" className="relative h-full bg-white/90 backdrop-blur-sm border border-gray-100 group-hover:shadow-2xl group-hover:border-hakiardhi-red/30 transition-all duration-500">
                <Card.Body className="p-8 lg:p-10">
                  {/* Icon badge */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-hakiardhi-red/30 to-brand-500/30 rounded-2xl blur-lg"></div>
                      <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-hakiardhi-red/10 to-brand-500/10 border-2 border-hakiardhi-red/30 flex items-center justify-center">
                        <Icon name="target" size="xl" className="text-hakiardhi-red" />
                      </div>
                    </div>
                    <h3 className="text-2xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-hakiardhi-red to-brand-500">
                      Our Mission
                    </h3>
                  </div>

                  {/* Main statement */}
                  <div className="bg-gradient-to-br from-hakiardhi-red/5 to-brand-50/50 rounded-2xl p-6 mb-6 border border-hakiardhi-red/10">
                    <p className="text-xl lg:text-2xl font-black text-gray-900 leading-relaxed">
                      To research into, train, advocate for, and promote land rights of the rural-based
                      and peri-urban small producers who constitute the majority of the Tanzanian
                      population.
                    </p>
                  </div>

                  {/* Key pillars */}
                  <div className="space-y-4">
                    {[
                      { title: 'Research', desc: 'Conducting evidence-based studies on land tenure issues', icon: 'document' },
                      { title: 'Training', desc: 'Building capacity on land rights knowledge', icon: 'book' },
                      { title: 'Advocacy', desc: 'Promoting policy reforms for equitable land access', icon: 'megaphone' },
                      { title: 'Promotion', desc: 'Raising awareness about land rights among small producers', icon: 'users' }
                    ].map((pillar, idx) => (
                      <div key={idx} className="bg-gradient-to-r from-gray-50 to-transparent rounded-xl p-4 border border-gray-100 hover:border-hakiardhi-red/20 hover:shadow-md transition-all duration-300 group/pillar">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-hakiardhi-red to-brand-500 flex items-center justify-center group-hover/pillar:scale-110 transition-transform duration-300 shadow-md">
                              <Icon name={pillar.icon as any} size="sm" className="text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-hakiardhi-red to-brand-500 mb-1">
                              {pillar.title}
                            </h4>
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {pillar.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>
        </Grid>

        {/* Enhanced Target Groups */}
        <div
          className={`mt-20 lg:mt-32 transition-all duration-1000 delay-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="text-center mb-12">
            {/* Decorative top element */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-2">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-hakiardhi-red"></div>
                <div className="w-2 h-2 rounded-full bg-hakiardhi-red"></div>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-hakiardhi-red"></div>
              </div>
            </div>

            <h3 className="text-3xl lg:text-5xl xl:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-hakiardhi-red to-brand-500 mb-4">
              Target Groups
            </h3>

            {/* Decorative underline */}
            <div className="flex justify-center mb-6">
              <div className="h-1.5 w-24 bg-gradient-to-r from-hakiardhi-red via-brand-500 to-hakiardhi-red rounded-full"></div>
            </div>

            <p className="text-lg lg:text-xl text-gray-700 mb-6 max-w-3xl mx-auto leading-relaxed font-medium">
              We focus on empowering small-scale producers in rural and peri-urban areas across Tanzania
            </p>
          </div>

          <Grid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} gap="lg">
            {[
              { name: 'Pastoralists', image: '/images/pastoralists.png', icon: 'cow' },
              { name: 'Farmers', image: '/images/farmers.png', icon: 'wheat' },
              { name: 'Fisher folks', image: '/images/fisher_folks.png', icon: 'fish' },
              { name: 'Artisanal miners', image: '/images/artisanal_minors.png', icon: 'pickaxe' },
              { name: 'Fruit pickers', image: '/images/fuit_pickers.png', icon: 'apple' },
              { name: 'Hunters', image: '/images/public_debate_1.JPG', icon: 'bow-arrow' },
              { name: 'Beekeepers', image: '/images/beekeepers.png', icon: 'bee' },
            ].map((beneficiary, index) => (
              <div
                key={index}
                className="group relative"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Outer glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-br from-hakiardhi-red/20 to-brand-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <Card variant="elevated" className="relative overflow-hidden border-2 border-gray-100 group-hover:border-hakiardhi-red/30 transition-all duration-500 group-hover:shadow-2xl h-full">
                  {/* Image container */}
                  <div className="relative h-56 w-full bg-gray-200 overflow-hidden">
                    <Image
                      src={beneficiary.image}
                      alt={beneficiary.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Enhanced gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-hakiardhi-red/70 transition-all duration-500"></div>

                    {/* Icon badge */}
                    <div className="absolute top-4 right-4">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-hakiardhi-red transition-all duration-300">
                        <Icon name={beneficiary.icon as any} size="sm" className="text-white" />
                      </div>
                    </div>

                    {/* Name label */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white text-lg font-black tracking-wide group-hover:text-xl transition-all duration-300">
                          {beneficiary.name}
                        </h4>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-hakiardhi-red to-brand-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <span className="text-white text-xs font-black">{index + 1}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom accent */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-hakiardhi-red via-brand-500 to-hakiardhi-red"></div>
                  </div>
                </Card>
              </div>
            ))}
          </Grid>
        </div>
      </div>
    </section>
  );
}
