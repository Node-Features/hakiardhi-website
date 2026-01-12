'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface ButtonProps {
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'link' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  children,
  icon,
  iconPosition = 'right',
  className = '',
  disabled = false,
  fullWidth = false,
  type = 'button',
}: ButtonProps) {
  // Optimized text sizing for small-screen laptops (1024-1366px)
  // Reduces font size at lg breakpoint for better content density and visibility
  // Surface Pro, HP ProBook, Dell, Chromebook, EliteBook benefit from smaller text
  const sizeClasses = {
    sm: 'text-[11px] sm:text-xs lg:text-sm px-6 py-2.5 min-h-[40px]',
    md: 'text-xs sm:text-sm lg:text-sm xl:text-base px-8 py-3 min-h-[44px]',
    lg: 'text-sm sm:text-sm lg:text-sm xl:text-base 2xl:text-lg px-10 py-3.5 min-h-[48px]',
  };

  const variantClasses = {
    primary: 'bg-hakiardhi-red text-white border-2 border-hakiardhi-red relative overflow-hidden active:scale-[0.97] active:translate-y-0 shadow-[0_4px_6px_rgba(0,0,0,0.1)] hover:!bg-black hover:!border-black hover:!text-white hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.25)]',
    secondary: 'bg-hakiardhi-red text-white border-2 border-hakiardhi-red active:scale-[0.97] active:translate-y-0 shadow-[0_4px_6px_rgba(0,0,0,0.1)] hover:!bg-black hover:!border-black hover:!text-white hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.25)]',
    tertiary: 'bg-hakiardhi-red text-white border-2 border-hakiardhi-red active:scale-[0.97] active:translate-y-0 shadow-[0_4px_6px_rgba(0,0,0,0.1)] hover:!bg-black hover:!border-black hover:!text-white hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.25)]',
    link: 'bg-hakiardhi-red text-white border-2 border-hakiardhi-red rounded-full active:scale-[0.97] active:translate-y-0 shadow-[0_4px_6px_rgba(0,0,0,0.1)] hover:!bg-black hover:!border-black hover:!text-white hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.25)]',
    dark: 'bg-black text-white border-2 border-black active:scale-[0.97] active:translate-y-0 shadow-[0_4px_6px_rgba(0,0,0,0.1)] hover:!bg-hakiardhi-red hover:!border-hakiardhi-red hover:!text-white hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(214,40,40,0.25)]',
  };

  const baseClasses = [
    'group inline-flex items-center justify-center gap-2',
    'font-semibold transition-all duration-300 ease-out',
    'whitespace-nowrap', // Prevent text wrapping
    'leading-tight', // Normalize line-height for consistent button height
    variant !== 'link' ? 'rounded-full' : '',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    fullWidth ? 'w-full' : '',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hakiardhi-red focus-visible:ring-offset-2',
    sizeClasses[size],
    variantClasses[variant],
    className,
  ].filter(Boolean).join(' ');

  const iconClasses = [
    'flex-shrink-0 transition-all duration-300 ease-out',
    iconPosition === 'right' ? 'group-hover:translate-x-1 group-active:translate-x-0' : 'group-hover:-translate-x-1 group-active:translate-x-0',
    iconPosition === 'left' ? 'order-first mr-3' : 'order-last ml-3',
  ].filter(Boolean).join(' ');

  const IconElement = icon ? (
    <span className={iconClasses}>
      {icon}
    </span>
  ) : null;

  const content = (
    <span className="relative flex items-center justify-center gap-2 z-10 w-full">
      {iconPosition === 'left' && IconElement}
      <span className="flex items-center justify-center">{children}</span>
      {iconPosition === 'right' && IconElement}
    </span>
  );

  const commonStyles = {
    fontFamily: "'Metropolis', sans-serif",
    fontWeight: 600,
    textRendering: 'optimizeLegibility' as const,
    WebkitFontSmoothing: 'antialiased' as const,
    MozOsxFontSmoothing: 'grayscale' as const,
  };

  const gradientClasses = 'absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-0 transition-transform duration-700 rounded-full pointer-events-none';

  if (href && !disabled) {
    return (
      <Link href={href} className={baseClasses} style={commonStyles}>
        {content}
        {variant === 'primary' && (
          <span className={gradientClasses}></span>
        )}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={baseClasses}
      style={commonStyles}
    >
      {content}
      {variant === 'primary' && (
        <span className={gradientClasses}></span>
      )}
    </button>
  );
}
