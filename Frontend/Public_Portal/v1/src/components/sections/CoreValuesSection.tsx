'use client';

import { useMultipleIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { coreValues } from '@/data/coreValues';
import { THRESHOLDS, SPACING, CONTENT_WIDTHS, RESPONSIVE } from '@/constants/design-tokens';
import BackgroundDecor from '../ui/BackgroundDecor';
import Card from '../ui/Card';
import Icon from '../ui/Icon';

export interface CoreValuesSectionProps {
  className?: string;
}

export default function CoreValuesSection({ className = '' }: CoreValuesSectionProps) {
  // Use optimized single observer for all core values
  const [visibleIndices, getRef] = useMultipleIntersectionObserver(
    coreValues.length,
    { threshold: THRESHOLDS.intersection.default }
  );


  return (
    <section
      className={`relative ${RESPONSIVE.section} overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 ${className}`}
    >
      {/* Enhanced decorative gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-orange-500/10 to-brand-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-[32rem] h-[32rem] bg-gradient-to-br from-brand-500/10 to-hakiardhi-red/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-gradient-to-br from-success-500/5 to-brand-500/5 rounded-full blur-3xl"></div>

      <div className={`container mx-auto ${RESPONSIVE.container} relative z-10`}>
        {/* Enhanced Section Header */}
        <div className={`text-center ${SPACING.margin.section.md}`}>
          <div className={SPACING.component.relaxed}>
            {/* Decorative top element */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-2">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-hakiardhi-red"></div>
                <div className="w-2 h-2 rounded-full bg-hakiardhi-red"></div>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-hakiardhi-red"></div>
              </div>
            </div>

            <h2 className="text-3xl lg:text-5xl xl:text-6xl font-black text-gray-900 mb-4">
              Our Core <span className="text-transparent bg-clip-text bg-gradient-to-r from-hakiardhi-red to-brand-500">Values</span>
            </h2>

            {/* Decorative underline */}
            <div className="flex justify-center mb-6">
              <div className="h-1.5 w-24 bg-gradient-to-r from-hakiardhi-red via-brand-500 to-hakiardhi-red rounded-full"></div>
            </div>

            <p className={`text-base lg:text-xl text-gray-700 ${CONTENT_WIDTHS.text.wide} mx-auto leading-relaxed font-medium`}>
              The fundamental principles that guide HakiArdhi's operations and decision-making,
              rooted in respect for indigenous knowledge and participatory approaches to land rights.
            </p>
          </div>
        </div>

        {/* Core Values List */}
        <div className="space-y-0">
          {coreValues.map((value, index) => {
            const isEven = index % 2 === 0;
            const isVisible = visibleIndices.get(index) || false;

            return (
              <div key={index}>
                <div
                  ref={getRef(index) as React.RefObject<HTMLDivElement>}
                  data-index={index}
                  className={`grid grid-cols-1 lg:grid-cols-2 ${SPACING.gap.xl} items-center ${SPACING.padding.lg} transition-all duration-1000 ${
                    isVisible ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {/* Text Content - Enhanced Card */}
                  <div
                    className={`${isEven ? 'lg:order-1' : 'lg:order-2'} transition-all duration-1000 ${
                      isVisible
                        ? 'translate-x-0 scale-100'
                        : isEven
                        ? '-translate-x-10 scale-95'
                        : 'translate-x-10 scale-95'
                    } flex flex-col justify-center`}
                  >
                    <Card variant="elevated" className="bg-white/90 backdrop-blur-sm border border-gray-100 hover:shadow-2xl hover:border-hakiardhi-red/20 transition-all duration-500 h-full">
                      <Card.Body className="p-8 lg:p-10">
                        <div className={SPACING.component.loose}>
                          {/* Icon and Title */}
                          <div className="flex items-center gap-5 mb-6">
                            <div className="relative flex-shrink-0">
                              {/* Icon background glow */}
                              <div className="absolute inset-0 bg-gradient-to-br from-hakiardhi-red/20 to-brand-500/20 rounded-2xl blur-lg"></div>
                              <div className="relative w-16 h-16 flex items-center justify-center bg-gradient-to-br from-hakiardhi-red/10 to-brand-500/10 rounded-2xl border-2 border-brand-500/20">
                                <div className="w-10 h-10 text-brand-500">
                                  {value.icon}
                                </div>
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-2xl lg:text-3xl xl:text-4xl font-black text-gray-900 leading-tight">
                                {value.title}
                              </h3>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-lg lg:text-xl text-gray-700 leading-relaxed mb-8">
                            {value.description}
                          </p>

                          {/* In Practice Section - Enhanced */}
                          <div className="bg-gradient-to-br from-gray-50 to-brand-50/30 rounded-xl p-6 border border-gray-100">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-hakiardhi-red to-brand-500 flex items-center justify-center">
                                <Icon name="star" size="sm" className="text-white" />
                              </div>
                              <h4 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-hakiardhi-red to-brand-500">
                                In Practice
                              </h4>
                            </div>
                            <div className="space-y-3">
                              {value.inPractice.map((practice, practiceIndex) => (
                                <div key={practiceIndex} className="flex items-start gap-3 group">
                                  <div className="flex-shrink-0 mt-0.5">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-success-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                      <Icon name="check" size="sm" className="text-white" />
                                    </div>
                                  </div>
                                  <p className="text-gray-700 text-base leading-relaxed">{practice}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>

                  {/* Image/Visual - Enhanced */}
                  <div
                    className={`${isEven ? 'lg:order-2' : 'lg:order-1'} transition-all duration-1000 ${
                      isVisible
                        ? 'translate-x-0 scale-100'
                        : isEven
                        ? 'translate-x-10 scale-95'
                        : '-translate-x-10 scale-95'
                    } flex items-center justify-center`}
                  >
                    <div className="relative w-full max-w-md group">
                      {/* Outer glow effect */}
                      <div className="absolute -inset-2 bg-gradient-to-br from-hakiardhi-red/20 via-brand-500/20 to-success-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white border-2 border-gray-200 group-hover:border-hakiardhi-red/40 shadow-xl group-hover:shadow-2xl transition-all duration-500">
                        {/* Background gradient patterns */}
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-50/50 via-transparent to-hakiardhi-red/5"></div>
                        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-brand-500/10 to-transparent rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-hakiardhi-red/10 to-transparent rounded-full blur-3xl"></div>

                        {/* Icon/Visual Representation */}
                        <div className="absolute inset-0 flex items-center justify-center p-12">
                          <div className="w-full h-full text-brand-500/30 group-hover:text-brand-500/50 group-hover:scale-110 transition-all duration-500">
                            {value.icon}
                          </div>
                        </div>

                        {/* Value Number - Enhanced Badge */}
                        <div className="absolute top-6 right-6 z-10">
                          <div className="relative">
                            {/* Badge glow */}
                            <div className="absolute inset-0 bg-hakiardhi-red rounded-full blur-md opacity-60"></div>
                            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-hakiardhi-red to-red-700 flex items-center justify-center shadow-2xl ring-4 ring-white/50 group-hover:scale-110 transition-transform duration-300">
                              <span className="text-3xl font-black text-white">
                                {String(index + 1).padStart(2, '0')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Accent - Enhanced */}
                        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-hakiardhi-red via-brand-500 to-hakiardhi-red"></div>

                        {/* Corner decorations */}
                        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-brand-500/30 rounded-tl-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-hakiardhi-red/30 rounded-br-3xl"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Divider between values */}
                {index < coreValues.length - 1 && (
                  <div className="flex items-center justify-center py-12 lg:py-16">
                    <div className="flex items-center gap-3 w-full max-w-3xl">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-hakiardhi-red/40 to-hakiardhi-red/60"></div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></div>
                        <div className="w-3 h-3 rounded-full bg-hakiardhi-red"></div>
                        <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-hakiardhi-red/40 to-hakiardhi-red/60"></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Values in Action - Enhanced Design */}
        <div className="mt-20 lg:mt-32">
          <div className="relative overflow-hidden">
            {/* Enhanced Background decoration with patterns */}
            <div className="absolute inset-0 bg-gradient-to-br from-hakiardhi-red/5 via-brand-50/50 to-hakiardhi-red/5 rounded-3xl"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-500/10 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-hakiardhi-red/10 to-transparent rounded-full blur-3xl"></div>

            {/* Decorative border */}
            <div className="absolute inset-0 rounded-3xl border-2 border-gray-100"></div>

            {/* Content */}
            <div className="relative px-6 py-12 lg:px-16 lg:py-20">
              <div className="max-w-4xl mx-auto text-center space-y-8">
                {/* Enhanced Icon/Badge */}
                <div className="flex justify-center">
                  <div className="relative">
                    {/* Badge glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-hakiardhi-red to-brand-600 rounded-full blur-xl opacity-50"></div>
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-hakiardhi-red via-red-600 to-brand-600 flex items-center justify-center shadow-2xl ring-8 ring-white/50 animate-pulse">
                      <Icon name="heart" size="xl" className="text-white" />
                    </div>
                  </div>
                </div>

                {/* Enhanced Title */}
                <div className="space-y-4">
                  <h3 className="text-3xl lg:text-5xl xl:text-6xl font-black text-gray-900">
                    Values in <span className="text-transparent bg-clip-text bg-gradient-to-r from-hakiardhi-red via-red-600 to-brand-500">Action</span>
                  </h3>
                  <div className="flex justify-center">
                    <div className="h-1.5 w-32 bg-gradient-to-r from-hakiardhi-red via-red-600 to-brand-500 rounded-full shadow-lg"></div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-6">
                  <p className="text-xl lg:text-2xl text-gray-800 leading-relaxed font-medium">
                    For over 30 years, these core values have guided our work with rural and peri-urban
                    communities across Tanzania, helping us build a movement for equitable land tenure.
                  </p>

                  <Card variant="elevated" className="bg-white/80 backdrop-blur-sm">
                    <Card.Body className="py-6 px-8">
                      <p className="text-lg text-hakiardhi-red font-semibold leading-relaxed">
                        Every program, research initiative, and advocacy effort reflects our commitment to
                        these principles.
                      </p>
                    </Card.Body>
                  </Card>
                </div>

                {/* Enhanced Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                  {[
                    { value: '30+', label: 'Years of Impact', icon: 'calendar' },
                    { value: '500+', label: 'Communities Served', icon: 'users' },
                    { value: '100%', label: 'Values-Driven', icon: 'heart' }
                  ].map((stat, idx) => (
                    <div key={idx} className="group">
                      <div className="relative">
                        {/* Stat card glow */}
                        <div className="absolute -inset-1 bg-gradient-to-br from-hakiardhi-red/20 to-brand-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-100 group-hover:border-hakiardhi-red/30 shadow-lg group-hover:shadow-2xl transform group-hover:-translate-y-1 transition-all duration-500">
                          {/* Icon badge */}
                          <div className="flex justify-center mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-hakiardhi-red to-brand-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                              <Icon name={stat.icon as any} size="md" className="text-white" />
                            </div>
                          </div>

                          {/* Stat value */}
                          <div className="text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-hakiardhi-red to-brand-500 mb-2 text-center">
                            {stat.value}
                          </div>

                          {/* Stat label */}
                          <div className="text-sm font-bold text-gray-600 uppercase tracking-wider text-center">
                            {stat.label}
                          </div>

                          {/* Bottom accent */}
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-hakiardhi-red to-transparent rounded-b-2xl"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
