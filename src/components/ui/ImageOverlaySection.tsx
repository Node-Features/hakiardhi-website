import { ReactNode } from 'react';
import Image from 'next/image';
import Section from './Section';

export interface ImageOverlaySectionProps {
  image: string;
  overlayOpacity?: 'light' | 'medium' | 'dark';
  blurAmount?: 'sm' | 'md' | 'lg';
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'responsive';
  children: ReactNode;
  className?: string;
  id?: string;
}

/**
 * ImageOverlaySection Component
 *
 * A section with a blurred background image and gradient overlay
 * Perfect for creating visually striking sections with white text
 *
 * @example
 * <ImageOverlaySection
 *   image="/images/hero.jpg"
 *   overlayOpacity="medium"
 *   blurAmount="md"
 * >
 *   <Section.Content>
 *     <h2 className="text-white">Your Content</h2>
 *   </Section.Content>
 * </ImageOverlaySection>
 */
export default function ImageOverlaySection({
  image,
  overlayOpacity = 'medium',
  blurAmount = 'md',
  spacing = 'lg',
  children,
  className = '',
  id,
}: ImageOverlaySectionProps) {
  const overlays = {
    light: 'from-zinc-900/50 via-zinc-800/50 to-zinc-900/50',
    medium: 'from-zinc-900/70 via-zinc-800/60 to-zinc-900/70',
    dark: 'from-zinc-900/85 via-zinc-800/80 to-zinc-900/85',
  };

  const blurs = {
    sm: 'blur-sm',
    md: 'blur-md',
    lg: 'blur-lg',
  };

  return (
    <Section
      variant="none"
      spacing={spacing}
      className={`relative overflow-hidden ${className}`}
      id={id}
    >
      {/* Background Image with Blur */}
      <div className="absolute inset-0 z-0">
        <Image
          src={image}
          alt=""
          fill
          className={`object-cover opacity-20 ${blurs[blurAmount]}`}
          priority={false}
        />
        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${overlays[overlayOpacity]}`} />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 text-white">
        {children}
      </div>
    </Section>
  );
}
