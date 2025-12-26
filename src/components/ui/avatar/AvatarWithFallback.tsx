'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface AvatarWithFallbackProps {
  src?: string | null;
  name: string;
  size?: 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge';
  status?: 'online' | 'offline' | 'busy' | 'none';
  className?: string;
}

const sizeClasses = {
  xsmall: 'h-6 w-6',
  small: 'h-8 w-8',
  medium: 'h-10 w-10',
  large: 'h-12 w-12',
  xlarge: 'h-14 w-14',
  xxlarge: 'h-16 w-16',
};

const textSizeClasses = {
  xsmall: 'text-xs',
  small: 'text-xs',
  medium: 'text-sm',
  large: 'text-base',
  xlarge: 'text-lg',
  xxlarge: 'text-xl',
};

const statusSizeClasses = {
  xsmall: 'h-1.5 w-1.5',
  small: 'h-2 w-2',
  medium: 'h-2.5 w-2.5',
  large: 'h-3 w-3',
  xlarge: 'h-3.5 w-3.5',
  xxlarge: 'h-4 w-4',
};

const statusColorClasses = {
  online: 'bg-success-500',
  offline: 'bg-error-400',
  busy: 'bg-warning-500',
};

const AvatarWithFallback: React.FC<AvatarWithFallbackProps> = ({
  src,
  name,
  size = 'medium',
  status = 'none',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  // Generate initials from name
  const initials = name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Generate a consistent pastel color based on the name
  const getColorClass = (name: string) => {
    const colors = [
      'bg-brand-100 text-brand-600',
      'bg-pink-100 text-pink-600',
      'bg-cyan-100 text-cyan-600',
      'bg-orange-100 text-orange-600',
      'bg-green-100 text-green-600',
      'bg-purple-100 text-purple-600',
      'bg-yellow-100 text-yellow-600',
      'bg-error-100 text-error-600',
    ];

    const index = name
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const showFallback = !src || imageError;

  return (
    <div className={`relative flex-shrink-0 rounded-full ${sizeClasses[size]} ${className}`}>
      {showFallback ? (
        // Fallback with initials
        <div
          className={`flex ${sizeClasses[size]} items-center justify-center rounded-full ${getColorClass(name)}`}
        >
          <span className={`${textSizeClasses[size]} font-medium`}>{initials}</span>
        </div>
      ) : (
        // Image
        <Image
          width={0}
          height={0}
          sizes="100vw"
          src={src}
          alt={name}
          className={`${sizeClasses[size]} rounded-full object-cover`}
          onError={() => setImageError(true)}
        />
      )}

      {/* Status Indicator */}
      {status !== 'none' && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-[1.5px] border-white dark:border-gray-900 ${
            statusSizeClasses[size]
          } ${statusColorClasses[status] || ''}`}
        ></span>
      )}
    </div>
  );
};

export default AvatarWithFallback;
