'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/Icon';
import ShareSection from '@/components/ui/ShareSection';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { fetchNewsBySlug, fetchNews, NewsItem } from '@/lib/api/services/news';

// Allowed image hostnames (must match next.config.ts)
const ALLOWED_IMAGE_HOSTS = [
  'hakiardhi-api.vercel.app',
  'tjsatamyfjxdxqgxmcuq.supabase.co',
];

// Check if image URL is from an allowed host
const isAllowedImageHost = (url: string | null): boolean => {
  if (!url) return false;
  try {
    const hostname = new URL(url).hostname;
    return ALLOWED_IMAGE_HOSTS.some(host => hostname.includes(host));
  } catch {
    return false;
  }
};

// Skeleton for news detail page
function NewsDetailSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Hero Skeleton */}
      <section className="relative h-[50vh] min-h-[400px] flex items-end">
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-300 via-zinc-200 to-zinc-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />
        <div className="relative z-10 w-full">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
            <div className="h-4 w-48 bg-zinc-500 rounded mb-6"></div>
            <div className="flex gap-3 mb-4">
              <div className="h-8 w-24 bg-zinc-400 rounded-full"></div>
              <div className="h-8 w-20 bg-zinc-400 rounded-full"></div>
            </div>
            <div className="h-12 w-3/4 bg-zinc-400 rounded mb-4"></div>
            <div className="flex gap-6">
              <div className="h-5 w-32 bg-zinc-500 rounded"></div>
              <div className="h-5 w-40 bg-zinc-500 rounded"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Skeleton */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Excerpt skeleton */}
        <div className="mb-8 border-l-4 border-zinc-200 pl-6">
          <div className="h-6 bg-zinc-100 rounded w-full mb-2"></div>
          <div className="h-6 bg-zinc-100 rounded w-3/4"></div>
        </div>

        {/* Content skeleton */}
        <div className="space-y-4 mb-12">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-4 bg-zinc-100 rounded w-full"></div>
          ))}
          <div className="h-4 bg-zinc-100 rounded w-3/4"></div>
          <div className="h-4 bg-zinc-100 rounded w-5/6"></div>
        </div>

        {/* Gallery skeleton */}
        <div className="mb-8">
          <div className="h-8 w-40 bg-zinc-200 rounded mb-6"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-zinc-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Related card skeleton
function RelatedCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse">
      <div className="h-48 bg-zinc-200"></div>
      <div className="p-6 space-y-3">
        <div className="h-3 w-16 bg-zinc-200 rounded"></div>
        <div className="h-6 bg-zinc-200 rounded w-full"></div>
        <div className="h-4 bg-zinc-100 rounded w-5/6"></div>
        <div className="h-4 bg-zinc-100 rounded w-4/6"></div>
      </div>
    </div>
  );
}

