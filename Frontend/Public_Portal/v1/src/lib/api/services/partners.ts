/**
 * Partners API Service
 * Service layer for fetching partners from the API
 */

import { api } from '../client';
import { PartnersAPIResponse } from '@/types/api';

/**
 * Partner in local format (for UI consumption)
 */
export interface Partner {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  logoUrlDark: string | null;
  websiteUrl: string | null;
  description: string | null;
  partnerType: string;
  partnershipLevel: string | null;
  country: string | null;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
}

/**
 * Fetch partners from API
 *
 * @returns Array of partners
 * @throws {APIError} If the API request fails
 *
 * @example
 * ```typescript
 * const partners = await fetchPartners();
 * console.log(partners[0].name);
 * ```
 */
export async function fetchPartners(): Promise<Partner[]> {
  const endpoint = '/api/partners';
  const response = await api.get<PartnersAPIResponse>(endpoint);

  // Transform API data to local format (snake_case to camelCase)
  return response.data.map((partner) => ({
    id: partner.id,
    name: partner.name,
    slug: partner.slug,
    logoUrl: partner.logo_url,
    logoUrlDark: partner.logo_url_dark,
    websiteUrl: partner.website_url,
    description: partner.description,
    partnerType: partner.partner_type,
    partnershipLevel: partner.partnership_level,
    country: partner.country,
    isActive: partner.is_active,
    isFeatured: partner.is_featured,
    displayOrder: partner.display_order,
  }));
}
