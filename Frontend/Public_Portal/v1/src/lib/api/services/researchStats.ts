/**
 * Research Stats API Service
 * Service layer for fetching research statistics from the API
 */

import { api } from '../client';
import { ResearchStatsAPIResponse } from '@/types/api';

/**
 * Research stats in local format (for UI consumption)
 */
export interface ResearchStats {
  totalPublications: number;
  totalDownloads: number;
  totalViews: number;
  topicCount: number;
  recentPublications: number;
  lastRefreshed: string;
}

/**
 * Fetch research statistics from API
 *
 * @returns Research statistics
 * @throws {APIError} If the API request fails
 *
 * @example
 * ```typescript
 * const stats = await fetchResearchStats();
 * console.log(stats.totalPublications);
 * ```
 */
export async function fetchResearchStats(): Promise<ResearchStats> {
  const endpoint = '/api/research/stats';
  const response = await api.get<ResearchStatsAPIResponse>(endpoint);

  // Transform API data to local format (snake_case to camelCase)
  return {
    totalPublications: response.data.total_publications,
    totalDownloads: response.data.total_downloads,
    totalViews: response.data.total_views,
    topicCount: response.data.topic_count,
    recentPublications: response.data.recent_publications,
    lastRefreshed: response.data.last_refreshed,
  };
}
