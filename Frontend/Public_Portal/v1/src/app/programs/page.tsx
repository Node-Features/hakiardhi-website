'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header, Footer } from '@/components';
import Section from '@/components/ui/Section';
import Grid from '@/components/ui/Grid';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import SectionHeader from '@/components/features/SectionHeader';
import { SPACING, TYPOGRAPHY } from '@/constants/design-tokens';
import { programCategories } from '@/data/programCategories';
import { fetchPrograms, fetchProgramCategories, Program, ProgramCategory } from '@/lib/api/services/programs';

// Skeleton component for program cards
function ProgramCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
      <div className="h-48 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200"></div>
      <div className="p-5">
        <div className="h-4 bg-zinc-200 rounded w-3/4 mb-3"></div>
        <div className="h-3 bg-zinc-100 rounded w-full mb-2"></div>
        <div className="h-3 bg-zinc-100 rounded w-5/6 mb-4"></div>
        <div className="pt-3 border-t border-gray-100 space-y-2">
          <div className="h-3 bg-zinc-100 rounded w-1/2"></div>
          <div className="h-3 bg-zinc-100 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );
}

// Skeleton for category tabs
function CategoryTabsSkeleton() {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-8">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-12 w-32 bg-zinc-200 rounded-full animate-pulse"></div>
      ))}
    </div>
  );
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [categories, setCategories] = useState<ProgramCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsToShow, setItemsToShow] = useState(9);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch programs from API
  const loadPrograms = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: {
        page: number;
        limit: number;
        category?: string;
        status?: string;
        search?: string;
      } = {
        page: 1,
        limit: 100, // Fetch all for client-side filtering
      };

      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }

      if (selectedStatus !== 'All') {
        params.status = selectedStatus;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await fetchPrograms(params);
      setPrograms(response.programs);
      setTotalCount(response.meta?.total || response.programs.length);
    } catch (err) {
      console.error('Error loading programs:', err);
      setError('Failed to load programs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedStatus, searchQuery]);

  // Fetch categories from API
  const loadCategories = useCallback(async () => {
    setIsCategoriesLoading(true);
    try {
      const data = await fetchProgramCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
      // Use empty array on error
      setCategories([]);
    } finally {
      setIsCategoriesLoading(false);
    }
  }, []);

  // Load data on mount and when filters change
  useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Get all categories including "All"
  const allCategories = [
    { name: 'All', count: totalCount },
    ...categories,
  ];

  // Get visible programs
  const visiblePrograms = programs.slice(0, itemsToShow);
  const hasMore = itemsToShow < programs.length;

  // Reset items when filters change
  const handleFilterChange = (callback: () => void) => {
    callback();
    setItemsToShow(9);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedStatus('All');
    setSearchQuery('');
    setItemsToShow(9);
  };

  const hasActiveFilters = selectedCategory !== 'All' || selectedStatus !== 'All' || searchQuery !== '';

  // Status options
  const statusOptions = ['All', 'Active', 'Completed', 'Ongoing', 'Phased Out'];

  return (
    <main id="main-content" className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <Section variant="white" spacing="xs" className="pt-44 lg:pt-48 pb-8">
        <Section.Content>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className={`${TYPOGRAPHY.heading.h1.size} ${TYPOGRAPHY.heading.h1.weight} text-gray-900 mb-6`}>
              Our Programs
            </h1>
            <p className={`${TYPOGRAPHY.body.lg.size} text-gray-600 ${TYPOGRAPHY.body.lg.lineHeight}`}>
              Comprehensive initiatives designed to protect land rights and empower communities through
              education, legal support, and advocacy across Tanzania.
            </p>
          </div>
        </Section.Content>
      </Section>

      {/* Program Categories Overview */}
      <Section variant="light" spacing="lg">
        <Section.Content>
          <SectionHeader
            title="Program Thematic Areas"
            description="Our work is organized into strategic program themes"
            align="center"
          />

          <Grid cols={{ base: 1, md: 2, lg: 4 }} gap="lg">
            {programCategories.map((category, index) => (
              <div
                key={category.id}
                className="opacity-0 animate-fade-in"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'forwards',
                }}
              >
                <Card variant="elevated" hoverEffect="lift" className="h-full">
                  <Card.Body>
                    <div className={SPACING.margin.element.md}>
                      <Icon name={category.iconName as any} size="xl" className="text-hakiardhi-red" />
                    </div>
                    <h3 className={`${TYPOGRAPHY.heading.h4.size} ${TYPOGRAPHY.heading.h4.weight} text-gray-900 ${SPACING.margin.element.sm}`}>
                      {category.name}
                    </h3>
                    <p className={`${TYPOGRAPHY.body.default.size} text-gray-600 ${TYPOGRAPHY.body.default.lineHeight} ${SPACING.margin.element.sm}`}>
                      {category.description}
                    </p>
                    <div className={`${SPACING.padding.sm} bg-hakiardhi-red/5 rounded-lg mt-auto`}>
                      <p className={`${TYPOGRAPHY.body.sm.size} text-gray-700 font-medium`}>
                        <span className="text-hakiardhi-red">Focus:</span> {category.focus}
                      </p>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </Grid>
        </Section.Content>
      </Section>

      {/* Programs Section */}
      <section className="hakiardhi-section bg-gray-50 relative overflow-hidden">
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-gradient-to-br from-orange-500/10 to-brand-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-brand-500/10 to-success-500/10 rounded-full blur-3xl"></div>

        <div className="hakiardhi-container relative z-10">
          {/* Section Header */}
          <SectionHeader
            title="All Programs"
            description="Explore our comprehensive initiatives supporting land rights and community empowerment across Tanzania."
            align="center"
          />

          {/* Category Filter Tabs */}
          {isCategoriesLoading ? (
            <CategoryTabsSkeleton />
          ) : (
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {allCategories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => handleFilterChange(() => setSelectedCategory(category.name))}
                  className={`group px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 ${
                    selectedCategory === category.name
                      ? 'bg-hakiardhi-red text-white shadow-lg shadow-hakiardhi-red/30 scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-300 hover:border-hakiardhi-red hover:scale-105'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {category.name}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      selectedCategory === category.name
                        ? 'bg-white/20 text-white'
                        : 'bg-hakiardhi-red/10 text-hakiardhi-red group-hover:bg-hakiardhi-red/20'
                    }`}>
                      {category.count}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Collapsible Filter Panel */}
          <div className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-200 rounded-2xl mb-10">
            <div className="py-6 px-4">
              {/* Filter Toggle Button */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="group flex items-center gap-2 px-6 py-3 bg-white rounded-xl border-2 border-gray-200 hover:border-hakiardhi-red transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <Icon name="funnel" size="sm" className="text-hakiardhi-red" />
                  <span className="font-semibold text-gray-900">
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </span>
                  {hasActiveFilters && (
                    <span className="px-2 py-0.5 bg-hakiardhi-red text-white text-xs font-bold rounded-full">
                      Active
                    </span>
                  )}
                  <Icon
                    name={showFilters ? "chevron-up" : "chevron-down"}
                    size="sm"
                    className="text-gray-400 group-hover:text-hakiardhi-red transition-colors"
                  />
                </button>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 text-hakiardhi-red hover:bg-hakiardhi-red/5 rounded-lg font-medium transition-all duration-300"
                  >
                    <Icon name="close" size="sm" />
                    Clear Filters
                  </button>
                )}
              </div>

              {/* Filter Panel */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  showFilters ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Search Filter */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <Icon name="search" size="sm" className="text-hakiardhi-red" />
                        Search
                      </label>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleFilterChange(() => setSearchQuery(e.target.value))}
                        placeholder="Search programs..."
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 font-medium hover:border-hakiardhi-red focus:border-hakiardhi-red focus:ring-4 focus:ring-hakiardhi-red/10 transition-all"
                      />
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <Icon name="check-circle" size="sm" className="text-hakiardhi-red" />
                        Status
                      </label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => handleFilterChange(() => setSelectedStatus(e.target.value))}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 font-medium hover:border-hakiardhi-red focus:border-hakiardhi-red focus:ring-4 focus:ring-hakiardhi-red/10 transition-all cursor-pointer"
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Results Count Badge */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-center gap-2">
                      <Icon name="check-circle" size="sm" className="text-hakiardhi-red" />
                      <span className="text-gray-600 font-medium">
                        Showing <span className="text-hakiardhi-red font-bold text-lg">{programs.length}</span>{' '}
                        {programs.length === 1 ? 'program' : 'programs'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Programs Grid */}
          {isLoading ? (
            <div className="bg-gradient-to-br from-zinc-50 via-gray-50 to-zinc-100/50 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-inner border border-zinc-200/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <ProgramCardSkeleton key={i} />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <Icon name="alert-circle" size="xl" className="text-red-500" />
              </div>
              <h3 className={`${TYPOGRAPHY.heading.h3.size} ${TYPOGRAPHY.heading.h3.weight} text-gray-900 mb-3`}>
                Error Loading Programs
              </h3>
              <p className={`${TYPOGRAPHY.body.lg.size} text-gray-500 mb-6`}>
                {error}
              </p>
              <button
                onClick={loadPrograms}
                className="px-6 py-3 bg-hakiardhi-red text-white font-semibold rounded-xl hover:bg-black transition-all duration-300"
              >
                Try Again
              </button>
            </div>
          ) : programs.length > 0 ? (
            <div className="bg-gradient-to-br from-zinc-50 via-gray-50 to-zinc-100/50 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-inner border border-zinc-200/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                {visiblePrograms.map((program, index) => (
                  <div
                    key={program.id}
                    className="opacity-0 animate-fade-in flex"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: 'forwards',
                    }}
                  >
                    <Link href={`/programs/${program.slug}`} className="w-full flex flex-col">
                      <Card variant="elevated" hoverEffect="lift" className="w-full flex flex-col group transition-all duration-300 h-full">
                        <Card.Media className="h-48 relative overflow-hidden flex-shrink-0">
                          {program.image ? (
                            <Image
                              src={program.image}
                              alt={program.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-hakiardhi-red/20 to-brand-500/20 flex items-center justify-center">
                              <Icon name="document" size="xl" className="text-hakiardhi-red/50" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Card.Media>

                        {/* Category Badge */}
                        {program.category && (
                          <Card.Badge className="absolute top-4 right-4">
                            <Badge variant="primary" size="sm">
                              {program.category}
                            </Badge>
                          </Card.Badge>
                        )}

                        <Card.Body className="flex-1 flex flex-col p-5">
                          {/* Title */}
                          <div className="mb-2">
                            <h3 className="text-base font-bold text-gray-900 group-hover:text-hakiardhi-red transition-colors duration-300 leading-snug line-clamp-2 group-hover:line-clamp-none">
                              {program.title}
                            </h3>
                          </div>

                          {/* Description */}
                          <p className="flex-grow text-sm text-gray-600 leading-relaxed mb-3 line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                            {program.description || 'No description available.'}
                          </p>

                          {/* Program Meta */}
                          <div className="mt-auto pt-3 border-t border-gray-100">
                            <div className="space-y-2 mb-3">
                              <div className="flex items-center gap-2">
                                <Icon name="clock" size="sm" className="text-hakiardhi-red flex-shrink-0" />
                                <span className="text-xs text-gray-600 leading-tight">
                                  {new Date(program.startDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                  })} - {new Date(program.endDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                  })}
                                </span>
                              </div>
                              {program.location && (
                                <div className="flex items-center gap-2">
                                  <Icon name="globe" size="sm" className="text-hakiardhi-red flex-shrink-0" />
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

                            {/* Learn More Link */}
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

              {/* Load More Button */}
              {hasMore && (
                <div className="mt-12 text-center">
                  <div className="inline-block relative">
                    <div className="absolute inset-0 bg-hakiardhi-red/20 blur-xl rounded-full scale-150"></div>
                    <button
                      onClick={() => setItemsToShow(prev => prev + 9)}
                      className="relative group px-8 py-4 bg-hakiardhi-red text-white font-bold rounded-full shadow-lg hover:bg-black hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      <span className="flex items-center gap-3">
                        Load More Programs
                        <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </button>
                  </div>
                  <p className="mt-4 text-gray-600 font-medium">
                    Showing {visiblePrograms.length} of {programs.length} programs
                  </p>
                  <div className="mt-3 max-w-md mx-auto h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-hakiardhi-red to-red-600 transition-all duration-500"
                      style={{ width: `${(visiblePrograms.length / programs.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <Icon name="calendar" size="xl" className="text-gray-400" />
              </div>
              <h3 className={`${TYPOGRAPHY.heading.h3.size} ${TYPOGRAPHY.heading.h3.weight} text-gray-900 mb-3`}>
                No Programs Found
              </h3>
              <p className={`${TYPOGRAPHY.body.lg.size} text-gray-500 mb-6`}>
                No programs match your current filter selection
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-hakiardhi-red text-white font-semibold rounded-xl hover:bg-black transition-all duration-300"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-12 text-center p-8 bg-gradient-to-r from-hakiardhi-red/5 to-red-50 rounded-2xl border-l-4 border-hakiardhi-red max-w-3xl mx-auto">
            <h3 className={`${TYPOGRAPHY.heading.h3.size} ${TYPOGRAPHY.heading.h3.weight} text-gray-900 mb-3`}>
              Want to learn more about our programs?
            </h3>
            <p className={`${TYPOGRAPHY.body.lg.size} text-gray-600 mb-6`}>
              Each of our programs is designed to empower communities, protect land rights, and promote
              social justice across Tanzania.
            </p>
            <Button variant="primary" size="lg" href="/contact" className="w-full sm:w-auto">
              Get In Touch
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
