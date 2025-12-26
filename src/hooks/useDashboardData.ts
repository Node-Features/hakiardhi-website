import useSWR from 'swr';
import { authApiFetch } from '@/lib/api/interceptors';

export interface BeneficiariesBreakdown {
  total: number;
  male: number;
  female: number;
  other: number;
  percent_male: number;
  percent_female: number;
  percent_other: number;
}

export interface IncidentsBreakdown {
  total: number;
  land_conflict: number;
  eviction: number;
  boundary_dispute: number;
  other: number;
  percent_land_conflict: number;
  percent_eviction: number;
  percent_boundary_dispute: number;
  percent_other: number;
}

export interface CasesBreakdown {
  total: number;
  advocacy: number;
  mediation: number;
  legal_support: number;
  other: number;
  percent_advocacy: number;
  percent_mediation: number;
  percent_legal_support: number;
  percent_other: number;
}

export interface GeographyBreakdown {
  total_regions: number;
  districts: number;
  villages: number;
  percent_districts: number;
  percent_villages: number;
}

export interface OtherStats {
  users: number;
  projects: number;
}

export interface GlobalSummary {
  beneficiaries: BeneficiariesBreakdown;
  incidents: IncidentsBreakdown;
  cases: CasesBreakdown;
  geography: GeographyBreakdown;
  others: OtherStats;
}

export interface ProjectSummary {
  project_id?: string;
  title?: string;
  total_activities?: number;
  completed_activities?: number;
  total_beneficiaries?: number;
  start_date?: string;
  end_date?: string | null;
  status?: string;
}

export interface RegionSummary {
  region_id?: string;
  region_name?: string;
  beneficiaries?: number;
  incidents?: number;
  cases?: number;
  projects?: number;
}

export interface DashboardData {
  success: boolean;
  summary: {
    global: GlobalSummary;
    projects: ProjectSummary[];
    regions: RegionSummary[];
  };
}

export interface DashboardFilters {
  project_uuid?: string | null;
  region_uuid?: string | null;
  interval_type?: 'month' | 'quarter' | 'year' | 'date';
  year?: number;
  quarter?: number;
  month?: number;
  start_date?: string;
  end_date?: string;
}

// Fetcher function for SWR using authenticated API client with token refresh
const fetcher = (url: string): Promise<DashboardData> => authApiFetch<DashboardData>(url);

/**
 * Custom hook to fetch dashboard analytics data
 * Uses SWR for caching, revalidation, and automatic refetching
 */
export function useDashboardData(filters: DashboardFilters = {}) {
  // Build query string from filters
  const params = new URLSearchParams();

  if (filters.project_uuid) {
    params.append('project_uuid', filters.project_uuid);
  }

  if (filters.region_uuid) {
    params.append('region_uuid', filters.region_uuid);
  }

  if (filters.interval_type) {
    params.append('interval_type', filters.interval_type);
  }

  // Add year parameter for year, quarter, and month interval types
  if (filters.year !== undefined && filters.year !== null) {
    params.append('year', String(filters.year));
  }

  // Add quarter parameter for quarterly interval type
  if (filters.quarter !== undefined && filters.quarter !== null) {
    params.append('quarter', String(filters.quarter));
  }

  // Add month parameter for monthly interval type
  if (filters.month !== undefined && filters.month !== null) {
    params.append('month', String(filters.month));
  }

  // Add date range parameters for custom date range interval type
  if (filters.start_date) {
    params.append('start_date', filters.start_date);
  }

  if (filters.end_date) {
    params.append('end_date', filters.end_date);
  }

  const queryString = params.toString();
  const url = `/api/admin/analytics/overview${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR<DashboardData>(
    url,
    fetcher,
    {
      // Revalidate on focus
      revalidateOnFocus: true,
      // Revalidate on reconnect
      revalidateOnReconnect: true,
      // Dedupe requests within 2 seconds
      dedupingInterval: 2000,
      // Keep previous data while fetching new data
      keepPreviousData: true,
    }
  );

  return {
    data,
    isLoading,
    isError: error,
    error,
    refresh: mutate, // Function to manually refresh data
  };
}

/**
 * Helper hook to calculate derived metrics
 */
export function useDashboardMetrics(data: DashboardData | undefined) {
  if (!data?.summary) {
    return null;
  }

  const { projects = [], regions = [] } = data.summary;

  // Calculate project completion rate
  // Note: Project completion data calculated from projects array
  const completedProjects = projects.filter(p => p.status && p.status === 'Completed').length;
  const projectCompletionRate = projects.length > 0
    ? (completedProjects / projects.length) * 100
    : 0;

  // Calculate activity completion rate
  const totalActivities = projects.reduce((sum, p) => sum + (p.total_activities || 0), 0);
  const completedActivities = projects.reduce((sum, p) => sum + (p.completed_activities || 0), 0);
  const activityCompletionRate = totalActivities > 0
    ? (completedActivities / totalActivities) * 100
    : 0;

  // Get top performing projects
  const topProjects = [...projects]
    .sort((a, b) => {
      const aTotal = a.total_activities || 0;
      const aCompleted = a.completed_activities || 0;
      const bTotal = b.total_activities || 0;
      const bCompleted = b.completed_activities || 0;
      const aRate = aTotal > 0 ? aCompleted / aTotal : 0;
      const bRate = bTotal > 0 ? bCompleted / bTotal : 0;
      return bRate - aRate;
    })
    .slice(0, 5);

  // Get top regions by beneficiaries
  const topRegions = [...regions]
    .sort((a, b) => (b.beneficiaries || 0) - (a.beneficiaries || 0))
    .slice(0, 5);

  return {
    projectCompletionRate,
    activityCompletionRate,
    topProjects,
    topRegions,
    totalActivities,
    completedActivities,
    completedProjects,
    totalProjects: projects.length,
  };
}
