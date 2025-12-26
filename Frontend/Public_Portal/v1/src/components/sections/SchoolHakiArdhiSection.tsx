'use client';

import { useEffect, useState, ReactNode } from 'react';
import Button from '../ui/Button';

export interface SchoolHakiArdhiSectionProps {
  className?: string;
}

interface Program {
  title: string;
  description: string;
  duration: string;
  targetAudience: string;
  objectives: string[];
  icon: ReactNode;
}

interface Testimonial {
  name: string;
  location: string;
  quote: string;
  program: string;
}

export default function SchoolHakiArdhiSection({ className = '' }: SchoolHakiArdhiSectionProps) {
  const [isVisible, setIsVisible] = useState(false);

  const programs: Program[] = [
    {
      title: 'Land Rights Fundamentals',
      description:
        'Comprehensive introduction to land tenure laws, rights, and responsibilities in Tanzania.',
      duration: '3 Days',
      targetAudience: 'Community leaders, small producers',
      objectives: [
        'Understanding Tanzania land laws and policies',
        'Recognizing land rights and ownership types',
        'Navigating legal processes and documentation',
        'Protecting community land from disputes',
      ],
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
    {
      title: 'Women and Land Rights',
      description:
        'Specialized training on gender equity in land ownership and inheritance rights.',
      duration: '2 Days',
      targetAudience: 'Women farmers, community groups',
      objectives: [
        'Understanding women legal rights to land',
        'Challenging discriminatory practices',
        'Securing inheritance and ownership rights',
        'Building advocacy capacity',
      ],
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      title: 'Community Land Management',
      description:
        'Practical training on collective land management and sustainable practices.',
      duration: '5 Days',
      targetAudience: 'Village land committees, cooperatives',
      objectives: [
        'Establishing community land governance',
        'Implementing sustainable land use practices',
        'Managing common resources effectively',
        'Resolving community land disputes',
      ],
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
  ];

  const testimonials: Testimonial[] = [
    {
      name: 'Amina Juma',
      location: 'Morogoro',
      quote:
        'School HakiArdhi taught me about my rights as a woman to own land. I successfully secured land ownership for the first time in my life.',
      program: 'Women and Land Rights',
    },
    {
      name: 'Joseph Msangi',
      location: 'Dodoma',
      quote:
        'The training helped our village resolve long-standing land disputes. We now manage our community land better.',
      program: 'Community Land Management',
    },
    {
      name: 'Mary Nguyo',
      location: 'Arusha',
      quote:
        'Understanding land laws empowered me to protect my family farm from illegal acquisition. Knowledge is power!',
      program: 'Land Rights Fundamentals',
    },
  ];

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

    const element = document.getElementById('school-hakiardhi-section');
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
      id="school-hakiardhi-section"
      className={`relative py-16 lg:py-24 overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(to bottom, #000000 0%, #0a0a0a 100%)',
      }}
    >
      {/* Background decoration */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <div
          className={`text-center mb-12 lg:mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-3xl lg:text-5xl font-black text-white mb-4 lg:mb-6">
            School <span className="text-brand-500">HakiArdhi</span>
          </h2>
          <p className="text-base lg:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Empowering communities through education. Building capacity on land rights, tenure laws,
            and sustainable land management practices.
          </p>
        </div>

        {/* Programs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-12 lg:mb-16">
          {programs.map((program, index) => (
            <div
              key={index}
              className={`transition-all duration-1000 ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 200 + 200}ms` }}
            >
              <div className="h-full bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-brand-500/20 hover:border-brand-500/40 transition-all duration-300 flex flex-col">
                {/* Icon and Duration */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 text-brand-500">{program.icon}</div>
                  <span className="px-3 py-1 text-xs font-bold bg-brand-500 text-white rounded-full">
                    {program.duration}
                  </span>
                </div>

                <h3 className="text-xl font-black text-white mb-3">{program.title}</h3>
                <p className="text-gray-300 text-sm mb-4 leading-relaxed flex-grow">{program.description}</p>

                {/* Target Audience */}
                <div className="mb-4 p-3 bg-gray-800/50 rounded-lg mt-auto">
                  <p className="text-xs text-brand-400 font-semibold mb-1">Target Audience:</p>
                  <p className="text-sm text-gray-300">{program.targetAudience}</p>
                </div>

                {/* Learning Objectives */}
                <div>
                  <p className="text-xs text-brand-400 font-semibold mb-2">Learning Objectives:</p>
                  <ul className="space-y-2">
                    {program.objectives.map((objective, objIndex) => (
                      <li key={objIndex} className="flex items-start gap-2">
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
                        <span className="text-xs text-gray-300">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Enroll Button */}
                <Button variant="secondary" size="md" fullWidth className="mt-6">
                  Enroll Now
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Impact Stats */}
        <div
          className={`mb-12 lg:mb-16 transition-all duration-1000 delay-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="bg-gradient-to-br from-brand-500/20 to-brand-500/5 backdrop-blur-sm rounded-2xl p-8 lg:p-12 border border-brand-500/20">
            <h3 className="text-2xl lg:text-3xl font-black text-white mb-8 text-center">
              Our Impact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl lg:text-5xl font-black text-brand-500 mb-2">5,000+</div>
                <p className="text-gray-300">Community Members Trained</p>
              </div>
              <div>
                <div className="text-4xl lg:text-5xl font-black text-brand-500 mb-2">150+</div>
                <p className="text-gray-300">Training Sessions Conducted</p>
              </div>
              <div>
                <div className="text-4xl lg:text-5xl font-black text-brand-500 mb-2">20+</div>
                <p className="text-gray-300">Regions Reached</p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div
          className={`transition-all duration-1000 delay-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h3 className="text-2xl lg:text-3xl font-black text-white mb-8 text-center">
            Success <span className="text-brand-500">Stories</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-brand-500/20 flex flex-col"
              >
                <svg
                  className="w-8 h-8 text-brand-500 mb-4 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-gray-300 text-sm leading-relaxed mb-4 italic flex-grow">
                  "{testimonial.quote}"
                </p>
                <div className="mt-auto">
                  <p className="text-white font-bold">{testimonial.name}</p>
                  <p className="text-gray-400 text-xs">{testimonial.location}</p>
                  <p className="text-brand-400 text-xs mt-1">{testimonial.program}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enrollment CTA */}
        <div
          className={`mt-12 lg:mt-16 text-center transition-all duration-1000 delay-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h3 className="text-xl lg:text-2xl font-bold text-white mb-3">Ready to Learn?</h3>
          <p className="text-gray-300 mb-8">
            Join thousands of community members who have empowered themselves through knowledge.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              View Training Schedule
            </Button>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Request Training
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
