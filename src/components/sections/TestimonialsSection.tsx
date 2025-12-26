'use client';

import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { THRESHOLDS } from '@/constants/design-tokens';
import Image from 'next/image';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import AnimatedList from '../ui/AnimatedList';

export interface Testimonial {
  name: string;
  role: string;
  location: string;
  quote: string;
  image: string;
  program?: string;
}

export interface TestimonialsSectionProps {
  testimonials?: Testimonial[];
  className?: string;
}

const defaultTestimonials: Testimonial[] = [
  {
    name: 'Amina Juma',
    role: 'School of HakiArdhi Graduate',
    location: 'Mbeya Region',
    quote: 'HakiArdhi trained me as a land rights monitor. Now I help my entire community understand and protect their land rights. This knowledge has empowered hundreds of families.',
    image: '/images/capacity_building_3.jpg',
    program: 'School of HakiArdhi'
  },
  {
    name: 'Joseph Makamba',
    role: 'Community Leader',
    location: 'Morogoro',
    quote: 'When our village faced displacement, HakiArdhi provided free legal aid and stood with us. Today, we still have our ancestral lands and our livelihoods are secure.',
    image: '/images/public_debate_1.JPG',
    program: 'Legal Aid Program'
  },
  {
    name: 'Grace Kileo',
    role: 'Women\'s Group Coordinator',
    location: 'Arusha',
    quote: 'Through HakiArdhi\'s training, our women\'s group learned about inheritance rights and land ownership. We are now advocating for equal land rights for women across our region.',
    image: '/images/capacity_building_2.jpg',
    program: 'Advocacy Training'
  },
];

export default function TestimonialsSection({
  testimonials = defaultTestimonials,
  className = '',
}: TestimonialsSectionProps) {
  const [sectionRef, isVisible] = useIntersectionObserver({
    threshold: THRESHOLDS.intersection.low,
    freezeOnceVisible: true,
  });

  return (
    <section
      ref={sectionRef}
      className={`relative py-16 lg:py-24 bg-gradient-to-br from-zinc-50 via-white to-zinc-50 overflow-hidden ${className}`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-hakiardhi-red/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div
          className={`text-center mb-12 lg:mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-hakiardhi-red/10 rounded-full mb-6">
            <Icon name="heart" size="sm" className="text-hakiardhi-red" />
            <span className="text-sm font-bold text-hakiardhi-red uppercase tracking-wide">
              Success Stories
            </span>
          </div>

          <h2 className="text-3xl lg:text-5xl font-black text-gray-900 mb-4">
            Voices from the <span className="text-hakiardhi-red">Communities</span> We Serve
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Real stories from people whose lives have been transformed through our programs
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatedList staggerDelay={150}>
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                  {/* Program badge */}
                  {testimonial.program && (
                    <div className="absolute top-4 left-4">
                      <div className="px-3 py-1.5 bg-hakiardhi-red rounded-full text-xs font-bold text-white">
                        {testimonial.program}
                      </div>
                    </div>
                  )}

                  {/* Quote icon */}
                  <div className="absolute bottom-4 right-4">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Icon name="quote" size="md" className="text-white" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Quote */}
                  <blockquote className="text-gray-700 leading-relaxed mb-6 italic">
                    "{testimonial.quote}"
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-hakiardhi-red/20 to-brand-500/20 flex items-center justify-center flex-shrink-0">
                      <Icon name="user" size="md" className="text-hakiardhi-red" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Icon name="map-pin" size="sm" className="text-hakiardhi-red" />
                        {testimonial.location}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </AnimatedList>
        </div>

        {/* CTA */}
        <div
          className={`text-center mt-12 transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <p className="text-lg text-gray-700 font-medium mb-6">
            Your support makes stories like these possible
          </p>
          <Button
            href="/portfolio"
            variant="primary"
            size="lg"
            icon={<Icon name="arrow-right" size="sm" />}
          >
            Read More Success Stories
          </Button>
        </div>
      </div>
    </section>
  );
}
