/**
 * Resources API Service
 * Service layer for fetching resources from the Publications API
 * Resources include: Training Materials, Manuals, Legal Guides, Policy Briefs, Newsletters
 * Types are fetched dynamically from the API based on category classification
 */

import { api } from '../client';

/**
 * Resource type value from API
 * The backend uses 'resource' as the type for resources (training materials, guides, etc.)
 */
const RESOURCE_TYPE = 'resource';

/**
 * Research type value from API
 * The backend uses 'research' as the type for research publications
 */
const RESEARCH_TYPE = 'research';

/**
 * API Response types
 */
interface APIPublication {
  id: string;
  title: string;
  authors: { name: string; affiliation: string }[];
  publication_date: string;
  type: string;
  topics: string[];
  abstract: string;
  download_url: string;
  cover_image: string | null;
  downloads: number;
  views: number;
  is_featured: boolean;
  pdf_size: string;
  pages: number;
}

interface PublicationsAPIResponse {
  success: boolean;
  data: APIPublication[];
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

/**
 * Resource in local format (for UI consumption)
 */
export interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string[];
  language: string;
  targetAudience: string[];
  dateAdded: string;
  downloadUrl: string;
  fileSize: string | null;
  format: string;
  duration: string | null;
  thumbnail: string | null;
  downloads: number;
  featured: boolean;
  year: number;
}

/**
 * Resources response with pagination
 */
export interface ResourcesResponse {
  resources: Resource[];
  meta: {
    currentPage: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Fetch parameters for resources
 */
export interface FetchResourcesParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  topic?: string;
  year?: number;
  featured?: boolean;
  category?: string; // 'resource' or 'research' - filters by publication category
}

/**
 * Resource type from API
 */
export interface ResourceType {
  name: string;
  slug: string;
  count: number;
}

/**
 * Resource topic from API
 */
export interface ResourceTopic {
  name: string;
  slug: string;
  count: number;
}

/**
 * Transform API publication to Resource format
 */
function transformToResource(apiPub: APIPublication): Resource {
  return {
    id: apiPub.id,
    title: apiPub.title,
    description: apiPub.abstract,
    type: apiPub.type,
    category: apiPub.topics || [],
    language: 'English', // Default - backend should add this field
    targetAudience: [], // Default - backend should add this field
    dateAdded: apiPub.publication_date,
    downloadUrl: apiPub.download_url,
    fileSize: apiPub.pdf_size || null,
    format: 'PDF', // Default - backend should add this field
    duration: null, // For videos - backend should add this field
    thumbnail: apiPub.cover_image || null,
    downloads: apiPub.downloads,
    featured: apiPub.is_featured,
    year: new Date(apiPub.publication_date).getFullYear(),
  };
}

/**
 * Fetch resources from API (filtered publications)
 * Uses backend's type filter to get only resource-type publications
 *
 * @param params - Fetch parameters (page, limit, search, type, topic, year, featured, category)
 * @returns Resources response with pagination
 * @throws {APIError} If the API request fails
 */
export async function fetchResources(params: FetchResourcesParams = {}): Promise<ResourcesResponse> {
  const { page = 1, limit = 10, search, topic, year, featured, category } = params;

  // Build query string
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());

  // Use category to filter by type at the API level
  // 'resource' category -> type=resource, 'research' category -> type=research
  if (category === 'resource') {
    queryParams.append('type', RESOURCE_TYPE);
  } else if (category === 'research') {
    queryParams.append('type', RESEARCH_TYPE);
  }

  if (search) queryParams.append('search', search);
  if (topic && topic !== 'All Topics') queryParams.append('topic', topic);
  if (year) queryParams.append('year', year.toString());
  if (featured !== undefined) queryParams.append('featured', featured.toString());

  const endpoint = `/api/publications?${queryParams.toString()}`;
  const response = await api.get<PublicationsAPIResponse>(endpoint);

  // Transform API data to Resource format
  const resources = response.data.map(transformToResource);

