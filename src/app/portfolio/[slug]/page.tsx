import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { portfolioItems } from '@/data/portfolio';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/Icon';
import ShareSection from '@/components/ui/ShareSection';
import Footer from '@/components/layout/Footer';

interface PortfolioCaseStudyPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PortfolioCaseStudyPage({ params }: PortfolioCaseStudyPageProps) {
  const { slug } = await params;
  const portfolio = portfolioItems.find((item) => item.slug === slug);

  if (!portfolio) {
    notFound();
  }

  // Get related items (same category, exclude current)
  const relatedItems = portfolioItems
    .filter((item) => item.category === portfolio.category && item.id !== portfolio.id)
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section with Impact Image */}
      <section className="relative h-[70vh] min-h-[600px] flex items-end">
        <div className="absolute inset-0">
          <Image
            src={portfolio.image}
            alt={portfolio.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/50" />
        </div>

        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
            {/* Breadcrumb */}
            <div className="mb-6">
              <nav className="flex items-center gap-2 text-sm text-gray-300">
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
                <span>/</span>
                <Link href="/portfolio" className="hover:text-white transition-colors">
                  Portfolio
                </Link>
                <span>/</span>
                <span className="text-white">{portfolio.title}</span>
              </nav>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Badge variant="warning" size="lg">
                {portfolio.type}
              </Badge>
              <Badge variant="primary" size="lg">
                {portfolio.category}
              </Badge>
            </div>

            {/* Title & Subtitle */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight max-w-4xl">
              {portfolio.title}
            </h1>
            <p className="text-xl sm:text-2xl text-gray-200 font-medium max-w-3xl">
              {portfolio.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Key Impact Metrics Banner */}
      {portfolio.impactMetrics && portfolio.impactMetrics.length > 0 && (
        <section className="bg-hakiardhi-red text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {portfolio.impactMetrics.map((metric, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2">
                    {metric.value}
                  </div>
                  <div className="text-sm sm:text-base font-bold opacity-90">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Story & Content */}
          <div className="lg:col-span-2 space-y-16">
            {/* Overview */}
            <section>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl border-l-4 border-hakiardhi-red">
                <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                  <Icon name="target" size="md" className="text-hakiardhi-red" />
                  Executive Summary
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {portfolio.description}
                </p>
              </div>
            </section>

            {/* The Challenge */}
            {portfolio.challenge && (
              <section>
                <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <Icon name="alert-circle" size="lg" className="text-hakiardhi-red" />
                  </div>
                  The Challenge
                </h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {portfolio.challenge}
                  </p>
                </div>
              </section>
            )}

            {/* Our Approach */}
            {portfolio.approach && (
              <section>
                <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Icon name="shield-check" size="lg" className="text-blue-600" />
                  </div>
                  Our Approach
                </h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {portfolio.approach}
                  </p>
                </div>
              </section>
            )}

            {/* Timeline / Journey */}
            {portfolio.timeline && portfolio.timeline.length > 0 && (
              <section>
                <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Icon name="clock" size="lg" className="text-purple-600" />
                  </div>
                  Project Journey
                </h2>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-hakiardhi-red/30"></div>

                  <div className="space-y-8">
                    {portfolio.timeline.map((milestone, index) => (
                      <div key={index} className="relative pl-16">
                        {/* Timeline dot */}
                        <div className="absolute left-3 top-1 w-6 h-6 bg-hakiardhi-red rounded-full border-4 border-white shadow-lg"></div>

                        <div className="bg-white p-6 rounded-xl shadow-md border-2 border-gray-100 hover:border-hakiardhi-red transition-all duration-300">
                          <div className="text-sm font-bold text-hakiardhi-red mb-2">
                            {milestone.date}
                          </div>
                          <h3 className="text-xl font-black text-gray-900 mb-2">
                            {milestone.milestone}
                          </h3>
                          <p className="text-gray-700 leading-relaxed">
                            {milestone.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Testimonials */}
            {portfolio.testimonials && portfolio.testimonials.length > 0 && (
              <section>
                <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Icon name="quote" size="lg" className="text-green-600" />
                  </div>
                  Voices of Impact
                </h2>
                <div className="space-y-6">
                  {portfolio.testimonials.map((testimonial, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg border-l-4 border-hakiardhi-red"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <Icon name="quote" size="xl" className="text-hakiardhi-red/20 flex-shrink-0" />
                        <p className="text-lg text-gray-700 leading-relaxed italic">
                          &ldquo;{testimonial.quote}&rdquo;
                        </p>
                      </div>
                      <div className="flex items-center gap-3 pl-16">
                        <div>
                          <div className="font-black text-gray-900">{testimonial.name}</div>
                          <div className="text-sm text-gray-600">{testimonial.role}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Impact Metrics Detail */}
            {portfolio.impactMetrics && portfolio.impactMetrics.length > 0 && (
              <section>
                <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Icon name="target" size="lg" className="text-yellow-600" />
                  </div>
                  Measurable Impact
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {portfolio.impactMetrics.map((metric, index) => (
                    <div
                      key={index}
                      className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-100 hover:border-hakiardhi-red transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-hakiardhi-red/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Icon name={metric.icon as any || "check-circle"} size="lg" className="text-hakiardhi-red" />
                        </div>
                        <div>
                          <div className="text-3xl font-black text-hakiardhi-red mb-1">
                            {metric.value}
                          </div>
                          <div className="text-sm font-bold text-gray-900 mb-2">
                            {metric.label}
                          </div>
                          <div className="text-sm text-gray-600 leading-relaxed">
                            {metric.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Photo Gallery */}
            {portfolio.gallery && portfolio.gallery.length > 0 && (
              <section>
                <h2 className="text-3xl font-black text-gray-900 mb-8">Visual Story</h2>
                <div className="grid grid-cols-2 gap-4">
                  {portfolio.gallery.map((image, index) => (
                    <div
                      key={index}
                      className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer shadow-lg"
                    >
                      <Image
                        src={image}
                        alt={`${portfolio.title} - Image ${index + 1}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Funding Transparency */}
            {portfolio.fundingBreakdown && portfolio.fundingBreakdown.length > 0 && (
              <section className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl">
                <h2 className="text-3xl font-black text-gray-900 mb-4 flex items-center gap-3">
                  <Icon name="briefcase" size="lg" className="text-blue-600" />
                  Financial Transparency
                </h2>
                <p className="text-gray-600 mb-6">
                  Total Project Budget: <span className="text-2xl font-black text-gray-900">{portfolio.totalBudget}</span>
                </p>
                <div className="space-y-4">
                  {portfolio.fundingBreakdown.map((item, index) => (
                    <div key={index} className="bg-white p-4 rounded-xl shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-gray-900">{item.category}</span>
                        <span className="text-lg font-black text-hakiardhi-red">{item.amount}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-hakiardhi-red to-red-600 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {item.percentage}% of total budget
                      </div>
                    </div>
                  ))}
                </div>

                {portfolio.fundingSources && portfolio.fundingSources.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-300">
                    <h3 className="font-black text-gray-900 mb-3">Funding Partners</h3>
                    <div className="flex flex-wrap gap-3 items-center">
                      {portfolio.fundingSources.map((source, index) => {
                        // Map funding source names to logo files
                        const logoMap: Record<string, string> = {
                          'International Land Coalition': '/images/international-land-coalition.png',
                          'Ford Foundation': '/images/donor_horizont3000_logo.jpg',
                          'Community Contributions': '/images/austrian-development-agency-logo.jpg',
                          'UN Women': '/images/donor_horizont3000_logo.jpg',
                          'Austrian Development Agency': '/images/austrian-development-agency-logo.jpg',
                          'Individual Donors': '/images/international-land-coalition.png',
                        };

                        const logoPath = logoMap[source] || '/images/international-land-coalition.png';

                        return (
                          <div
                            key={index}
                            className="bg-white rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center"
                          >
                            <div className="relative w-24 h-10">
                              <Image
                                src={logoPath}
                                alt={source}
                                fill
                                className="object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                                sizes="96px"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Project Details Card */}
            <div className="bg-gray-50 rounded-2xl p-6 sticky top-6">
              <h3 className="text-xl font-black text-gray-900 mb-4">Project Details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Icon name="map-pin" size="sm" className="text-hakiardhi-red flex-shrink-0 mt-1" />
                  <div>
                    <div className="text-sm font-semibold text-gray-500">Location</div>
                    <div className="text-gray-900 font-bold">{portfolio.location}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="clock" size="sm" className="text-hakiardhi-red flex-shrink-0 mt-1" />
                  <div>
                    <div className="text-sm font-semibold text-gray-500">Duration</div>
                    <div className="text-gray-900 font-bold">{portfolio.duration || portfolio.year}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="users" size="sm" className="text-hakiardhi-red flex-shrink-0 mt-1" />
                  <div>
                    <div className="text-sm font-semibold text-gray-500">Beneficiaries</div>
                    <div className="text-gray-900 font-bold">
                      {portfolio.beneficiaries?.toLocaleString() || 'N/A'}
                    </div>
                  </div>
                </div>
                {portfolio.partner && (
                  <div className="flex items-start gap-3">
                    <Icon name="hand-heart" size="sm" className="text-hakiardhi-red flex-shrink-0 mt-1" />
                    <div>
                      <div className="text-sm font-semibold text-gray-500">Partner</div>
                      <div className="text-gray-900 font-bold">{portfolio.partner}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              {portfolio.tags && portfolio.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-bold text-gray-500 mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {portfolio.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-hakiardhi-red/10 text-hakiardhi-red rounded-full text-xs font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Support CTA */}
            {portfolio.needsContinuedSupport && (
              <div className="bg-gradient-to-br from-hakiardhi-red to-hakiardhi-red-dark rounded-2xl p-6 text-white">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <Icon name="heart" size="lg" className="text-white" />
                </div>
                <h3 className="text-xl font-black mb-3">Support This Work</h3>
                <p className="mb-6 text-sm leading-relaxed opacity-90">
                  {portfolio.supportMessage ||
                    'This program requires ongoing support to continue serving communities. Your donation makes a direct difference.'}
                </p>
                <div className="space-y-3">
                  <Button href="/donate" variant="secondary" className="w-full bg-white !text-hakiardhi-red hover:bg-gray-100 border-0">
                    Donate Now
                  </Button>
                  <Button href="/contact" variant="tertiary" className="w-full text-white hover:text-gray-200">
                    Learn More
                  </Button>
                </div>
              </div>
            )}

            {/* Share Section */}
            <ShareSection title={portfolio.title} description={portfolio.description} />
          </div>
        </div>
      </div>

      {/* Related Projects */}
      {relatedItems.length > 0 && (
        <section className="bg-gray-50 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
                Related Projects
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explore more work in {portfolio.category}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {relatedItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/portfolio/${item.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative h-48">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <Badge variant="primary">{item.type}</Badge>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-2">
                      <span className="text-xs font-semibold text-hakiardhi-red">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-hakiardhi-red transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                    <div className="flex items-center text-hakiardhi-red font-bold text-sm group-hover:gap-2 transition-all">
                      <span>View Case Study</span>
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
              <Button href="/portfolio" variant="secondary" size="lg">
                View All Projects
              </Button>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
