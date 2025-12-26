/**
 * Hero Section Images
 *
 * Images displayed in the hero carousel on the homepage
 */

export const heroImages = [
  '/images/hero_1.JPG',
  '/images/hero_2.JPG',
  '/images/public_debate_1.JPG',
  '/images/public_debate_2.JPG',
] as const;

export type HeroImage = typeof heroImages[number];