  return {
    resources,
    meta: response.meta ? {
      currentPage: response.meta.current_page,
      perPage: response.meta.per_page,
      total: response.meta.total,
      totalPages: response.meta.total_pages,
    } : {
      currentPage: 1,
      perPage: limit,
      total: resources.length,
      totalPages: 1,
    },
  };
}

/**
 * Check if a type matches resource type
 */
function isResourceType(typeName: string): boolean {
  if (!typeName) return false;
  return typeName.toLowerCase() === RESOURCE_TYPE;
}

/**
 * Check if a type matches research type
 */
function isResearchType(typeName: string): boolean {
  if (!typeName) return false;
  return typeName.toLowerCase() === RESEARCH_TYPE;
}

/**
 * Fetch resource types from API
 * Since backend uses simple types ('resource', 'research'), we just return the matching type
 *
 * @param category - Optional category filter ('resource' or 'research')
 * @returns Array of resource types with counts
 */
export async function fetchResourceTypes(category?: string): Promise<ResourceType[]> {
  try {
    const endpoint = '/api/publications/types';
    const response = await api.get<{ success: boolean; data: ResourceType[] }>(endpoint);

    // Filter out 'All' from API response (backend already includes it)
    let filteredTypes = response.data.filter(
      type => type.name.toLowerCase() !== 'all' && type.slug !== 'all'
    );

    // Filter by category if specified
    if (category === 'resource') {
      filteredTypes = filteredTypes.filter(type => type.name.toLowerCase() === RESOURCE_TYPE);
    } else if (category === 'research') {
      filteredTypes = filteredTypes.filter(type => type.name.toLowerCase() === RESEARCH_TYPE);
    }

    // Calculate total count for 'All' option
    const totalCount = filteredTypes.reduce((sum, type) => sum + type.count, 0);

    // If filtering for resources and only one type exists, just return 'All' with the count
    // since there's no need to show a single "resource" type filter
    if (category && filteredTypes.length <= 1) {
      return [
        { name: 'All', slug: 'all-types', count: totalCount },
      ];
    }

    return [
      { name: 'All', slug: 'all-types', count: totalCount },
      ...filteredTypes,
    ];
  } catch (err) {
    console.error('Error fetching resource types:', err);
    return [
      { name: 'All', slug: 'all-types', count: 0 },
    ];
  }
}

/**
 * Fetch topics/categories for a specific publication type
 * Fetches publications of that type and extracts unique topics with counts
 *
 * @param type - Publication type to filter by ('resource' or 'research')
 * @returns Array of topics with counts
 */
export async function fetchResourceTopics(type?: string): Promise<ResourceTopic[]> {
  try {
    // Build query to fetch publications of specific type
    const queryParams = new URLSearchParams();
    queryParams.append('limit', '100'); // Get enough to calculate topic counts

    if (type) {
      queryParams.append('type', type);
    }

    const endpoint = `/api/publications?${queryParams.toString()}`;
    const response = await api.get<PublicationsAPIResponse>(endpoint);

    // Extract topics from publications and count occurrences
    const topicCounts: Record<string, number> = {};

    response.data.forEach(pub => {
      if (Array.isArray(pub.topics)) {
        pub.topics.forEach(topic => {
          if (topic) {
            topicCounts[topic] = (topicCounts[topic] || 0) + 1;
          }
        });
      }
    });

    // Convert to array and sort alphabetically
    const topics = Object.entries(topicCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, count]) => ({
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and'),
        count,
      }));

    // Calculate total count
    const totalCount = response.data.length;

    return [
      { name: 'All', slug: 'all-topics', count: totalCount },
      ...topics,
    ];
  } catch (err) {
    console.error('Error fetching resource topics:', err);
    return [
      { name: 'All', slug: 'all-topics', count: 0 },
    ];
  }
}

/**
 * Fetch a single resource by ID
 *
 * @param id - Resource ID
 * @returns Resource or null if not found
 */
export async function fetchResourceById(id: string): Promise<Resource | null> {
  try {
    const endpoint = `/api/publications/${id}`;
    const response = await api.get<{ success: boolean; data: APIPublication }>(endpoint);

    if (response.success && response.data) {
      return transformToResource(response.data);
    }
    return null;
  } catch {
    return null;
  }
}
