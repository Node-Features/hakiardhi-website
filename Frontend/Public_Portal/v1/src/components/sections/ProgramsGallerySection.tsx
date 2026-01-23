'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '../ui/Button';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { THRESHOLDS, SPACING, CONTENT_WIDTHS, RESPONSIVE } from '@/constants/design-tokens';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Icon from '../ui/Icon';
import { ProgramsGridSkeleton } from '../ui/ProgramCardSkeleton';
import { fetchPrograms, Program } from '@/lib/api/services/programs';

export interface ProgramsGallerySectionProps {
  limit?: number;
  className?: string;
}

/**
 * Check if image URL is safe to use with Next.js Image
 */
function getSafeImageUrl(url: string | null): string {
  if (!url) return '/images/placeholder-program.jpg';
  if (url.startsWith('/')) return url;

  const allowedDomains = [
    'hakiardhi-api.vercel.app',
    'tjsatamyfjxdxqgxmcuq.supabase.co',
  ];

  try {
    const urlObj = new URL(url);
    if (allowedDomains.some(domain => urlObj.hostname.includes(domain))) {
      return url;
    }
  } catch {
    // Invalid URL
  }

  return '/images/placeholder-program.jpg';
}

export default function ProgramsGallerySection({ limit = 3, className = '' }: ProgramsGallerySectionProps) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sectionRef, isVisible] = useIntersectionObserver({
    threshold: THRESHOLDS.intersection.low,
    freezeOnceVisible: true,
  });

  // Fetch programs from API
  useEffect(() => {
    async function loadPrograms() {
      try {
        setIsLoading(true);
        const response = await fetchPrograms({ limit, featured: true });
        setPrograms(response.programs);
      } catch (error) {
        console.error('Failed to load programs:', error);
        setPrograms([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadPrograms();
  }, [limit]);

  return (
    <section
      ref={sectionRef}
      id="programs-gallery-section"
      className={`relative ${RESPONSIVE.section} overflow-hidden bg-gray-50 ${className}`}
    >
      {/* Elegant decorative gradient orbs */}
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-gradient-to-br from-orange-500/10 to-brand-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-brand-500/10 to-success-500/10 rounded-full blur-3xl"></div>

      <div className={`container mx-auto ${RESPONSIVE.container} relative z-10`}>
        {/* Section Header */}
        <div
          className={`text-center ${SPACING.margin.section.sm} transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className={SPACING.component.relaxed}>
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-hakiardhi-red/10 rounded-full mb-6">
              <Icon name="briefcase" size="sm" className="text-hakiardhi-red" />
              <span className="text-sm font-bold text-hakiardhi-red uppercase tracking-wide">
                Our Programs
              </span>
            </div>

            <h2 className="text-3xl lg:text-5xl font-black text-gray-900 mb-4">
              Transforming <span className="text-hakiardhi-red">Lives</span> Through Action
            </h2>
            <p className={`text-base lg:text-lg text-gray-600 ${CONTENT_WIDTHS.text.wide} mx-auto leading-relaxed`}>
              Explore our diverse programs working towards equitable land tenure for communities across Tanzania
            </p>
          </div>
        </div>

        {/* Programs Grid - With Gradient Background Container */}
        {isLoading ? (
          <div className="bg-gradient-to-br from-zinc-50 via-gray-50 to-zinc-100/50 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-inner border border-zinc-200/50">
            <ProgramsGridSkeleton count={limit} />
          </div>
        ) : programs.length > 0 ? (
          <div className="bg-gradient-to-br from-zinc-50 via-gray-50 to-zinc-100/50 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-inner border border-zinc-200/50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
              {programs.map((program, index) => (
                <div
                  key={program.id}
                  className={`transition-all duration-1000 flex ${
                    isVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${(index % 3) * 100 + 400}ms` }}
                >
                  <Link href={`/programs/${program.slug}`} className="w-full flex flex-col">
                    <Card variant="elevated" hoverEffect="lift" className="w-full flex flex-col group transition-all duration-300 h-full">
                      <Card.Media className="h-48 relative overflow-hidden flex-shrink-0">
                        <Image
                          src={getSafeImageUrl(program.image)}
                          alt={program.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </Card.Media>

                      {/* Badge */}
                      {program.category && (
                        <Card.Badge className="absolute top-4 right-4">
                          <Badge variant="primary" size="sm">
                            {program.category}
                          </Badge>
                        </Card.Badge>
                      )}

                      <Card.Body className="flex-1 flex flex-col p-5">
                        {/* Title with professional typography */}
                        <div className="mb-2">
                          <h3 className="text-base font-bold text-gray-900 group-hover:text-hakiardhi-red transition-colors duration-300 leading-snug line-clamp-2 group-hover:line-clamp-none">
                            {program.title}
                          </h3>
                        </div>

                        {/* Description with optimal readability */}
                        <p className="flex-grow text-sm text-gray-600 leading-relaxed mb-3 line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                          {program.description}
                        </p>

                        {/* Program Meta - Professional spacing and alignment */}
                        <div className="mt-auto pt-3 border-t border-gray-100">
                          <div className="space-y-2 mb-3">
                            {program.startDate && (
                              <div className="flex items-center gap-2">
                                <Icon name="clock" size="sm" className="text-hakiardhi-red flex-shrink-0" />
                                <span className="text-xs text-gray-600 leading-tight">
                                  {new Date(program.startDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            )}
                            {program.location && (
                              <div className="flex items-center gap-2">
                                <Icon name="map-pin" size="sm" className="text-hakiardhi-red flex-shrink-0" />
                                <span className="text-xs text-gray-600 leading-tight">{program.location}</span>
                              </div>
                            )}
                            {program.participantsCount > 0 && (
                              <div className="flex items-center gap-2">
                                <Icon name="users" size="sm" className="text-hakiardhi-red flex-shrink-0" />
                                <span className="text-xs text-gray-600 leading-tight">{program.participantsCount} Participants</span>
                              </div>
                            )}
                          </div>

                          {/* Learn More Button */}
                          <div className="flex items-center gap-2 text-hakiardhi-red font-bold text-sm group-hover:gap-3 transition-all">
                            <span>Learn More</span>
                            <Icon name="arrow-right" size="sm" />
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Link>
                </div>
              ))}
            </div>

            {/* View All Programs Link */}
            <div className="mt-12 text-center">
              <Button variant="primary" size="lg" href="/programs" icon={<Icon name="arrow-right" size="sm" />}>
                View All Programs
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Icon name="calendar" size="xl" className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No Programs Found
            </h3>
            <p className="text-lg text-gray-500 mb-6">
              No programs match your current filter selection
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
