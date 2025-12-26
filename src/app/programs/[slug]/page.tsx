import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { programs } from '@/data/programs';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ShareSection from '@/components/ui/ShareSection';
import Footer from '@/components/layout/Footer';
import { SPACING } from '@/constants/design-tokens';

interface ProgramDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProgramDetailPage({ params }: ProgramDetailPageProps) {
  const { slug } = await params;
  const program = programs.find((p) => p.slug === slug);

  if (!program) {
    notFound();
  }

  // Get related programs (same category, exclude current)
  const relatedPrograms = programs
    .filter((p) => p.category === program.category && p.id !== program.id)
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section with Background Image */}
      <section className="relative h-[60vh] min-h-[500px] flex items-end">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={program.image}
            alt={program.title}
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
                <Link href="/programs" className="hover:text-white transition-colors">
                  Programs
                </Link>
                <span>/</span>
                <span className="text-white">{program.title}</span>
              </nav>
            </div>

            {/* Category and Status Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge variant="primary" size="lg">
                {program.category}
              </Badge>
              {program.status && (
                <Badge
                  variant={
                    program.status === 'Completed'
                      ? 'success'
                      : program.status === 'Ongoing'
                      ? 'warning'
                      : 'info'
                  }
                  size="lg"
                >
                  {program.status}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
              {program.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-gray-200">
              {program.date && (
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
                    {new Date(program.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
              {program.location && (
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
                  <span className="font-medium">{program.location}</span>
                </div>
              )}
              {program.participants && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <span className="font-medium">{program.participants} Participants</span>
                </div>
              )}
              {program.duration && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-medium">{program.duration}</span>
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
            {/* Overview Section */}
            <section>
              <h2 className="text-3xl font-black text-gray-900 mb-6">Program Overview</h2>
              <p className="text-lg text-gray-700 leading-relaxed">{program.fullDescription}</p>
            </section>

            {/* Objectives Section */}
            {program.objectives && program.objectives.length > 0 && (
              <section>
                <h2 className="text-3xl font-black text-gray-900 mb-6">Objectives</h2>
                <div className="space-y-4">
                  {program.objectives.map((objective, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-hakiardhi-red rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 leading-relaxed pt-1">{objective}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Impact Metrics Section */}
            {program.impact && program.impact.length > 0 && (
              <section>
                <h2 className="text-3xl font-black text-gray-900 mb-6">Impact & Reach</h2>
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  {program.impact.map((metric, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-hakiardhi-red to-hakiardhi-red-dark p-6 rounded-2xl text-white"
                    >
                      <div className="text-3xl sm:text-4xl font-black mb-2">{metric.value}</div>
                      <div className="text-sm sm:text-base font-medium opacity-90">{metric.label}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Outcomes Section */}
            {program.outcomes && program.outcomes.length > 0 && (
              <section>
                <h2 className="text-3xl font-black text-gray-900 mb-6">Key Outcomes</h2>
                <div className="space-y-3">
                  {program.outcomes.map((outcome, index) => (
                    <div key={index} className="flex gap-3">
                      <svg
                        className="w-6 h-6 text-hakiardhi-red flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-gray-700 leading-relaxed">{outcome}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Photo Gallery Section */}
            {program.gallery && program.gallery.length > 0 && (
              <section>
                <h2 className="text-3xl font-black text-gray-900 mb-6">Photo Gallery</h2>
                <div className="grid grid-cols-2 gap-4">
                  {program.gallery.map((image, index) => (
                    <div
                      key={index}
                      className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer"
                    >
                      <Image
                        src={image}
                        alt={`${program.title} - Image ${index + 1}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Partners Section */}
            {program.partners && program.partners.length > 0 && (
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-xl font-black text-gray-900 mb-4">Partners</h3>
                <ul className="space-y-3">
                  {program.partners.map((partner, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-hakiardhi-red flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                      <span className="text-gray-700">{partner}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Call to Action */}
            <div className="bg-gradient-to-br from-hakiardhi-red to-hakiardhi-red-dark rounded-2xl p-6 text-white">
              <h3 className="text-xl font-black mb-3">Get Involved</h3>
              <p className="mb-6 text-sm leading-relaxed opacity-90">
                Support our land rights programs and make a lasting impact in communities across Tanzania.
              </p>
              <div className="space-y-3">
                <Button href="/donate" variant="secondary" className="w-full !bg-black !text-white hover:!text-hakiardhi-red !border-black">
                  Donate Now
                </Button>
                <Button href="/contact" variant="tertiary" className="w-full !bg-black !text-white hover:!text-hakiardhi-red !border-black">
                  Contact Us
                </Button>
              </div>
            </div>

            {/* Share Section */}
            <ShareSection title={program.title} description={program.description} />
          </div>
        </div>
      </div>

      {/* Related Programs Section */}
      {relatedPrograms.length > 0 && (
        <section className="bg-gray-50 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
                Related Programs
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explore more programs in {program.category}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {relatedPrograms.map((relatedProgram) => (
                <Link
                  key={relatedProgram.id}
                  href={`/programs/${relatedProgram.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative h-48">
                    <Image
                      src={relatedProgram.image}
                      alt={relatedProgram.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <Badge variant="primary">{relatedProgram.category}</Badge>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-hakiardhi-red transition-colors">
                      {relatedProgram.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{relatedProgram.description}</p>
                    <div className="flex items-center text-hakiardhi-red font-bold text-sm group-hover:gap-2 transition-all">
                      <span>Learn More</span>
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
              <Button href="/programs" variant="secondary" size="lg">
                View All Programs
              </Button>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
