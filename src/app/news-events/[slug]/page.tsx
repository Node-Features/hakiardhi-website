import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { newsEvents } from '@/data/newsEvents';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ShareSection from '@/components/ui/ShareSection';
import Footer from '@/components/layout/Footer';
import { SPACING } from '@/constants/design-tokens';

interface NewsEventDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function NewsEventDetailPage({ params }: NewsEventDetailPageProps) {
  const { slug } = await params;
  const newsEvent = newsEvents.find((item) => item.slug === slug);

  if (!newsEvent) {
    notFound();
  }

  // Get related items (same type, exclude current)
  const relatedItems = newsEvents
    .filter((item) => item.type === newsEvent.type && item.id !== newsEvent.id)
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section with Background Image */}
      <section className="relative h-[60vh] min-h-[500px] flex items-end">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={newsEvent.image}
            alt={newsEvent.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
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
                <span className="text-white">{newsEvent.title}</span>
              </nav>
            </div>

            {/* Type and Category Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge
                variant={
                  newsEvent.type === 'News'
                    ? 'primary'
                    : newsEvent.type === 'Event'
                    ? 'warning'
                    : 'info'
                }
                size="lg"
              >
                {newsEvent.type}
              </Badge>
              <Badge variant="secondary" size="lg">
                {newsEvent.category}
              </Badge>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
              {newsEvent.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-gray-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="font-medium">
                  {new Date(newsEvent.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              {newsEvent.location && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="font-medium">{newsEvent.location}</span>
                </div>
              )}
              {newsEvent.author && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="font-medium">{newsEvent.author}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Summary Section */}
            <section>
              <h2 className="text-3xl font-black text-gray-900 mb-6">Overview</h2>
              <p className="text-lg text-gray-700 leading-relaxed font-medium bg-gray-50 p-6 rounded-2xl border-l-4 border-hakiardhi-red">
                {newsEvent.excerpt}
              </p>
            </section>

            {/* Full Content Section */}
            <section>
              <h2 className="text-3xl font-black text-gray-900 mb-6">Full Story</h2>
              <div className="prose prose-lg max-w-none">
                {newsEvent.fullDescription.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-gray-700 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>

            {/* Photo Gallery Section */}
            {newsEvent.gallery && newsEvent.gallery.length > 0 && (
              <section>
                <h2 className="text-3xl font-black text-gray-900 mb-6">Photo Gallery</h2>
                <div className="grid grid-cols-2 gap-4">
                  {newsEvent.gallery.map((image, index) => (
                    <div
                      key={index}
                      className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer"
                    >
                      <Image
                        src={image}
                        alt={`${newsEvent.title} - Image ${index + 1}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Related Links Section */}
            {newsEvent.relatedLinks && newsEvent.relatedLinks.length > 0 && (
              <section>
                <h2 className="text-3xl font-black text-gray-900 mb-6">Related Resources</h2>
                <div className="space-y-3">
                  {newsEvent.relatedLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-hakiardhi-red/5 border-2 border-transparent hover:border-hakiardhi-red transition-all duration-300 group"
                    >
                      <svg
                        className="w-5 h-5 text-hakiardhi-red flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                      <span className="text-gray-700 font-medium group-hover:text-hakiardhi-red">
                        {link.title}
                      </span>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Quick Info Card */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-xl font-black text-gray-900 mb-4">Quick Info</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-hakiardhi-red flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                  <div>
                    <div className="text-sm font-semibold text-gray-500">Type</div>
                    <div className="text-gray-900 font-bold">{newsEvent.type}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-hakiardhi-red flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                  <div>
                    <div className="text-sm font-semibold text-gray-500">Category</div>
                    <div className="text-gray-900 font-bold">{newsEvent.category}</div>
                  </div>
                </div>
                {newsEvent.author && (
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-hakiardhi-red flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <div className="text-sm font-semibold text-gray-500">Author</div>
                      <div className="text-gray-900 font-bold">{newsEvent.author}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-br from-hakiardhi-red to-hakiardhi-red-dark rounded-2xl p-6 text-white">
              <h3 className="text-xl font-black mb-3">Stay Informed</h3>
              <p className="mb-6 text-sm leading-relaxed opacity-90">
                Subscribe to our newsletter for the latest updates on land rights advocacy in Tanzania.
              </p>
              <div className="space-y-3">
                <Button href="/news-events" variant="secondary" className="w-full bg-white !text-red-600 hover:bg-gray-100 border-0">
                  View All Updates
                </Button>
                <Button href="/contact" variant="tertiary" className="w-full !bg-black text-white hover:text-gray-200">
                  Contact Us
                </Button>
              </div>
            </div>

            {/* Share Section */}
            <ShareSection title={newsEvent.title} description={newsEvent.excerpt} />
          </div>
        </div>
      </div>

      {/* Related Items Section */}
      {relatedItems.length > 0 && (
        <section className="bg-gray-50 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
                Related {newsEvent.type === 'News' ? 'News' : newsEvent.type === 'Event' ? 'Events' : 'Updates'}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explore more {newsEvent.type.toLowerCase()}s and updates
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {relatedItems.map((relatedItem) => (
                <Link
                  key={relatedItem.id}
                  href={`/news-events/${relatedItem.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative h-48">
                    <Image
                      src={relatedItem.image}
                      alt={relatedItem.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <Badge
                        variant={
                          relatedItem.type === 'News'
                            ? 'primary'
                            : relatedItem.type === 'Event'
                            ? 'warning'
                            : 'info'
                        }
                      >
                        {relatedItem.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-2">
                      <span className="text-xs font-semibold text-hakiardhi-red">
                        {relatedItem.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-hakiardhi-red transition-colors">
                      {relatedItem.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{relatedItem.excerpt}</p>
                    <div className="flex items-center text-hakiardhi-red font-bold text-sm group-hover:gap-2 transition-all">
                      <span>Read More</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button href="/news-events" variant="secondary" size="lg">
                View All News & Events
              </Button>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
