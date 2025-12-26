import { ReactNode } from 'react';

export interface SectionContentProps {
  children: ReactNode;
  className?: string;
}

export default function SectionContent({ children, className = '' }: SectionContentProps) {
  return (
    <div className={`hakiardhi-container relative z-10 ${className}`}>
      {children}
    </div>
  );
}
