'use client';

import { useState, useMemo } from 'react';
import { Header, Footer } from '@/components';
import Section from '@/components/ui/Section';
import Grid from '@/components/ui/Grid';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SectionHeader from '@/components/features/SectionHeader';
import { SPACING, TYPOGRAPHY } from '@/constants/design-tokens';
import { tanzaniaRegions, lrmRoles, lrmImpactStats, howToBecomeLRM } from '@/data/lrmNetwork';
import Image from 'next/image';

export default function LRMNetworkPage() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const totalLRMs = useMemo(() =>
    tanzaniaRegions.reduce((sum, region) => sum + region.lrmCount, 0),
    []
  );

  const activeRegion = hoveredRegion || selectedRegion;
  const regionData = activeRegion
    ? tanzaniaRegions.find(r => r.name === activeRegion)
    : null;

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-44 lg:pt-48 pb-16 bg-gradient-to-br from-zinc-50 via-red-50 to-orange-50 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <Section.Content className="relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Icon name="users" size="sm" className="text-gray-700" />
              <span className="text-sm font-bold text-black uppercase tracking-wide">
                Community Empowerment
              </span>
            </div>

            <h1 className={`${TYPOGRAPHY.heading.h1.size} ${TYPOGRAPHY.heading.h1.weight} text-red-600 mb-6 drop-shadow-lg`}>
              Land Rights Monitors Network
            </h1>
            <p className={`${TYPOGRAPHY.body.lg.size} text-gray-700 ${TYPOGRAPHY.body.lg.lineHeight} mb-8 max-w-3xl mx-auto`}>
              Empowering communities across Tanzania through trained grassroots champions who protect land rights,
              resolve disputes, and ensure justice reaches every village.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white backdrop-blur-md rounded-2xl p-6 border border-white">
                <div className="text-5xl font-black text-black mb-2">{totalLRMs}+</div>
                <div className="text-black/90 font-semibold">Active Monitors</div>
              </div>
              <div className="bg-white backdrop-blur-md rounded-2xl p-6 border border-white">
                <div className="text-5xl font-black text-black mb-2">{tanzaniaRegions.length}</div>
                <div className="text-black/90 font-semibold">Regions Covered</div>
              </div>
              <div className="bg-white backdrop-blur-md rounded-2xl p-6 border border-white">
                <div className="text-5xl font-black text-black mb-2">10K+</div>
                <div className="text-black/90 font-semibold">Communities Served</div>
              </div>
            </div>
          </div>
        </Section.Content>
      </section>

      {/* Interactive Map Section */}
      <section className="relative py-16 lg:py-24 bg-gray-50 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-hakiardhi-red/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl"></div>

        <Section.Content className="relative z-10">
          <SectionHeader
            title="Our Nationwide Network"
            description="Hover over regions to see LRM distribution across Tanzania"
            align="center"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Map Visualization - Takes 2 columns */}
            <div className="lg:col-span-2">
              <Card variant="elevated" className="p-8 bg-white">
                <div className="relative">
                  {/* Title */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Tanzania LRM Distribution Map</h3>
                    <p className="text-gray-600">Click or hover on a region to view details</p>
                  </div>

                  {/* Map Grid - Simplified Tanzania regional layout */}
                  <div className="grid grid-cols-4 gap-2 max-w-2xl mx-auto">
                    {tanzaniaRegions.map((region) => (
                      <div
                        key={region.id}
                        className={`
                          relative p-4 rounded-xl cursor-pointer transition-all duration-300
                          ${activeRegion === region.name
                            ? 'bg-hakiardhi-red text-white scale-105 shadow-xl ring-4 ring-hakiardhi-red/50'
                            : 'bg-gray-100 hover:bg-hakiardhi-red/10 hover:scale-105'
                          }
                          ${region.gridPosition}
                        `}
                        onClick={() => setSelectedRegion(region.name)}
                        onMouseEnter={() => setHoveredRegion(region.name)}
                        onMouseLeave={() => setHoveredRegion(null)}
                      >
                        {/* Region bubble */}
                        <div className="text-center">
                          <div className={`
                            w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center font-bold text-lg
                            ${activeRegion === region.name
                              ? 'bg-white text-hakiardhi-red'
                              : 'bg-hakiardhi-red text-white'
                            }
                          `}>
                            {region.lrmCount}
                          </div>
                          <div className={`text-xs font-semibold ${activeRegion === region.name ? 'text-white' : 'text-gray-700'}`}>
                            {region.name}
                          </div>
                        </div>

                        {/* Tooltip on hover */}
                        {hoveredRegion === region.name && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-black text-white text-xs rounded-lg whitespace-nowrap z-50 shadow-xl">
                            {region.lrmCount} LRMs in {region.name}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="mt-8 flex items-center justify-center gap-8 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-hakiardhi-red"></div>
                      <span className="text-gray-600">High Coverage (50+)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                      <span className="text-gray-600">Medium Coverage (20-49)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                      <span className="text-gray-600">Growing Coverage (1-19)</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Region Details Panel */}
            <div className="lg:col-span-1">
              <Card variant="elevated" className="sticky top-24 p-6 bg-gradient-to-br from-hakiardhi-red/5 to-orange-50">
                {regionData ? (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <Icon name="map-pin" size="lg" className="text-hakiardhi-red" />
                      <h3 className="text-2xl font-bold text-gray-900">{regionData.name}</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="text-sm text-gray-600 mb-1">Active LRMs</div>
                        <div className="text-3xl font-black text-hakiardhi-red">{regionData.lrmCount}</div>
                      </div>

                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="text-sm text-gray-600 mb-1">Districts Covered</div>
                        <div className="text-2xl font-bold text-gray-900">{regionData.districts}</div>
                      </div>

                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="text-sm text-gray-600 mb-1">Villages Reached</div>
                        <div className="text-2xl font-bold text-gray-900">{regionData.villages}</div>
                      </div>

                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="text-sm text-gray-600 mb-2">Key Achievements</div>
                        <ul className="space-y-2">
                          {regionData.achievements.map((achievement, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                              <Icon name="check-circle" size="sm" className="text-green-600 flex-shrink-0 mt-0.5" />
                              <span>{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Icon name="map" size="xl" className="text-gray-400 mb-4 mx-auto" />
                    <p className="text-gray-600">Select a region to view details</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </Section.Content>
      </section>

      {/* What LRMs Do Section */}
      <Section variant="white" spacing="lg">
        <Section.Content>
          <SectionHeader
            title="What Land Rights Monitors Do"
            description="Grassroots champions trained by HakiArdhi to protect community land rights"
            align="center"
          />

          <Grid cols={{ base: 1, md: 2, lg: 3 }} gap="lg">
            {lrmRoles.map((role, index) => (
              <div
                key={role.id}
                className="opacity-0 animate-fade-in"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'forwards',
                }}
              >
                <Card variant="elevated" hoverEffect="lift" className="h-full group">
                  <Card.Body className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-hakiardhi-red to-orange-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                      <Icon name={role.icon as any} size="lg" className="text-white" />
                    </div>
                    <h3 className={`${TYPOGRAPHY.heading.h4.size} ${TYPOGRAPHY.heading.h4.weight} text-gray-900 ${SPACING.margin.element.sm}`}>
                      {role.title}
                    </h3>
                    <p className={`${TYPOGRAPHY.body.default.size} text-gray-600 ${TYPOGRAPHY.body.default.lineHeight}`}>
                      {role.description}
                    </p>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </Grid>
        </Section.Content>
      </Section>

      {/* Impact Statistics */}
      <section className="relative py-16 lg:py-24 bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-hakiardhi-red rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <Section.Content className="relative z-10">
          <div className="text-center mb-12">
            <h2 className={`${TYPOGRAPHY.heading.h2.size} ${TYPOGRAPHY.heading.h2.weight} text-white mb-4`}>
              Network Impact
            </h2>
            <p className={`${TYPOGRAPHY.body.lg.size} text-white/80 max-w-3xl mx-auto`}>
              Measurable change driven by our Land Rights Monitors across Tanzania
            </p>
          </div>

          <Grid cols={{ base: 1, md: 2, lg: 4 }} gap="lg">
            {lrmImpactStats.map((stat, index) => (
              <div
                key={stat.id}
                className="opacity-0 animate-fade-in"
                style={{
                  animationDelay: `${index * 150}ms`,
                  animationFillMode: 'forwards',
                }}
              >
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  <Icon name={stat.icon as any} size="xl" className="text-hakiardhi-red mb-4 mx-auto" />
                  <div className="text-4xl font-black text-white mb-2">{stat.value}</div>
                  <div className="text-white/90 font-semibold">{stat.label}</div>
                </div>
              </div>
            ))}
          </Grid>
        </Section.Content>
      </section>

      {/* How to Become an LRM */}
      <Section variant="light" spacing="lg">
        <Section.Content>
          <SectionHeader
            title="How to Become a Land Rights Monitor"
            description="Join our network of community champions protecting land rights"
            align="center"
          />

          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {howToBecomeLRM.steps.map((step, index) => (
                <div
                  key={step.id}
                  className="opacity-0 animate-fade-in"
                  style={{
                    animationDelay: `${index * 150}ms`,
                    animationFillMode: 'forwards',
                  }}
                >
                  <Card
                    variant="elevated"
                    hoverEffect="lift"
                  >
                    <Card.Body className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-hakiardhi-red to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-black">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className={`${TYPOGRAPHY.heading.h4.size} ${TYPOGRAPHY.heading.h4.weight} text-gray-900 ${SPACING.margin.element.sm}`}>
                          {step.title}
                        </h3>
                        <p className={`${TYPOGRAPHY.body.default.size} text-gray-600 ${TYPOGRAPHY.body.default.lineHeight}`}>
                          {step.description}
                        </p>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>

            {/* Requirements Card */}
            <Card variant="elevated" className="mt-12 bg-gradient-to-br from-hakiardhi-red/5 to-orange-50">
              <Card.Body className="p-8">
                <h3 className={`${TYPOGRAPHY.heading.h3.size} ${TYPOGRAPHY.heading.h3.weight} text-gray-900 ${SPACING.margin.element.md} text-center`}>
                  Requirements
                </h3>
                <Grid cols={{ base: 1, md: 2 }} gap="md">
                  {howToBecomeLRM.requirements.map((req, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Icon name="check-circle" size="md" className="text-hakiardhi-red flex-shrink-0 mt-1" />
                      <span className="text-gray-700">{req}</span>
                    </div>
                  ))}
                </Grid>
              </Card.Body>
            </Card>
          </div>
        </Section.Content>
      </Section>

      {/* Success Story Section */}
      <Section variant="white" spacing="lg">
        <Section.Content>
          <div className="max-w-5xl mx-auto">
            <Card variant="elevated" className="overflow-hidden">
              <Grid cols={{ base: 1, lg: 2 }} gap="none">
                <div className="relative h-96 lg:h-full min-h-[400px]">
                  <Image
                    src="/images/capacity_building_3.jpg"
                    alt="Land Rights Monitor in action"
                    fill
                    className="object-cover"
                  />
                </div>
                <Card.Body className="p-8 lg:p-12 bg-gradient-to-br from-gray-50 to-white">
                  <Badge variant="primary" size="md" className="mb-4">
                    Success Story
                  </Badge>
                  <h3 className={`${TYPOGRAPHY.heading.h3.size} ${TYPOGRAPHY.heading.h3.weight} text-gray-900 ${SPACING.margin.element.md}`}>
                    "I've Helped 200+ Families Secure Their Land Rights"
                  </h3>
                  <blockquote className="text-gray-700 leading-relaxed mb-6 italic border-l-4 border-hakiardhi-red pl-4">
                    "After being trained as a Land Rights Monitor by HakiArdhi, I established study groups in my village.
                    We've resolved over 50 land disputes, created a community library, and connected families with legal aid
                    when needed. Being an LRM has empowered me to protect my community's future."
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-hakiardhi-red/10 flex items-center justify-center">
                      <Icon name="user" size="md" className="text-hakiardhi-red" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Amina Juma</div>
                      <div className="text-sm text-gray-600">Lead LRM, Mbeya Region</div>
                    </div>
                  </div>
                </Card.Body>
              </Grid>
            </Card>
          </div>
        </Section.Content>
      </Section>

      {/* CTA Section */}
      <section className="relative py-16 lg:py-24 bg-gradient-to-br from-zinc-50 via-red-50 to-orange-50 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/patterns/dots.svg')] bg-repeat"></div>
        </div>

        <Section.Content className="relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className={`${TYPOGRAPHY.heading.h2.size} ${TYPOGRAPHY.heading.h2.weight} text-red-600 mb-6`}>
              Join Our Network of Change Makers
            </h2>
            <p className={`${TYPOGRAPHY.body.lg.size} text-gray-600 ${TYPOGRAPHY.body.lg.lineHeight} mb-8`}>
              Whether you want to become an LRM or support our network, there's a place for you in this movement.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                href="/contact"
                variant="secondary"
                size="lg"
                className="!bg-black !text-white hover:!text-hakiardhi-red !border-black"
              >
                Become an LRM
              </Button>
              <Button
                href="/donate"
                variant="secondary"
                size="lg"
                className="text-white  bg-black hover:text-white hover:bg-black"
              >
                <Icon name="heart" size="md" className="mr-2" />
                Support the Network
              </Button>
            </div>
          </div>
        </Section.Content>
      </section>

      <Footer />
    </main>
  );
}
