import { ReactNode } from 'react';

export interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export default function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return (
    <p className={`text-body-md text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300 ${className}`}>
      {children}
    </p>
  );
}
