'use client';

import { useState, useEffect } from 'react';
import Icon from './Icon';

interface ShareSectionProps {
  title: string;
  description: string;
}

export default function ShareSection({ title, description }: ShareSectionProps) {
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const shareLinks = [
    {
      name: 'Facebook',
      icon: 'facebook' as const,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
      color: 'bg-[#1877F2] hover:bg-[#0C63D4]',
    },
    {
      name: 'Twitter',
      icon: 'twitter' as const,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(title)}`,
      color: 'bg-black hover:bg-gray-800',
    },
    {
      name: 'LinkedIn',
      icon: 'linkedin' as const,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
      color: 'bg-[#0A66C2] hover:bg-[#004182]',
    },
    {
      name: 'Email',
      icon: 'mail' as const,
      url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this program: ${title}\n\n${description}\n\n${currentUrl}`)}`,
      color: 'bg-hakiardhi-red hover:bg-hakiardhi-red-dark',
    },
  ];

  return (
    <div className="bg-gray-50 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="share" size="md" className="text-hakiardhi-red" />
        <h3 className="text-xl font-black text-gray-900">Share This Program</h3>
      </div>
      <p className="text-sm text-gray-600 mb-6 leading-relaxed">
        Help spread awareness about our land rights work and make a difference in communities.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target={link.name !== 'Email' ? '_blank' : undefined}
            rel={link.name !== 'Email' ? 'noopener noreferrer' : undefined}
            className={`flex items-center justify-center gap-2 ${link.color} text-white py-3 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 group`}
            aria-label={`Share on ${link.name}`}
          >
            <Icon name={link.icon} size="sm" />
            <span className="text-sm font-bold">{link.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