interface NewsDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = use(params);
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [relatedItems, setRelatedItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRelatedLoading, setIsRelatedLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load news item
  useEffect(() => {
    async function loadNewsItem() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchNewsBySlug(slug);
        if (data) {
          setNewsItem(data);
        } else {
          setError('News item not found');
        }
      } catch (err) {
        console.error('Error loading news item:', err);
        setError('Failed to load news item. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    loadNewsItem();
  }, [slug]);

  // Load related items when news item is loaded
  useEffect(() => {
    async function loadRelatedItems() {
      if (!newsItem) return;

      setIsRelatedLoading(true);
      try {
        const response = await fetchNews({
          type: newsItem.type,
          limit: 4,
        });
        // Filter out current item and limit to 3
        const filtered = response.items
          .filter(item => item.id !== newsItem.id)
          .slice(0, 3);
        setRelatedItems(filtered);
      } catch (err) {
        console.error('Error loading related items:', err);
      } finally {
        setIsRelatedLoading(false);
      }
    }

    loadRelatedItems();
  }, [newsItem]);

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Check if URL has valid image
  const hasValidImage = (url: string | null) => {
    return isAllowedImageHost(url);
  };

  // Get badge variant based on type
  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'Event':
        return 'info';
      case 'Announcement':
        return 'warning';
      case 'Update':
        return 'success';
      default:
        return 'primary';
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="pt-20">
          <NewsDetailSkeleton />
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !newsItem) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="pt-44 pb-20">
          <div className="max-w-2xl mx-auto text-center px-4">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <Icon name="alert-circle" size="xl" className="text-red-500" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-4">
              {error === 'News item not found' ? 'Article Not Found' : 'Error Loading Article'}
            </h1>
            <p className="text-lg text-gray-500 mb-8">
              {error || 'The article you are looking for could not be found.'}
            </p>
            <Button variant="primary" size="lg" href="/news-events">
              <Icon name="arrow-left" size="sm" className="mr-2" />
              Back to News & Events
            </Button>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Hero Section with Background Image */}
      <section className="relative h-[50vh] min-h-[400px] flex items-end pt-20">
        {/* Background Image */}
        <div className="absolute inset-0">
          {hasValidImage(newsItem.cover_image) ? (
            <Image
              src={newsItem.cover_image!}
              alt={newsItem.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-hakiardhi-red via-hakiardhi-red-dark to-black flex items-center justify-center">
              <Icon name="newspaper" size="xl" className="text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
            {/* Breadcrumb */}
            <div className="mb-6">
              <nav className="flex items-center gap-2 text-sm text-gray-300">
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
                <span>/</span>
                <Link href="/news-events" className="hover:text-white transition-colors">
                  News & Events
                </Link>
                <span>/</span>
                <span className="text-white truncate max-w-[200px]">{newsItem.title}</span>
              </nav>
            </div>

            {/* Type and Category Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge variant={getTypeBadgeVariant(newsItem.type)} size="lg">
                {newsItem.type}
              </Badge>
              {newsItem.category && (
                <Badge variant="secondary" size="lg" className="bg-white/20 text-white">
                  {newsItem.category}
                </Badge>
              )}
              {newsItem.is_featured && (
                <Badge variant="warning" size="lg">
                  Featured
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
              {newsItem.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-gray-200">
              <div className="flex items-center gap-2">
                <Icon name="clock" size="sm" />
                <span className="font-medium">{formatDate(newsItem.date)}</span>
              </div>
              {newsItem.event_location && (
                <div className="flex items-center gap-2">
                  <Icon name="globe" size="sm" />
                  <span className="font-medium">{newsItem.event_location}</span>
                </div>
              )}
              {newsItem.author_name && newsItem.author_name.trim() && (
                <div className="flex items-center gap-2">
                  <Icon name="user" size="sm" />
                  <span className="font-medium">{newsItem.author_name}</span>
                </div>
              )}
              {newsItem.views_count > 0 && (
                <div className="flex items-center gap-2">
                  <Icon name="eye" size="sm" />
                  <span className="font-medium">{newsItem.views_count} views</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Event Details Card (for Event type) */}
        {newsItem.type === 'Event' && newsItem.event_date && (
          <div className="bg-gradient-to-r from-hakiardhi-red/5 to-red-50 rounded-2xl p-6 mb-10 border-l-4 border-hakiardhi-red">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icon name="calendar" size="md" className="text-hakiardhi-red" />
              Event Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-hakiardhi-red/10 rounded-lg flex items-center justify-center">
                  <Icon name="clock" size="sm" className="text-hakiardhi-red" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(newsItem.event_date)}</p>
                </div>
              </div>
              {newsItem.event_location && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-hakiardhi-red/10 rounded-lg flex items-center justify-center">
                    <Icon name="globe" size="sm" className="text-hakiardhi-red" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-semibold text-gray-900">{newsItem.event_location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Excerpt/Summary */}
        {newsItem.excerpt && (
          <div className="mb-8">
            <p className="text-xl text-gray-700 leading-relaxed font-medium border-l-4 border-hakiardhi-red pl-6 py-2">
              {newsItem.excerpt}
            </p>
          </div>
        )}

        {/* Main Content */}
        <div className="prose prose-lg max-w-none mb-12">
          <div
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: newsItem.content || '<p>No content available.</p>' }}
          />
        </div>

        {/* Tags */}
        {newsItem.tags && newsItem.tags.length > 0 && (
          <div className="mb-10">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {newsItem.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-hakiardhi-red/10 hover:text-hakiardhi-red transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Photo Gallery */}
        {(() => {
          const validGalleryImages = (newsItem.gallery || []).filter(isAllowedImageHost);
          return validGalleryImages.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Photo Gallery</h2>
              <div className={`grid gap-4 ${
                validGalleryImages.length === 1 ? 'grid-cols-1' :
                validGalleryImages.length === 2 ? 'grid-cols-2' :
                validGalleryImages.length === 3 ? 'grid-cols-3' :
                'grid-cols-2 md:grid-cols-3'
              }`}>
                {validGalleryImages.map((image, index) => (
                  <div
                    key={index}
                    className={`relative rounded-2xl overflow-hidden group cursor-pointer ${
                      validGalleryImages.length === 1 ? 'h-80' : 'h-48 md:h-64'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${newsItem.title} - Image ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  </div>
                ))}
              </div>
            </section>
          );
        })()}

        {/* Related Links */}
        {newsItem.related_links && newsItem.related_links.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Related Links</h2>
            <div className="space-y-3">
              {newsItem.related_links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-hakiardhi-red/5 transition-colors group"
                >
                  <div className="w-10 h-10 bg-hakiardhi-red/10 rounded-lg flex items-center justify-center group-hover:bg-hakiardhi-red/20 transition-colors">
                    <Icon name="link" size="sm" className="text-hakiardhi-red" />
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-hakiardhi-red transition-colors">
                    {link.title}
                  </span>
                  <Icon name="arrow-right" size="sm" className="ml-auto text-gray-400 group-hover:text-hakiardhi-red transition-colors" />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Share and Actions */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Share Section */}
            <ShareSection
              title={newsItem.title}
              description={newsItem.excerpt || ''}
            />

            {/* Back Button */}
            <Button variant="secondary" size="lg" href="/news-events">
              <Icon name="arrow-left" size="sm" className="mr-2" />
              Back to News & Events
            </Button>
          </div>
        </div>
      </div>

      {/* Related Items Section */}
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              Related {newsItem.type === 'News' ? 'News' : newsItem.type === 'Event' ? 'Events' : 'Updates'}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore more {newsItem.type.toLowerCase()}s and updates
            </p>
          </div>

          {isRelatedLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[1, 2, 3].map((i) => (
                <RelatedCardSkeleton key={i} />
              ))}
            </div>
          ) : relatedItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {relatedItems.map((relatedItem) => (
                <Link
                  key={relatedItem.id}
                  href={`/news-events/${relatedItem.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative h-48">
                    {hasValidImage(relatedItem.cover_image) ? (
                      <Image
                        src={relatedItem.cover_image!}
                        alt={relatedItem.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <Icon name="newspaper" size="xl" className="text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <Badge variant={getTypeBadgeVariant(relatedItem.type)}>
                        {relatedItem.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-6">
                    {relatedItem.category && (
                      <div className="mb-2">
                        <span className="text-xs font-semibold text-hakiardhi-red">
                          {relatedItem.category}
                        </span>
                      </div>
                    )}
                    <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-hakiardhi-red transition-colors line-clamp-2">
                      {relatedItem.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {relatedItem.excerpt || 'No description available'}
                    </p>
                    <div className="flex items-center text-hakiardhi-red font-bold text-sm group-hover:gap-2 transition-all">
                      <span>Read More</span>
                      <Icon name="arrow-right" size="sm" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No related items found
            </div>
          )}

          <div className="text-center mt-12">
            <Button href="/news-events" variant="secondary" size="lg">
              View All News & Events
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-hakiardhi-red to-hakiardhi-red-dark py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Stay Updated</h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter to receive the latest news, event announcements,
            and updates on land rights advocacy in Tanzania.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="secondary"
              size="lg"
              href="/contact"
              className="!bg-white !text-hakiardhi-red hover:!bg-gray-100"
            >
              Subscribe to Newsletter
            </Button>
            <Button
              variant="tertiary"
              size="lg"
              href="/news-events"
              className="!border-white !text-white hover:!bg-white/10"
            >
              View All Updates
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
