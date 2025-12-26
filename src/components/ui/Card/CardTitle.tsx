import { ReactNode } from 'react';

export interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export default function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={`text-heading-sm font-bold text-gray-900 group-hover:text-brand-600 transition-colors duration-300 ${className}`}>
      {children}
    </h3>
  );
}
