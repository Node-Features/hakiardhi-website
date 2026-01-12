'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { heroImages } from '@/data/heroImages';
import { TIMING, SPACING, CONTENT_WIDTHS } from '@/constants/design-tokens';

export default function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Only render current and next image for performance
  const visibleIndices = [currentImageIndex, (currentImageIndex + 1) % heroImages.length];

  const goToSlide = useCallback((index: number) => {
    if (index === currentImageIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex(index);
      setIsTransitioning(false);
    }, TIMING.carousel.transitionDelay);
  }, [currentImageIndex]);

  const goToNextSlide = useCallback(() => {
    goToSlide((currentImageIndex + 1) % heroImages.length);
  }, [currentImageIndex, goToSlide]);

  const goToPrevSlide = useCallback(() => {
    goToSlide((currentImageIndex - 1 + heroImages.length) % heroImages.length);
  }, [currentImageIndex, goToSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevSlide();
      } else if (e.key === 'ArrowRight') {
        goToNextSlide();
      } else if (e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        setIsPaused((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextSlide, goToPrevSlide]);

  useEffect(() => {
    // Trigger fade-in animation after component mounts
    const timer = setTimeout(() => setIsLoaded(true), TIMING.fadeIn.initial);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);

      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
        setIsTransitioning(false);
      }, TIMING.carousel.transitionDelay);
    }, TIMING.carousel.interval);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section
      className="relative h-screen w-full overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Hero images showcasing HakiArdhi's work"
    >
      {/* Screen reader live region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Slide {currentImageIndex + 1} of {heroImages.length}
      </div>

      {/* Background Images with Smooth Fade Transition - Optimized rendering */}
      {heroImages.map((image, index) =>
        visibleIndices.includes(index) && (
          <div
            key={image}
            id={`hero-image-${index}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${index + 1} of ${heroImages.length}`}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex && !isTransitioning
                ? 'opacity-100'
                : 'opacity-0'
            }`}
          >
            <Image
              src={image}
              alt={`HakiArdhi community empowerment - Slide ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
              quality={95}
              sizes="100vw"
            />
          </div>
        )
      )}

      {/* Elegant Gradient Overlay - Sophisticated multi-layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-brand-900/30 via-transparent to-brand-900/30"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

      {/* Hero Content with Elegant Typography - Bottom Aligned */}
      <div className={`relative z-10 container mx-auto ${SPACING.container.responsive} h-full flex items-end justify-center pb-16 lg:pb-20`}>
        <div className={`${CONTENT_WIDTHS.text.wide} w-full text-center`}>
          {/* Main Headline - Minimalistic */}
          <h1
            className={`text-2xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-white leading-tight ${SPACING.margin.element.md} transition-all duration-1000 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{
              textShadow: '2px 2px 8px rgba(0, 0, 0, 0.7)',
              letterSpacing: '-0.01em',
            }}
          >
            Securing Land Rights for All
          </h1>

          {/* Subheadline - Minimized */}
          <p
            className={`text-sm sm:text-base md:text-base lg:text-lg xl:text-xl text-white/90 font-normal ${SPACING.margin.element.md} ${CONTENT_WIDTHS.text.body} mx-auto leading-relaxed transition-all duration-1000 delay-200 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{
              textShadow: '1px 1px 4px rgba(0, 0, 0, 0.6)',
            }}
          >
            Empowering communities through research, training, and advocacy
          </p>

          {/* CTA Buttons - Compact */}
          <div
            className={`flex flex-col sm:flex-row ${SPACING.gap.sm} justify-center items-center transition-all duration-1000 delay-400 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {/* Primary Button - Red */}
            <Button
              href="/programs"
              variant="primary"
              size="lg"
              icon={<Icon name="arrow-right" size="sm" />}
            >
              Explore Our Work
            </Button>

            {/* Secondary Button */}
            <Button
              href="/legal-aid"
              variant="secondary"
              size="lg"
              icon={<Icon name="shield" size="sm" />}
            >
              Get Legal Aid
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Minimal */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <Icon name="chevron-down" size="md" className="text-white/60 drop-shadow-lg" />
      </div>

      {/* Carousel Controls - Minimal */}
      <div className={`absolute bottom-6 right-6 z-10 flex items-center ${SPACING.gap.xs} opacity-60 hover:opacity-100 transition-opacity`}>
        {/* Image Indicators - Minimal Dots */}
        <div className={`flex ${SPACING.gap.xs}`} role="tablist" aria-label="Choose slide">
          {heroImages.map((_, index) => (
            <button
              key={index}
              role="tab"
              aria-selected={index === currentImageIndex}
              aria-controls={`hero-image-${index}`}
              onClick={() => goToSlide(index)}
              className={`rounded-full transition-all duration-500 ${
                index === currentImageIndex
                  ? 'bg-hakiardhi-red w-8 h-2'
                  : 'bg-white/60 hover:bg-white/90 w-2 h-2'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
