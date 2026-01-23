/**
 * Publications API Service
 * Service layer for fetching publications from the API
 */

import { api } from '../client';
import { PublicationsAPIResponse } from '@/types/api';
import { Publication } from '@/data/research';
import { transformAPIPublicationToLocal } from '../transformers';

/**
 * Parameters for fetching publications
 */
export interface FetchPublicationsParams {
  page?: number;
  limit?: number;
  type?: string;
  topic?: string;
  year?: number;
  search?: string;
}

/**
 * Paginated publications response (local format)
 */
export interface PaginatedPublications {
  publications: Publication[];
  meta: {
    currentPage: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Fetch publications from API with filters and pagination
 *
 * @param params - Filter and pagination parameters
 * @returns Paginated publications in local format
 * @throws {APIError} If the API request fails
 *
 * @example
 * ```typescript
 * const result = await fetchPublications({
 *   page: 1,
 *   limit: 10,
 *   type: 'Report',
 *   year: 2024
 * });
 * ```
 */
export async function fetchPublications(
  params: FetchPublicationsParams = {}
): Promise<PaginatedPublications> {
  // Build query parameters
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', String(params.page));
  if (params.limit) queryParams.append('limit', String(params.limit));
  if (params.type) queryParams.append('type', params.type);
  if (params.topic) queryParams.append('topic', params.topic);
  if (params.year) queryParams.append('year', String(params.year));
  if (params.search) queryParams.append('search', params.search);

  const queryString = queryParams.toString();
  const endpoint = `/api/publications${queryString ? `?${queryString}` : ''}`;

  // Fetch data from API
  const response = await api.get<PublicationsAPIResponse>(endpoint);

  // Transform API data to local format
  return {
    publications: response.data.map(transformAPIPublicationToLocal),
    meta: {
      currentPage: response.meta.current_page,
      perPage: response.meta.per_page,
      total: response.meta.total,
      totalPages: response.meta.total_pages,
    },
  };
}

/**
 * Fetch a single publication by ID
 *
 * @param id - Publication ID
 * @returns Publication in local format
 * @throws {APIError} If the API request fails
 *
 * @example
 * ```typescript
 * const publication = await fetchPublicationById('pub-001');
 * ```
 */
export async function fetchPublicationById(id: string): Promise<Publication> {
  const endpoint = `/api/publications/${id}`;
  const response = await api.get<PublicationsAPIResponse>(endpoint);

  // API returns array in data, get first item
  if (response.data.length === 0) {
    throw new Error(`Publication not found: ${id}`);
  }

  return transformAPIPublicationToLocal(response.data[0]);
}
