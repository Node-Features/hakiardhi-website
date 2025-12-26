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
import {
  resources,
  resourceCategories,
  RESOURCE_TYPES,
  RESOURCE_CATEGORIES,
  TARGET_AUDIENCES,
} from '@/data/resources';

// Helper function to get resource icon name based on type
const getResourceIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    'Research Report': 'document-text',
    'Policy Brief': 'document',
    'Newsletter': 'newspaper',
    'Legal Guide': 'scale',
    'Video': 'video-camera',
    'Infographic': 'photograph',
    'Case Study': 'book-open',
    'Training Manual': 'academic-cap',
    'Template': 'clipboard',
  };
  return iconMap[type] || 'document';
};

// Helper function to get deterministic image based on resource ID
const getImageFromId = (resourceId: string): string => {
  const existingImages = [
    '/images/hero_1.JPG',
    '/images/hero_2.JPG',
    '/images/capacity_building_1.jpg',
    '/images/legal_aid_1.JPG',
    '/images/gender_training_1.JPG',
  ];

  // Create a simple hash from the resource ID
  let hash = 0;
  for (let i = 0; i < resourceId.length; i++) {
    hash = ((hash << 5) - hash) + resourceId.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }

  const index = Math.abs(hash) % existingImages.length;
  return existingImages[index];
};

// Shared styles
const SELECT_CLASSES = "w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 font-medium hover:border-hakiardhi-red focus:border-hakiardhi-red focus:ring-4 focus:ring-hakiardhi-red/10 transition-all cursor-pointer";

