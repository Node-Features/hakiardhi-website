import StatCard, { StatCardProps } from '../features/StatCard';
import Section from '../ui/Section';
import BackgroundDecor from '../ui/BackgroundDecor';
import Grid from '../ui/Grid';
import AnimatedList from '../ui/AnimatedList';
import { impactStats as defaultStats } from '@/data/impactStats';

export interface ImpactSectionProps {
  title?: string;
  description?: string;
  stats?: Array<Omit<StatCardProps, 'className'>>;
  variant?: 'light' | 'dark';
  className?: string;
}

export default function ImpactSection({
  title = 'Our Impact in Numbers',
  description = 'Measurable results in advancing land rights and social justice across Tanzania',
  stats: statsProp,
  variant = 'light',
  className = '',
}: ImpactSectionProps) {
  const stats = statsProp || defaultStats;

  return (
    <Section variant={variant} spacing="lg" className={className}>
      <BackgroundDecor
        orbs={[
          { position: 'top-left', size: 'md', colors: ['brand', 'orange'], animate: true },
          { position: 'center-right', size: 'lg', colors: ['success', 'blue'], animate: true },
          { position: 'bottom-center', size: 'md', colors: ['blue', 'brand'], animate: true },
        ]}
      />

      <Section.Content>
        <Section.Header title={title} description={description} align="center" />

        <Grid cols={{ base: 1, sm: 2, lg: 4 }} gap="xl">
          <AnimatedList staggerDelay={150}>
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                number={stat.number}
                label={stat.label}
                description={stat.description}
                icon={stat.icon}
              />
            ))}
          </AnimatedList>
        </Grid>
      </Section.Content>
    </Section>
  );
}
