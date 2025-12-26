'use client';

import { useEffect, useState } from 'react';
import Button from '../ui/Button';

export interface ResearchesSectionProps {
  className?: string;
}

interface Research {
  id: number;
  title: string;
  abstract: string;
  publishedDate: string;
  authors: string[];
  keyFindings: string[];
  category: string;
  downloadLink: string;
}

export default function ResearchesSection({ className = '' }: ResearchesSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const researches: Research[] = [
    {
      id: 1,
      title: 'Land Tenure Systems in Rural Tanzania: A Comprehensive Study',
      abstract:
        'An extensive analysis of traditional and modern land tenure systems in rural Tanzania, examining their impact on small-scale producers and community development.',
      publishedDate: '2024',
      authors: ['Dr. J. Mwesigwa', 'Dr. A. Kamara'],
      keyFindings: [
        'Indigenous land management systems remain vital',
        'Need for policy reforms to protect customary rights',
        'Gender disparities in land ownership persist',
      ],
      category: 'Land Tenure',
      downloadLink: '/downloads/research-1.pdf',
    },
    {
      id: 2,
      title: 'Impact of Land Reforms on Small Producers',
      abstract:
        'This research explores the effects of recent land reforms on the livelihoods of small-scale producers in peri-urban areas of Tanzania.',
      publishedDate: '2023',
      authors: ['Prof. M. Ndimbo', 'R. Masanja'],
      keyFindings: [
        'Mixed outcomes from recent policy changes',
        'Increased land insecurity in peri-urban zones',
        'Need for inclusive policy formulation',
      ],
      category: 'Policy Analysis',
      downloadLink: '/downloads/research-2.pdf',
    },
    {
      id: 3,
      title: 'Women and Land Rights: Challenges and Opportunities',
      abstract:
        'A focused study on the barriers women face in accessing and owning land, and pathways to achieving gender equity in land tenure.',
      publishedDate: '2023',
      authors: ['Dr. F. Mollel', 'A. Hussein'],
      keyFindings: [
        'Cultural norms limit women land ownership',
        'Legal frameworks exist but enforcement is weak',
        'Community education shows promising results',
      ],
      category: 'Gender & Land',
      downloadLink: '/downloads/research-3.pdf',
    },
  ];

  const filteredResearches = researches.filter(
    (research) =>
      research.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      research.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
      research.category.toLowerCase().includes(searchTerm.toLowerCase())
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

    const element = document.getElementById('researches-section');
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
      id="researches-section"
      className={`relative py-16 lg:py-24 overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(to bottom, #000000 0%, #1a1a1a 50%, #000000 100%)',
      }}
    >
      {/* Background decoration */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <div
          className={`text-center mb-10 lg:mb-12 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-3xl lg:text-5xl font-black text-white mb-4 lg:mb-6">
            Our <span className="text-brand-500">Research</span>
          </h2>
          <p className="text-base lg:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed mb-6 lg:mb-8">
            Evidence-based research driving policy change and supporting communities in their
            struggle for land rights.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search research by title, topic, or category..."
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

        {/* Research List */}
        <div className="space-y-6 lg:space-y-8 max-w-5xl mx-auto">
          {filteredResearches.map((research, index) => (
            <div
              key={research.id}
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
                    {/* Category Badge */}
                    <div className="mb-3">
                      <span className="px-3 py-1 text-xs font-bold bg-brand-500/20 text-brand-400 rounded-full border border-brand-500/30">
                        {research.category}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-white mb-3 hover:text-brand-500 transition-colors">
                      {research.title}
                    </h3>

                    <p className="text-gray-300 mb-4 leading-relaxed">{research.abstract}</p>

                    {/* Authors and Date */}
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
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                        <span>{research.authors.join(', ')}</span>
                      </div>
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
                        <span>{research.publishedDate}</span>
                      </div>
                    </div>

                    {/* Key Findings */}
                    <div>
                      <h4 className="text-sm font-bold text-brand-400 mb-2">Key Findings:</h4>
                      <ul className="space-y-2">
                        {research.keyFindings.map((finding, findingIndex) => (
                          <li key={findingIndex} className="flex items-start gap-2">
                            <svg
                              className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-gray-300 text-sm">{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Download Button */}
                  <div className="lg:flex-shrink-0">
                    <Button
                      href={research.downloadLink}
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
        {filteredResearches.length === 0 && (
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
            <p className="text-gray-400 text-lg">No research found matching your search.</p>
          </div>
        )}
      </div>
    </section>
  );
}
