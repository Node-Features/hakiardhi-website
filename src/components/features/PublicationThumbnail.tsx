'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getThumbnailSources } from '@/utils/documentPreview';

interface PublicationThumbnailProps {
  publicationId: string | number;
  title: string;
  type: string;
  customThumbnail?: string;
  className?: string;
  showPlaceholder?: boolean;
}

export default function PublicationThumbnail({
  publicationId,
  title,
  type,
  customThumbnail,
  className = '',
  showPlaceholder = true,
}: PublicationThumbnailProps) {
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const sources = getThumbnailSources(publicationId, type, customThumbnail);
  const currentSource = sources[currentSourceIndex];

  const handleError = () => {
    // Try next source
    if (currentSourceIndex < sources.length - 1) {
      setCurrentSourceIndex(currentSourceIndex + 1);
    } else {
      setHasError(true);
    }
  };

  // If all sources failed and no placeholder wanted, show SVG
  if (hasError || !showPlaceholder) {
    return (
      <div className={`relative bg-gray-800 ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 to-brand-500/5 flex items-center justify-center">
          <svg
            className="w-20 h-20 text-brand-500/30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        {/* Document type overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      </div>
    );
  }

  return (
    <div className={`relative bg-gray-800 overflow-hidden ${className}`}>
      <Image
        src={currentSource}
        alt={title}
        fill
        className="object-cover"
        onError={handleError}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={currentSourceIndex === 0} // Priority for first attempt
      />
      {/* Overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
    </div>
  );
}
