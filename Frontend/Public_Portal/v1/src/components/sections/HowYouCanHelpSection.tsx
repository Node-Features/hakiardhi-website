'use client';

import { useState } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { THRESHOLDS } from '@/constants/design-tokens';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import AnimatedList from '../ui/AnimatedList';

export interface SupportOption {
  icon: string;
  title: string;
  description: string;
  cta: string;
  link: string;
  color?: string;
}

export interface HowYouCanHelpSectionProps {
  options?: SupportOption[];
  className?: string;
}

const defaultOptions: SupportOption[] = [
  {
    icon: 'heart',
    title: 'Make a Donation',
    description: 'Your financial support enables us to provide free legal aid, training, and advocacy to communities in need.',
    cta: 'Donate Now',
    link: '/donate',
    color: 'red'
  },
  {
    icon: 'users',
    title: 'Become a Partner',
    description: 'Join organizations worldwide supporting our mission. Corporate partnerships create sustainable impact.',
    cta: 'Partner With Us',
    link: '/work-with-us?tab=partner',
    color: 'blue'
  },
  {
    icon: 'calendar',
    title: 'Volunteer Your Time',
    description: 'Share your expertise in legal aid, research, community training, or administrative support.',
    cta: 'Volunteer',
    link: '/work-with-us?tab=volunteer',
    color: 'green'
  },
  {
    icon: 'share',
    title: 'Spread the Word',
    description: 'Amplify our impact by sharing our work on social media and within your networks.',
    cta: 'Share Our Story',
    link: '#share',
    color: 'orange'
  },
];

