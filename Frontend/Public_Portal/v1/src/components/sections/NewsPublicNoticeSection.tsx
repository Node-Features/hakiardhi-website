'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { NewsGridSkeleton } from '../ui/NewsCardSkeleton';
import { fetchNews, NewsItem } from '@/lib/api/services/news';

export interface NewsPublicNoticeSectionProps {
  limit?: number;
  className?: string;
}

/**
 * Check if image URL is safe to use with Next.js Image
 * Only allows local paths and configured remote domains
 */
function getSafeImageUrl(url: string | null): string {
  if (!url) return '/images/placeholder-news.jpg';

  // Local images are safe
  if (url.startsWith('/')) return url;

  // Check for allowed domains
  const allowedDomains = [
    'hakiardhi-api.vercel.app',
    'tjsatamyfjxdxqgxmcuq.supabase.co',
  ];

  try {
    const urlObj = new URL(url);
    if (allowedDomains.some(domain => urlObj.hostname.includes(domain))) {
      return url;
    }
  } catch {
    // Invalid URL
  }

  return '/images/placeholder-news.jpg';
}

export default function NewsPublicNoticeSection({ limit = 3, className = '' }: NewsPublicNoticeSectionProps) {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  // Fetch news from API
  useEffect(() => {
    async function loadNews() {
      try {
        setIsLoading(true);
        const response = await fetchNews({ limit });
        setNewsItems(response.items);
      } catch (error) {
        console.error('Failed to load news:', error);
        setNewsItems([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadNews();
  }, [limit]);

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

    const element = document.getElementById('news-section');
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
      id="news-section"
      className={`relative py-16 lg:py-20 bg-gray-50 overflow-hidden ${className}`}
    >
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-gradient-to-br from-orange-500/10 to-brand-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-brand-500/10 to-success-500/10 rounded-full blur-3xl"></div>

      {/* Header Container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div
          className={`text-center mb-12 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-hakiardhi-red/10 rounded-full mb-6">
            <Icon name="newspaper" size="sm" className="text-hakiardhi-red" />
            <span className="text-sm font-bold text-hakiardhi-red uppercase tracking-wide">
              Latest Updates
            </span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-3">
            News & <span className="text-hakiardhi-red">Updates</span>
          </h2>
          <p className="text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
            Stay informed about our latest activities and announcements
          </p>
        </div>

      </div>

      {/* News Grid - Full Width Cards without container */}
      <div className="relative z-10 py-8 lg:py-12 px-4 sm:px-6 lg:px-8 mb-12">
        {isLoading ? (
          <NewsGridSkeleton count={limit} />
        ) : newsItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
            {newsItems.map((item, index) => (
              <div
                key={item.id}
                className={`transition-all duration-1000 flex ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 150 + 400}ms` }}
              >
                <Link href={`/news-events/${item.slug}`} className="w-full">
                  <Card variant="elevated" hoverEffect="lift" className="w-full flex flex-col group transition-all duration-300 cursor-pointer h-full">
                    <Card.Media className="h-48 relative overflow-hidden flex-shrink-0">
                      <Image
                        src={getSafeImageUrl(item.cover_image)}
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
                      {item.category && (
                        <div className="mb-2">
                          <span className="text-xs font-semibold text-hakiardhi-red">{item.category}</span>
                        </div>
                      )}

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
                          {item.event_location && (
                            <div className="flex items-center gap-2">
                              <Icon name="map-pin" size="sm" className="text-hakiardhi-red flex-shrink-0" />
                              <span className="text-xs text-gray-600 leading-tight">{item.event_location}</span>
                            </div>
                          )}
                          {item.author_name && (
                            <div className="flex items-center gap-2">
                              <Icon name="user" size="sm" className="text-hakiardhi-red flex-shrink-0" />
                              <span className="text-xs text-gray-600 leading-tight">{item.author_name}</span>
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
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No news available at the moment.</p>
          </div>
        )}
      </div>

      {/* View All Link - In Container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <Button variant="primary" size="lg" href="/news-events" icon={<Icon name="arrow-right" size="sm" />}>
            View All News & Updates
          </Button>
        </div>
      </div>
    </section>
  );
}
