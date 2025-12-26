import { ReactNode } from 'react';

export interface CardFooterProps {
  children: ReactNode;
  className?: string;
  showDivider?: boolean;
}

export default function CardFooter({ children, className = '', showDivider = true }: CardFooterProps) {
  return (
    <>
      {showDivider && (
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-6 group-hover:via-brand-300 transition-colors duration-500"></div>
      )}
      <div className={`px-6 pb-6 pt-5 ${className}`}>
        {children}
      </div>
    </>
  );
}
