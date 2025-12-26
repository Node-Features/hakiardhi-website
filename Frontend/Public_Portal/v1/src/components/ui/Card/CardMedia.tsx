import { ReactNode } from 'react';
import Image from 'next/image';

export interface CardMediaProps {
  children?: ReactNode;
  image?: string;
  alt?: string;
  height?: string;
  overlay?: boolean;
  className?: string;
}

export default function CardMedia({
  children,
  image,
  alt = '',
  height = 'h-56',
  overlay = false,
  className = '',
}: CardMediaProps) {
  if (children) {
    return (
      <div className={`relative ${height} overflow-hidden ${className}`}>
        {children}
      </div>
    );
  }

  if (image) {
    return (
      <div className={`relative ${height} overflow-hidden ${className}`}>
        <Image
          src={image}
          alt={alt}
          fill
          className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
        />
        {overlay && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        )}
      </div>
    );
  }

  return null;
}
