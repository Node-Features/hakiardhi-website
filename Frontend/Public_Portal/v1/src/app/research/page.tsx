'use client';

import { useState, useMemo, useEffect } from 'react';
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
import {
  publications,
  researchAreas,
  impactStats,
  researchPartners,
  PUBLICATION_TYPES,
  RESEARCH_TOPICS,
} from '@/data/research';

export default function ResearchPage() {
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('All');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsToShow, setItemsToShow] = useState(9);
  const [isVisible, setIsVisible] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isNewsletterModalOpen, setIsNewsletterModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Extract unique years from publications
  const years = useMemo(() => {
    const yearSet = new Set(publications.map(p => new Date(p.publicationDate).getFullYear()));
    return ['All', ...Array.from(yearSet).sort((a, b) => (b as number) - (a as number))];
  }, []);

  // Get quarter from date
  const getQuarter = (date: string) => {
    const month = new Date(date).getMonth() + 1;
    return Math.ceil(month / 3);
  };

  // Get month name
  const getMonthName = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'long' });
  };

  // Get unique months from filtered publications
  const availableMonths = useMemo(() => {
    const months = new Set(
      publications
        .filter(p => {
          const year = selectedYear === 'All' || new Date(p.publicationDate).getFullYear() === Number(selectedYear);
          const quarter = selectedQuarter === 'All' || getQuarter(p.publicationDate) === Number(selectedQuarter);
          return year && quarter;
        })
        .map(p => getMonthName(p.publicationDate))
    );
    return ['All', ...Array.from(months)];
  }, [selectedYear, selectedQuarter]);

  // Filter publications
  const filteredPublications = useMemo(() => {
    return publications.filter(pub => {
      const pubDate = new Date(pub.publicationDate);
      const pubYear = pubDate.getFullYear();
      const pubQuarter = getQuarter(pub.publicationDate);
      const pubMonth = getMonthName(pub.publicationDate);

      const typeMatch = selectedType === 'All' || pub.type === selectedType;
      const topicMatch = selectedTopic === 'All' || pub.topic.includes(selectedTopic);
      const yearMatch = selectedYear === 'All' || pubYear === Number(selectedYear);
      const quarterMatch = selectedQuarter === 'All' || pubQuarter === Number(selectedQuarter);
      const monthMatch = selectedMonth === 'All' || pubMonth === selectedMonth;
      const searchMatch =
        searchQuery === '' ||
        pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pub.authors.some(author => author.toLowerCase().includes(searchQuery.toLowerCase())) ||
        pub.abstract.toLowerCase().includes(searchQuery.toLowerCase());

      return typeMatch && topicMatch && yearMatch && quarterMatch && monthMatch && searchMatch;
    });
  }, [selectedType, selectedTopic, selectedYear, selectedQuarter, selectedMonth, searchQuery]);

  const visiblePublications = filteredPublications.slice(0, itemsToShow);
  const hasMore = itemsToShow < filteredPublications.length;

  // Reset items when filters change
  const handleFilterChange = (callback: () => void) => {
    callback();
    setItemsToShow(9);
  };

  // Get featured publications
  const featuredPublications = publications.filter(p => p.featured);

  const hasActiveFilters = selectedTopic !== 'All' || selectedYear !== 'All' || selectedQuarter !== 'All' || selectedMonth !== 'All';

  const clearFilters = () => {
    setSelectedTopic('All');
    setSelectedYear('All');
    setSelectedQuarter('All');
    setSelectedMonth('All');
    setItemsToShow(9);
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
            {impactStats.map((stat, index) => (
              <div
                key={stat.id}
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
            ))}
          </Grid>
        </Section.Content>
      </Section>

      {/* Research Areas */}
      <Section variant="light" spacing="lg">
        <Section.Content>
          <SectionHeader
            title="Research Thematic Areas"
            description="Our work is organized into five strategic research themes"
            align="center"
          />

          <Grid cols={{ base: 1, md: 2, lg: 3 }} gap="lg">
            {researchAreas.map((area, index) => (
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
            ))}
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
            {PUBLICATION_TYPES.map((type) => {
              const count = publications.filter(p => type === 'All' || p.type === type).length;
              return (
                <button
                  key={type}
                  onClick={() => handleFilterChange(() => setSelectedType(type))}
                  className={`group px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 ${
                    selectedType === type
                      ? 'bg-hakiardhi-red text-white shadow-lg shadow-hakiardhi-red/30 scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-300 hover:border-hakiardhi-red hover:scale-105'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {type}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      selectedType === type
                        ? 'bg-white/20 text-white'
                        : 'bg-hakiardhi-red/10 text-hakiardhi-red group-hover:bg-hakiardhi-red/20'
                    }`}>
                      {count}
                    </span>
                  </span>
                </button>
              );
            })}
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
                  {/* Topic Filter - Inside Panel */}
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                      <Icon name="document" size="sm" className="text-hakiardhi-red" />
                      Filter by Topic
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {RESEARCH_TOPICS.map((topic) => (
                        <button
                          key={topic}
                          onClick={() => handleFilterChange(() => setSelectedTopic(topic))}
                          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                            selectedTopic === topic
                              ? 'bg-hakiardhi-red text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                          }`}
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Year Filter */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <Icon name="clock" size="sm" className="text-hakiardhi-red" />
                        Year
                      </label>
                      <select
                        value={selectedYear}
                        onChange={(e) => {
                          handleFilterChange(() => {
                            setSelectedYear(e.target.value);
                            setSelectedQuarter('All');
                            setSelectedMonth('All');
                          });
                        }}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 font-medium hover:border-hakiardhi-red focus:border-hakiardhi-red focus:ring-4 focus:ring-hakiardhi-red/10 transition-all cursor-pointer"
                      >
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>

                    {/* Quarter Filter - Conditional */}
                    {selectedYear !== 'All' && (
                      <div className="space-y-2 animate-fade-in">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                          <Icon name="clock" size="sm" className="text-hakiardhi-red" />
                          Quarter
                        </label>
                        <select
                          value={selectedQuarter}
                          onChange={(e) => {
                            handleFilterChange(() => {
                              setSelectedQuarter(e.target.value);
                              setSelectedMonth('All');
                            });
                          }}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 font-medium hover:border-hakiardhi-red focus:border-hakiardhi-red focus:ring-4 focus:ring-hakiardhi-red/10 transition-all cursor-pointer"
                        >
                          <option value="All">All Quarters</option>
                          <option value="1">Q1 (Jan-Mar)</option>
                          <option value="2">Q2 (Apr-Jun)</option>
                          <option value="3">Q3 (Jul-Sep)</option>
                          <option value="4">Q4 (Oct-Dec)</option>
                        </select>
                      </div>
                    )}

                    {/* Month Filter - Conditional */}
                    {selectedYear !== 'All' && availableMonths.length > 1 && (
                      <div className="space-y-2 animate-fade-in" style={{ animationDelay: '100ms' }}>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                          <Icon name="clock" size="sm" className="text-hakiardhi-red" />
                          Month
                        </label>
                        <select
                          value={selectedMonth}
                          onChange={(e) => handleFilterChange(() => setSelectedMonth(e.target.value))}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 font-medium hover:border-hakiardhi-red focus:border-hakiardhi-red focus:ring-4 focus:ring-hakiardhi-red/10 transition-all cursor-pointer"
                        >
                          {availableMonths.map(month => (
                            <option key={month} value={month}>{month}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Results Count Badge */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
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

          {/* Publications Grid - Attractive Background Section */}
          {filteredPublications.length > 0 ? (
            <div className="bg-gradient-to-br from-zinc-50 via-gray-50 to-zinc-100/50 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-inner border border-zinc-200/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                {visiblePublications.map((publication, index) => (
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
                        Load More Publications
                        <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </button>
                  </div>
                  <p className="mt-4 text-gray-600 font-medium">
                    Showing {visiblePublications.length} of {filteredPublications.length} publications
                  </p>
                  <div className="mt-3 max-w-md mx-auto h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-hakiardhi-red to-red-600 transition-all duration-500"
                      style={{ width: `${(visiblePublications.length / filteredPublications.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
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
            {researchPartners.map((partner, index) => (
              <div
                key={partner.name}
                className="opacity-0 animate-fade-in"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'forwards',
                }}
              >
                <Card variant="elevated" className="hover:shadow-lg hover:scale-105 transition-all duration-300 h-full">
                  <Card.Body className="p-6 flex items-center justify-center">
                    <div className="relative w-full h-20">
                      <Image
                        src={partner.logo}
                        alt={partner.name}
                        fill
                        className="object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      />
                    </div>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </Grid>
        </Section.Content>
      </Section>

      <Footer />
    </main>
  );
}
