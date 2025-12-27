import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'default' | 'circular' | 'rectangular' | 'text';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className = '', variant = 'default', width, height, animation = 'pulse', ...props }, ref) => {
    const baseClasses = 'bg-zinc-200 dark:bg-zinc-800';

    const animationClasses = {
      pulse: 'animate-pulse',
      wave: 'animate-shimmer bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800',
      none: '',
    };

    const variantClasses = {
      default: 'rounded-md',
      circular: 'rounded-full',
      rectangular: 'rounded-none',
      text: 'rounded h-4',
    };

    const style: React.CSSProperties = {
      width: width || undefined,
      height: height || undefined,
    };

    return (
      <div
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
        style={style}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export default Skeleton;

// Compound components for common skeleton patterns
export const SkeletonText = ({ lines = 3, className = '' }: { lines?: number; className?: string }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} variant="text" className={i === lines - 1 ? 'w-3/4' : 'w-full'} />
    ))}
  </div>
);

export const SkeletonCard = ({ className = '' }: { className?: string }) => (
  <div className={`space-y-4 ${className}`}>
    <Skeleton className="h-32 w-full" />
    <div className="space-y-2">
      <Skeleton variant="text" className="w-3/4" />
      <Skeleton variant="text" className="w-1/2" />
    </div>
  </div>
);

export const SkeletonInput = ({ className = '' }: { className?: string }) => (
  <Skeleton className={`h-10 w-full ${className}`} />
);

export const SkeletonAvatar = ({ size = 40, className = '' }: { size?: number; className?: string }) => (
  <Skeleton variant="circular" width={size} height={size} className={className} />
);
