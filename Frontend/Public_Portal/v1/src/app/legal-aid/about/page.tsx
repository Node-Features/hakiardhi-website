'use client';

import Image from 'next/image';
import { Header, Footer } from '@/components';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

const services = [
  {
    title: 'Free Legal Consultations',
    description: 'Expert advice on land rights, ownership disputes, inheritance matters, and property transactions - completely free of charge.',
    icon: 'message-square',
    stats: '2,000+ consultations',
    color: 'blue',
  },
  {
    title: 'Court Representation',
    description: 'Professional advocacy in district courts, land tribunals, and appellate courts to defend your land rights.',
    icon: 'shield',
    stats: '400+ court cases',
    color: 'red',
  },
  {
    title: 'Document Preparation',
    description: 'Complete assistance with land titles, village land certificates, CCROs, and legal documentation for secure tenure.',
    icon: 'file-text',
    stats: '1,500+ documents',
    color: 'green',
  },
  {
    title: 'Mediation & ADR',
    description: 'Alternative dispute resolution to help parties reach fair, lasting agreements without costly court litigation.',
    icon: 'hand-shake',
    stats: '300+ mediations',
    color: 'orange',
  },
  {
    title: 'Community Legal Training',
    description: 'Capacity building programs to empower communities with knowledge of land laws, rights, and legal processes.',
    icon: 'book-open',
    stats: '500+ trainings',
    color: 'purple',
  },
  {
    title: 'Emergency Response',
    description: 'Rapid legal intervention for urgent cases - evictions, land grabbing, or immediate threats to your land.',
    icon: 'zap',
    stats: '24/7 available',
    color: 'yellow',
  },
];

const eligibility = [
  { text: 'Rural and peri-urban communities facing land disputes', icon: 'users' },
  { text: 'Small-scale farmers and producers with tenure issues', icon: 'map-pin' },
  { text: 'Women facing inheritance or property discrimination', icon: 'heart' },
  { text: 'Communities threatened by forced evictions', icon: 'home' },
  { text: 'Vulnerable groups unable to afford legal services', icon: 'shield' },
  { text: 'Villages seeking collective land rights documentation', icon: 'file-text' },
];

const faqs = [
  {
    question: 'Is the legal service really free?',
    answer: 'Yes, all our legal aid services are completely free for qualifying beneficiaries. We are funded by donors and partners committed to land rights justice.',
  },
  {
    question: 'How long does it take to resolve a case?',
    answer: 'Timeline varies by complexity. Simple consultations may be resolved in one visit, while court cases can take months. We keep you informed throughout the process.',
  },
  {
    question: 'What documents should I bring?',
    answer: 'Bring any land-related documents you have: titles, certificates, sale agreements, inheritance documents, maps, or correspondence about the dispute.',
  },
  {
    question: 'Can you help with cases outside Dar es Salaam?',
    answer: 'Yes! We serve communities across Tanzania. Our WhatsApp chatbot provides initial guidance, or call our toll-free line (0800 711 555), and we can arrange consultations remotely or refer you to local partners.',
  },
  {
    question: 'What if I need help urgently?',
    answer: 'For emergencies like imminent evictions, contact our WhatsApp legal bot or call our toll-free line (0800 711 555) immediately. We can escalate urgent cases to our legal team for rapid response.',
  },
];

