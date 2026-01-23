/**
 * Publication Topics API Service
 * Service layer for fetching publication topics from the API
 */

import { api } from '../client';
import { PublicationTopicsAPIResponse } from '@/types/api';

/**
 * Publication topic in local format (for UI consumption)
 */
export interface PublicationTopic {
  name: string;
  slug: string;
  count: number;
}

/**
 * Fetch publication topics from API
 *
 * @returns Array of publication topics with counts
 * @throws {APIError} If the API request fails
 *
 * @example
 * ```typescript
 * const topics = await fetchPublicationTopics();
 * // Returns: [{ name: 'All', slug: 'all', count: 10 }, { name: 'Land Tenure Systems', slug: 'land-tenure-systems', count: 5 }, ...]
 * ```
 */
export async function fetchPublicationTopics(): Promise<PublicationTopic[]> {
  const endpoint = '/api/publications/topics';
  const response = await api.get<PublicationTopicsAPIResponse>(endpoint);

  // API already returns in the correct format
  return response.data;
}
