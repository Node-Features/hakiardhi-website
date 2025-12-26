'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { newsEvents } from '@/data/newsEvents';

export interface NewsPublicNoticeSectionProps {
  className?: string;
}

const NEWS_TYPES = ['All', 'News', 'Event', 'Announcement'];

export default function NewsPublicNoticeSection({ className = '' }: NewsPublicNoticeSectionProps) {
  const [selectedType, setSelectedType] = useState('All');
  const [isVisible, setIsVisible] = useState(false);

  // Get first 3 items for landing page
  const newsItems = newsEvents.slice(0, 3);

  const filteredNews =
    selectedType === 'All'
      ? newsItems
      : newsItems.filter((item) => item.type === selectedType);

  // Get type count
  const getTypeCount = (type: string) => {
    if (type === 'All') return newsItems.length;
    return newsItems.filter(item => item.type === type).length;
  };

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

        {/* Type Filter Tabs - Minimal for landing page */}
        <div
          className={`flex flex-wrap justify-center gap-3 mb-8 transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {NEWS_TYPES.map((type) => {
            const count = getTypeCount(type);
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
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

        {/* News Grid - Professional Cards */}
        <div className="bg-gradient-to-br from-zinc-50 via-gray-50 to-zinc-100/50 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-inner border border-zinc-200/50 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
            {filteredNews.map((item, index) => (
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
                              <Icon name="map-pin" size="sm" className="text-hakiardhi-red flex-shrink-0" />
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
        </div>

        {/* View All Link */}
        <div className="text-center">
          <Button variant="primary" size="lg" href="/news-events" icon={<Icon name="arrow-right" size="sm" />}>
            View All News & Updates
          </Button>
        </div>
      </div>
    </section>
  );
}
