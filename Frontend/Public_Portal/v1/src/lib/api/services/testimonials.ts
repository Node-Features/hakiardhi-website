/**
 * Testimonials API Service
 * Service layer for fetching testimonials from the Public Portal API
 */

import { api } from '../client';

/**
 * Testimonial from API
 */
export interface APITestimonial {
  id: string;
  quote: string;
  author_name: string;
  author_role: string | null;
  author_location: string | null;
  author_image: string | null;
  author_type: 'beneficiary' | 'partner' | 'staff' | 'lrm' | 'community_leader' | 'government';
  project_id: string | null;
  case_id: string | null;
  portfolio_item_id: string | null;
  rating: number | null;
  video_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Testimonial formatted for UI display
 */
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  quote: string;
  image: string;
  program?: string;
  rating?: number;
  authorType?: string;
}

/**
 * API response structure
 */
interface TestimonialsAPIResponse {
  success: boolean;
  data: APITestimonial[];
}

/**
 * Transform API testimonial to UI format
 */
function transformTestimonial(apiTestimonial: APITestimonial): Testimonial {
  // Map author_type to program label
  const programLabels: Record<string, string> = {
    lrm: 'School of HakiArdhi',
    beneficiary: 'Community Program',
    community_leader: 'Community Leadership',
    partner: 'Partner Organization',
    staff: 'HakiArdhi Staff',
    government: 'Government Partner',
  };

  return {
    id: apiTestimonial.id,
    name: apiTestimonial.author_name,
    role: apiTestimonial.author_role || '',
    location: apiTestimonial.author_location || '',
    quote: apiTestimonial.quote,
    image: apiTestimonial.author_image || '/images/placeholder-avatar.jpg',
    program: programLabels[apiTestimonial.author_type] || undefined,
    rating: apiTestimonial.rating || undefined,
    authorType: apiTestimonial.author_type,
  };
}

/**
 * Fetch testimonials from API
 *
 * @param limit - Maximum number of testimonials to fetch
 * @param featured - Whether to fetch only featured testimonials
 * @returns Array of testimonials
 */
export async function fetchTestimonials(
  limit: number = 3,
  featured: boolean = true
): Promise<Testimonial[]> {
  try {
    const endpoint = `/api/testimonials?limit=${limit}&featured=${featured}`;
    const response = await api.get<TestimonialsAPIResponse>(endpoint);

    if (response.success && response.data) {
      return response.data.map(transformTestimonial);
    }

    return [];
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
}

/**
 * Fetch a single testimonial by ID
 *
 * @param id - Testimonial ID
 * @returns Testimonial or null
 */
export async function fetchTestimonialById(id: string): Promise<Testimonial | null> {
  try {
    const endpoint = `/api/testimonials/${id}`;
    const response = await api.get<{ success: boolean; data: APITestimonial }>(endpoint);

    if (response.success && response.data) {
      return transformTestimonial(response.data);
    }

    return null;
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    return null;
  }
}
