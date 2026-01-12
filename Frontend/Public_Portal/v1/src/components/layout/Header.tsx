'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '../ui/Button';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import { SPACING } from '@/constants/design-tokens';

const navigationItems = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'What We Do', href: '/what-we-do' },
  { label: 'Programs', href: '/programs' },
  { label: 'Research', href: '/research' },
  { label: 'Resource Centre', href: '/resource-centre' },
  { label: 'News & Events', href: '/news-events' },
  { label: 'Gallery', href: '/gallery' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Detect scroll for sticky background
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        {/* Top Bar - Red Background */}
        <div className="bg-hakiardhi-red text-white overflow-hidden">
          <div className={`flex items-center justify-between ${SPACING.header.horizontalPadding} py-1 min-w-0`}>
            {/* Left Side - Contact Info - Single Line on Mobile with proper constraints */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-6 overflow-x-auto whitespace-nowrap scrollbar-hide flex-1 min-w-0">
              <div className="flex items-center gap-1 flex-shrink-0">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-[9px] sm:text-xs lg:text-sm font-medium">Mon - Fri : 08:00 - 17:00</span>
              </div>
              <a href="tel:+255784646752" className="flex items-center gap-1 flex-shrink-0">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-[9px] sm:text-xs lg:text-sm font-medium">+255 784 646 752</span>
              </a>
              <a href="mailto:info@hakiardhi.or.tz" className="flex items-center gap-1 flex-shrink-0">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-[9px] sm:text-xs lg:text-sm font-medium">info@hakiardhi.or.tz</span>
              </a>
            </div>

            {/* Right Side - Quick Links & Language Switcher */}
            <div className="hidden lg:flex items-center gap-1 text-xs font-semibold tracking-wide flex-shrink-0">
              <Link href="/contact" className={`flex items-center ${SPACING.gap.xs} ${SPACING.padding.xs} hover:text-hakiardhi-red rounded transition-all`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span>CONTACT US</span>
              </Link>
              <span className="text-white/50">|</span>
              <Link href="/portfolio" className={`flex items-center ${SPACING.gap.xs} ${SPACING.padding.xs} hover:text-hakiardhi-red rounded transition-all`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>PORTFOLIO</span>
              </Link>
              <span className="text-white/50">|</span>
              <Link href="/work-with-us" className={`flex items-center ${SPACING.gap.xs} ${SPACING.padding.xs} hover:text-hakiardhi-red rounded transition-all`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>WORK WITH US</span>
              </Link>
              <span className="text-white/50">|</span>
              <Link href="/lrm-network" className={`flex items-center ${SPACING.gap.xs} ${SPACING.padding.xs} hover:text-hakiardhi-red rounded transition-all`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span>LRM NETWORK</span>
              </Link>
              <span className="text-white/50">|</span>
              {/* Language Switcher */}
              <LanguageSwitcher variant="dropdown" theme="light" size="sm" />
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div
          className={`transition-all duration-300 ${
            isScrolled
              ? 'bg-white/80 shadow-lg backdrop-blur-xl'
              : 'bg-white/60 backdrop-blur-md'
          }`}
        >
        <nav aria-label="Main navigation" className={`flex items-center justify-between ${SPACING.header.padding}`}>
          {/* Logo - Balanced for readability */}
          <Link
            href="/"
            className="flex-shrink-0 transition-transform hover:scale-105"
          >
            <Image
              src="/images/logo.png"
              alt="HakiArdhi"
              width={280}
              height={84}
              className="h-16 sm:h-18 lg:h-20 xl:h-22 2xl:h-24 w-auto"
              priority
            />
          </Link>

          {/* Desktop Menu - Right Justified - Balanced sizing for all screens */}
          <div className={`hidden lg:flex items-center gap-4 xl:gap-5 2xl:gap-6`}>
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative inline-flex items-center justify-center group py-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hakiardhi-red focus-visible:ring-offset-2"
              >
                {/* Menu text - Balanced sizing with no wrapping */}
                <span className="relative z-10 text-sm lg:text-[0.9375rem] xl:text-base 2xl:text-base font-semibold text-black group-hover:text-hakiardhi-red transition-colors duration-300 whitespace-nowrap">
                  {item.label}
                  {/* Underline on hover */}
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-black group-hover:w-full transition-all duration-300"></span>
                </span>
              </Link>
            ))}

            {/* Visual Separator - Balanced spacing */}
            <div className="w-[1px] h-8 bg-gray-300 mx-2"></div>

            {/* CTA Button - Balanced size */}
            <Button
              href="/legal-aid"
              variant="primary"
              size="md"
            >
              Get Legal Aid
            </Button>
          </div>

          {/* Mobile Menu Toggle - Modern minimal design */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden min-w-[48px] min-h-[48px] flex items-center justify-center transition-all duration-300 group"
            aria-label="Open navigation menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <div className="w-7 h-7 relative flex flex-col items-center justify-center gap-[5px]">
              {/* Hamburger Icon - Clean three lines */}
              <span className="w-7 h-[2.5px] bg-black group-hover:bg-hakiardhi-red rounded-full transition-all duration-300 group-hover:w-6"></span>
              <span className="w-7 h-[2.5px] bg-black group-hover:bg-hakiardhi-red rounded-full transition-all duration-300"></span>
              <span className="w-7 h-[2.5px] bg-black group-hover:bg-hakiardhi-red rounded-full transition-all duration-300 group-hover:w-5"></span>
            </div>
          </button>
        </nav>

        {/* Divider */}
        <div className={`h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent ${SPACING.header.horizontalPadding}`}></div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          ></div>

          {/* Mobile Menu Panel */}
          <div
            id="mobile-menu"
            className="fixed top-[140px] sm:top-[150px] left-0 right-0 bottom-0 z-[70] bg-gradient-to-b from-white to-gray-50 shadow-2xl overflow-y-auto animate-slide-down"
          >
            <nav aria-label="Mobile navigation" className="flex flex-col h-full">
              {/* Close Button Header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 bg-white/80 sticky top-0 z-10 backdrop-blur-sm">
                <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Menu</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center transition-all duration-300 group"
                  aria-label="Close navigation menu"
                >
                  <div className="w-7 h-7 relative flex items-center justify-center">
                    {/* Close X Icon - Animated cross */}
                    <span className="absolute w-7 h-[2.5px] bg-black group-hover:bg-hakiardhi-red rounded-full rotate-45 transition-all duration-300"></span>
                    <span className="absolute w-7 h-[2.5px] bg-black group-hover:bg-hakiardhi-red rounded-full -rotate-45 transition-all duration-300"></span>
                  </div>
                </button>
              </div>

              {/* Menu Items Container */}
              <div className="flex-1 px-4 sm:px-6 py-6 space-y-3">
                {navigationItems.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="group relative flex items-center justify-between px-4 sm:px-5 py-4 sm:py-5 text-sm md:text-base font-semibold !text-black rounded-xl hover:bg-white hover:!text-hakiardhi-red hover:shadow-md active:scale-[0.98] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hakiardhi-red focus-visible:ring-offset-2"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      {/* Animated dot indicator */}
                      <span className="w-1.5 h-1.5 bg-hakiardhi-red rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      {item.label}
                    </span>

                    {/* Arrow Icon */}
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-hakiardhi-red group-hover:translate-x-1 transition-all duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>

                    {/* Hover background effect */}
                    <span className="absolute inset-0 bg-gradient-to-r from-hakiardhi-red/5 to-hakiardhi-red/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </Link>
                ))}

                {/* Divider */}
                <div className="py-3">
                  <div className="border-t border-gray-300"></div>
                </div>

                {/* Quick Links Section */}
                <Link
                  href="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="group relative flex items-center justify-between px-4 sm:px-5 py-4 sm:py-5 text-sm md:text-base font-semibold !text-black rounded-xl hover:bg-white hover:!text-hakiardhi-red hover:shadow-md active:scale-[0.98] transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-hakiardhi-red rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    Contact Us
                  </span>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-hakiardhi-red group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="absolute inset-0 bg-gradient-to-r from-hakiardhi-red/5 to-hakiardhi-red/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Link>

                <Link
                  href="/portfolio"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="group relative flex items-center justify-between px-4 sm:px-5 py-4 sm:py-5 text-sm md:text-base font-semibold !text-black rounded-xl hover:bg-white hover:!text-hakiardhi-red hover:shadow-md active:scale-[0.98] transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-hakiardhi-red rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    Portfolio
                  </span>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-hakiardhi-red group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="absolute inset-0 bg-gradient-to-r from-hakiardhi-red/5 to-hakiardhi-red/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Link>

                <Link
                  href="/work-with-us"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="group relative flex items-center justify-between px-4 sm:px-5 py-4 sm:py-5 text-sm md:text-base font-semibold !text-black rounded-xl hover:bg-white hover:!text-hakiardhi-red hover:shadow-md active:scale-[0.98] transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-hakiardhi-red rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    Work With Us
                  </span>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-hakiardhi-red group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="absolute inset-0 bg-gradient-to-r from-hakiardhi-red/5 to-hakiardhi-red/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Link>

                <Link
                  href="/lrm-network"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="group relative flex items-center justify-between px-4 sm:px-5 py-4 sm:py-5 text-sm md:text-base font-semibold !text-black rounded-xl hover:bg-white hover:!text-hakiardhi-red hover:shadow-md active:scale-[0.98] transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-hakiardhi-red rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    LRM Network
                  </span>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-hakiardhi-red group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="absolute inset-0 bg-gradient-to-r from-hakiardhi-red/5 to-hakiardhi-red/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Link>
              </div>

              {/* Bottom Section - Language & CTA */}
              <div className="px-6 pb-6 space-y-4 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
                {/* Language Switcher */}
                <div className="flex items-center justify-between px-5 py-4 bg-gray-50 rounded-xl border border-gray-200 mt-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">Language</span>
                  </div>
                  <LanguageSwitcher variant="toggle" theme="light" size="sm" />
                </div>

                {/* CTA Button */}
                <Button
                  href="/legal-aid"
                  onClick={() => setIsMobileMenuOpen(false)}
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="!py-4 !text-base !font-bold shadow-lg hover:shadow-xl hover:!bg-black hover:!border-black hover:!text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  <span className="flex items-center justify-center gap-2">
                    Get Legal Aid
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Button>
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
