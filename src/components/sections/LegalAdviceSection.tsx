'use client';

import { useEffect, useState, ReactNode } from 'react';
import Button from '../ui/Button';

export interface LegalAdviceSectionProps {
  className?: string;
}

interface Service {
  title: string;
  description: string;
  icon: ReactNode;
}

interface FAQ {
  question: string;
  answer: string;
}

export default function LegalAdviceSection({ className = '' }: LegalAdviceSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const services: Service[] = [
    {
      title: 'Legal Advice',
      description:
        'Free legal consultation on land rights, tenure issues, and property matters for small-scale producers and communities.',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      ),
    },
    {
      title: 'Legal Representation',
      description:
        'Representing vulnerable communities in land disputes, ensuring fair access to justice and protection of rights.',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
          />
        </svg>
      ),
    },
    {
      title: 'Counselling Services',
      description:
        'Support and guidance for individuals and communities navigating land tenure challenges and disputes.',
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
    {
      title: 'Legal Awareness Training',
      description:
        'Educational programs to build community understanding of land laws, rights, and legal processes.',
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
      title: 'Mediation & ADR',
      description:
        'Alternative dispute resolution services to help communities resolve land conflicts peacefully and efficiently.',
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
  ];

  const faqs: FAQ[] = [
    {
      question: 'Who can access legal services?',
      answer:
        'Our legal services are available to rural-based and peri-urban small producers, communities facing land tenure challenges, and vulnerable groups needing support with land rights issues.',
    },
    {
      question: 'How do I request legal assistance?',
      answer:
        'Contact us via phone, email, or visit our office. Our team will assess your case, explain available services, and guide you through the process.',
    },
    {
      question: 'Is there a cost for legal services?',
      answer:
        'We provide free legal assistance to qualifying beneficiaries, particularly small-scale producers and vulnerable communities who cannot afford legal representation.',
    },
    {
      question: 'What types of land cases do you handle?',
      answer:
        'We handle land disputes, tenure security issues, inheritance matters, gender-based land discrimination, land grabbing cases, and other land rights violations.',
    },
    {
      question: 'How long does the legal process take?',
      answer:
        'Timeline varies depending on case complexity. Simple matters may be resolved in weeks, while complex litigation can take months. We keep clients informed throughout the process.',
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

    const element = document.getElementById('legal-advice-section');
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
      id="legal-advice-section"
      className={`relative py-16 lg:py-24 overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(to bottom, #000000 0%, #1a1a1a 50%, #000000 100%)',
      }}
    >
      {/* Background decoration */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <div
          className={`text-center mb-12 lg:mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-3xl lg:text-5xl font-black text-white mb-4 lg:mb-6">
            Legal Advice & <span className="text-brand-500">Counselling</span>
          </h2>
          <p className="text-base lg:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Providing accessible legal support to communities and individuals navigating land tenure
            challenges and protecting their land rights.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12 lg:mb-16">
          {services.map((service, index) => (
            <div
              key={index}
              className={`transition-all duration-1000 ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100 + 200}ms` }}
            >
              <div className="h-full bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-brand-500/20 hover:border-brand-500/40 transition-all duration-300 hover:scale-105 flex flex-col">
                <div className="w-14 h-14 text-brand-500 mb-4 flex-shrink-0">{service.icon}</div>
                <h3 className="text-xl font-black text-white mb-3">{service.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed flex-grow">{service.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* How to Access Section */}
        <div
          className={`mb-12 lg:mb-16 transition-all duration-1000 delay-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="bg-gradient-to-br from-brand-500/20 to-brand-500/5 backdrop-blur-sm rounded-2xl p-8 lg:p-12 border border-brand-500/20">
            <h3 className="text-2xl lg:text-3xl font-black text-white mb-8 text-center">
              How to Access Our Services
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-brand-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-black text-white">1</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Contact Us</h4>
                <p className="text-gray-300 text-sm">
                  Reach out via phone, email, or visit our office to discuss your case
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-brand-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-black text-white">2</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Case Assessment</h4>
                <p className="text-gray-300 text-sm">
                  Our legal team will review your case and determine eligibility
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-brand-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-black text-white">3</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Receive Support</h4>
                <p className="text-gray-300 text-sm">
                  Get legal advice, representation, or access to our mediation services
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div
          className={`transition-all duration-1000 delay-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h3 className="text-2xl lg:text-3xl font-black text-white mb-8 text-center">
            Frequently Asked <span className="text-brand-500">Questions</span>
          </h3>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm rounded-xl border border-brand-500/20 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-800/30 transition-colors"
                >
                  <span className="text-white font-semibold pr-4">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-brand-500 flex-shrink-0 transition-transform ${
                      expandedFAQ === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {expandedFAQ === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-300 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div
          className={`mt-12 lg:mt-16 text-center transition-all duration-1000 delay-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h3 className="text-xl lg:text-2xl font-bold text-white mb-3">Need Legal Assistance?</h3>
          <p className="text-gray-300 mb-8">Our legal team is ready to help you protect your land rights.</p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
              href="https://wa.me/+255784646752"
            >
              WhatsApp Chat
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
              href="tel:0800711555"
            >
              Call Toll-Free
            </Button>
          </div>
          <p className="text-gray-400 text-sm mt-4">
            WhatsApp: +255 784 646 752 | Toll-Free: 0800 711 555
          </p>
        </div>
      </div>
    </section>
  );
}
