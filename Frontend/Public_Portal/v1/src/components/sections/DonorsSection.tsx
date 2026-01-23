'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Section from '../ui/Section';
import Grid from '../ui/Grid';
import Card from '../ui/Card';
import SectionHeader from '../features/SectionHeader';
import { PartnersGridSkeleton } from '../ui/PartnerCardSkeleton';
import { fetchPartners, Partner } from '@/lib/api/services/partners';

export interface DonorsSectionProps {
  title?: string;
  description?: string;
  className?: string;
  variant?: 'white' | 'light';
}

/**
 * Check if image URL is safe to use with Next.js Image
 */
function getSafeImageUrl(url: string | null): string {
  if (!url) return '/images/placeholder-logo.png';
  if (url.startsWith('/')) return url;

  const allowedDomains = [
    'hakiardhi-api.vercel.app',
    'tjsatamyfjxdxqgxmcuq.supabase.co',
  ];

  try {
    const urlObj = new URL(url);
    if (allowedDomains.some(domain => urlObj.hostname.includes(domain))) {
      return url;
    }
  } catch {
    // Invalid URL
  }

  return '/images/placeholder-logo.png';
}

export default function DonorsSection({
  title = 'Our Partners & Donors',
  description = 'Working together with leading organizations to create lasting impact',
  className = '',
  variant = 'white',
}: DonorsSectionProps) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch partners from API
  useEffect(() => {
    async function loadPartners() {
      try {
        setIsLoading(true);
        const data = await fetchPartners();
        // Filter to only show active and featured partners
        const featuredPartners = data.filter(p => p.isActive && p.isFeatured);
        setPartners(featuredPartners.length > 0 ? featuredPartners : data.filter(p => p.isActive));
      } catch (error) {
        console.error('Failed to load partners:', error);
        setPartners([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadPartners();
  }, []);
  return (
    <Section variant={variant} spacing="lg" className={className}>
      <Section.Content>
        <SectionHeader
          title={title}
          description={description}
          align="center"
        />

        {isLoading ? (
          <PartnersGridSkeleton count={6} />
        ) : partners.length > 0 ? (
          <Grid cols={{ base: 2, md: 3, lg: 6 }} gap="md">
            {partners.map((partner, index) => (
              <div
                key={partner.id}
                className="opacity-0 animate-fade-in"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'forwards',
                }}
              >
                {partner.websiteUrl ? (
                  <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer">
                    <Card variant="elevated" className="hover:shadow-lg hover:scale-105 transition-all duration-300 h-full">
                      <Card.Body className="p-6 flex items-center justify-center">
                        <div className="relative w-full h-20">
                          <Image
                            src={getSafeImageUrl(partner.logoUrl)}
                            alt={partner.name}
                            fill
                            className="object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                          />
                        </div>
                      </Card.Body>
                    </Card>
                  </a>
                ) : (
                  <Card variant="elevated" className="hover:shadow-lg hover:scale-105 transition-all duration-300 h-full">
                    <Card.Body className="p-6 flex items-center justify-center">
                      <div className="relative w-full h-20">
                        <Image
                          src={getSafeImageUrl(partner.logoUrl)}
                          alt={partner.name}
                          fill
                          className="object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                        />
                      </div>
                    </Card.Body>
                  </Card>
                )}
              </div>
            ))}
          </Grid>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No partners available at the moment.</p>
          </div>
        )}
      </Section.Content>
    </Section>
  );
}
