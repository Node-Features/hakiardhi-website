/**
 * BackgroundDecor Component
 *
 * Reusable decorative background elements (gradient orbs/blobs)
 * Replaces 200+ lines of duplicated decoration code
 */

export type OrbPosition =
  | 'top-left'
  | 'top-right'
  | 'top-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'bottom-center'
  | 'center-left'
  | 'center-right'
  | 'center';

export type OrbSize = 'sm' | 'md' | 'lg' | 'xl';

export type OrbColor = 'brand' | 'blue' | 'orange' | 'success' | 'purple' | 'pink';

export interface Orb {
  position: OrbPosition;
  size?: OrbSize;
  colors?: [OrbColor, OrbColor];
  animate?: boolean;
  opacity?: number;
  animationDelay?: string;
}

export interface BackgroundDecorProps {
  orbs?: Orb[];
  variant?: 'default' | 'animated' | 'subtle';
  className?: string;
}

const positionClasses: Record<OrbPosition, string> = {
  'top-left': 'top-10 left-10',
  'top-right': 'top-10 right-10 translate-x-1/2 -translate-y-1/2',
  'top-center': 'top-10 left-1/2 -translate-x-1/2',
  'bottom-left': 'bottom-10 left-10 translate-y-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-10 right-10',
  'bottom-center': 'bottom-10 left-1/2 -translate-x-1/2',
  'center-left': 'top-1/2 left-10 -translate-y-1/2',
  'center-right': 'top-1/2 right-10 -translate-y-1/2',
  'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
};

const sizeClasses: Record<OrbSize, string> = {
  sm: 'w-64 h-64',
  md: 'w-80 h-80',
  lg: 'w-96 h-96',
  xl: 'w-[32rem] h-[32rem]',
};

const colorClasses: Record<OrbColor, string> = {
  brand: 'from-brand-500/10 to-brand-300/5',
  blue: 'from-blue-light-500/10 to-blue-light-300/5',
  orange: 'from-orange-500/10 to-orange-300/5',
  success: 'from-success-500/10 to-success-300/5',
  purple: 'from-purple-500/10 to-purple-300/5',
  pink: 'from-pink-500/10 to-pink-300/5',
};

export default function BackgroundDecor({
  orbs = [],
  variant = 'default',
  className = '',
}: BackgroundDecorProps) {
  // Default orb configurations if none provided
  const defaultOrbs: Orb[] = [
    { position: 'top-left', size: 'md', colors: ['brand', 'orange'], animate: true },
    { position: 'bottom-right', size: 'lg', colors: ['success', 'blue'], animate: true, animationDelay: '2s' },
  ];

  const orbsToRender = orbs.length > 0 ? orbs : defaultOrbs;

  const variantOpacity = variant === 'subtle' ? 'opacity-20' : variant === 'animated' ? 'opacity-30' : 'opacity-30';

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${variantOpacity} ${className}`}>
      {orbsToRender.map((orb, index) => {
        const colors = orb.colors || ['brand', 'orange'];
        const gradientClass = `bg-gradient-to-br ${colorClasses[colors[0]]} ${colorClasses[colors[1]]}`;

        return (
          <div
            key={index}
            className={`
              absolute rounded-full blur-3xl
              ${positionClasses[orb.position]}
              ${sizeClasses[orb.size || 'md']}
              ${gradientClass}
              ${orb.animate ? 'animate-float' : ''}
            `.trim().replace(/\s+/g, ' ')}
            style={orb.animationDelay ? { animationDelay: orb.animationDelay } : undefined}
          />
        );
      })}
    </div>
  );
}
