'use client';

import { useEffect, useState } from 'react';
import Button from '../ui/Button';

export interface ResourceCenterSectionProps {
  className?: string;
}

interface Resource {
  id: number;
  title: string;
  description: string;
  publishedDate: string;
  category: string;
  type: 'PDF' | 'Document' | 'Guide' | 'Toolkit' | 'Report' | 'Video';
  downloadLink: string;
  fileSize?: string;
  tags?: string[];
}

export default function ResourceCenterSection({ className = '' }: ResourceCenterSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const resources: Resource[] = [
    {
      id: 1,
      title: 'Community Land Rights Handbook',
      description:
        'A comprehensive guide for communities on understanding and protecting their land rights under Tanzanian law.',
      publishedDate: '2024',
      category: 'Legal Guides',
      type: 'PDF',
      downloadLink: '/downloads/land-rights-handbook.pdf',
      fileSize: '2.5 MB',
      tags: ['Land Rights', 'Community', 'Legal'],
    },
    {
      id: 2,
      title: 'Gender and Land Toolkit',
      description:
        'Practical tools and strategies for promoting gender equality in land ownership and access.',
      publishedDate: '2024',
      category: 'Toolkits',
      type: 'Toolkit',
      downloadLink: '/downloads/gender-land-toolkit.pdf',
      fileSize: '1.8 MB',
      tags: ['Gender', 'Toolkit', 'Training'],
    },
    {
      id: 3,
      title: 'Village Land Act - Simplified Guide',
      description:
        'An easy-to-understand summary of the Village Land Act and its implications for rural communities.',
      publishedDate: '2023',
      category: 'Legal Guides',
      type: 'Guide',
      downloadLink: '/downloads/village-land-act-guide.pdf',
      fileSize: '1.2 MB',
      tags: ['Policy', 'Village Land', 'Legal'],
    },
    {
      id: 4,
      title: 'Land Conflict Resolution Manual',
      description:
        'Step-by-step procedures for resolving land disputes through mediation and legal channels.',
      publishedDate: '2024',
      category: 'Manuals',
      type: 'Document',
      downloadLink: '/downloads/conflict-resolution-manual.pdf',
      fileSize: '3.1 MB',
      tags: ['Conflict Resolution', 'Mediation', 'Legal'],
    },
    {
      id: 5,
      title: 'HakiArdhi Annual Report 2023',
      description:
        'Our comprehensive annual report highlighting achievements, challenges, and impact across all programs.',
      publishedDate: '2024',
      category: 'Reports',
      type: 'Report',
      downloadLink: '/downloads/annual-report-2023.pdf',
      fileSize: '5.4 MB',
      tags: ['Annual Report', 'Impact', 'Programs'],
    },
    {
      id: 6,
      title: 'Paralegal Training Materials',
      description:
        'Complete training curriculum for community paralegals on land rights and legal advocacy.',
      publishedDate: '2023',
      category: 'Training Materials',
      type: 'Document',
      downloadLink: '/downloads/paralegal-training.pdf',
      fileSize: '4.2 MB',
      tags: ['Training', 'Paralegal', 'Capacity Building'],
    },
  ];

  const categories = ['All', ...Array.from(new Set(resources.map(r => r.category)))];

  const filteredResources = resources.filter(
    (resource) => {
      const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (resource.tags && resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));

      const matchesCategory = selectedCategory === 'All' || resource.category === selectedCategory;

      return matchesSearch && matchesCategory;
    }
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('resource-center-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return (
    <section
      id="resource-center-section"
      className={`relative py-16 lg:py-24 overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(to bottom, #000000 0%, #1a1a1a 50%, #000000 100%)',
      }}
    >
      {/* Background decoration */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <div
          className={`text-center mb-10 lg:mb-12 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-3xl lg:text-5xl font-black text-white mb-4 lg:mb-6">
            Resource <span className="text-brand-500">Center</span>
          </h2>
          <p className="text-base lg:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed mb-6 lg:mb-8">
            Access our comprehensive collection of guides, toolkits, reports, and educational materials on land rights and advocacy.
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-6 lg:mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                    : 'bg-gray-800/50 text-gray-300 border border-brand-500/20 hover:border-brand-500/40 hover:bg-gray-800'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search resources by title, category, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 pl-12 bg-gray-900/50 border border-brand-500/20 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-brand-500/40 transition-all"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Resource List */}
        <div className="space-y-6 lg:space-y-8 max-w-5xl mx-auto">
          {filteredResources.map((resource, index) => (
            <div
              key={resource.id}
              className={`transition-all duration-1000 ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 200 + 400}ms` }}
            >
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-brand-500/20 hover:border-brand-500/40 transition-all duration-300">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 lg:gap-8">
                  {/* Content */}
                  <div className="flex-1">
                    {/* Category Badge and Type */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="px-3 py-1 text-xs font-bold bg-brand-500/20 text-brand-400 rounded-full border border-brand-500/30">
                        {resource.category}
                      </span>
                      <span className="px-3 py-1 text-xs font-bold bg-gray-700/50 text-gray-300 rounded-full border border-gray-600/30">
                        {resource.type}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-white mb-3 hover:text-brand-500 transition-colors">
                      {resource.title}
                    </h3>

                    <p className="text-gray-300 mb-4 leading-relaxed">{resource.description}</p>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>{resource.publishedDate}</span>
                      </div>
                      {resource.fileSize && (
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span>{resource.fileSize}</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {resource.tags && resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {resource.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 text-xs bg-gray-800/50 text-gray-400 rounded border border-gray-700/30"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Download Button */}
                  <div className="lg:flex-shrink-0">
                    <Button
                      href={resource.downloadLink}
                      variant="primary"
                      size="md"
                      icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      }
                      iconPosition="left"
                    >
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredResources.length === 0 && (
          <div className="text-center py-16">
            <svg
              className="w-16 h-16 text-gray-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-gray-400 text-lg">No resources found matching your search.</p>
          </div>
        )}
      </div>
    </section>
  );
}
