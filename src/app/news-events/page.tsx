'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { newsEvents } from '@/data/newsEvents';

const EVENT_TYPES = ['All', 'News', 'Event', 'Announcement'];
const EVENT_CATEGORIES = ['All', 'Legal Updates', 'Training & Events', 'Program Updates', 'Success Stories', 'Publications'];

export default function NewsEventsPage() {
  const [selectedType, setSelectedType] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [itemsToShow, setItemsToShow] = useState(9);
  const [isVisible, setIsVisible] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Extract unique years
  const years = useMemo(() => {
    const yearSet = new Set(newsEvents.map(item => new Date(item.date).getFullYear()));
    return ['All', ...Array.from(yearSet).sort((a, b) => (b as number) - (a as number))];
  }, []);

  // Filter items
  const filteredItems = useMemo(() => {
    return newsEvents.filter(item => {
      const itemYear = new Date(item.date).getFullYear();
      const typeMatch = selectedType === 'All' || item.type === selectedType;
      const categoryMatch = selectedCategory === 'All' || item.category === selectedCategory;
      const yearMatch = selectedYear === 'All' || itemYear === Number(selectedYear);
      return typeMatch && categoryMatch && yearMatch;
    });
  }, [selectedType, selectedCategory, selectedYear]);

  const visibleItems = filteredItems.slice(0, itemsToShow);
  const hasMore = itemsToShow < filteredItems.length;

  // Get featured items
  const featuredItems = newsEvents.filter(item => item.featured);

  // Get type count
  const getTypeCount = (type: string) => {
    if (type === 'All') return newsEvents.length;
    return newsEvents.filter(item => item.type === type).length;
  };

  // Reset items when filters change
  const handleFilterChange = (callback: () => void) => {
    callback();
    setItemsToShow(9);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedYear('All');
    setItemsToShow(9);
  };

  const hasActiveFilters = selectedCategory !== 'All' || selectedYear !== 'All';

  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <Section variant="white" spacing="xs" className="pt-44 lg:pt-48 pb-8">
        <Section.Content>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className={`${TYPOGRAPHY.heading.h1.size} ${TYPOGRAPHY.heading.h1.weight} text-gray-900 mb-6`}>
              News & Events
            </h1>
            <p className={`${TYPOGRAPHY.body.lg.size} text-gray-600 ${TYPOGRAPHY.body.lg.lineHeight}`}>
              Stay updated with the latest news, upcoming events, and important announcements from
              HakiArdhi and the land rights movement in Tanzania.
            </p>
          </div>
        </Section.Content>
      </Section>

      {/* Featured Items Section */}
      {featuredItems.length > 0 && (
        <Section variant="light" spacing="lg">
          <Section.Content>
            <SectionHeader
              title="Featured Updates"
              description="Highlights and important announcements"
              align="center"
            />

            <Grid cols={{ base: 1, md: 2, lg: 3 }} gap="lg">
              {featuredItems.map((item, index) => (
                <div
                  key={item.id}
                  className="opacity-0 animate-fade-in"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'forwards',
                  }}
                >
                  <Link href={`/news-events/${item.slug}`}>
                    <Card variant="elevated" hoverEffect="lift" className="h-full group cursor-pointer">
                      <Card.Media className="h-56 relative overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute top-4 left-4">
                          <Badge variant="warning" size="sm">Featured</Badge>
                        </div>
                        <div className="absolute top-4 right-4">
                          <Badge variant="primary" size="sm">{item.type}</Badge>
                        </div>
                      </Card.Media>

                      <Card.Body className="p-5">
                        <div className="mb-2">
                          <span className="text-xs font-semibold text-hakiardhi-red">{item.category}</span>
                        </div>
                        <h3 className={`${TYPOGRAPHY.heading.h4.size} ${TYPOGRAPHY.heading.h4.weight} text-gray-900 mb-3 group-hover:text-hakiardhi-red transition-colors`}>
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {item.excerpt}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                          <Icon name="clock" size="sm" className="text-hakiardhi-red" />
                          {new Date(item.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <Button variant="secondary" size="sm" fullWidth>
                          Read More
                        </Button>
                      </Card.Body>
                    </Card>
                  </Link>
                </div>
              ))}
            </Grid>
          </Section.Content>
        </Section>
      )}

      {/* All News & Events Section */}
      <section className="hakiardhi-section bg-gray-50 relative overflow-hidden">
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-gradient-to-br from-orange-500/10 to-brand-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-brand-500/10 to-success-500/10 rounded-full blur-3xl"></div>

        <div className="hakiardhi-container relative z-10">
          {/* Section Header */}
          <SectionHeader
            title="All Updates"
            description="Browse our complete collection of news, events, and announcements."
            align="center"
          />

          {/* Type Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {EVENT_TYPES.map((type) => {
              const count = getTypeCount(type);
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

              {/* Filter Panel */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  showFilters ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Category Filter */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <Icon name="folder" size="sm" className="text-hakiardhi-red" />
                        Category
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => handleFilterChange(() => setSelectedCategory(e.target.value))}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 font-medium hover:border-hakiardhi-red focus:border-hakiardhi-red focus:ring-4 focus:ring-hakiardhi-red/10 transition-all cursor-pointer"
                      >
                        {EVENT_CATEGORIES.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    {/* Year Filter */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <Icon name="clock" size="sm" className="text-hakiardhi-red" />
                        Year
                      </label>
                      <select
                        value={selectedYear}
                        onChange={(e) => handleFilterChange(() => setSelectedYear(e.target.value))}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 font-medium hover:border-hakiardhi-red focus:border-hakiardhi-red focus:ring-4 focus:ring-hakiardhi-red/10 transition-all cursor-pointer"
                      >
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Results Count */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-center gap-2">
                      <Icon name="check-circle" size="sm" className="text-hakiardhi-red" />
                      <span className="text-gray-600 font-medium">
                        Showing <span className="text-hakiardhi-red font-bold text-lg">{filteredItems.length}</span>{' '}
                        {filteredItems.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items Grid */}
          {filteredItems.length > 0 ? (
            <div className="bg-gradient-to-br from-zinc-50 via-gray-50 to-zinc-100/50 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-inner border border-zinc-200/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                {visibleItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="opacity-0 animate-fade-in flex"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: 'forwards',
                    }}
                  >
                    <Link href={`/news-events/${item.slug}`} className="w-full">
                      <Card variant="elevated" hoverEffect="lift" className="w-full flex flex-col group transition-all duration-300 cursor-pointer h-full">
                        <Card.Media className="h-48 relative overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Card.Media>

                        {/* Type Badge */}
                        <Card.Badge className="absolute top-4 right-4">
                          <Badge variant="primary" size="sm">
                            {item.type}
                          </Badge>
                        </Card.Badge>

                        <Card.Body className="flex-1 flex flex-col p-5">
                          {/* Category */}
                          <div className="mb-2">
                            <span className="text-xs font-semibold text-hakiardhi-red">{item.category}</span>
                          </div>

                          {/* Title */}
                          <div className="mb-2">
                            <h3 className="text-base font-bold text-gray-900 group-hover:text-hakiardhi-red transition-colors duration-300 leading-snug line-clamp-2 group-hover:line-clamp-none">
                              {item.title}
                            </h3>
                          </div>

                          {/* Excerpt */}
                          <p className="flex-grow text-sm text-gray-600 leading-relaxed mb-3 line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                            {item.excerpt}
                          </p>

                          {/* Meta Info */}
                          <div className="mt-auto pt-3 border-t border-gray-100">
                            <div className="space-y-2 mb-3">
                              <div className="flex items-center gap-2">
                                <Icon name="clock" size="sm" className="text-hakiardhi-red flex-shrink-0" />
                                <span className="text-xs text-gray-600 leading-tight">
                                  {new Date(item.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                              {item.location && (
                                <div className="flex items-center gap-2">
                                  <Icon name="globe" size="sm" className="text-hakiardhi-red flex-shrink-0" />
                                  <span className="text-xs text-gray-600 leading-tight">{item.location}</span>
                                </div>
                              )}
                              {item.author && (
                                <div className="flex items-center gap-2">
                                  <Icon name="user" size="sm" className="text-hakiardhi-red flex-shrink-0" />
                                  <span className="text-xs text-gray-600 leading-tight">{item.author}</span>
                                </div>
                              )}
                            </div>

                            {/* Read More Button */}
                            <Button variant="secondary" size="sm" fullWidth>
                              <Icon name="arrow-right" size="sm" className="mr-2" />
                              {item.type === 'Event' ? 'View Details' : 'Read More'}
                            </Button>
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
                        Load More Updates
                        <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </button>
                  </div>
                  <p className="mt-4 text-gray-600 font-medium">
                    Showing {visibleItems.length} of {filteredItems.length} items
                  </p>
                  <div className="mt-3 max-w-md mx-auto h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-hakiardhi-red to-red-600 transition-all duration-500"
                      style={{ width: `${(visibleItems.length / filteredItems.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <Icon name="newspaper" size="xl" className="text-gray-400" />
              </div>
              <h3 className={`${TYPOGRAPHY.heading.h3.size} ${TYPOGRAPHY.heading.h3.weight} text-gray-900 mb-3`}>
                No Updates Found
              </h3>
              <p className={`${TYPOGRAPHY.body.lg.size} text-gray-500 mb-6`}>
                No items match your current filter selection
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-hakiardhi-red text-white font-semibold rounded-xl hover:bg-black transition-all duration-300"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Newsletter CTA */}
          <div className="mt-12 text-center p-8 bg-gradient-to-r from-hakiardhi-red/5 to-red-50 rounded-2xl border-l-4 border-hakiardhi-red max-w-3xl mx-auto">
            <h3 className={`${TYPOGRAPHY.heading.h3.size} ${TYPOGRAPHY.heading.h3.weight} text-gray-900 mb-3`}>
              Stay Informed
            </h3>
            <p className={`${TYPOGRAPHY.body.lg.size} text-gray-600 mb-6`}>
              Subscribe to our newsletter to receive the latest news, event announcements, and updates
              on land rights advocacy in Tanzania.
            </p>
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              Subscribe to Newsletter
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
