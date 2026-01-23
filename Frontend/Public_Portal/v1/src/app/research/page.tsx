'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Header, Footer } from '@/components';
import Section from '@/components/ui/Section';
import Grid from '@/components/ui/Grid';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import SectionHeader from '@/components/features/SectionHeader';
import PublicationThumbnail from '@/components/features/PublicationThumbnail';
import CollapsibleFilterPanel, { FilterConfig } from '@/components/features/CollapsibleFilterPanel';
import NewsletterSubscriptionModal from '@/components/modals/NewsletterSubscriptionModal';
import { SPACING, TYPOGRAPHY, CONTENT_WIDTHS } from '@/constants/design-tokens';
import { Publication } from '@/data/research';
import { fetchPublications } from '@/lib/api/services/publications';
import { fetchResearchStats, ResearchStats } from '@/lib/api/services/researchStats';
import { fetchResearchAreas, ResearchArea } from '@/lib/api/services/researchAreas';
import { fetchPublicationTypes, PublicationType } from '@/lib/api/services/publicationTypes';
import { fetchPublicationTopics, PublicationTopic } from '@/lib/api/services/publicationTopics';
import { fetchPartners, Partner } from '@/lib/api/services/partners';
import PublicationCardSkeleton from '@/components/ui/PublicationCardSkeleton';

