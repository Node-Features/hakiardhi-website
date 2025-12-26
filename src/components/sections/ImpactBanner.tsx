'use client';

import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { THRESHOLDS } from '@/constants/design-tokens';
import Icon from '../ui/Icon';
import AnimatedList from '../ui/AnimatedList';

export interface ImpactStat {
  number: string;
  label: string;
  icon: string;
  color?: string;
}

export interface ImpactBannerProps {
  stats?: ImpactStat[];
  className?: string;
}

const defaultStats: ImpactStat[] = [
  { number: '30+', label: 'Years of Impact', icon: 'clock', color: 'brand' },
  { number: '1,000+', label: 'Communities Served', icon: 'users', color: 'success' },
  { number: '500+', label: 'Research Publications', icon: 'book', color: 'blue' },
  { number: '5M+', label: 'Lives Touched', icon: 'heart', color: 'orange' },
  { number: '25', label: 'Regions Covered', icon: 'map-pin', color: 'brand' },
  { number: '24/7', label: 'Legal Aid Available', icon: 'shield', color: 'success' },
];

export default function ImpactBanner({ stats = defaultStats, className = '' }: ImpactBannerProps) {
  const [sectionRef, isVisible] = useIntersectionObserver({
    threshold: THRESHOLDS.intersection.low,
    freezeOnceVisible: true,
  });

  const colorClasses = {
    brand: 'text-hakiardhi-red',
    success: 'text-green-600',
    blue: 'text-blue-600',
    orange: 'text-orange-600',
  };

  return (
    <section
      ref={sectionRef}
      className={`relative py-12 lg:py-16 bg-gradient-to-br from-zinc-50 via-white to-zinc-50 ${className}`}
    >
      {/* Subtle decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-hakiardhi-red/20 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-hakiardhi-red/20 to-transparent"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div
          className={`text-center mb-10 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-2xl lg:text-4xl font-black text-gray-900 mb-2">
            Our <span className="text-hakiardhi-red">Impact</span> at a Glance
          </h2>
          <p className="text-base lg:text-lg text-gray-600">
            Measurable results in advancing land rights across Tanzania
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-8">
          <AnimatedList staggerDelay={100}>
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-hakiardhi-red/30"
              >
                {/* Icon */}
                <div className="mb-4 flex justify-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-50 to-zinc-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon
                      name={stat.icon as any}
                      size="lg"
                      className={stat.color ? colorClasses[stat.color as keyof typeof colorClasses] : 'text-hakiardhi-red'}
                    />
                  </div>
                </div>

                {/* Number */}
                <div className="text-3xl lg:text-4xl font-black text-gray-900 mb-2 group-hover:text-hakiardhi-red transition-colors">
                  {stat.number}
                </div>

                {/* Label */}
                <div className="text-sm lg:text-base text-gray-600 font-medium leading-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </AnimatedList>
        </div>
      </div>
    </section>
  );
}
