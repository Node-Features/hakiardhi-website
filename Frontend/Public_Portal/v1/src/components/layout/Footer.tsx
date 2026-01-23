'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Icon from '../ui/Icon';
import Grid from '../ui/Grid';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import { SPACING } from '@/constants/design-tokens';
import { subscribeToNewsletter } from '@/lib/api/services/newsletter';

export default function Footer() {
  const [currentYear, setCurrentYear] = useState(2025);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    setStatus('idle');
    setMessage('');

    try {
      const response = await subscribeToNewsletter({ email });

      if (response.success || response.data?.success) {
        setStatus('success');
        setMessage('Thank you for subscribing!');
        setEmail('');
      } else if (response.error) {
        setStatus('error');
        setMessage(response.error.message);
      }
    } catch (err) {
      console.error('Newsletter subscription error:', err);
      setStatus('error');
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-black text-white overflow-hidden">
      <div className={`container mx-auto ${SPACING.container.responsive} py-12 lg:py-16`}>
        <Grid cols={{ base: 1, md: 2, lg: 4 }} gap="lg" className="mb-8 lg:mb-12">
          {/* About Column */}
          <div>
            <Image
              src="/images/logo-white.png"
              alt="HakiArdhi Logo"
              width={180}
              height={60}
              className="h-10 sm:h-12 w-auto mb-4"
            />
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-6">
              Land Rights Research & Resources Institute - Empowering communities since 1994.
            </p>
            <div className="flex gap-2 flex-wrap">
              <a href="https://web.facebook.com/profile.php?id=100068583082096" target="_blank" rel="noopener noreferrer" className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-300 hover:text-hakiardhi-red transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hakiardhi-red focus-visible:ring-offset-2 focus-visible:ring-offset-black" aria-label="Facebook">
                <Icon name="facebook" size="lg" />
              </a>
              <a href="https://x.com/_HAKIARDHI" target="_blank" rel="noopener noreferrer" className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-300 hover:text-hakiardhi-red transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hakiardhi-red focus-visible:ring-offset-2 focus-visible:ring-offset-black" aria-label="X (Twitter)">
                <Icon name="twitter" size="lg" />
              </a>
              <a href="https://www.instagram.com/hakiardhi/" target="_blank" rel="noopener noreferrer" className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-300 hover:text-hakiardhi-red transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hakiardhi-red focus-visible:ring-offset-2 focus-visible:ring-offset-black" aria-label="Instagram">
                <Icon name="instagram" size="lg" />
              </a>
              <a href="https://www.youtube.com/@hakiardhi_tv" target="_blank" rel="noopener noreferrer" className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-300 hover:text-hakiardhi-red transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hakiardhi-red focus-visible:ring-offset-2 focus-visible:ring-offset-black" aria-label="YouTube">
                <Icon name="youtube" size="lg" />
              </a>
              <a href="https://www.linkedin.com/in/hakiardhi-institute-0b986534a/" target="_blank" rel="noopener noreferrer" className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-300 hover:text-hakiardhi-red transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hakiardhi-red focus-visible:ring-offset-2 focus-visible:ring-offset-black" aria-label="LinkedIn">
                <Icon name="linkedin" size="lg" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm sm:text-base md:text-lg font-bold mb-5 text-white uppercase tracking-wide flex items-center gap-2">
              <span className="w-1 h-4 bg-hakiardhi-red rounded-full"></span>
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="group inline-flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-200 text-sm py-1">
                  <Icon name="arrow-right" size="xs" className="opacity-0 group-hover:opacity-100 -ml-2 group-hover:ml-0 transition-all duration-200 text-hakiardhi-red" />
                  <span className="group-hover:translate-x-1 transition-transform duration-200">About Us</span>
                </Link>
              </li>
              <li>
                <Link href="/what-we-do" className="group inline-flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-200 text-sm py-1">
                  <Icon name="arrow-right" size="xs" className="opacity-0 group-hover:opacity-100 -ml-2 group-hover:ml-0 transition-all duration-200 text-hakiardhi-red" />
                  <span className="group-hover:translate-x-1 transition-transform duration-200">What We Do</span>
                </Link>
              </li>
              <li>
                <Link href="/programs" className="group inline-flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-200 text-sm py-1">
                  <Icon name="arrow-right" size="xs" className="opacity-0 group-hover:opacity-100 -ml-2 group-hover:ml-0 transition-all duration-200 text-hakiardhi-red" />
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Our Programs</span>
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="group inline-flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-200 text-sm py-1">
                  <Icon name="arrow-right" size="xs" className="opacity-0 group-hover:opacity-100 -ml-2 group-hover:ml-0 transition-all duration-200 text-hakiardhi-red" />
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Portfolio</span>
                </Link>
              </li>
              <li>
                <Link href="/research" className="group inline-flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-200 text-sm py-1">
                  <Icon name="arrow-right" size="xs" className="opacity-0 group-hover:opacity-100 -ml-2 group-hover:ml-0 transition-all duration-200 text-hakiardhi-red" />
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Research</span>
                </Link>
              </li>
              <li>
                <Link href="/news-events" className="group inline-flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-200 text-sm py-1">
                  <Icon name="arrow-right" size="xs" className="opacity-0 group-hover:opacity-100 -ml-2 group-hover:ml-0 transition-all duration-200 text-hakiardhi-red" />
                  <span className="group-hover:translate-x-1 transition-transform duration-200">News & Events</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm sm:text-base md:text-lg font-bold mb-5 text-white uppercase tracking-wide flex items-center gap-2">
              <span className="w-1 h-4 bg-hakiardhi-red rounded-full"></span>
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/legal-aid" className="group inline-flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-200 text-sm py-1">
                  <Icon name="arrow-right" size="xs" className="opacity-0 group-hover:opacity-100 -ml-2 group-hover:ml-0 transition-all duration-200 text-hakiardhi-red" />
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Legal Aid</span>
                </Link>
              </li>
              <li>
                <Link href="/resource-centre" className="group inline-flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-200 text-sm py-1">
                  <Icon name="arrow-right" size="xs" className="opacity-0 group-hover:opacity-100 -ml-2 group-hover:ml-0 transition-all duration-200 text-hakiardhi-red" />
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Resource Centre</span>
                </Link>
              </li>
              <li>
                <Link href="/lrm-network" className="group inline-flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-200 text-sm py-1">
                  <Icon name="arrow-right" size="xs" className="opacity-0 group-hover:opacity-100 -ml-2 group-hover:ml-0 transition-all duration-200 text-hakiardhi-red" />
                  <span className="group-hover:translate-x-1 transition-transform duration-200">LRM Network</span>
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="group inline-flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-200 text-sm py-1">
                  <Icon name="arrow-right" size="xs" className="opacity-0 group-hover:opacity-100 -ml-2 group-hover:ml-0 transition-all duration-200 text-hakiardhi-red" />
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Gallery</span>
                </Link>
              </li>
              <li>
                <Link href="/work-with-us" className="group inline-flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-200 text-sm py-1">
                  <Icon name="arrow-right" size="xs" className="opacity-0 group-hover:opacity-100 -ml-2 group-hover:ml-0 transition-all duration-200 text-hakiardhi-red" />
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Work With Us</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="group inline-flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-200 text-sm py-1">
                  <Icon name="arrow-right" size="xs" className="opacity-0 group-hover:opacity-100 -ml-2 group-hover:ml-0 transition-all duration-200 text-hakiardhi-red" />
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Contact Us</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="w-full">
            <h3 className="text-sm sm:text-base md:text-lg font-bold mb-5 text-white uppercase tracking-wide flex items-center gap-2">
              <span className="w-1 h-4 bg-hakiardhi-red rounded-full"></span>
              Stay Connected
            </h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-xs sm:text-sm text-gray-300">
                <Icon name="phone" size="sm" className="flex-shrink-0 mt-0.5" />
                <span>0800 711 555</span>
              </li>
              <li className="flex items-start gap-2 text-xs sm:text-sm text-gray-300">
                <Icon name="mail" size="sm" className="flex-shrink-0 mt-0.5" />
                <span>info@hakiardhi.or.tz</span>
              </li>
            </ul>

            {/* Enhanced Newsletter Signup */}
            <div className="w-full">
              <p className={`text-xs sm:text-sm text-gray-300 ${SPACING.margin.element.xs} font-medium`}>Subscribe to our newsletter</p>
              <form
                className="relative mt-3 w-full"
                onSubmit={handleSubscribe}
              >
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address for newsletter
                </label>

                {/* Unified input-button container */}
                <div className="relative group w-full overflow-hidden">
                  {/* Outer glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-hakiardhi-red via-red-600 to-brand-500 rounded-full opacity-0 group-hover:opacity-50 group-focus-within:opacity-75 blur-sm transition-opacity duration-500"></div>

                  {/* Main container with overflow control */}
                  <div className="relative flex items-stretch bg-gradient-to-r from-gray-800 to-gray-900 rounded-full border border-gray-700 group-hover:border-hakiardhi-red/50 group-focus-within:border-hakiardhi-red transition-all duration-300 shadow-lg group-hover:shadow-xl group-focus-within:shadow-hakiardhi-red/20 overflow-hidden">
                    {/* Email icon */}
                    <div className="pl-3 pr-2 flex items-center flex-shrink-0">
                      <Icon name="mail" size="sm" className="text-gray-400 group-focus-within:text-hakiardhi-red transition-colors duration-300" />
                    </div>

                    {/* Input field */}
                    <input
                      id="newsletter-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="Your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 px-2 bg-transparent text-white text-xs sm:text-sm placeholder:text-gray-500 outline-none focus:placeholder:text-gray-600 border-none min-w-0 disabled:opacity-50"
                      aria-label="Email address"
                      style={{ boxShadow: 'none' }}
                    />

                    {/* Submit button - stays within bounds */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group/button relative flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-hakiardhi-red to-red-600 hover:from-red-600 hover:to-hakiardhi-red text-white px-3 sm:px-4 py-2.5 rounded-r-full text-xs sm:text-sm font-semibold transition-all duration-300 active:scale-95 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-hakiardhi-red focus:ring-offset-2 focus:ring-offset-black flex-shrink-0 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Subscribe to newsletter"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </>
                      ) : (
                        <>
                          <span>Subscribe</span>
                          <Icon name="arrow-right" size="sm" className="transform group-hover/button:translate-x-0.5 transition-transform duration-300" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Status message */}
                {status !== 'idle' && (
                  <p className={`mt-2 text-xs flex items-center gap-1.5 ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    <Icon name={status === 'success' ? 'check-circle' : 'alert-circle'} size="xs" />
                    {message}
                  </p>
                )}

                {/* Helper text */}
                {status === 'idle' && (
                  <p className="mt-2 text-xs text-gray-500">Get updates on our latest work and impact stories</p>
                )}
              </form>
            </div>
          </div>
        </Grid>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 lg:pt-8 mt-8 lg:mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 lg:gap-6">
            <p className="text-xs sm:text-sm text-gray-400">
              &copy; {currentYear} Hakiardhi - Ardhi ni Uhai, Ardhi sio bidhaa
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-6 text-xs sm:text-sm">
              <Link href="/privacy-policy" className="text-gray-400 hover:text-hakiardhi-red transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hakiardhi-red focus-visible:ring-offset-2 focus-visible:ring-offset-black">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-hakiardhi-red transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hakiardhi-red focus-visible:ring-offset-2 focus-visible:ring-offset-black">
                Terms of Use
              </Link>
              <Link href="/cookie-policy" className="text-gray-400 hover:text-hakiardhi-red transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hakiardhi-red focus-visible:ring-offset-2 focus-visible:ring-offset-black">
                Cookie Policy
              </Link>
              <Link href="/accessibility" className="text-gray-400 hover:text-hakiardhi-red transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hakiardhi-red focus-visible:ring-offset-2 focus-visible:ring-offset-black">
                Accessibility
              </Link>

              {/* Language Switcher */}
              <div className="border-l border-gray-700 pl-4 ml-2">
                <LanguageSwitcher variant="dropdown" theme="dark" size="sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
