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
import { programs, PROGRAM_CATEGORIES } from '@/data/programs';
import { programCategories } from '@/data/programCategories';

export default function ProgramsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedQuarter, setSelectedQuarter] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [itemsToShow, setItemsToShow] = useState(9);
  const [isVisible, setIsVisible] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Extract unique years from programs
  const years = useMemo(() => {
    const yearSet = new Set(programs.map(p => new Date(p.date).getFullYear()));
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

  // Filter programs
  const filteredPrograms = useMemo(() => {
    return programs.filter(program => {
      const programDate = new Date(program.date);
      const programYear = programDate.getFullYear();
      const programQuarter = getQuarter(program.date);
      const programMonth = getMonthName(program.date);

      const categoryMatch = selectedCategory === 'All' || program.category === selectedCategory;
      const yearMatch = selectedYear === 'All' || programYear === Number(selectedYear);
      const quarterMatch = selectedQuarter === 'All' || programQuarter === Number(selectedQuarter);
      const monthMatch = selectedMonth === 'All' || programMonth === selectedMonth;

      return categoryMatch && yearMatch && quarterMatch && monthMatch;
    });
  }, [selectedCategory, selectedYear, selectedQuarter, selectedMonth]);

  const visiblePrograms = filteredPrograms.slice(0, itemsToShow);
  const hasMore = itemsToShow < filteredPrograms.length;

  // Get category count
  const getCategoryCount = (category: string) => {
    if (category === 'All') return programs.length;
    return programs.filter(p => p.category === category).length;
  };

  // Reset items when filters change
  const handleFilterChange = (callback: () => void) => {
    callback();
    setItemsToShow(9);
  };

  // Get unique months from filtered programs
  const availableMonths = useMemo(() => {
    const months = new Set(
      programs
        .filter(p => {
          const year = selectedYear === 'All' || new Date(p.date).getFullYear() === Number(selectedYear);
          const quarter = selectedQuarter === 'All' || getQuarter(p.date) === Number(selectedQuarter);
          return year && quarter;
        })
        .map(p => getMonthName(p.date))
    );
    return ['All', ...Array.from(months)];
  }, [selectedYear, selectedQuarter]);

  // Clear all filters
  const clearFilters = () => {
    setSelectedYear('All');
    setSelectedQuarter('All');
    setSelectedMonth('All');
    setItemsToShow(9);
  };

  const hasActiveFilters = selectedYear !== 'All' || selectedQuarter !== 'All' || selectedMonth !== 'All';

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

      {/* Programs Section - Light Theme like Research Page */}
      <section className="hakiardhi-section bg-gray-50 relative overflow-hidden">
        {/* Elegant decorative gradient orbs */}
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-gradient-to-br from-orange-500/10 to-brand-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-brand-500/10 to-success-500/10 rounded-full blur-3xl"></div>

        <div className="hakiardhi-container relative z-10">
          {/* Section Header */}
          <SectionHeader
            title="All Programs"
            description="Explore our comprehensive initiatives supporting land rights and community empowerment across Tanzania."
            align="center"
          />

          {/* Category Filter Tabs - Fully Rounded Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {PROGRAM_CATEGORIES.map((category) => {
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
                    {showFilters ? 'Hide Filters' : 'Show Date Filters'}
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
                        Showing <span className="text-hakiardhi-red font-bold text-lg">{filteredPrograms.length}</span>{' '}
                        {filteredPrograms.length === 1 ? 'program' : 'programs'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Programs Grid - Attractive Background Section */}
          {filteredPrograms.length > 0 ? (
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
                          <Image
                            src={program.image}
                            alt={program.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Card.Media>

                        {/* Badge */}
                        <Card.Badge className="absolute top-4 right-4">
                          <Badge variant="primary" size="sm">
                            {program.category}
                          </Badge>
                        </Card.Badge>

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
                              <div className="flex items-center gap-2">
                                <Icon name="clock" size="sm" className="text-hakiardhi-red flex-shrink-0" />
                                <span className="text-xs text-gray-600 leading-tight">
                                  {new Date(program.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                              {program.location && (
                                <div className="flex items-center gap-2">
                                  <Icon name="globe" size="sm" className="text-hakiardhi-red flex-shrink-0" />
                                  <span className="text-xs text-gray-600 leading-tight">{program.location}</span>
                                </div>
                              )}
                              {program.participants && (
                                <div className="flex items-center gap-2">
                                  <Icon name="users" size="sm" className="text-hakiardhi-red flex-shrink-0" />
                                  <span className="text-xs text-gray-600 leading-tight">{program.participants} Participants</span>
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
                    Showing {visiblePrograms.length} of {filteredPrograms.length} programs
                  </p>
                  <div className="mt-3 max-w-md mx-auto h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-hakiardhi-red to-red-600 transition-all duration-500"
                      style={{ width: `${(visiblePrograms.length / filteredPrograms.length) * 100}%` }}
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