export default function LearnMorePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-44 lg:pt-48 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/legal_aid_2.JPG"
            alt="Learn About Legal Aid"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/50"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full mb-6 border border-white/20">
              <Icon name="info" size="sm" className="text-white" />
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                About Our Legal Services
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
              Free Legal Aid for <span className="text-hakiardhi-red">Land Rights</span>
            </h1>

            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Learn how HakiArdhi provides comprehensive legal support to protect your land rights - from consultations to court representation.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Icon name="check-circle" size="sm" className="text-green-400" />
                <span className="text-white text-sm font-semibold">100% Free</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Icon name="shield" size="sm" className="text-green-400" />
                <span className="text-white text-sm font-semibold">Confidential</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Icon name="users" size="sm" className="text-green-400" />
                <span className="text-white text-sm font-semibold">Expert Team</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-hakiardhi-red/10 rounded-full mb-6">
              <Icon name="briefcase" size="sm" className="text-hakiardhi-red" />
              <span className="text-sm font-bold text-hakiardhi-red uppercase tracking-wider">
                What We Offer
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">
              Our Legal <span className="text-hakiardhi-red">Services</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Comprehensive legal support tailored to your land rights needs - all completely free
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {services.map((service, idx) => {
              const colorClasses = {
                blue: { bg: 'from-blue-50 to-blue-100', icon: 'text-blue-600', badge: 'bg-blue-600 text-white font-semibold', border: 'hover:border-blue-300' },
                red: { bg: 'from-red-50 to-red-100', icon: 'text-hakiardhi-red', badge: 'bg-hakiardhi-red text-white font-semibold', border: 'hover:border-red-300' },
                green: { bg: 'from-green-50 to-green-100', icon: 'text-green-600', badge: 'bg-green-600 text-white font-semibold', border: 'hover:border-green-300' },
                orange: { bg: 'from-orange-50 to-orange-100', icon: 'text-orange-600', badge: 'bg-orange-600 text-white font-semibold', border: 'hover:border-orange-300' },
                purple: { bg: 'from-purple-50 to-purple-100', icon: 'text-purple-600', badge: 'bg-purple-600 text-white font-semibold', border: 'hover:border-purple-300' },
                yellow: { bg: 'from-yellow-50 to-amber-100', icon: 'text-amber-600', badge: 'bg-amber-600 text-white font-semibold', border: 'hover:border-amber-300' },
              };
              const colors = colorClasses[service.color as keyof typeof colorClasses];

              return (
                <Card
                  key={idx}
                  variant="elevated"
                  className={`group hover:shadow-xl transition-all duration-300 border border-gray-100 ${colors.border} hover:-translate-y-1`}
                >
                  <Card.Body className="p-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon name={service.icon as any} size="lg" className={colors.icon} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{service.description}</p>
                    <Badge size="sm" className={colors.badge}>
                      {service.stats}
                    </Badge>
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Who Can Access Section */}
      <section className="py-20 bg-gradient-to-br from-zinc-50 via-gray-50 to-zinc-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-6">
                Who Can <span className="text-hakiardhi-red">Access</span> Our Services?
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Our free legal aid is available to individuals and communities who need support with land rights issues but cannot afford legal representation.
              </p>

              <div className="space-y-4">
                {eligibility.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/50 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-hakiardhi-red/10 to-brand-500/10 flex items-center justify-center">
                      <Icon name={item.icon as any} size="md" className="text-hakiardhi-red" />
                    </div>
                    <p className="text-gray-700 font-medium pt-2">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/capacity_building_3.jpg"
                  alt="Community legal support"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-xl">
                <p className="text-4xl font-black text-hakiardhi-red mb-1">30+</p>
                <p className="text-sm text-gray-600 font-semibold">Years of Service</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-hakiardhi-red/10 rounded-full mb-6">
              <Icon name="arrow-right" size="sm" className="text-hakiardhi-red" />
              <span className="text-sm font-bold text-hakiardhi-red uppercase tracking-wider">
                Simple Process
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">
              How It <span className="text-hakiardhi-red">Works</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Getting legal help is simple - here's the process
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: '1', title: 'Contact Us', desc: 'Reach out via WhatsApp, phone, or visit our office', icon: 'message-square', color: 'blue' },
                { step: '2', title: 'Assessment', desc: 'Our team reviews your case and determines approach', icon: 'clipboard-list', color: 'orange' },
                { step: '3', title: 'Legal Action', desc: 'We provide advice, documentation, or representation', icon: 'shield', color: 'green' },
                { step: '4', title: 'Resolution', desc: 'We work until your land rights are secured', icon: 'check-circle', color: 'purple' },
              ].map((item, idx) => {
                const colorClasses = {
                  blue: 'from-blue-500 to-blue-600',
                  orange: 'from-orange-500 to-orange-600',
                  green: 'from-green-500 to-green-600',
                  purple: 'from-purple-500 to-purple-600',
                };
                return (
                  <div key={idx} className="text-center group">
                    <div className="relative mb-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colorClasses[item.color as keyof typeof colorClasses]} flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon name={item.icon as any} size="lg" className="text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center">
                        <span className="text-sm font-black text-gray-900">{item.step}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20 bg-gradient-to-br from-zinc-50 via-gray-50 to-zinc-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">
              Frequently Asked <span className="text-hakiardhi-red">Questions</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, idx) => (
              <Card key={idx} variant="elevated" className="overflow-hidden">
                <Card.Body className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-start gap-3">
                    <Icon name="help-circle" size="md" className="text-hakiardhi-red flex-shrink-0 mt-0.5" />
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed pl-9">{faq.answer}</p>
                </Card.Body>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-zinc-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-black text-black mb-4">
              Ready to Get Legal Help?
            </h2>
            <p className="text-xl text-black mb-8">
              Contact us today - our team is ready to help protect your land rights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="dark"
                size="lg"
                href="/legal-aid"
                className="whitespace-nowrap"
              >
                <Icon name="arrow-left" size="sm" className="mr-2" />
                Back to Legal Aid
              </Button>
              <Button
                variant="dark"
                size="lg"
                href="https://wa.me/255784646752"
                className="whitespace-nowrap"
              >
                <Icon name="phone" size="sm" className="mr-2" />
                WhatsApp Us Now
              </Button>
              <Button
                variant="dark"
                size="lg"
                href="tel:0800711555"
                className="whitespace-nowrap"
              >
                <Icon name="phone" size="sm" className="mr-2" />
                Toll-Free: 0800 711 555
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
