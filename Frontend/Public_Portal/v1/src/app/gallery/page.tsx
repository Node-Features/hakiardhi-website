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
import { SPACING, TYPOGRAPHY } from '@/constants/design-tokens';

// Gallery data structure
interface GalleryItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  date: string;
  location?: string;
  photographer?: string;
  tags?: string[];
}

// Sample gallery data
const galleryItems: GalleryItem[] = [
  {
    id: 'gal-001',
    title: 'Community Land Rights Workshop',
    description: 'Training session with local community members on understanding their land rights',
    image: '/images/capacity_building_1.jpg',
    category: 'Training & Capacity Building',
    date: '2024-03-15',
    location: 'Morogoro',
    tags: ['workshop', 'community', 'training']
  },
  {
    id: 'gal-002',
    title: 'Legal Aid Consultation',
    description: 'Providing legal support and guidance to community members',
    image: '/images/legal_aid_1.JPG',
    category: 'Legal Support',
    date: '2024-02-20',
    location: 'Dar es Salaam',
    tags: ['legal', 'consultation', 'support']
  },
  {
    id: 'gal-003',
    title: 'Gender and Land Rights Training',
    description: 'Empowering women with knowledge about their land inheritance rights',
    image: '/images/gender_training_1.JPG',
    category: 'Gender Programs',
    date: '2024-01-10',
    location: 'Arusha',
    tags: ['gender', 'women', 'training']
  },
  {
    id: 'gal-004',
    title: 'Community Meeting',
    description: 'Village assembly discussing land governance and community rights',
    image: '/images/capacity_building_2.jpg',
    category: 'Community Engagement',
    date: '2024-02-05',
    location: 'Mbeya',
    tags: ['meeting', 'community', 'governance']
  },
  {
    id: 'gal-005',
    title: 'Legal Documentation Session',
    description: 'Assisting communities with land documentation and registration',
    image: '/images/legal_aid_2.JPG',
    category: 'Legal Support',
    date: '2024-01-25',
    location: 'Dodoma',
    tags: ['documentation', 'legal', 'registration']
  },
  {
    id: 'gal-006',
    title: 'Women Empowerment Workshop',
    description: 'Training women on economic empowerment and land rights',
    image: '/images/gender_training_2.JPG',
    category: 'Gender Programs',
    date: '2023-12-15',
    location: 'Mwanza',
    tags: ['women', 'empowerment', 'workshop']
  },
  {
    id: 'gal-007',
    title: 'Capacity Building Program',
    description: 'Skills development training for community paralegals',
    image: '/images/capacity_building_3.jpg',
    category: 'Training & Capacity Building',
    date: '2023-11-20',
    location: 'Tanga',
    tags: ['capacity building', 'training', 'paralegals']
  },
  {
    id: 'gal-008',
    title: 'Legal Aid Outreach',
    description: 'Mobile legal clinic providing free legal advice to rural communities',
    image: '/images/legal_aid_3.JPG',
    category: 'Legal Support',
    date: '2023-10-30',
    location: 'Kagera',
    tags: ['outreach', 'legal', 'clinic']
  },
  {
    id: 'gal-009',
    title: 'Community Sensitization',
    description: 'Raising awareness about land rights and legal protections',
    image: '/images/legal_aid_4.JPG',
    category: 'Community Engagement',
    date: '2023-09-18',
    location: 'Singida',
    tags: ['awareness', 'sensitization', 'community']
  },
];

