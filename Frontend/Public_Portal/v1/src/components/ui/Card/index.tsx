/**
 * Card Compound Component
 *
 * A flexible card component for displaying content consistently
 *
 * @example
 * <Card variant="elevated" hoverEffect="lift">
 *   <Card.Media image="/image.jpg" />
 *   <Card.Header>
 *     <Card.Title>Title Here</Card.Title>
 *     <Card.Badge>New</Card.Badge>
 *   </Card.Header>
 *   <Card.Body>
 *     <Card.Description>Description text...</Card.Description>
 *   </Card.Body>
 *   <Card.Footer>
 *     <Button>Learn More</Button>
 *   </Card.Footer>
 * </Card>
 */

import CardRoot, { CardRootProps } from './CardRoot';
import CardMedia from './CardMedia';
import CardHeader from './CardHeader';
import CardTitle from './CardTitle';
import CardBody from './CardBody';
import CardDescription from './CardDescription';
import CardFooter from './CardFooter';
import CardBadge from './CardBadge';

export const Card = Object.assign(CardRoot, {
  Media: CardMedia,
  Header: CardHeader,
  Title: CardTitle,
  Body: CardBody,
  Description: CardDescription,
  Footer: CardFooter,
  Badge: CardBadge,
});

export type { CardRootProps };
export default Card;
