/**
 * Programs API Service
 * Service layer for fetching programs from the API
 */

import { api } from '../client';
import { ProgramsAPIResponse, APIProgram, APIProgramActivity } from '@/types/api';

/**
 * Program activity in local format
 */
export interface ProgramActivity {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
}

/**
 * Program in local format (for UI consumption)
 */
export interface Program {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  fullDescription: string | null;
  category: string | null;
  image: string | null;
  startDate: string;
  endDate: string;
  status: string;
  objectives: string[];
  outcomes: string[];
  impactMetrics: Record<string, number | string> | null;
  partners: {
    partnerId: string;
    name: string;
    logoUrl: string | null;
    websiteUrl: string | null;
    linkedAt: string;
  }[];
  gallery: string[];
  isFeatured: boolean;
  location: string | null;
  participantsCount: number;
  createdAt: string;
  updatedAt: string;
  activities?: ProgramActivity[];
}

/**
 * Programs response with pagination
 */
export interface ProgramsResponse {
  programs: Program[];
  meta?: {
    currentPage: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Fetch parameters for programs
 */
export interface FetchProgramsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  featured?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Program category from API
 */
export interface ProgramCategory {
  name: string;
  count: number;
}

/**
 * Transform API program to local format
 */
function transformProgram(apiProgram: APIProgram): Program {
  return {
    id: apiProgram.id,
    slug: apiProgram.slug,
    title: apiProgram.title,
    description: apiProgram.description,
    fullDescription: apiProgram.full_description,
    category: apiProgram.category,
    image: apiProgram.image,
    startDate: apiProgram.start_date,
    endDate: apiProgram.end_date,
    status: apiProgram.status,
    objectives: apiProgram.objectives || [],
    outcomes: apiProgram.outcomes || [],
    impactMetrics: apiProgram.impact_metrics,
    partners: (apiProgram.partners || []).map(p => ({
      partnerId: p.partner_id,
      name: p.name,
      logoUrl: p.logo_url,
      websiteUrl: p.website_url,
      linkedAt: p.linked_at,
    })),
    gallery: apiProgram.gallery || [],
    isFeatured: apiProgram.is_featured,
    location: apiProgram.location?.trim() || null,
    participantsCount: apiProgram.participants_count,
    createdAt: apiProgram.created_at,
    updatedAt: apiProgram.updated_at,
    activities: apiProgram.activities?.map(a => ({
      id: a.id,
      name: a.name,
      status: a.status,
      startDate: a.start_date,
      endDate: a.end_date,
    })),
  };
}

/**
 * Fetch programs from API
 *
 * @param params - Fetch parameters (page, limit, search, category, status, featured, sort, order)
 * @returns Programs response with pagination
 * @throws {APIError} If the API request fails
 *
 * @example
 * ```typescript
 * const { programs, meta } = await fetchPrograms({ page: 1, limit: 10 });
 * console.log(programs[0].title);
 * ```
 */
export async function fetchPrograms(params: FetchProgramsParams = {}): Promise<ProgramsResponse> {
  const { page = 1, limit = 10, search, category, status, featured, sort, order } = params;

  // Build query string
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());
  if (search) queryParams.append('search', search);
  if (category) queryParams.append('category', category);
  if (status) queryParams.append('status', status);
  if (featured !== undefined) queryParams.append('featured', featured.toString());
  if (sort) queryParams.append('sort', sort);
  if (order) queryParams.append('order', order);

  const endpoint = `/api/programs?${queryParams.toString()}`;
  const response = await api.get<ProgramsAPIResponse>(endpoint);

  // Transform API data to local format
  const programs = response.data.map(transformProgram);

  return {
    programs,
    meta: response.meta ? {
      currentPage: response.meta.current_page,
      perPage: response.meta.per_page,
      total: response.meta.total,
      totalPages: response.meta.total_pages,
    } : undefined,
  };
}

/**
 * Fetch program categories from API
 *
 * @returns Array of program categories with counts
 * @throws {APIError} If the API request fails
 */
export async function fetchProgramCategories(): Promise<ProgramCategory[]> {
  const endpoint = '/api/programs/categories';
  const response = await api.get<{ success: boolean; data: ProgramCategory[] }>(endpoint);
  return response.data;
}

/**
 * Fetch a single program by slug
 *
 * @param slug - Program slug
 * @returns Program or null if not found
 */
export async function fetchProgramBySlug(slug: string): Promise<Program | null> {
  try {
    const endpoint = `/api/programs/${slug}`;
    const response = await api.get<{ success: boolean; data: APIProgram }>(endpoint);

    if (response.success && response.data) {
      return transformProgram(response.data);
    }
    return null;
  } catch {
    return null;
  }
}