const GALLERY_CATEGORIES = ['All', 'Training & Capacity Building', 'Legal Support', 'Gender Programs', 'Community Engagement'];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [itemsToShow, setItemsToShow] = useState(12);
  const [isVisible, setIsVisible] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Extract unique years
  const years = useMemo(() => {
    const yearSet = new Set(galleryItems.map(item => new Date(item.date).getFullYear()));
    return ['All', ...Array.from(yearSet).sort((a, b) => (b as number) - (a as number))];
  }, []);

  // Filter gallery items
  const filteredItems = useMemo(() => {
    return galleryItems.filter(item => {
      const itemYear = new Date(item.date).getFullYear();
      const categoryMatch = selectedCategory === 'All' || item.category === selectedCategory;
      const yearMatch = selectedYear === 'All' || itemYear === Number(selectedYear);
      return categoryMatch && yearMatch;
    });
  }, [selectedCategory, selectedYear]);

  const visibleItems = filteredItems.slice(0, itemsToShow);
  const hasMore = itemsToShow < filteredItems.length;

  // Get category count
  const getCategoryCount = (category: string) => {
    if (category === 'All') return galleryItems.length;
    return galleryItems.filter(item => item.category === category).length;
  };

  // Reset items when filters change
  const handleFilterChange = (callback: () => void) => {
    callback();
    setItemsToShow(12);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedYear('All');
    setItemsToShow(12);
  };

  const hasActiveFilters = selectedYear !== 'All';

  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <Section variant="white" spacing="xs" className="pt-44 lg:pt-48 pb-8">
        <Section.Content>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className={`${TYPOGRAPHY.heading.h1.size} ${TYPOGRAPHY.heading.h1.weight} text-gray-900 mb-6`}>
              Photo Gallery
            </h1>
            <p className={`${TYPOGRAPHY.body.lg.size} text-gray-600 ${TYPOGRAPHY.body.lg.lineHeight}`}>
              Explore moments from our programs and initiatives across Tanzania. Witness the impact of
              our work in protecting land rights and empowering communities.
            </p>
          </div>
        </Section.Content>
      </Section>

      {/* Gallery Section */}
      <section className="hakiardhi-section bg-gray-50 relative overflow-hidden">
        {/* Elegant decorative gradient orbs */}
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-gradient-to-br from-orange-500/10 to-brand-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-brand-500/10 to-success-500/10 rounded-full blur-3xl"></div>

        <div className="hakiardhi-container relative z-10">
          {/* Section Header */}
          <SectionHeader
            title="Our Gallery"
            description="A visual journey through our programs, events, and community impact across Tanzania."
            align="center"
          />

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {GALLERY_CATEGORIES.map((category) => {
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

              {/* Filter Panel */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  showFilters ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
                  <div className="max-w-md">
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
                        {filteredItems.length === 1 ? 'photo' : 'photos'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery Grid */}
          {filteredItems.length > 0 ? (
            <div className="bg-gradient-to-br from-zinc-50 via-gray-50 to-zinc-100/50 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-inner border border-zinc-200/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {visibleItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="opacity-0 animate-fade-in"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animationFillMode: 'forwards',
                    }}
                  >
                    <div
                      onClick={() => setLightboxImage(item)}
                      className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2"
                    >
                      {/* Image */}
                      <div className="relative h-64 overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-white/90 rounded-full p-3">
                            <Icon name="eye" size="lg" className="text-hakiardhi-red" />
                          </div>
                        </div>
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-4 right-4">
                        <Badge variant="primary" size="sm">
                          {item.category}
                        </Badge>
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-hakiardhi-red transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Icon name="clock" size="sm" className="text-hakiardhi-red" />
                          {new Date(item.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short'
                          })}
                          {item.location && (
                            <>
                              <span>•</span>
                              <Icon name="globe" size="sm" className="text-hakiardhi-red" />
                              {item.location}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="mt-12 text-center">
                  <div className="inline-block relative">
                    <div className="absolute inset-0 bg-hakiardhi-red/20 blur-xl rounded-full scale-150"></div>
                    <button
                      onClick={() => setItemsToShow(prev => prev + 12)}
                      className="relative group px-8 py-4 bg-hakiardhi-red text-white font-bold rounded-full shadow-lg hover:bg-black hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      <span className="flex items-center gap-3">
                        Load More Photos
                        <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </button>
                  </div>
                  <p className="mt-4 text-gray-600 font-medium">
                    Showing {visibleItems.length} of {filteredItems.length} photos
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
                <Icon name="photograph" size="xl" className="text-gray-400" />
              </div>
              <h3 className={`${TYPOGRAPHY.heading.h3.size} ${TYPOGRAPHY.heading.h3.weight} text-gray-900 mb-3`}>
                No Photos Found
              </h3>
              <p className={`${TYPOGRAPHY.body.lg.size} text-gray-500 mb-6`}>
                No photos match your current filter selection
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-hakiardhi-red text-white font-semibold rounded-xl hover:bg-black transition-all duration-300"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 text-white hover:text-hakiardhi-red transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-[70vh] mb-6">
              <Image
                src={lightboxImage.image}
                alt={lightboxImage.title}
                fill
                className="object-contain"
              />
            </div>
            <div className="bg-white rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{lightboxImage.title}</h2>
                  <p className="text-gray-600">{lightboxImage.description}</p>
                </div>
                <Badge variant="primary" size="sm">
                  {lightboxImage.category}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Icon name="clock" size="sm" className="text-hakiardhi-red" />
                  {new Date(lightboxImage.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                {lightboxImage.location && (
                  <div className="flex items-center gap-2">
                    <Icon name="globe" size="sm" className="text-hakiardhi-red" />
                    {lightboxImage.location}
                  </div>
                )}
                {lightboxImage.photographer && (
                  <div className="flex items-center gap-2">
                    <Icon name="camera" size="sm" className="text-hakiardhi-red" />
                    {lightboxImage.photographer}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
