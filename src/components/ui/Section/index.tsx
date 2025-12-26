/**
 * Section Compound Component
 *
 * A flexible section component for building consistent page sections
 *
 * @example
 * <Section variant="light" spacing="lg">
 *   <Section.Content>
 *     <Section.Header title="What We Do" description="..." />
 *     <Grid cols={{ md: 2, lg: 4 }}>
 *       {items.map(item => <Card {...item} />)}
 *     </Grid>
 *   </Section.Content>
 * </Section>
 */

import SectionRoot, { SectionRootProps } from './SectionRoot';
import SectionHeader from './SectionHeader';
import SectionContent from './SectionContent';
import SectionFooter from './SectionFooter';

export const Section = Object.assign(SectionRoot, {
  Header: SectionHeader,
  Content: SectionContent,
  Footer: SectionFooter,
});

export type { SectionRootProps };
export default Section;
