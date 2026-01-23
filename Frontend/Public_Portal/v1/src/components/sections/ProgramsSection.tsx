'use client';

import { useState, useEffect } from 'react';
import ProgramCard, { ProgramCardProps } from '../features/ProgramCard';
import Button from '../ui/Button';
import { ProgramsGridSkeleton } from '../ui/ProgramCardSkeleton';
import { fetchPrograms, Program } from '@/lib/api/services/programs';

export interface ProgramsSectionProps {
  title?: string;
  description?: string;
  programs?: ProgramCardProps[];
  limit?: number;
  showViewAllButton?: boolean;
  viewAllLink?: string;
  viewAllText?: string;
  bgColor?: 'white' | 'gray';
  className?: string;
}

/**
 * Transform API program to ProgramCardProps format
 */
function transformProgramToCardProps(program: Program): ProgramCardProps {
  return {
    title: program.title,
    description: program.description || '',
    image: program.image || '/images/placeholder-program.jpg',
    link: `/programs/${program.slug}`,
    buttonText: 'Learn More',
    category: program.category || undefined,
    date: program.startDate,
    location: program.location || undefined,
    participants: program.participantsCount || undefined,
  };
}

export default function ProgramsSection({
  title = 'Our Programs',
  description = 'Transforming Lives Through Action. Explore our diverse programs working towards equitable land tenure for communities across Tanzania.',
  programs: programsProp,
  limit = 3,
  showViewAllButton = true,
  viewAllLink = '/programs',
  viewAllText = 'View All Programs',
  bgColor = 'gray',
  className = '',
}: ProgramsSectionProps) {
  const [programs, setPrograms] = useState<ProgramCardProps[]>(programsProp || []);
  const [isLoading, setIsLoading] = useState(!programsProp);

  // Fetch programs from API if not provided as props
  useEffect(() => {
    if (programsProp) {
      setPrograms(programsProp);
      setIsLoading(false);
      return;
    }

    async function loadPrograms() {
      try {
        setIsLoading(true);
        const response = await fetchPrograms({ limit, featured: true });
        const transformedPrograms = response.programs.map(transformProgramToCardProps);
        setPrograms(transformedPrograms);
      } catch (error) {
        console.error('Failed to load programs:', error);
        setPrograms([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadPrograms();
  }, [programsProp, limit]);

  return (
    <section
      className={`relative py-16 lg:py-24 overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(to bottom, #000000 0%, #1a1a1a 50%, #000000 100%)',
      }}
    >
      {/* Background decoration */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl"></div>

      {/* Header Container */}
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10 lg:mb-12">
          <h2 className="text-3xl lg:text-5xl font-black text-white mb-4 lg:mb-6">
            {title.split(' ').map((word, index) =>
              word === 'Programs' ? (
                <span key={index} className="text-brand-500">Programs</span>
              ) : (
                <span key={index}> {word}</span>
              )
            )}
          </h2>
          <p className="text-base lg:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Programs Grid - Full Width Cards without container */}
      <div className="relative z-10 py-8 lg:py-12 px-4 sm:px-6 lg:px-8 mb-12">
        {isLoading ? (
          <ProgramsGridSkeleton count={limit} />
        ) : programs.length > 0 ? (
          <div className={`grid grid-cols-1 md:grid-cols-2 ${programs.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-8`}>
            {programs.map((program, index) => (
              <div
                key={index}
                className="transition-all duration-500 opacity-0 animate-fade-in"
                style={{
                  animationDelay: `${index * 120}ms`,
                  animationFillMode: 'forwards',
                }}
              >
                <ProgramCard
                  title={program.title}
                  description={program.description}
                  image={program.image}
                  link={program.link}
                  buttonText={program.buttonText}
                  category={program.category}
                  location={program.location}
                  participants={program.participants}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No programs available at the moment.</p>
          </div>
        )}
      </div>

      {/* CTA with elegant styling - In Container */}
      {showViewAllButton && (
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center">
            <Button
              href={viewAllLink}
              variant="primary"
              size="lg"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              }
              iconPosition="right"
            >
              {viewAllText}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
