import { ReactNode } from 'react';

export interface SectionFooterProps {
  children: ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export default function SectionFooter({
  children,
  align = 'center',
  className = '',
}: SectionFooterProps) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={`mt-12 ${alignClasses[align]} ${className}`}>
      {children}
    </div>
  );
}
