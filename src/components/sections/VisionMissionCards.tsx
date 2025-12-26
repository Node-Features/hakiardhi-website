'use client';

import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { THRESHOLDS, TYPOGRAPHY } from '@/constants/design-tokens';
import Section from '../ui/Section';
import BackgroundDecor from '../ui/BackgroundDecor';
import Card from '../ui/Card';
import Grid from '../ui/Grid';
import Icon from '../ui/Icon';

export interface VisionMissionCardsProps {
  className?: string;
}

export default function VisionMissionCards({ className = '' }: VisionMissionCardsProps) {
  const [sectionRef, isVisible] = useIntersectionObserver({
    threshold: THRESHOLDS.intersection.low,
    freezeOnceVisible: true,
  });

  return (
    <Section variant="white" spacing="lg" className={className}>
      <BackgroundDecor
        orbs={[
          { position: 'top-right', size: 'md', colors: ['brand', 'orange'], animate: false },
          { position: 'bottom-left', size: 'md', colors: ['blue', 'success'], animate: false },
        ]}
      />

      <Section.Content>
        <Grid cols={{ base: 1, lg: 2 }} gap="xl">
          {/* Vision Card */}
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
                    <h3 className={`${TYPOGRAPHY.heading.h3.size} ${TYPOGRAPHY.heading.h3.weight} text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-hakiardhi-red`}>
                      Our Vision
                    </h3>
                  </div>

                  {/* Main statement */}
                  <div className="bg-gradient-to-br from-brand-50/50 to-hakiardhi-red/5 rounded-2xl p-6 mb-6 border border-brand-100">
                    <p className={`${TYPOGRAPHY.body.lg.size} font-bold text-gray-900 leading-relaxed`}>
                      A society with a socially just and equitable land tenure system.
                    </p>
                  </div>

                  {/* Key points */}
                  <div className="space-y-3">
                    {[
                      'Social justice in land ownership',
                      'Equity across all communities',
                      'Inclusive rural and peri-urban focus'
                    ].map((point, idx) => (
                      <div key={idx} className="flex items-start gap-3 group/item">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-success-500 flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300">
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

          {/* Mission Card */}
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
                    <h3 className={`${TYPOGRAPHY.heading.h3.size} ${TYPOGRAPHY.heading.h3.weight} text-transparent bg-clip-text bg-gradient-to-r from-hakiardhi-red to-brand-500`}>
                      Our Mission
                    </h3>
                  </div>

                  {/* Main statement */}
                  <div className="bg-gradient-to-br from-hakiardhi-red/5 to-brand-50/50 rounded-2xl p-6 mb-6 border border-hakiardhi-red/20">
                    <p className={`${TYPOGRAPHY.body.lg.size} font-bold text-gray-900 leading-relaxed`}>
                      To promote and protect the land rights of rural and peri-urban communities in Tanzania.
                    </p>
                  </div>

                  {/* Key points */}
                  <div className="space-y-3">
                    {[
                      'Community empowerment and advocacy',
                      'Research-based policy influence',
                      'Legal aid and rights protection'
                    ].map((point, idx) => (
                      <div key={idx} className="flex items-start gap-3 group/item">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-hakiardhi-red to-orange-500 flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300">
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
        </Grid>
      </Section.Content>
    </Section>
  );
}
