import ServiceCard, { ServiceCardProps } from '../features/ServiceCard';
import Section from '../ui/Section';
import BackgroundDecor from '../ui/BackgroundDecor';
import Grid from '../ui/Grid';
import AnimatedList from '../ui/AnimatedList';
import { services as defaultServices } from '@/data/services';

export interface WhatWeDoSectionProps {
  title?: string;
  description?: string;
  services?: Array<Omit<ServiceCardProps, 'className'>>;
  variant?: 'light' | 'dark';
  className?: string;
}

export default function WhatWeDoSection({
  title = 'What We Do',
  description = 'For over 30 years, HakiArdhi has been at the forefront of protecting land rights and empowering communities across Tanzania through comprehensive programs.',
  services: servicesProp,
  variant = 'light',
  className = '',
}: WhatWeDoSectionProps) {
  const services = servicesProp || defaultServices;

  return (
    <Section variant={variant} spacing="lg" className={className}>
      <BackgroundDecor
        orbs={[
          { position: 'top-right', size: 'lg', colors: ['brand', 'orange'], animate: false },
          { position: 'bottom-left', size: 'lg', colors: ['blue', 'success'], animate: false },
        ]}
      />

      <Section.Content>
        <Section.Header title={title} description={description} align="center" />

        <Grid cols={{ base: 1, md: 2, lg: 4 }} gap="lg">
          <AnimatedList staggerDelay={100}>
            {services.map((service, index) => (
              <ServiceCard
                key={index}
                icon={service.icon}
                title={service.title}
                description={service.description || ''}
                color={service.color as any}
              />
            ))}
          </AnimatedList>
        </Grid>
      </Section.Content>
    </Section>
  );
}