export default function ResearchPage() {
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isNewsletterModalOpen, setIsNewsletterModalOpen] = useState(false);
  const [apiPublications, setApiPublications] = useState<Publication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasAPIData, setHasAPIData] = useState(false);

  // Research stats state
  const [researchStats, setResearchStats] = useState<ResearchStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  // Research areas state
  const [researchAreas, setResearchAreas] = useState<ResearchArea[]>([]);
  const [isAreasLoading, setIsAreasLoading] = useState(true);

  // Publication types state
  const [publicationTypes, setPublicationTypes] = useState<PublicationType[]>([]);
  const [isTypesLoading, setIsTypesLoading] = useState(true);

  // Publication topics state
  const [publicationTopics, setPublicationTopics] = useState<PublicationTopic[]>([]);
  const [isTopicsLoading, setIsTopicsLoading] = useState(true);

  // Partners state
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isPartnersLoading, setIsPartnersLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Fetch research stats on mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await fetchResearchStats();
        setResearchStats(stats);
      } catch (err) {
        console.error('Failed to load research stats:', err);
        // Keep showing skeleton or fallback on error
      } finally {
        setIsStatsLoading(false);
      }
    };

    loadStats();
  }, []);

  // Fetch research areas on mount
  useEffect(() => {
    const loadAreas = async () => {
      try {
        const areas = await fetchResearchAreas();
        setResearchAreas(areas);
      } catch (err) {
        console.error('Failed to load research areas:', err);
        // Keep showing skeleton or fallback on error
      } finally {
        setIsAreasLoading(false);
      }
    };

    loadAreas();
  }, []);

  // Fetch publication types on mount
  useEffect(() => {
    const loadTypes = async () => {
      try {
        const types = await fetchPublicationTypes();
        setPublicationTypes(types);
      } catch (err) {
        console.error('Failed to load publication types:', err);
        // Fallback to default types on error
        setPublicationTypes([
          { name: 'All', slug: 'all', count: 0 },
        ]);
      } finally {
        setIsTypesLoading(false);
      }
    };

    loadTypes();
  }, []);

  // Fetch publication topics on mount
  useEffect(() => {
    const loadTopics = async () => {
      try {
        const topics = await fetchPublicationTopics();
        setPublicationTopics(topics);
      } catch (err) {
        console.error('Failed to load publication topics:', err);
        // Fallback to default topics on error
        setPublicationTopics([
          { name: 'All', slug: 'all', count: 0 },
        ]);
      } finally {
        setIsTopicsLoading(false);
      }
    };

    loadTopics();
  }, []);

  // Fetch partners on mount
  useEffect(() => {
    const loadPartners = async () => {
      try {
        const data = await fetchPartners();
        setPartners(data);
      } catch (err) {
        console.error('Failed to load partners:', err);
      } finally {
        setIsPartnersLoading(false);
      }
    };

    loadPartners();
  }, []);

  // Format large numbers with K/M suffix
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M+';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K+';
    }
    return num.toString();
  };

  // Year options for filter (2020-2030)
  // Generate years from current year to 35 years ago
  const currentYear = new Date().getFullYear();
  const years = ['All', ...Array.from({ length: 36 }, (_, i) => currentYear - i)];

  // Publications are now filtered entirely by the API
  const filteredPublications = apiPublications;



  // Load publications from API
  const loadPublications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchPublications({
        page: currentPage,
        limit: 9,
        type: selectedType === 'All' ? undefined : selectedType,
        topic: selectedTopic === 'All' ? undefined : selectedTopic,
        year: selectedYear === 'All' ? undefined : Number(selectedYear),
        search: searchQuery || undefined,
      });

      setApiPublications(result.publications);
      setTotalPages(result.meta.totalPages);
      setHasAPIData(true);
    } catch (err) {
      console.error('API Error:', err);
      setError('Unable to load publications from server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to load publications when filters change
  useEffect(() => {
    loadPublications();
  }, [currentPage, selectedType, selectedTopic, selectedYear]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        loadPublications();
      } else {
        setCurrentPage(1); // Reset to page 1, which triggers loadPublications
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset items when filters change
  const handleFilterChange = (callback: () => void) => {
    callback();
  };

  // Get featured publications

  const hasActiveFilters = selectedTopic !== 'All' || selectedYear !== 'All';

  const clearFilters = () => {
    setSelectedTopic('All');
    setSelectedYear('All');
  };

  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <Section variant="white" spacing="xs" className="pt-44 lg:pt-48 pb-8">
        <Section.Content>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className={`${TYPOGRAPHY.heading.h1.size} ${TYPOGRAPHY.heading.h1.weight} text-gray-900 mb-6`}>
              Research & Publications
            </h1>
            <p className={`${TYPOGRAPHY.body.lg.size} text-gray-600 ${TYPOGRAPHY.body.lg.lineHeight}`}>
              Explore our comprehensive research on land rights, tenure security, and community empowerment.
              Over 30 years of evidence-based insights driving policy reform and social justice.
            </p>
          </div>
        </Section.Content>
      </Section>

      {/* Impact Statistics */}
      <Section variant="white" spacing="xs" className="pt-8 pb-16">
        <Section.Content>
          <Grid cols={{ base: 1, sm: 2, lg: 4 }} gap="lg">
            {isStatsLoading ? (
              // Skeleton loading state
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="opacity-0 animate-fade-in"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'forwards',
                  }}
                >
                  <div className={`bg-gradient-to-br from-zinc-100 to-orange-100/50 ${SPACING.padding.lg} rounded-xl shadow-lg text-center animate-pulse`}>
                    <div className="h-12 bg-orange-200/40 rounded-lg mb-2 mx-auto w-24"></div>
                    <div className="h-6 bg-zinc-200/60 rounded mb-2 mx-auto w-28"></div>
                    <div className="h-4 bg-zinc-200/40 rounded mx-auto w-32"></div>
                  </div>
                </div>
              ))
            ) : (
              // Stats from API
              [
                { value: formatNumber(researchStats?.totalPublications || 0), label: 'Publications', description: 'Research & policy briefs' },
                { value: formatNumber(researchStats?.totalDownloads || 0), label: 'Downloads', description: 'Document downloads' },
                { value: formatNumber(researchStats?.totalViews || 0), label: 'Views', description: 'Publication views' },
                { value: researchStats?.topicCount?.toString() || '0', label: 'Topics', description: 'Research areas covered' },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className="opacity-0 animate-fade-in"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'forwards',
                  }}
                >
                  <div className={`bg-gradient-to-br from-hakiardhi-red to-red-600 text-white ${SPACING.padding.lg} rounded-xl shadow-xl text-center hover:scale-105 transition-transform`}>
                    <div className={`${TYPOGRAPHY.display.md.size} ${TYPOGRAPHY.display.md.weight} ${SPACING.margin.element.xs}`}>
                      {stat.value}
                    </div>
                    <div className={`${TYPOGRAPHY.body.lg.size} font-bold ${SPACING.margin.element.xs}`}>
                      {stat.label}
                    </div>
                    <div className={`${TYPOGRAPHY.body.sm.size} opacity-90`}>{stat.description}</div>
                  </div>
                </div>
              ))
            )}
          </Grid>
        </Section.Content>
      </Section>

      {/* Research Areas */}
      <Section variant="light" spacing="lg">
        <Section.Content>
          <SectionHeader
            title="Research Thematic Areas"
            description="Our work is organized into strategic research themes"
            align="center"
          />

          <Grid cols={{ base: 1, md: 2, lg: 3 }} gap="lg">
            {isAreasLoading ? (
              // Skeleton loading state
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="opacity-0 animate-fade-in"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'forwards',
                  }}
                >
                  <Card variant="elevated" className="h-full">
                    <Card.Body className="animate-pulse">
                      <div className={SPACING.margin.element.md}>
                        <div className="w-12 h-12 bg-orange-200/40 rounded-lg"></div>
                      </div>
                      <div className="h-6 bg-zinc-200/60 rounded w-3/4 mb-3"></div>
                      <div className="space-y-2 mb-4">
                        <div className="h-4 bg-zinc-200/40 rounded w-full"></div>
                        <div className="h-4 bg-zinc-200/40 rounded w-5/6"></div>
                        <div className="h-4 bg-zinc-200/40 rounded w-4/6"></div>
                      </div>
                      <div className={`${SPACING.padding.sm} bg-zinc-100 rounded-lg`}>
                        <div className="h-4 bg-orange-200/30 rounded w-24"></div>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              ))
            ) : (
              // Research areas from API
              researchAreas.map((area, index) => (
                <div
                  key={area.id}
                  className="opacity-0 animate-fade-in"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'forwards',
                  }}
                >
                  <Card variant="elevated" hoverEffect="lift" className="h-full">
                    <Card.Body>
                      <div className={SPACING.margin.element.md}>
                        <Icon name={area.iconName as any} size="xl" className="text-hakiardhi-red" />
                      </div>
                      <h3 className={`${TYPOGRAPHY.heading.h4.size} ${TYPOGRAPHY.heading.h4.weight} text-gray-900 ${SPACING.margin.element.sm}`}>
                        {area.name}
                      </h3>
                      <p className={`${TYPOGRAPHY.body.default.size} text-gray-600 ${TYPOGRAPHY.body.default.lineHeight} ${SPACING.margin.element.sm}`}>
                        {area.description}
                      </p>
                      <div className={`${SPACING.padding.sm} bg-hakiardhi-red/5 rounded-lg mt-auto`}>
                        <p className={`${TYPOGRAPHY.body.sm.size} text-gray-700 font-medium`}>
                          <span className="text-hakiardhi-red">{area.publicationCount}</span> Publications
                        </p>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              ))
            )}
          </Grid>
        </Section.Content>
      </Section>

      {/* Publications Section - Light Theme like Programs Page */}
      <section className="hakiardhi-section bg-gray-50 relative overflow-hidden">
        {/* Elegant decorative gradient orbs */}
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-gradient-to-br from-orange-500/10 to-brand-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-brand-500/10 to-success-500/10 rounded-full blur-3xl"></div>

        <div className="hakiardhi-container relative z-10">
          {/* Section Header */}
          <SectionHeader
            title="Our Publications"
            description="Access our comprehensive library of reports, policy briefs, and research supporting land rights advocacy and community empowerment."
            align="center"
          />

          {/* Type Filter Tabs - Fully Rounded Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {isTypesLoading ? (
              // Skeleton loading state
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-zinc-100 to-orange-100/50 animate-pulse"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-16 bg-zinc-200/60 rounded"></div>
                    <div className="h-4 w-6 bg-orange-200/40 rounded-full"></div>
                  </div>
                </div>
              ))
            ) : (
              // Publication types from API
              publicationTypes.map((type) => (
                <button
                  key={type.slug}
                  onClick={() => handleFilterChange(() => setSelectedType(type.name))}
                  className={`group px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 ${
                    selectedType === type.name
                      ? 'bg-hakiardhi-red text-white shadow-lg shadow-hakiardhi-red/30 scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-300 hover:border-hakiardhi-red hover:scale-105'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {type.name}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      selectedType === type.name
                        ? 'bg-white/20 text-white'
                        : 'bg-hakiardhi-red/10 text-hakiardhi-red group-hover:bg-hakiardhi-red/20'
                    }`}>
                      {type.count}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>

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

              {/* Filter Panel with Slide Animation */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  showFilters ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
                  {/* Filter Header with Year Dropdown */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <Icon name="document" size="sm" className="text-hakiardhi-red" />
                      Filter by Topic
                    </label>

                    {/* Year Filter Dropdown - Top Right */}
                    <div className="relative">
                      <select
                        value={selectedYear}
                        onChange={(e) => handleFilterChange(() => setSelectedYear(e.target.value))}
                        className="appearance-none pl-4 pr-10 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-gray-900 font-semibold text-sm hover:border-hakiardhi-red focus:border-hakiardhi-red focus:ring-4 focus:ring-hakiardhi-red/10 transition-all cursor-pointer min-w-[140px]"
                      >
                        {years.map(year => (
                          <option key={year} value={year}>{year === 'All' ? 'All Years' : year}</option>
                        ))}
                      </select>
                      {/* Custom Red Dropdown Arrow */}
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg className="h-5 w-5 text-hakiardhi-red" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Topic Pills */}
                  <div className="flex flex-wrap gap-2">
                    {isTopicsLoading ? (
                      // Skeleton loading state
                      Array.from({ length: 8 }).map((_, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 rounded-full bg-gradient-to-r from-zinc-100 to-orange-100/50 animate-pulse"
                        >
                          <div className="h-3 w-20 bg-zinc-200/60 rounded"></div>
                        </div>
                      ))
                    ) : (
                      // Topics from API
                      publicationTopics.map((topic) => (
                        <button
                          key={topic.slug}
                          onClick={() => handleFilterChange(() => setSelectedTopic(topic.name))}
                          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                            selectedTopic === topic.name
                              ? 'bg-hakiardhi-red text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                          }`}
                        >
                          {topic.name}
                        </button>
                      ))
                    )}
                  </div>

                  {/* Results Count Badge */}
                  <div className="mt-5 pt-5 border-t border-gray-100">
                    <div className="flex items-center justify-center gap-2">
                      <Icon name="check-circle" size="sm" className="text-hakiardhi-red" />
                      <span className="text-gray-600 font-medium">
                        Showing <span className="text-hakiardhi-red font-bold text-lg">{filteredPublications.length}</span>{' '}
                        {filteredPublications.length === 1 ? 'publication' : 'publications'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* Error Banner */}
          {error && (
            <div className="mb-8 p-4 rounded-xl bg-red-50 border-l-4 border-red-500">
              <div className="flex items-start gap-3">
                <Icon name="exclamation-triangle" size="lg" className="text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-1">Connection Issue</h3>
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    onClick={loadPublications}
                    className="mt-2 text-sm font-medium text-red-600 hover:text-red-800 underline"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Publications Grid - Attractive Background Section */}
          {isLoading ? (
            <div className="bg-gradient-to-br from-zinc-50 via-gray-50 to-zinc-100/50 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-inner border border-zinc-200/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                {Array.from({ length: 9 }).map((_, i) => (
                  <PublicationCardSkeleton key={i} />
                ))}
              </div>
            </div>
          ) : filteredPublications.length > 0 ? (
            <div className="bg-gradient-to-br from-zinc-50 via-gray-50 to-zinc-100/50 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-inner border border-zinc-200/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                {filteredPublications.map((publication, index) => (
                  <div
                    key={publication.id}
                    className="opacity-0 animate-fade-in flex"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: 'forwards',
                    }}
                  >
                    <Card variant="elevated" hoverEffect="lift" className="w-full flex flex-col group transition-all duration-300">
                      <Card.Media className="h-48 relative overflow-hidden flex-shrink-0">
                        <PublicationThumbnail
                          publicationId={publication.id}
                          title={publication.title}
                          type={publication.type}
                          customThumbnail={publication.coverImage}
                          className="h-full w-full"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </Card.Media>

                      {/* Badge */}
                      <Card.Badge className="absolute top-4 right-4">
                        <Badge variant="primary" size="sm">
                          {publication.type}
                        </Badge>
                      </Card.Badge>

                      {publication.featured && (
                        <div className="absolute top-4 left-4 z-10">
                          <Badge variant="warning" size="sm">Featured</Badge>
                        </div>
                      )}

                      <Card.Body className="flex-1 flex flex-col p-5">
                        {/* Title with professional typography - expands on hover */}
                        <div className="mb-2">
                          <h3 className="text-base font-bold text-gray-900 group-hover:text-hakiardhi-red transition-colors duration-300 leading-snug line-clamp-2 group-hover:line-clamp-none">
                            {publication.title}
                          </h3>
                        </div>

                        {/* Authors */}
                        <p className="text-xs text-gray-500 italic leading-tight mb-3">
                          {publication.authors[0]}{publication.authors.length > 1 ? ' et al.' : ''}
                        </p>

                        {/* Abstract with optimal readability - expands on hover */}
                        <p className="flex-grow text-sm text-gray-600 leading-relaxed mb-3 line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                          {publication.abstract}
                        </p>

                        {/* Topics */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {publication.topic.slice(0, 2).map((tag, tagIndex) => (
                            <span key={tagIndex} className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md">
                              {tag}
                            </span>
                          ))}
                          {publication.topic.length > 2 && (
                            <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md">
                              +{publication.topic.length - 2}
                            </span>
                          )}
                        </div>

                        {/* Meta Info - Professional spacing and alignment */}
                        <div className="mt-auto pt-3 border-t border-gray-100">
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center gap-2">
                              <Icon name="clock" size="sm" className="text-hakiardhi-red flex-shrink-0" />
                              <span className="text-xs text-gray-600 leading-tight">
                                {new Date(publication.publicationDate).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                })}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-600">
                              <span className="flex items-center gap-1.5">
                                <Icon name="document" size="sm" className="text-hakiardhi-red flex-shrink-0" />
                                {publication.pages || 'N/A'} pages
                              </span>
                              <span className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-hakiardhi-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                </svg>
                                {publication.downloads}
                              </span>
                              <span className="font-semibold text-gray-700">{publication.pdfSize || 'PDF'}</span>
                            </div>
                          </div>

                          {/* Download Button */}
                          <Button href={publication.downloadUrl} variant="secondary" size="sm" fullWidth>
                            <Icon name="document" size="sm" className="mr-2" />
                            Download
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>

            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <Icon name="document" size="xl" className="text-gray-400" />
              </div>
              <h3 className={`${TYPOGRAPHY.heading.h3.size} ${TYPOGRAPHY.heading.h3.weight} text-gray-900 mb-3`}>
                No Publications Found
              </h3>
              <p className={`${TYPOGRAPHY.body.lg.size} text-gray-500 mb-6`}>
                No publications match your current filter selection
              </p>
              <p className={`${TYPOGRAPHY.body.default.size} text-gray-400`}>
                Try adjusting your filters
              </p>
            </div>
          )}

          {/* Newsletter Signup CTA */}
          <div className="mt-12 text-center p-8 bg-gradient-to-r from-hakiardhi-red/5 to-red-50 rounded-2xl border-l-4 border-hakiardhi-red max-w-3xl mx-auto">
            <h3 className={`${TYPOGRAPHY.heading.h3.size} ${TYPOGRAPHY.heading.h3.weight} text-gray-900 mb-3`}>
              Stay Updated with Our Research
            </h3>
            <p className={`${TYPOGRAPHY.body.lg.size} text-gray-600 mb-6`}>
              Subscribe to our newsletter to receive the latest publications, research findings, and
              updates on land rights in Tanzania.
            </p>
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => setIsNewsletterModalOpen(true)}
            >
              Subscribe to Newsletter
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Subscription Modal */}
      <NewsletterSubscriptionModal
        isOpen={isNewsletterModalOpen}
        onClose={() => setIsNewsletterModalOpen(false)}
      />

      {/* Research Partners */}
      <Section variant="white" spacing="lg">
        <Section.Content>
          <SectionHeader
            title="Research Partners"
            description="Collaborating with leading institutions for greater impact"
            align="center"
          />

          <Grid cols={{ base: 2, md: 3, lg: 6 }} gap="md">
            {isPartnersLoading ? (
              // Skeleton loading state
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="opacity-0 animate-fade-in"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'forwards',
                  }}
                >
                  <Card variant="elevated" className="h-full">
                    <Card.Body className="p-6 flex items-center justify-center animate-pulse">
                      <div className="w-full h-20 bg-gradient-to-r from-zinc-100 to-orange-100/50 rounded-lg"></div>
                    </Card.Body>
                  </Card>
                </div>
              ))
            ) : (
              // Partners from API
              partners.map((partner, index) => (
                <a
                  key={partner.id}
                  href={partner.websiteUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-0 animate-fade-in block"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'forwards',
                  }}
                >
                  <Card variant="elevated" className="hover:shadow-lg hover:scale-105 transition-all duration-300 h-full">
                    <Card.Body className="p-6 flex items-center justify-center">
                      <div className="relative w-full h-20">
                        {partner.logoUrl ? (
                          <Image
                            src={partner.logoUrl}
                            alt={partner.name}
                            fill
                            className="object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                            <span className="text-sm font-medium text-gray-500 text-center px-2">
                              {partner.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </a>
              ))
            )}
          </Grid>
        </Section.Content>
      </Section>

      <Footer />
    </main>
  );
}
