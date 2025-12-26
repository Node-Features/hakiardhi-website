import { ReactNode } from 'react';
import { CONTENT_WIDTHS, SPACING } from '@/constants/design-tokens';

export interface SectionHeaderProps {
  title: string | ReactNode;
  description?: string | ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  variant?: 'light' | 'dark';
}

export default function SectionHeader({
  title,
  description,
  align = 'center',
  className = '',
  variant = 'light',
}: SectionHeaderProps) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center mx-auto',
    right: 'text-right ml-auto',
  };

  const textColor = variant === 'dark' ? 'text-white' : 'text-gray-900';
  const descColor = variant === 'dark' ? 'text-gray-300' : 'text-gray-600';

  return (
    <div className={`${CONTENT_WIDTHS.text.wide} ${SPACING.margin.section.md} ${alignClasses[align]} ${className}`}>
      {/* Decorative accent */}
      <div className={`inline-block ${SPACING.margin.element.sm} ${align === 'center' ? 'mx-auto' : align === 'right' ? 'ml-auto' : ''}`}>
        <div className="h-1 w-16 bg-gradient-to-r from-brand-500 to-brand-300 rounded-full"></div>
      </div>

      <h2 className={`text-display-sm font-black ${textColor} ${SPACING.margin.element.md} leading-tight tracking-tight`}>
        {typeof title === 'string' ? (
          <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            {title}
          </span>
        ) : (
          title
        )}
      </h2>
      {description && (
        <p className={`text-body-lg ${descColor} leading-relaxed font-medium`}>
          {description}
        </p>
      )}
    </div>
  );
}
