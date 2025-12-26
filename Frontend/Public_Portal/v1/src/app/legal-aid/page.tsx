'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Header, Footer } from '@/components';
import Section from '@/components/ui/Section';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import LegalHelpModal from '@/components/modals/LegalHelpModal';
import { TYPOGRAPHY } from '@/constants/design-tokens';

const legalServices = [
  {
    id: 1,
    title: 'Land Dispute Resolution',
    description: 'Expert legal representation in land ownership conflicts, boundary disputes, and inheritance cases.',
    icon: 'shield',
    cases: '500+ cases',
    color: 'red',
  },
  {
    id: 2,
    title: 'Community Land Rights',
    description: 'Assistance with collective land titles, village land certificates, and customary rights documentation.',
    icon: 'users',
    cases: '300+ communities',
    color: 'blue',
  },
  {
    id: 3,
    title: 'Legal Consultations',
    description: 'Free legal advice on land rights, inheritance, evictions, and property transactions.',
    icon: 'book',
    cases: '2,000+ consultations',
    color: 'green',
  },
  {
    id: 4,
    title: 'Court Representation',
    description: 'Professional representation in district courts, land tribunals, and appellate courts.',
    icon: 'briefcase',
    cases: '400+ representations',
    color: 'orange',
  },
];

const chatbotFeatures = [
  {
    title: 'Instant Legal Guidance',
    description: 'Get immediate preliminary advice on land rights issues, available 24/7 in Swahili and English.',
    icon: 'chat',
  },
  {
    title: 'Incident Reporting',
    description: 'Report land disputes, evictions, or rights violations directly through WhatsApp with photo and location support.',
    icon: 'alert-circle',
  },
  {
    title: 'Smart Case Escalation',
    description: 'AI analyzes your case complexity and automatically connects you with our legal team when needed.',
    icon: 'arrow-up',
  },
  {
    title: 'FAQ Knowledge Base',
    description: 'Access hundreds of answered questions on land laws, procedures, and community rights.',
    icon: 'info',
  },
];

const howItWorks = [
  {
    step: '01',
    title: 'Contact Us',
    description: 'Send a WhatsApp message, call our toll-free line (0800 711 555), or visit our office. Our AI chatbot provides instant initial guidance.',
    icon: 'phone',
  },
  {
    step: '02',
    title: 'Case Assessment',
    description: 'Our legal team reviews your case and determines the best approach for resolution.',
    icon: 'search',
  },
  {
    step: '03',
    title: 'Legal Action',
    description: 'We provide representation, documentation support, or mediation based on your needs.',
    icon: 'briefcase',
  },
  {
    step: '04',
    title: 'Resolution',
    description: 'We work until your land rights are secured and documented properly.',
    icon: 'check-circle',
  },
];

