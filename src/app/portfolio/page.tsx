'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header, Footer, DonorsSection } from '@/components';
import Section from '@/components/ui/Section';
import Grid from '@/components/ui/Grid';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import SectionHeader from '@/components/features/SectionHeader';
import { SPACING, TYPOGRAPHY } from '@/constants/design-tokens';
import { portfolioItems } from '@/data/portfolio';

const PORTFOLIO_CATEGORIES = ['All', 'Legal Advocacy', 'Gender Justice', 'Capacity Building', 'Legal Support', 'Land Governance', 'Environmental Justice', 'Indigenous Rights'];
const PORTFOLIO_TYPES = ['All', 'Case Study', 'Project', 'Initiative', 'Success Story'];

export default function PortfolioPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
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
    const yearSet = new Set(portfolioItems.map(item => item.year.split('-')[0]));
    return ['All', ...Array.from(yearSet).sort((a, b) => (b as string).localeCompare(a as string))];
  }, []);

  // Filter items
  const filteredItems = useMemo(() => {
    return portfolioItems.filter(item => {
      const categoryMatch = selectedCategory === 'All' || item.category === selectedCategory;
      const typeMatch = selectedType === 'All' || item.type === selectedType;
      const yearMatch = selectedYear === 'All' || item.year.includes(selectedYear);
      return categoryMatch && typeMatch && yearMatch;
    });
  }, [selectedCategory, selectedType, selectedYear]);

  const visibleItems = filteredItems.slice(0, itemsToShow);
  const hasMore = itemsToShow < filteredItems.length;

  // Get featured items
  const featuredItems = portfolioItems.filter(item => item.featured);

  // Get category count
  const getCategoryCount = (category: string) => {
    if (category === 'All') return portfolioItems.length;
    return portfolioItems.filter(item => item.category === category).length;
  };

  // Reset items when filters change
  const handleFilterChange = (callback: () => void) => {
    callback();
    setItemsToShow(9);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedType('All');
    setSelectedYear('All');
    setItemsToShow(9);
  };

  const hasActiveFilters = selectedType !== 'All' || selectedYear !== 'All';

  // Calculate total impact
  const totalBeneficiaries = portfolioItems.reduce((sum, item) => sum + (item.beneficiaries || 0), 0);

  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <Section variant="white" spacing="xs" className="pt-44 lg:pt-48 pb-8">
        <Section.Content>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className={`${TYPOGRAPHY.heading.h1.size} ${TYPOGRAPHY.heading.h1.weight} text-gray-900 mb-6`}>
              Our Portfolio
            </h1>
            <p className={`${TYPOGRAPHY.body.lg.size} text-gray-600 ${TYPOGRAPHY.body.lg.lineHeight}`}>
              Explore our impactful projects, successful case studies, and ongoing initiatives protecting
              land rights and empowering communities across Tanzania.
            </p>
          </div>
        </Section.Content>
      </Section>

      {/* Impact Statistics */}
      <Section variant="white" spacing="xs" className="pt-8 pb-16">
        <Section.Content>
          <Grid cols={{ base: 1, sm: 2, lg: 4 }} gap="lg">
            {[
              { value: portfolioItems.length, label: 'Projects', description: 'Completed & Ongoing' },
              { value: totalBeneficiaries.toLocaleString(), label: 'Beneficiaries', description: 'Lives Impacted' },
              { value: '15+', label: 'Regions', description: 'Nationwide Coverage' },
              { value: '30+', label: 'Partners', description: 'Strategic Collaborations' },
            ].map((stat, index) => (
              <div
                key={index}
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

      {/* Featured Projects Section */}
      {featuredItems.length > 0 && (
        <Section variant="light" spacing="lg">
          <Section.Content>
            <SectionHeader
              title="Featured Projects"
              description="Highlighting our most impactful work"
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
                  <Link href={`/portfolio/${item.slug}`}>
                    <Card variant="elevated" hoverEffect="lift" className="h-full group cursor-pointer">
                      <Card.Media className="h-56 relative overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute top-4 left-4">
                          <Badge variant="warning" size="sm">Featured</Badge>
                        </div>
                        <div className="absolute top-4 right-4">
                          <Badge variant="primary" size="sm">{item.type}</Badge>
                        </div>
                      </Card.Media>

                      <Card.Body className="p-6">
                        <div className="mb-2">
                          <span className="text-xs font-semibold text-hakiardhi-red">{item.category}</span>
                        </div>
                        <h3 className={`text-xl font-black text-gray-900 mb-2 group-hover:text-hakiardhi-red transition-colors`}>
                          {item.title}
                        </h3>
                        <p className="text-sm font-semibold text-gray-600 mb-3">
                          {item.subtitle}
                        </p>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                          {item.description}
                        </p>

                        {/* Impact Highlights */}
                        {item.impact && item.impact.length > 0 && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs font-bold text-gray-700 mb-2">Key Impact:</p>
                            <ul className="space-y-1">
                              {item.impact.slice(0, 2).map((impact, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                                  <Icon name="check-circle" size="sm" className="text-hakiardhi-red flex-shrink-0 mt-0.5" />
                                  <span>{impact}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                          <div className="flex items-center gap-1">
                            <Icon name="clock" size="sm" className="text-hakiardhi-red" />
                            {item.year}
                          </div>
                          <div className="flex items-center gap-1">
                            <Icon name="globe" size="sm" className="text-hakiardhi-red" />
                            {item.location}
                          </div>
                        </div>

                        <Button variant="secondary" size="sm" fullWidth>
                          View Case Study
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

      {/* All Portfolio Items Section */}
      <section className="hakiardhi-section bg-gray-50 relative overflow-hidden">
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-gradient-to-br from-orange-500/10 to-brand-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-brand-500/10 to-success-500/10 rounded-full blur-3xl"></div>

        <div className="hakiardhi-container relative z-10">
          {/* Section Header */}
          <SectionHeader
            title="All Projects"
            description="Browse our complete portfolio of land rights initiatives and success stories."
            align="center"
          />

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {PORTFOLIO_CATEGORIES.map((category) => {
              const count = getCategoryCount(category);
              return (
                <button
                  key={category}
                  onClick={() => handleFilterChange(() => setSelectedCategory(category))}
                  className={`group px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-hakiardhi-red text-white shadow-lg shadow-hakiardhi-red/30 scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-300 hover:border-hakiardhi-red hover:scale-105'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {category}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      selectedCategory === category
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
                    {/* Type Filter */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <Icon name="document" size="sm" className="text-hakiardhi-red" />
                        Type
                      </label>
                      <select
                        value={selectedType}
                        onChange={(e) => handleFilterChange(() => setSelectedType(e.target.value))}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 font-medium hover:border-hakiardhi-red focus:border-hakiardhi-red focus:ring-4 focus:ring-hakiardhi-red/10 transition-all cursor-pointer"
                      >
                        {PORTFOLIO_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
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
                        {filteredItems.length === 1 ? 'project' : 'projects'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Grid */}
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
                    <Link href={`/portfolio/${item.slug}`} className="w-full">
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

                          {/* Description */}
                          <p className="flex-grow text-sm text-gray-600 leading-relaxed mb-3 line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                            {item.description}
                          </p>

                          {/* Meta Info */}
                          <div className="mt-auto pt-3 border-t border-gray-100">
                            <div className="space-y-2 mb-3">
                              <div className="flex items-center justify-between text-xs text-gray-600">
                                <div className="flex items-center gap-2">
                                  <Icon name="clock" size="sm" className="text-hakiardhi-red flex-shrink-0" />
                                  <span>{item.year}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Icon name="globe" size="sm" className="text-hakiardhi-red flex-shrink-0" />
                                  <span className="truncate">{item.location}</span>
                                </div>
                              </div>
                              {item.beneficiaries && (
                                <div className="flex items-center gap-2">
                                  <Icon name="users" size="sm" className="text-hakiardhi-red flex-shrink-0" />
                                  <span className="text-xs text-gray-600">{item.beneficiaries.toLocaleString()} Beneficiaries</span>
                                </div>
                              )}
                            </div>

                            {/* View Button */}
                            <Button variant="secondary" size="sm" fullWidth>
                              <Icon name="arrow-right" size="sm" className="mr-2" />
                              View Details
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
                        Load More Projects
                        <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </button>
                  </div>
                  <p className="mt-4 text-gray-600 font-medium">
                    Showing {visibleItems.length} of {filteredItems.length} projects
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
                <Icon name="briefcase" size="xl" className="text-gray-400" />
              </div>
              <h3 className={`${TYPOGRAPHY.heading.h3.size} ${TYPOGRAPHY.heading.h3.weight} text-gray-900 mb-3`}>
                No Projects Found
              </h3>
              <p className={`${TYPOGRAPHY.body.lg.size} text-gray-500 mb-6`}>
                No projects match your current filter selection
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
              Partner With Us
            </h3>
            <p className={`${TYPOGRAPHY.body.lg.size} text-gray-600 mb-6`}>
              Join us in creating lasting impact. Partner with HakiArdhi to protect land rights and
              empower communities across Tanzania.
            </p>
            <Button variant="primary" size="lg" href="/work-with-us" className="w-full sm:w-auto">
              Let's Go
            </Button>
          </div>
        </div>
      </section>

      {/* Donors & Partners Section */}
      <DonorsSection />

      <Footer />
    </main>
  );
}