export default function HowYouCanHelpSection({
  options = defaultOptions,
  className = '',
}: HowYouCanHelpSectionProps) {
  const [sectionRef, isVisible] = useIntersectionObserver({
    threshold: THRESHOLDS.intersection.low,
    freezeOnceVisible: true,
  });
  const [showComingSoon, setShowComingSoon] = useState(false);

  const colorClasses = {
    red: {
      iconBg: 'from-red-50 to-red-100',
      iconColor: 'text-red-600',
      hoverBg: 'group-hover:from-red-100 group-hover:to-red-200',
      accentBorder: 'border-red-100',
      hoverBorder: 'group-hover:border-red-300',
      hoverShadow: 'group-hover:shadow-red-100/50',
      ctaColor: 'text-red-600 hover:text-red-700'
    },
    blue: {
      iconBg: 'from-blue-50 to-blue-100',
      iconColor: 'text-blue-600',
      hoverBg: 'group-hover:from-blue-100 group-hover:to-blue-200',
      accentBorder: 'border-blue-100',
      hoverBorder: 'group-hover:border-blue-300',
      hoverShadow: 'group-hover:shadow-blue-100/50',
      ctaColor: 'text-blue-600 hover:text-blue-700'
    },
    green: {
      iconBg: 'from-green-50 to-green-100',
      iconColor: 'text-green-600',
      hoverBg: 'group-hover:from-green-100 group-hover:to-green-200',
      accentBorder: 'border-green-100',
      hoverBorder: 'group-hover:border-green-300',
      hoverShadow: 'group-hover:shadow-green-100/50',
      ctaColor: 'text-green-600 hover:text-green-700'
    },
    orange: {
      iconBg: 'from-orange-50 to-orange-100',
      iconColor: 'text-orange-600',
      hoverBg: 'group-hover:from-orange-100 group-hover:to-orange-200',
      accentBorder: 'border-orange-100',
      hoverBorder: 'group-hover:border-orange-300',
      hoverShadow: 'group-hover:shadow-orange-100/50',
      ctaColor: 'text-orange-600 hover:text-orange-700'
    }
  };

  return (
    <section
      ref={sectionRef}
      className={`relative py-20 lg:py-28 xl:py-32 bg-white overflow-hidden ${className}`}
    >
      {/* Subtle background decorations */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-br from-hakiardhi-red/5 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-gradient-to-br from-brand-500/5 to-transparent rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
        {/* Header */}
        <div
          className={`text-center mb-16 lg:mb-20 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Tag */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-hakiardhi-red/10 to-brand-500/10 rounded-full mb-8 shadow-sm">
            <Icon name="hand-heart" size="sm" className="!text-hakiardhi-red" />
            <span className="text-sm font-bold !text-hakiardhi-red uppercase tracking-wider">
              Get Involved
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black !text-gray-900 mb-6 leading-tight">
            How <span className="!text-hakiardhi-red">You</span> Can Help
          </h2>

          {/* Subheading */}
          <p className="text-lg lg:text-xl !text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Every contribution—big or small—creates lasting change for communities fighting for their land rights
          </p>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-hakiardhi-red/30"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-hakiardhi-red"></div>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-hakiardhi-red/30"></div>
          </div>
        </div>

        {/* Support Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-20 lg:mb-24">
          <AnimatedList staggerDelay={120}>
            {options.map((option, index) => {
              const colors = colorClasses[option.color as keyof typeof colorClasses] || colorClasses.red;
              return (
                <div
                  key={index}
                  className={`group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 border ${colors.accentBorder} ${colors.hoverBorder} ${colors.hoverShadow} hover:-translate-y-2`}
                >
                  {/* Top accent line */}
                  <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r ${colors.iconBg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                  {/* Icon */}
                  <div className="mb-6">
                    <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${colors.iconBg} ${colors.hoverBg} flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
                      <Icon name={option.icon as any} size="xl" className={colors.iconColor} />

                      {/* Subtle glow effect on hover */}
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colors.iconBg} opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500`}></div>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl lg:text-2xl font-black text-gray-900 mb-4 leading-tight">
                    {option.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed mb-6 text-base min-h-[4.5rem]">
                    {option.description}
                  </p>

                  {/* CTA Link */}
                  <a
                    href={option.link}
                    className={`inline-flex items-center gap-2.5 font-bold !text-hakiardhi-red hover:!text-black transition-all duration-300 group/cta underline hover:no-underline`}
                  >
                    <span className="relative">
                      {option.cta}
                    </span>
                    <Icon
                      name="arrow-right"
                      size="sm"
                      className="group-hover/cta:translate-x-1.5 transition-transform duration-300"
                    />
                  </a>
                </div>
              );
            })}
          </AnimatedList>
        </div>

        {/* Featured Donation CTA */}
        <div
          className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-hakiardhi-red via-brand-500 to-hakiardhi-red p-12 lg:p-16 xl:p-20 text-center shadow-2xl transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          {/* Enhanced background pattern */}
          <div className="absolute inset-0">
            {/* Animated gradient orbs */}
            <div className="absolute top-0 left-1/4 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>

            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }}></div>
          </div>

          <div className="relative z-10">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg">
                <Icon name="heart" size="xl" className="text-white" />
              </div>
            </div>

            {/* Heading */}
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
              Every Contribution <span className="block mt-2">Matters</span>
            </h3>

            {/* Subheading */}
            <p className="text-lg lg:text-xl text-white/95 mb-10 max-w-2xl mx-auto leading-relaxed">
              Your donation provides legal aid, training, and protection to families fighting for their land rights
            </p>

            {/* CTA Buttons - Temporarily disabled */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-10">
              <Button
                onClick={() => setShowComingSoon(true)}
                variant="dark"
                size="lg"
                icon={<Icon name="heart" size="sm" />}
              >
                Make a One-Time Gift
              </Button>
              <Button
                onClick={() => setShowComingSoon(true)}
                variant="dark"
                size="lg"
                icon={<Icon name="refresh" size="sm" />}
              >
                Become a Monthly Donor
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 pt-8 border-t border-white/20">
              <div className="flex items-center gap-2.5 text-white/90">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Icon name="shield-check" size="sm" />
                </div>
                <span className="text-sm font-semibold">Secure Donation</span>
              </div>
              <div className="flex items-center gap-2.5 text-white/90">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Icon name="check-circle" size="sm" />
                </div>
                <span className="text-sm font-semibold">Tax Deductible</span>
              </div>
              <div className="flex items-center gap-2.5 text-white/90">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Icon name="eye" size="sm" />
                </div>
                <span className="text-sm font-semibold">100% Transparent</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Modal */}
      {showComingSoon && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] animate-fade-in"
            onClick={() => setShowComingSoon(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-scale-in">
              <div className="w-20 h-20 mx-auto mb-6 bg-hakiardhi-red/10 rounded-full flex items-center justify-center">
                <Icon name="heart" size="lg" className="text-hakiardhi-red" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Coming Soon</h2>
              <p className="text-gray-600 mb-6">
                Online donations will be available soon. For now, please contact us directly to make a donation.
              </p>
              <button
                onClick={() => setShowComingSoon(false)}
                className="w-full bg-hakiardhi-red text-white font-semibold py-3 px-6 rounded-xl hover:bg-hakiardhi-red/90 transition-all duration-300 active:scale-[0.98]"
              >
                Got it
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
