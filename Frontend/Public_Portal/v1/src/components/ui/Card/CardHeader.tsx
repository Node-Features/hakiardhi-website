import { ReactNode } from 'react';

export interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export default function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`px-6 pt-6 ${className}`}>
      {children}
    </div>
  );
}
