/**
 * News & Events API Service
 * Service layer for fetching news and events from the Public Portal API
 */

import { api } from '../client';

/**
 * News item from API
 */
export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  type: 'News' | 'Event' | 'Announcement' | 'Update';
  event_date: string | null;
  event_location: string | null;
  gallery: string[];
  related_links: { title: string; url: string }[];
  tags: string[];
  is_featured: boolean;
  is_published: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
  category_id: string | null;
  category: string | null;
  category_description: string | null;
  author_id: string | null;
  author_name: string | null;
  author_image: string | null;
  date: string;
  is_upcoming: boolean;
  is_past_event: boolean;
  gallery_count: number;
}

/**
 * News API response
 */
interface NewsAPIResponse {
  success: boolean;
  data: NewsItem[];
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

/**
 * News response with pagination
 */
export interface NewsResponse {
  items: NewsItem[];
  meta: {
    currentPage: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Fetch parameters for news
 */
export interface FetchNewsParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  category?: string;
  featured?: boolean;
}

/**
 * Fetch news and events from API
 *
 * @param params - Fetch parameters
 * @returns News response with pagination
 */
export async function fetchNews(params: FetchNewsParams = {}): Promise<NewsResponse> {
  const { page = 1, limit = 10, search, type, category, featured } = params;

  // Build query string
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());

  if (search) queryParams.append('search', search);
  if (type && type !== 'All') queryParams.append('type', type);
  if (category && category !== 'All') queryParams.append('category', category);
  if (featured !== undefined) queryParams.append('featured', featured.toString());

  const endpoint = `/api/news?${queryParams.toString()}`;
  const response = await api.get<NewsAPIResponse>(endpoint);

  return {
    items: response.data || [],
    meta: response.meta ? {
      currentPage: response.meta.current_page,
      perPage: response.meta.per_page,
      total: response.meta.total,
      totalPages: response.meta.total_pages,
    } : {
      currentPage: 1,
      perPage: limit,
      total: response.data?.length || 0,
      totalPages: 1,
    },
  };
}

/**
 * Fetch featured news
 *
 * @param limit - Number of featured items to fetch
 * @returns Array of featured news items
 */
export async function fetchFeaturedNews(limit: number = 3): Promise<NewsItem[]> {
  try {
    const response = await fetchNews({ featured: true, limit });
    return response.items;
  } catch (error) {
    console.error('Error fetching featured news:', error);
    return [];
  }
}

/**
 * Fetch a single news item by slug
 *
 * @param slug - News item slug
 * @returns News item or null if not found
 */
export async function fetchNewsBySlug(slug: string): Promise<NewsItem | null> {
  try {
    const endpoint = `/api/news/${slug}`;
    const response = await api.get<{ success: boolean; data: NewsItem }>(endpoint);

    if (response.success && response.data) {
      return response.data;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch upcoming events
 *
 * @param limit - Number of events to fetch
 * @returns Array of upcoming events
 */
export async function fetchUpcomingEvents(limit: number = 5): Promise<NewsItem[]> {
  try {
    const endpoint = `/api/events/upcoming?limit=${limit}`;
    const response = await api.get<{ success: boolean; data: NewsItem[] }>(endpoint);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return [];
  }
}

/**
 * Extract unique years from news items
 */
export function extractYears(items: NewsItem[]): (string | number)[] {
  const yearSet = new Set(items.map(item => new Date(item.date).getFullYear()));
  return ['All', ...Array.from(yearSet).sort((a, b) => b - a)];
}

/**
 * Get count of items by type
 */
export function getTypeCount(items: NewsItem[], type: string): number {
  if (type === 'All') return items.length;
  return items.filter(item => item.type === type).length;
}
