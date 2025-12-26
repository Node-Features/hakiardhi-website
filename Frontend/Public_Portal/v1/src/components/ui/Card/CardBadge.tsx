import { ReactNode } from 'react';

export interface CardBadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  className?: string;
}

export default function CardBadge({ children, variant = 'primary', className = '' }: CardBadgeProps) {
  const variantClasses = {
    primary: 'bg-brand-500 text-white',
    secondary: 'bg-gray-500 text-white',
    success: 'bg-success-500 text-white',
    warning: 'bg-warning-500 text-white',
  };

  return (
    <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}
