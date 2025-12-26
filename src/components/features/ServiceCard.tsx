import { ReactNode } from 'react';
import { getColorClasses, getBorderColor, getHoverBorderColor, type ThemeColor } from '@/utils/colors';

export type ServiceCardColor = 'brand' | 'blue' | 'orange' | 'success' | 'error';

export interface ServiceCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  color?: ServiceCardColor;
  className?: string;
}

export default function ServiceCard({
  icon,
  title,
  description,
  color = 'brand',
  className = '',
}: ServiceCardProps) {
  const iconColorClasses = getColorClasses(color as ThemeColor);
  const borderColor = getBorderColor(color as ThemeColor);
  const hoverBorderColor = getHoverBorderColor(color as ThemeColor);

  return (
    <div className={`card-hakiardhi group hover:shadow-theme-xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 border border-gray-100 ${hoverBorderColor} ${className}`}>
      <div
        className={`inline-flex p-4 rounded-xl ${iconColorClasses} mb-5 transition-all group-hover:scale-110 group-hover:rotate-3 duration-500 shadow-md group-hover:shadow-lg`}
      >
        {icon}
      </div>
      <h3 className="text-heading-sm font-bold text-gray-900 mb-3 group-hover:text-brand-600 transition-colors duration-300">{title}</h3>
      <p className="text-body-md text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">{description}</p>

      {/* Decorative line */}
      <div className="mt-4 h-1 w-0 bg-gradient-to-r from-brand-500 to-brand-300 rounded-full group-hover:w-full transition-all duration-500"></div>
    </div>
  );
}
