/**
 * API Type Definitions
 * TypeScript interfaces matching the backend API response structure
 */

/**
 * Author object from API (with affiliation)
 */
export interface APIPublicationAuthor {
  name: string;
  affiliation: string;
}

/**
 * Publication object from API
 * Note: Uses snake_case to match backend conventions
 */
export interface APIPublication {
  id: string;
  title: string;
  authors: APIPublicationAuthor[];  // Array of objects
  publication_date: string;          // Snake case (YYYY-MM-DD)
  type: string;
  topics: string[];                  // Array of topics
  abstract: string;
  download_url: string;
  cover_image: string | null;
  downloads: number;
  views: number;
  is_featured: boolean;
  pages: number;
}

/**
 * Publications API response with pagination metadata
 */
export interface PublicationsAPIResponse {
  success: boolean;
  data: APIPublication[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

/**
 * Research stats data from API
 */
export interface APIResearchStats {
  total_publications: number;
  total_downloads: number;
  total_views: number;
  topic_count: number;
  recent_publications: number;
  last_refreshed: string;
}

/**
 * Research stats API response
 */
export interface ResearchStatsAPIResponse {
  success: boolean;
  data: APIResearchStats;
}

/**
 * Research area from API
 */
export interface APIResearchArea {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_name: string;
  cover_image: string | null;
  publication_count: number;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Research areas API response
 */
export interface ResearchAreasAPIResponse {
  success: boolean;
  data: APIResearchArea[];
}

/**
 * Publication type from API
 */
export interface APIPublicationType {
  name: string;
  slug: string;
  count: number;
}

/**
 * Publication types API response
 */
export interface PublicationTypesAPIResponse {
  success: boolean;
  data: APIPublicationType[];
}

/**
 * Publication topic from API
 */
export interface APIPublicationTopic {
  name: string;
  slug: string;
  count: number;
}

/**
 * Publication topics API response
 */
export interface PublicationTopicsAPIResponse {
  success: boolean;
  data: APIPublicationTopic[];
}

/**
 * Partner from API
 */
export interface APIPartner {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  logo_url_dark: string | null;
  website_url: string | null;
  description: string | null;
  partner_type: string;
  partnership_level: string | null;
  partnership_start: string | null;
  partnership_end: string | null;
  country: string | null;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
}

/**
 * Partners API response
 */
export interface PartnersAPIResponse {
  success: boolean;
  data: APIPartner[];
}

/**
 * Program partner from API (embedded in program)
 */
export interface APIProgramPartner {
  partner_id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  linked_at: string;
}

/**
 * Program activity from API
 */
export interface APIProgramActivity {
  id: string;
  name: string;
  status: string;
  start_date: string;
  end_date: string;
}

/**
 * Program from API
 */
export interface APIProgram {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  full_description: string | null;
  category: string | null;
  image: string | null;
  start_date: string;
  end_date: string;
  status: string;
  objectives: string[];
  outcomes: string[];
  impact_metrics: Record<string, number | string> | null;
  partners: APIProgramPartner[];
  gallery: string[];
  is_featured: boolean;
  location: string | null;
  participants_count: number;
  created_at: string;
  updated_at: string;
  activities?: APIProgramActivity[];
}

/**
 * Programs API response with pagination metadata
 */
export interface ProgramsAPIResponse {
  success: boolean;
  data: APIProgram[];
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}