// Helper component for resource thumbnail
const ResourceThumbnail = ({ resource }: { resource: any }) => {
  const showIcon = !resource.thumbnail;
  const thumbnail = resource.thumbnail || getImageFromId(resource.id);

  return (
    <>
      {!showIcon && (
        <Image
          src={thumbnail}
          alt={resource.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
      )}
      {showIcon && (
        <div className="absolute inset-0 bg-gradient-to-br from-hakiardhi-red/90 to-red-700/90 flex items-center justify-center">
          <Icon name={getResourceIcon(resource.type) as any} size="xl" className="text-white opacity-80" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </>
  );
};

// Reusable Filter Select Component
const FilterSelect = ({
  icon,
  label,
  value,
  onChange,
  options
}: {
  icon: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[] | { value: string; label: string }[];
}) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
      <Icon name={icon as any} size="sm" className="text-hakiardhi-red" />
      {label}
    </label>
    <select value={value} onChange={(e) => onChange(e.target.value)} className={SELECT_CLASSES}>
      {options.map((option) => {
        const opt = typeof option === 'string' ? { value: option, label: option } : option;
        return <option key={opt.value} value={opt.value}>{opt.label}</option>;
      })}
    </select>
  </div>
);

// Reusable Category Tags Component
const CategoryTags = ({ categories, maxDisplay = 2 }: { categories: string[]; maxDisplay?: number }) => (
  <div className="flex flex-wrap gap-1.5 mb-3">
    {categories.slice(0, maxDisplay).map((cat, index) => (
      <span key={index} className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md">
        {cat}
      </span>
    ))}
    {categories.length > maxDisplay && (
      <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md">
        +{categories.length - maxDisplay}
      </span>
    )}
  </div>
);

// Reusable Meta Info Item Component
const MetaInfoItem = ({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) => (
  <span className="flex items-center gap-1.5">
    {icon}
    {children}
  </span>
);

export default function ResourcesPage() {
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Topics');
  const [selectedAudience, setSelectedAudience] = useState<string>('All Audiences');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsToShow, setItemsToShow] = useState(9);
  const [isVisible, setIsVisible] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Filter resources
  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const typeMatch = selectedType === 'All' || resource.type === selectedType;
      const categoryMatch = selectedCategory === 'All Topics' || resource.category.includes(selectedCategory);
      const audienceMatch = selectedAudience === 'All Audiences' || resource.targetAudience.includes(selectedAudience);
      const languageMatch = selectedLanguage === 'All' || resource.language === selectedLanguage || resource.language === 'Both';
      const searchMatch =
        searchQuery === '' ||
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (resource.category && resource.category.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase())));

      return typeMatch && categoryMatch && audienceMatch && languageMatch && searchMatch;
    });
  }, [selectedType, selectedCategory, selectedAudience, selectedLanguage, searchQuery]);

  const visibleResources = filteredResources.slice(0, itemsToShow);
  const hasMore = itemsToShow < filteredResources.length;

  // Reset items when filters change
  const handleFilterChange = (callback: () => void) => {
    callback();
    setItemsToShow(9);
  };

  // Get featured resources
  const featuredResources = resources.filter(r => r.featured);

  const hasActiveFilters = selectedCategory !== 'All Topics' || selectedAudience !== 'All Audiences' || selectedLanguage !== 'All';

  const clearFilters = () => {
    setSelectedCategory('All Topics');
    setSelectedAudience('All Audiences');
    setSelectedLanguage('All');
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
              Resource Center
            </h1>
            <p className={`${TYPOGRAPHY.body.lg.size} text-gray-600 ${TYPOGRAPHY.body.lg.lineHeight}`}>
              Access our comprehensive collection of guides, toolkits, reports, and educational materials
              on land rights and advocacy. Free resources to empower communities and support your work.
            </p>
          </div>
        </Section.Content>
      </Section>

      {/* Resource Categories Overview */}
      <Section variant="light" spacing="lg">
        <Section.Content>
          <SectionHeader
            title="Resource Categories"
            description="Explore our library organized by resource type"
            align="center"
          />

          <Grid cols={{ base: 1, md: 2, lg: 3 }} gap="lg">
            {resourceCategories.map((category, index) => (
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
                        <span className="text-hakiardhi-red">{category.count}</span> Resources
                      </p>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </Grid>
        </Section.Content>
      </Section>

      {/* Resources Section */}
      <section className="hakiardhi-section bg-gray-50 relative overflow-hidden">
        {/* Elegant decorative gradient orbs */}
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-gradient-to-br from-orange-500/10 to-brand-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-brand-500/10 to-success-500/10 rounded-full blur-3xl"></div>

        <div className="hakiardhi-container relative z-10">
          {/* Section Header */}
          <SectionHeader
            title="All Resources"
            description="Browse and download our comprehensive collection of materials supporting land rights advocacy and community empowerment."
            align="center"
          />

          {/* Type Filter Tabs - Fully Rounded Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {RESOURCE_TYPES.map((type) => {
              const count = resources.filter(r => type === 'All' || r.type === type).length;
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
                  {/* Category Filter */}
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                      <Icon name="folder" size="sm" className="text-hakiardhi-red" />
                      Filter by Topic
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {RESOURCE_CATEGORIES.map((category) => (
                        <button
                          key={category}
                          onClick={() => handleFilterChange(() => setSelectedCategory(category))}
                          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                            selectedCategory === category
                              ? 'bg-hakiardhi-red text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Audience and Language Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FilterSelect
                      icon="users"
                      label="Target Audience"
                      value={selectedAudience}
                      onChange={(value) => handleFilterChange(() => setSelectedAudience(value))}
                      options={TARGET_AUDIENCES}
                    />
                    <FilterSelect
                      icon="globe"
                      label="Language"
                      value={selectedLanguage}
                      onChange={(value) => handleFilterChange(() => setSelectedLanguage(value))}
                      options={[
                        { value: 'All', label: 'All Languages' },
                        { value: 'English', label: 'English' },
                        { value: 'Swahili', label: 'Swahili' },
                        { value: 'Both', label: 'Both' }
                      ]}
                    />
                  </div>

                  {/* Results Count Badge */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-center gap-2">
                      <Icon name="check-circle" size="sm" className="text-hakiardhi-red" />
                      <span className="text-gray-600 font-medium">
                        Showing <span className="text-hakiardhi-red font-bold text-lg">{filteredResources.length}</span>{' '}
                        {filteredResources.length === 1 ? 'resource' : 'resources'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resources Grid */}
          {filteredResources.length > 0 ? (
            <div className="bg-gradient-to-br from-zinc-50 via-gray-50 to-zinc-100/50 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-inner border border-zinc-200/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                {visibleResources.map((resource, index) => (
                  <div
                    key={resource.id}
                    className="opacity-0 animate-fade-in flex"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: 'forwards',
                    }}
                  >
                    <Card variant="elevated" hoverEffect="lift" className="w-full flex flex-col group transition-all duration-300">
                      {/* Image Preview */}
                      <Card.Media className="h-48 relative overflow-hidden flex-shrink-0">
                        <ResourceThumbnail resource={resource} />
                      </Card.Media>

                      {/* Type Badge - Top Right */}
                      <Card.Badge className="absolute top-4 right-4 z-10">
                        <Badge variant="primary" size="sm">
                          {resource.type}
                        </Badge>
                      </Card.Badge>

                      {/* Featured Badge - Top Left */}
                      {resource.featured && (
                        <div className="absolute top-4 left-4 z-10">
                          <Badge variant="warning" size="sm">Featured</Badge>
                        </div>
                      )}

                      <Card.Body className="flex-1 flex flex-col p-5">
                        {/* Language Badge */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-md">
                            {resource.language}
                          </span>
                        </div>

                        {/* Title */}
                        <div className="mb-2">
                          <h3 className="text-base font-bold text-gray-900 group-hover:text-hakiardhi-red transition-colors duration-300 leading-snug line-clamp-2 group-hover:line-clamp-none">
                            {resource.title}
                          </h3>
                        </div>

                        {/* Description */}
                        <p className="flex-grow text-sm text-gray-600 leading-relaxed mb-3 line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                          {resource.description}
                        </p>

                        {/* Categories */}
                        <CategoryTags categories={resource.category} maxDisplay={2} />

                        {/* Meta Info */}
                        <div className="mt-auto pt-3 border-t border-gray-100">
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center gap-2">
                              <Icon name="clock" size="sm" className="text-hakiardhi-red flex-shrink-0" />
                              <span className="text-xs text-gray-600 leading-tight">
                                Added {new Date(resource.dateAdded).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                })}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-600">
                              {resource.fileSize && (
                                <MetaInfoItem icon={<Icon name="document" size="sm" className="text-hakiardhi-red flex-shrink-0" />}>
                                  {resource.fileSize}
                                </MetaInfoItem>
                              )}
                              <MetaInfoItem icon={
                                <svg className="w-3.5 h-3.5 text-hakiardhi-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                </svg>
                              }>
                                {resource.downloads}
                              </MetaInfoItem>
                              {resource.format && (
                                <span className="font-semibold text-gray-700">{resource.format}</span>
                              )}
                            </div>
                          </div>

                          {/* Download Button */}
                          <Button href={resource.downloadUrl} variant="secondary" size="sm" fullWidth>
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
                        Load More Resources
                        <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </button>
                  </div>
                  <p className="mt-4 text-gray-600 font-medium">
                    Showing {visibleResources.length} of {filteredResources.length} resources
                  </p>
                  <div className="mt-3 max-w-md mx-auto h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-hakiardhi-red to-red-600 transition-all duration-500"
                      style={{ width: `${(visibleResources.length / filteredResources.length) * 100}%` }}
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
                No Resources Found
              </h3>
              <p className={`${TYPOGRAPHY.body.lg.size} text-gray-500 mb-6`}>
                No resources match your current filter selection
              </p>
              <p className={`${TYPOGRAPHY.body.default.size} text-gray-400`}>
                Try adjusting your filters
              </p>
            </div>
          )}

          {/* Newsletter Signup CTA */}
          <div className="mt-12 text-center p-8 bg-gradient-to-r from-hakiardhi-red/5 to-red-50 rounded-2xl border-l-4 border-hakiardhi-red max-w-3xl mx-auto">
            <h3 className={`${TYPOGRAPHY.heading.h3.size} ${TYPOGRAPHY.heading.h3.weight} text-gray-900 mb-3`}>
              Need Help Finding Resources?
            </h3>
            <p className={`${TYPOGRAPHY.body.lg.size} text-gray-600 mb-6`}>
              Can't find what you're looking for? Contact us for assistance or to request specific
              materials for your land rights advocacy work.
            </p>
            <Button variant="primary" size="lg" href="/contact" className="w-full sm:w-auto">
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
