/**
 * Publication Types API Service
 * Service layer for fetching publication types from the API
 */

import { api } from '../client';
import { PublicationTypesAPIResponse } from '@/types/api';

/**
 * Publication type in local format (for UI consumption)
 */
export interface PublicationType {
  name: string;
  slug: string;
  count: number;
}

/**
 * Fetch publication types from API
 *
 * @returns Array of publication types with counts
 * @throws {APIError} If the API request fails
 *
 * @example
 * ```typescript
 * const types = await fetchPublicationTypes();
 * // Returns: [{ name: 'All', slug: 'all', count: 10 }, { name: 'Report', slug: 'report', count: 5 }, ...]
 * ```
 */
export async function fetchPublicationTypes(): Promise<PublicationType[]> {
  const endpoint = '/api/publications/types';
  const response = await api.get<PublicationTypesAPIResponse>(endpoint);

  // API already returns in the correct format
  return response.data;
}
