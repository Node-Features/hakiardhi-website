'use client';

import { useEffect, useState } from 'react';
import Button from '../ui/Button';

export interface PublicationsSectionProps {
  className?: string;
}

interface Publication {
  id: number;
  title: string;
  description: string;
  type: string;
  publishedDate: string;
  downloadLink: string;
  coverImage: string;
  tags: string[];
}

const PUBLICATION_TYPES = ['All', 'Reports', 'Policy Briefs', 'Newsletters', 'Case Studies', 'Toolkits'];

export default function PublicationsSection({ className = '' }: PublicationsSectionProps) {
  const [selectedType, setSelectedType] = useState('All');
  const [isVisible, setIsVisible] = useState(false);

  const publications: Publication[] = [
    {
      id: 1,
      title: 'Annual Report 2023: Land Rights in Tanzania',
      description:
        'Comprehensive overview of land rights developments, challenges, and achievements throughout 2023.',
      type: 'Reports',
      publishedDate: 'January 2024',
      downloadLink: '/downloads/annual-report-2023.pdf',
      coverImage: '/images/publications/report-2023.jpg',
      tags: ['Land Rights', 'Annual Report', 'Tanzania'],
    },
    {
      id: 2,
      title: 'Policy Brief: Strengthening Customary Land Tenure',
      description:
        'Recommendations for policy makers on protecting and strengthening customary land tenure systems.',
      type: 'Policy Briefs',
      publishedDate: 'November 2023',
      downloadLink: '/downloads/policy-brief-customary.pdf',
      coverImage: '/images/publications/policy-brief-1.jpg',
      tags: ['Policy', 'Customary Rights', 'Advocacy'],
    },
    {
      id: 3,
      title: 'HakiArdhi Newsletter - Q4 2023',
      description:
        'Latest updates on our programs, events, and impact stories from communities we serve.',
      type: 'Newsletters',
      publishedDate: 'December 2023',
      downloadLink: '/downloads/newsletter-q4-2023.pdf',
      coverImage: '/images/publications/newsletter-q4.jpg',
      tags: ['Newsletter', 'Updates', 'Community'],
    },
    {
      id: 4,
      title: 'Case Study: Community Land Rights in Morogoro',
      description:
        'Success story of community empowerment and land rights protection in Morogoro region.',
      type: 'Case Studies',
      publishedDate: 'October 2023',
      downloadLink: '/downloads/case-study-morogoro.pdf',
      coverImage: '/images/publications/case-study-1.jpg',
      tags: ['Case Study', 'Success Story', 'Morogoro'],
    },
    {
      id: 5,
      title: 'Toolkit: Understanding Your Land Rights',
      description:
        'Practical guide for communities to understand and exercise their land rights under Tanzanian law.',
      type: 'Toolkits',
      publishedDate: 'September 2023',
      downloadLink: '/downloads/toolkit-land-rights.pdf',
      coverImage: '/images/publications/toolkit-1.jpg',
      tags: ['Toolkit', 'Education', 'Legal Rights'],
    },
    {
      id: 6,
      title: 'Women and Land Rights Fact Sheet',
      description:
        'Key statistics and information on women land ownership and access in Tanzania.',
      type: 'Policy Briefs',
      publishedDate: 'August 2023',
      downloadLink: '/downloads/fact-sheet-women.pdf',
      coverImage: '/images/publications/fact-sheet-1.jpg',
      tags: ['Gender', 'Statistics', 'Fact Sheet'],
    },
  ];

  const filteredPublications =
    selectedType === 'All'
      ? publications
      : publications.filter((pub) => pub.type === selectedType);

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

    const element = document.getElementById('publications-section');
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
      id="publications-section"
      className={`relative py-16 lg:py-24 overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(to bottom, #000000 0%, #0a0a0a 100%)',
      }}
    >
      {/* Background decoration */}
      <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <div
          className={`text-center mb-10 lg:mb-12 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-3xl lg:text-5xl font-black text-white mb-4 lg:mb-6">
            Our <span className="text-brand-500">Publications</span>
          </h2>
          <p className="text-base lg:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Access our comprehensive library of reports, policy briefs, toolkits, and resources
            supporting land rights advocacy and community empowerment.
          </p>
        </div>

        {/* Type Filter */}
        <div
          className={`flex flex-wrap justify-center gap-3 mb-10 transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {PUBLICATION_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 ${
                selectedType === type
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/50 scale-105'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700 hover:scale-105'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Publications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredPublications.map((publication, index) => (
            <div
              key={publication.id}
              className={`group transition-all duration-1000 ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${(index % 3) * 100 + 400}ms` }}
            >
              <div className="h-full bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm rounded-2xl overflow-hidden border border-brand-500/20 hover:border-brand-500/40 transition-all duration-300 hover:scale-105 flex flex-col">
                {/* Cover Image */}
                <div className="relative h-48 overflow-hidden bg-gray-800">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 to-brand-500/5 flex items-center justify-center">
                    <svg
                      className="w-20 h-20 text-brand-500/30"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  {/* Type Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 text-xs font-bold bg-brand-500 text-white rounded-full">
                      {publication.type}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="mb-3">
                    <p className="text-xs text-gray-400 flex items-center gap-2">
                      <svg
                        className="w-3 h-3"
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
                      {publication.publishedDate}
                    </p>
                  </div>

                  <h3 className="text-lg font-black text-white mb-3 group-hover:text-brand-500 transition-colors line-clamp-2">
                    {publication.title}
                  </h3>

                  <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">
                    {publication.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4 mt-auto">
                    {publication.tags.slice(0, 2).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 text-xs bg-gray-800/50 text-gray-400 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Download Button */}
                  <a
                    href={publication.downloadLink}
                    className="inline-flex items-center gap-2 text-brand-500 font-semibold text-sm hover:gap-3 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Download PDF
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPublications.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No publications found in this category.</p>
          </div>
        )}

        {/* Newsletter Signup CTA */}
        <div
          className={`mt-12 lg:mt-16 transition-all duration-1000 delay-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="bg-gradient-to-br from-brand-500/20 to-brand-500/5 backdrop-blur-sm rounded-2xl p-8 lg:p-12 border border-brand-500/20 text-center max-w-3xl mx-auto">
            <h3 className="text-2xl lg:text-3xl font-black text-white mb-3 lg:mb-4">
              Stay Updated
            </h3>
            <p className="text-gray-300 mb-8">
              Subscribe to our newsletter to receive the latest publications, research findings, and
              updates on land rights in Tanzania.
            </p>
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              Subscribe to Newsletter
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
