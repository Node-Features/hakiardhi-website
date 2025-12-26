import Section from '../ui/Section';
import SectionHeader from '../features/SectionHeader';
import Grid, { GridProps } from '../ui/Grid';
import Card from '../ui/Card';
import Image from 'next/image';

export interface Partner {
  name: string;
  logo: string;
  category?: 'donor' | 'research' | 'network';
}

export interface DonorSectionProps {
  title?: string;
  description?: string;
  partners: Partner[];
  variant?: 'light' | 'white';
  cols?: GridProps['cols'];
  className?: string;
}

export default function DonorSection({
  title = 'Partners & Networks',
  description = 'Collaborating with local and international organizations for greater impact',
  partners,
  variant = 'light',
  cols = { base: 2, md: 3, lg: 6 },
  className = '',
}: DonorSectionProps) {
  return (
    <Section variant={variant} spacing="lg" className={className}>
      <Section.Content>
        <SectionHeader
          title={title}
          description={description}
          align="center"
        />

        <Grid cols={cols} gap="md">
          {partners.map((partner, index) => (
            <div
              key={partner.name}
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
                      src={partner.logo}
                      alt={partner.name}
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
