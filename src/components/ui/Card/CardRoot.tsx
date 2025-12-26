import { ReactNode } from 'react';

export interface CardRootProps {
  children: ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled' | 'glass';
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'none';
  className?: string;
  onClick?: () => void;
  clickable?: boolean;
}

export default function CardRoot({
  children,
  variant = 'elevated',
  hoverEffect = 'lift',
  className = '',
  onClick,
  clickable = false,
}: CardRootProps) {
  const variantClasses = {
    elevated: 'bg-white shadow-theme-sm hover:shadow-theme-xl border border-gray-100',
    outlined: 'bg-white border-2 border-gray-200 hover:border-brand-500',
    filled: 'bg-gray-50 border border-gray-200',
    glass: 'bg-white/5 backdrop-blur-md border border-gray-200/20',
  };

  const hoverEffectClasses = {
    lift: 'hover:-translate-y-3',
    glow: 'hover:shadow-[0_8px_24px_rgba(214,40,40,0.25)]',
    scale: 'hover:scale-105',
    none: '',
  };

  const cursorClass = clickable || onClick ? 'cursor-pointer' : '';

  return (
    <div
      onClick={onClick}
      className={`
        group rounded-2xl overflow-hidden transition-all duration-500
        ${variantClasses[variant]}
        ${hoverEffectClasses[hoverEffect]}
        ${cursorClass}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {children}
    </div>
  );
}