export default function LegalAidPage() {
  const [activeService, setActiveService] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      {/* Legal Help Modal */}
      <LegalHelpModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Hero Section with Image */}
      <section className="relative pt-44 lg:pt-48 pb-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/legal_aid_1.JPG"
            alt="Legal Aid Services"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-black/50"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full mb-8 border border-white/20">
              <Icon name="shield" size="sm" className="text-white" />
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                Free Legal Aid
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl lg:text-6xl font-black text-white mb-6 leading-tight">
              Legal Support for <span className="text-hakiardhi-red">Land Rights</span>
            </h1>

            {/* Description */}
            <p className="text-xl text-white/95 mb-8 leading-relaxed">
              Access free legal aid, court representation, and expert guidance to protect your land rights.
              Our team has helped thousands of families secure their land.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsModalOpen(true)}
                icon={<Icon name="phone" size="sm" />}
                iconPosition="left"
              >
                Get Legal Help Now
              </Button>
              <Button
                variant="secondary"
                size="lg"
                href="/legal-aid/about"
                className="bg-white/10 !text-white hover:!bg-red-600 hover:!text-black !border-white/40 backdrop-blur-md"
                icon={<Icon name="arrow-right" size="sm" />}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative Element */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-hakiardhi-red to-transparent"></div>
      </section>

      {/* AI WhatsApp Chatbot Feature - Premium Section */}
      <section className="relative py-20 bg-gradient-to-br from-green-50 via-white to-emerald-50 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full mb-6 border border-green-500/20">
                <Icon name="phone" size="sm" className="text-green-600" />
                <span className="text-sm font-bold text-green-700 uppercase tracking-wider">
                  AI-Powered Innovation
                </span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-black text-gray-900 mb-4">
                24/7 Legal Aid via <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">WhatsApp</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Meet our AI-powered legal assistant - your instant connection to land rights expertise, anytime, anywhere.
              </p>
            </div>

            {/* Main Feature Card */}
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {/* Left - WhatsApp Interface Mockup */}
              <div className="relative">
                <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-green-500/20">
                  {/* WhatsApp Header */}
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-200 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <Icon name="phone" size="md" className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">HakiArdhi Legal Bot</h3>
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Online - AI Assistant
                      </p>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="space-y-4 mb-6">
                    {/* Bot Message */}
                    <div className="flex gap-2">
                      <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%]">
                        <p className="text-sm text-gray-800">
                          Habari! I'm HakiArdhi's Legal AI. How can I help you with land rights today?
                        </p>
                      </div>
                    </div>

                    {/* User Message */}
                    <div className="flex gap-2 justify-end">
                      <div className="bg-green-500 rounded-2xl rounded-tr-none px-4 py-3 max-w-[80%]">
                        <p className="text-sm text-white">
                          I have a land boundary dispute with my neighbor
                        </p>
                      </div>
                    </div>

                    {/* Bot Response */}
                    <div className="flex gap-2">
                      <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%]">
                        <p className="text-sm text-gray-800">
                          I can help you with that. Let me ask a few questions to understand your case better...
                        </p>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <button className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-gray-700 hover:bg-green-50 transition-colors border border-gray-200">
                            📍 Report Issue
                          </button>
                          <button className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-gray-700 hover:bg-green-50 transition-colors border border-gray-200">
                            👨‍⚖️ Talk to Lawyer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp CTA */}
                  <div className="bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 rounded-2xl p-6 text-center relative overflow-hidden">
                    {/* Decorative pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

                    <p className="text-white font-bold text-lg mb-4 relative z-10">Start Your Free Legal Consultation</p>

                    {/* WhatsApp Button - Primary */}
                    <a
                      href="https://wa.me/+255784646752"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative z-10 flex items-center justify-center gap-3 w-full bg-white rounded-xl px-6 py-4 mb-3 group hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                    >
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="text-green-600 font-black text-base">WhatsApp Chat</p>
                        <p className="text-gray-500 text-xs">+255 784 646 752</p>
                      </div>
                      <Icon name="arrow-right" size="sm" className="text-green-500 ml-auto group-hover:translate-x-1 transition-transform" />
                    </a>

                    {/* Divider */}
                    <div className="relative z-10 flex items-center gap-3 my-3">
                      <div className="flex-1 h-px bg-white/30"></div>
                      <span className="text-white/70 text-xs font-medium">OR</span>
                      <div className="flex-1 h-px bg-white/30"></div>
                    </div>

                    {/* Toll-Free Button - Secondary */}
                    <a
                      href="tel:0800711555"
                      className="relative z-10 flex items-center justify-center gap-3 w-full bg-white/15 backdrop-blur-sm border-2 border-white/40 rounded-xl px-6 py-4 group hover:bg-white/25 hover:border-white/60 transition-all duration-300"
                    >
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon name="phone" size="sm" className="text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-white font-black text-base">Toll-Free Call</p>
                        <p className="text-white/80 text-xs">0800 711 555</p>
                      </div>
                      <Icon name="arrow-right" size="sm" className="text-white/70 ml-auto group-hover:translate-x-1 transition-transform" />
                    </a>

                    {/* Trust indicator */}
                    <div className="relative z-10 flex items-center justify-center gap-2 mt-4 pt-3 border-t border-white/20">
                      <Icon name="shield" size="sm" className="text-white/80" />
                      <p className="text-white/80 text-xs font-medium">100% Free & Confidential</p>
                    </div>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -top-4 -right-4 bg-white rounded-full px-4 py-2 shadow-lg border-2 border-green-500/20">
                  <p className="text-sm font-bold text-gray-900">✨ AI-Powered</p>
                </div>
              </div>

              {/* Right - Features */}
              <div>
                <div className="space-y-4">
                  {chatbotFeatures.map((feature, idx) => (
                    <div
                      key={idx}
                      className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-500/30"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Icon name={feature.icon as any} size="md" className="text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                          <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <p className="text-2xl font-black text-green-600">24/7</p>
                    <p className="text-xs text-gray-600">Available</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <p className="text-2xl font-black text-green-600">&lt;2min</p>
                    <p className="text-xs text-gray-600">Response</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <p className="text-2xl font-black text-green-600">FREE</p>
                    <p className="text-xs text-gray-600">Service</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats Section - Toll-Free & Push SMS */}
      <section className="py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-hakiardhi-red rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full mb-6 border border-white/20">
              <Icon name="chart" size="sm" className="text-white" />
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                Our Impact
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">
              Reaching Communities <span className="text-hakiardhi-red">Everywhere</span>
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Through toll-free hotlines and push SMS campaigns, we're making legal aid accessible to everyone
            </p>
          </div>

          {/* Impact Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {/* Toll-Free Calls */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:border-hakiardhi-red/50 transition-all duration-300 hover:scale-105">
              <div className="w-14 h-14 rounded-xl bg-hakiardhi-red/20 flex items-center justify-center mx-auto mb-4">
                <Icon name="phone" size="lg" className="text-hakiardhi-red" />
              </div>
              <p className="text-4xl font-black text-white mb-2">15,000+</p>
              <p className="text-sm text-gray-300 font-semibold">Toll-Free Calls</p>
              <p className="text-xs text-gray-400 mt-1">Received in 2024</p>
            </div>

            {/* Push SMS Sent */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:border-green-500/50 transition-all duration-300 hover:scale-105">
              <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Icon name="send" size="lg" className="text-green-400" />
              </div>
              <p className="text-4xl font-black text-white mb-2">50,000+</p>
              <p className="text-sm text-gray-300 font-semibold">SMS Alerts Sent</p>
              <p className="text-xs text-gray-400 mt-1">Legal awareness campaigns</p>
            </div>

            {/* Communities Reached */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:border-blue-500/50 transition-all duration-300 hover:scale-105">
              <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <Icon name="users" size="lg" className="text-blue-400" />
              </div>
              <p className="text-4xl font-black text-white mb-2">120+</p>
              <p className="text-sm text-gray-300 font-semibold">Districts Reached</p>
              <p className="text-xs text-gray-400 mt-1">Across Tanzania</p>
            </div>

            {/* Response Rate */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:border-orange-500/50 transition-all duration-300 hover:scale-105">
              <div className="w-14 h-14 rounded-xl bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
                <Icon name="clock" size="lg" className="text-orange-400" />
              </div>
              <p className="text-4xl font-black text-white mb-2">&lt;2hrs</p>
              <p className="text-sm text-gray-300 font-semibold">Avg Response Time</p>
              <p className="text-xs text-gray-400 mt-1">For urgent cases</p>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Toll-Free Image */}
            <div className="relative h-64 rounded-2xl overflow-hidden group">
              <Image
                src="/images/Toll-free.jpg"
                alt="Toll-Free Hotline Service"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-bold text-lg mb-1">Toll-Free Hotline</h3>
                <p className="text-white/80 text-sm">0800 711 555</p>
              </div>
            </div>

            {/* Push SMS Image 1 */}
            <div className="relative h-64 rounded-2xl overflow-hidden group">
              <Image
                src="/images/Push-SMS-1.jpg"
                alt="Push SMS Legal Awareness Campaign"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-bold text-lg mb-1">SMS Campaigns</h3>
                <p className="text-white/80 text-sm">Legal awareness alerts</p>
              </div>
            </div>

            {/* Push SMS Image 2 */}
            <div className="relative h-64 rounded-2xl overflow-hidden group">
              <Image
                src="/images/Push-SMS-2.jpg"
                alt="Push SMS Community Outreach"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-bold text-lg mb-1">Community Reach</h3>
                <p className="text-white/80 text-sm">Proactive outreach</p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-12 bg-white/5 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto border border-white/10">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Toll-Free Hotline */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-hakiardhi-red flex items-center justify-center">
                    <Icon name="phone" size="sm" className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Toll-Free Hotline</h3>
                </div>
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                  Our toll-free line (0800 711 555) allows anyone to access legal help without airtime costs.
                  Available Monday to Friday, 8:00 AM - 6:00 PM.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-400">
                    <Icon name="check" size="sm" className="text-green-400" />
                    No airtime required
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-400">
                    <Icon name="check" size="sm" className="text-green-400" />
                    Swahili & English support
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-400">
                    <Icon name="check" size="sm" className="text-green-400" />
                    Professional legal advisors
                  </li>
                </ul>
              </div>

              {/* Push SMS Campaign */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                    <Icon name="send" size="sm" className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Push SMS Campaigns</h3>
                </div>
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                  Proactive legal awareness through SMS alerts, reaching rural communities with important
                  information about their land rights.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-400">
                    <Icon name="check" size="sm" className="text-green-400" />
                    Legal updates & alerts
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-400">
                    <Icon name="check" size="sm" className="text-green-400" />
                    Court date reminders
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-400">
                    <Icon name="check" size="sm" className="text-green-400" />
                    Rights awareness tips
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Services Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-hakiardhi-red/10 rounded-full mb-6 border border-hakiardhi-red/20">
              <Icon name="shield" size="sm" className="text-hakiardhi-red" />
              <span className="text-sm font-bold text-hakiardhi-red uppercase tracking-wider">
                Our Services
              </span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-gray-900 mb-4">
              Comprehensive <span className="text-hakiardhi-red">Legal Aid</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              From legal consultations to court representation, we provide complete support for land rights cases
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {legalServices.map((service) => {
              const colorClasses = {
                red: { bg: 'from-red-50 to-red-100', icon: 'text-red-600', border: 'border-red-100', hover: 'hover:border-red-300' },
                blue: { bg: 'from-blue-50 to-blue-100', icon: 'text-blue-600', border: 'border-blue-100', hover: 'hover:border-blue-300' },
                green: { bg: 'from-green-50 to-green-100', icon: 'text-green-600', border: 'border-green-100', hover: 'hover:border-green-300' },
                orange: { bg: 'from-orange-50 to-orange-100', icon: 'text-orange-600', border: 'border-orange-100', hover: 'hover:border-orange-300' },
              };
              const colors = colorClasses[service.color as keyof typeof colorClasses];

              return (
                <Card
                  key={service.id}
                  variant="elevated"
                  className={`group hover:shadow-2xl transition-all duration-300 border-2 ${colors.border} ${colors.hover}`}
                >
                  <Card.Body className="p-6 text-center">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colors.bg} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon name={service.icon as any} size="xl" className={colors.icon} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{service.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{service.description}</p>
                    <Badge size="sm" className="bg-red-600 text-gray-50">
                      {service.cases}
                    </Badge>
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section with Image */}
      <section className="py-20 bg-gradient-to-br from-zinc-50 via-gray-50 to-zinc-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-hakiardhi-red/5 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Left - Image */}
            <div className="relative">
              <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/legal_aid_2.JPG"
                  alt="Legal Aid Process"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8">
                  <p className="text-white font-bold text-xl mb-2">Free Legal Support</p>
                  <p className="text-white/90 text-sm">Professional representation for land rights cases</p>
                </div>
              </div>

              {/* Floating Stats */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
                <p className="text-4xl font-black text-hakiardhi-red mb-1">2,000+</p>
                <p className="text-sm text-gray-600 font-semibold">Cases Won</p>
              </div>
            </div>

            {/* Right - Process Steps */}
            <div>
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-8">
                How to Get <span className="text-hakiardhi-red">Legal Help</span>
              </h2>

              <div className="space-y-6">
                {howItWorks.map((step, idx) => (
                  <div key={idx} className="flex gap-6 group">
                    {/* Step Number */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-hakiardhi-red to-brand-500 flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        {step.step}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6 border-b border-gray-200 last:border-0">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <Icon name={step.icon as any} size="sm" className="text-hakiardhi-red" />
                        {step.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="primary" size="lg" className="mt-8 hover:!bg-black">
                <Icon name="phone" size="sm" className="mr-2" />
                Contact Legal Team
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Success Story Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 lg:p-12 border-l-4 border-green-600">
              <div className="flex items-start gap-4 mb-6">
                <Icon name="quote" size="xl" className="text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-xl lg:text-2xl text-gray-800 leading-relaxed mb-6 italic">
                    "HakiArdhi's legal team helped us secure our village land title after a 5-year dispute.
                    Their WhatsApp chatbot made it easy to report our case and get immediate guidance.
                    We are forever grateful!"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-300 overflow-hidden relative">
                      <Image
                        src="/images/capacity_building_3.jpg"
                        alt="Success story"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Maria Kimaro</p>
                      <p className="text-sm text-gray-600">Village Chairperson, Morogoro</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency CTA Section */}
      <section className="py-16 bg-gradient-to-br from-zinc-50 via-gray-50 to-zinc-100 relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-hakiardhi-red/20 to-transparent"></div>
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-br from-hakiardhi-red/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-gradient-to-br from-green-500/5 to-transparent rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-hakiardhi-red/10 to-red-100 mx-auto mb-6 shadow-sm border border-hakiardhi-red/20">
              <Icon name="alert-circle" size="xl" className="text-hakiardhi-red" />
            </div>

            {/* Heading */}
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">
              Facing an Urgent <span className="text-transparent bg-clip-text bg-gradient-to-r from-hakiardhi-red to-brand-500">Land Rights Issue</span>?
            </h2>

            {/* Description */}
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Our legal team is ready to help. Get immediate support through our AI chatbot or call our emergency hotline.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                href="https://wa.me/+255784646752"
                variant="primary"
                size="lg"
                className="bg-green-600 hover:!bg-black !text-white shadow-lg hover:shadow-xl hover:scale-105 !font-black !px-8"
              >
                <Icon name="phone" size="sm" className="mr-2" />
                WhatsApp Legal Bot
              </Button>
              <Button
                href="tel:0800711555"
                variant="secondary"
                size="lg"
                className="bg-white !text-hakiardhi-red hover:!bg-black !border-2 !border-hakiardhi-red shadow-lg hover:shadow-xl hover:scale-105 !font-black !px-8"
              >
                <Icon name="phone" size="sm" className="mr-2" />
                Toll-Free: 0800 711 555
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 mt-10 pt-8 border-t border-gray-200">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                  <Icon name="check-circle" size="sm" className="text-green-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">24/7 Available</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-hakiardhi-red/10 flex items-center justify-center">
                  <Icon name="shield" size="sm" className="text-hakiardhi-red" />
                </div>
                <span className="text-sm font-semibold text-gray-700">100% Free Service</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Icon name="users" size="sm" className="text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Expert Legal Team</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-hakiardhi-red/20 to-transparent"></div>
      </section>

      <Footer />
    </main>
  );
}
