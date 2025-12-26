'use client';

import Image from 'next/image';
import Section from '../ui/Section';
import Grid from '../ui/Grid';
import Card from '../ui/Card';
import Icon from '../ui/Icon';
import SectionHeader from '../features/SectionHeader';

// Donor/Partner data
const donors = [
  {
    name: 'Austrian Development Agency',
    logo: '/images/austrian-development-agency-logo.jpg',
  },
  {
    name: 'Horizont3000',
    logo: '/images/donor_horizont3000_logo.jpg',
  },
  {
    name: 'International Land Coalition',
    logo: '/images/international-land-coalition.png',
  },
  {
    name: 'Ardhi University',
    logo: '/images/research-patner-aru-logo.jpg',
  },
  {
    name: 'IPIS Research',
    logo: '/images/research-patner-IPIS-logo.png',
  },
  {
    name: 'University of Dar es Salaam',
    logo: '/images/research-patner-udsm-logo.png',
  },
];

export interface DonorsSectionProps {
  title?: string;
  description?: string;
  className?: string;
  variant?: 'white' | 'light';
}

export default function DonorsSection({
  title = 'Our Partners & Donors',
  description = 'Working together with leading organizations to create lasting impact',
  className = '',
  variant = 'white',
}: DonorsSectionProps) {
  return (
    <Section variant={variant} spacing="lg" className={className}>
      <Section.Content>
        <SectionHeader
          title={title}
          description={description}
          align="center"
        />

        <Grid cols={{ base: 2, md: 3, lg: 6 }} gap="md">
          {donors.map((donor, index) => (
            <div
              key={donor.name}
              className="opacity-0 animate-fade-in"
              style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: 'forwards',
              }}
            >
              <Card variant="elevated" className="hover:shadow-lg hover:scale-105 transition-all duration-300 h-full">
                <Card.Body className="p-6 flex items-center justify-center">
                  <div className="relative w-full h-20">
                    <Image
                      src={donor.logo}
                      alt={donor.name}
                      fill
                      className="object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    />
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))}
        </Grid>
      </Section.Content>
    </Section>
  );
}
