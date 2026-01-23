'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/Icon';
import ShareSection from '@/components/ui/ShareSection';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { fetchProgramBySlug, Program } from '@/lib/api/services/programs';

// Skeleton for program detail page
function ProgramDetailSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Hero Skeleton */}
      <section className="relative h-[60vh] min-h-[500px] flex items-end">
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-300 via-zinc-200 to-zinc-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
            <div className="h-4 w-48 bg-zinc-500 rounded mb-6"></div>
            <div className="flex gap-3 mb-4">
              <div className="h-8 w-24 bg-zinc-400 rounded-full"></div>
              <div className="h-8 w-20 bg-zinc-400 rounded-full"></div>
            </div>
            <div className="h-12 w-3/4 bg-zinc-400 rounded mb-4"></div>
            <div className="flex gap-6">
              <div className="h-5 w-32 bg-zinc-500 rounded"></div>
              <div className="h-5 w-40 bg-zinc-500 rounded"></div>
              <div className="h-5 w-28 bg-zinc-500 rounded"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <div>
              <div className="h-8 w-48 bg-zinc-200 rounded mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 bg-zinc-100 rounded w-full"></div>
                <div className="h-4 bg-zinc-100 rounded w-full"></div>
                <div className="h-4 bg-zinc-100 rounded w-3/4"></div>
              </div>
            </div>
            <div>
              <div className="h-8 w-32 bg-zinc-200 rounded mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 bg-zinc-200 rounded-full"></div>
                    <div className="h-4 bg-zinc-100 rounded w-5/6"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="h-6 w-24 bg-zinc-200 rounded mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-4 bg-zinc-100 rounded w-3/4"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProgramDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function ProgramDetailPage({ params }: ProgramDetailPageProps) {
  const { slug } = use(params);
  const [program, setProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProgram() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchProgramBySlug(slug);
        if (data) {
          setProgram(data);
        } else {
          setError('Program not found');
        }
      } catch (err) {
        console.error('Error loading program:', err);
        setError('Failed to load program. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    loadProgram();
  }, [slug]);

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Helper to safely extract string from description that might be an object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getDescriptionText = (desc: any): string | null => {
    if (!desc) return null;
    if (typeof desc === 'string') return desc;
    if (typeof desc === 'object' && 'description' in desc && typeof desc.description === 'string') {
      return desc.description;
    }
    return null;
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="pt-20">
          <ProgramDetailSkeleton />
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !program) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="pt-44 pb-20">
          <div className="max-w-2xl mx-auto text-center px-4">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <Icon name="alert-circle" size="xl" className="text-red-500" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-4">
              {error === 'Program not found' ? 'Program Not Found' : 'Error Loading Program'}
            </h1>
            <p className="text-lg text-gray-500 mb-8">
              {error || 'The program you are looking for could not be found.'}
            </p>
            <Button variant="primary" size="lg" href="/programs">
              <Icon name="arrow-left" size="sm" className="mr-2" />
              Back to Programs
            </Button>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Hero Section with Background Image */}
      <section className="relative h-[60vh] min-h-[500px] flex items-end pt-20">
        {/* Background Image */}
        <div className="absolute inset-0">
          {program.image ? (
            <Image
              src={program.image}
              alt={program.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-hakiardhi-red to-brand-600" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
            {/* Breadcrumb */}
            <div className="mb-6">
              <nav className="flex items-center gap-2 text-sm text-gray-300">
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
                <span>/</span>
                <Link href="/programs" className="hover:text-white transition-colors">
                  Programs
                </Link>
                <span>/</span>
                <span className="text-white">{program.title}</span>
              </nav>
            </div>

            {/* Category and Status Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {program.category && (
                <Badge variant="primary" size="lg">
                  {program.category}
                </Badge>
              )}
              {program.status && (
                <Badge
                  variant={
                    program.status === 'Completed'
                      ? 'success'
                      : program.status === 'Ongoing' || program.status === 'Active'
                      ? 'info'
                      : 'warning'
                  }
                  size="lg"
                >
                  {program.status}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
              {program.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-gray-200">
              <div className="flex items-center gap-2">
                <Icon name="clock" size="sm" />
                <span className="font-medium">
                  {formatDate(program.startDate)} - {formatDate(program.endDate)}
                </span>
              </div>
              {program.location && (
                <div className="flex items-center gap-2">
                  <Icon name="globe" size="sm" />
                  <span className="font-medium">{program.location}</span>
                </div>
              )}
              {program.participantsCount > 0 && (
                <div className="flex items-center gap-2">
                  <Icon name="users" size="sm" />
                  <span className="font-medium">{program.participantsCount} Participants</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Overview Section */}
            <section>
              <h2 className="text-3xl font-black text-gray-900 mb-6">Program Overview</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                {getDescriptionText(program.fullDescription) || getDescriptionText(program.description) || 'No description available.'}
              </p>
            </section>

            {/* Objectives Section */}
            <section>
              <h2 className="text-3xl font-black text-gray-900 mb-6">Objectives</h2>
              {(() => {
                const validObjectives = (program.objectives || [])
                  .map(obj => getDescriptionText(obj))
                  .filter((text): text is string => text !== null && text.trim() !== '');
                return validObjectives.length > 0 ? (
                  <div className="space-y-4">
                    {validObjectives.map((objective, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-hakiardhi-red rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <p className="text-gray-700 leading-relaxed pt-1">{objective}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No objectives have been defined for this program yet.</p>
                );
              })()}
            </section>

            {/* Impact Metrics Section */}
            {program.impactMetrics && !Array.isArray(program.impactMetrics) && Object.keys(program.impactMetrics).length > 0 && (
              <section>
                <h2 className="text-3xl font-black text-gray-900 mb-6">Impact & Reach</h2>
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  {Object.entries(program.impactMetrics).map(([key, value], index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-hakiardhi-red to-hakiardhi-red-dark p-6 rounded-2xl text-white"
                    >
                      <div className="text-3xl sm:text-4xl font-black mb-2">{value}</div>
                      <div className="text-sm sm:text-base font-medium opacity-90 capitalize">
                        {key.replace(/_/g, ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Outcomes Section */}
            <section>
              <h2 className="text-3xl font-black text-gray-900 mb-6">Key Outcomes</h2>
              {(() => {
                const validOutcomes = (program.outcomes || [])
                  .map(out => getDescriptionText(out))
                  .filter((text): text is string => text !== null && text.trim() !== '');
                return validOutcomes.length > 0 ? (
                  <div className="space-y-3">
                    {validOutcomes.map((outcome, index) => (
                      <div key={index} className="flex gap-3">
                        <Icon name="check-circle" size="md" className="text-hakiardhi-red flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700 leading-relaxed">{outcome}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No outcomes have been recorded for this program yet.</p>
                );
              })()}
            </section>

            {/* Activities Timeline */}
            {program.activities && program.activities.length > 0 && (
              <section>
                <h2 className="text-3xl font-black text-gray-900 mb-6">Activities</h2>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                  <div className="space-y-6">
                    {program.activities.map((activity) => (
                      <div key={activity.id} className="relative flex gap-6 pl-12">
                        {/* Timeline dot */}
                        <div className={`absolute left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          activity.status === 'Completed'
                            ? 'bg-green-500 border-green-500'
                            : activity.status === 'Ongoing'
                            ? 'bg-blue-500 border-blue-500'
                            : 'bg-white border-gray-300'
                        }`}>
                          {activity.status === 'Completed' && (
                            <Icon name="check" size="xs" className="text-white" />
                          )}
                        </div>

                        <div className="flex-1 bg-gray-50 rounded-xl p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-semibold text-gray-900">{activity.name}</h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {formatDate(activity.startDate)} - {formatDate(activity.endDate)}
                              </p>
                            </div>
                            <Badge
                              variant={activity.status === 'Completed' ? 'success' : activity.status === 'Ongoing' ? 'info' : 'secondary'}
                              size="sm"
                            >
                              {activity.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Photo Gallery Section */}
            <section>
              <h2 className="text-3xl font-black text-gray-900 mb-6">Photo Gallery</h2>
              {(() => {
                const validImages = (program.gallery || []).filter(
                  (img) => typeof img === 'string' && img.trim() !== ''
                );
                return validImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {validImages.map((image, index) => (
                      <div
                        key={index}
                        className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer"
                      >
                        <Image
                          src={image}
                          alt={`${program.title} - Image ${index + 1}`}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((index) => (
                      <div
                        key={index}
                        className="relative h-64 rounded-2xl overflow-hidden bg-gray-100 flex flex-col items-center justify-center"
                      >
                        <Icon name="image" size="xl" className="text-gray-300 mb-2" />
                        <span className="text-gray-400 text-sm">No image available</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Partners Section */}
            {program.partners && program.partners.length > 0 && (
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-xl font-black text-gray-900 mb-4">Partners</h3>
                <ul className="space-y-3">
                  {program.partners.map((partner, index) => (
                    <li key={index}>
                      <a
                        href={partner.websiteUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors"
                      >
                        {partner.logoUrl ? (
                          <Image
                            src={partner.logoUrl}
                            alt={partner.name}
                            width={32}
                            height={32}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-hakiardhi-red/10 flex items-center justify-center">
                            <Icon name="users" size="xs" className="text-hakiardhi-red" />
                          </div>
                        )}
                        <span className="text-gray-700 hover:text-hakiardhi-red transition-colors">
                          {partner.name}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Call to Action */}
            <div className="bg-gradient-to-br from-hakiardhi-red to-hakiardhi-red-dark rounded-2xl p-6 text-white">
              <h3 className="text-xl font-black mb-3">Get Involved</h3>
              <p className="mb-6 text-sm leading-relaxed opacity-90">
                Support our land rights programs and make a lasting impact in communities across Tanzania.
              </p>
              <div className="space-y-3">
                <Button href="/donate" variant="secondary" className="w-full !bg-black !text-white hover:!text-hakiardhi-red !border-black">
                  Donate Now
                </Button>
                <Button href="/contact" variant="tertiary" className="w-full !bg-black !text-white hover:!text-hakiardhi-red !border-black">
                  Contact Us
                </Button>
              </div>
            </div>

            {/* Share Section */}
            <ShareSection title={program.title} description={getDescriptionText(program.description) || ''} />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
