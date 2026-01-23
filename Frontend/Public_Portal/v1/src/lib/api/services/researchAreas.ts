/**
 * Research Areas API Service
 * Service layer for fetching research areas from the API
 */

import { api } from '../client';
import { ResearchAreasAPIResponse } from '@/types/api';

/**
 * Research area in local format (for UI consumption)
 */
export interface ResearchArea {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  coverImage: string | null;
  publicationCount: number;
  displayOrder: number;
  isActive: boolean;
}

/**
 * Fetch research areas from API
 *
 * @returns Array of research areas
 * @throws {APIError} If the API request fails
 *
 * @example
 * ```typescript
 * const areas = await fetchResearchAreas();
 * console.log(areas[0].name);
 * ```
 */
export async function fetchResearchAreas(): Promise<ResearchArea[]> {
  const endpoint = '/api/research/areas';
  const response = await api.get<ResearchAreasAPIResponse>(endpoint);

  // Transform API data to local format (snake_case to camelCase)
  return response.data.map((area) => ({
    id: area.id,
    name: area.name,
    slug: area.slug,
    description: area.description,
    iconName: area.icon_name,
    coverImage: area.cover_image,
    publicationCount: area.publication_count,
    displayOrder: area.display_order,
    isActive: area.is_active,
  }));
}
