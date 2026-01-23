/**
 * Stats API Service
 * Service layer for fetching statistics from the Public Portal API
 */

import { api } from '../client';

/**
 * Home page stats from API
 */
export interface HomeStats {
  years_of_impact: number;
  communities_served: number;
  publications_count: number;
  beneficiaries_reached: number;
  regions_covered: number;
  cases_resolved: number;
  active_lrms: number;
  active_wgc_members: number;
  total_network_members: number;
  active_projects: number;
  completed_projects: number;
  total_projects: number;
  activities_completed: number;
  training_sessions: number;
  districts_reached: number;
  total_cases: number;
  open_cases: number;
  case_success_rate: number;
  lrm_disputes_resolved: number;
  news_posts_count: number;
  featured_stories_count: number;
  female_beneficiaries: number;
  male_beneficiaries: number;
  female_lrms: number;
  last_refreshed: string;
  is_default?: boolean;
}

/**
 * Stats API response
 */
interface StatsAPIResponse {
  success: boolean;
  data: HomeStats;
}

/**
 * Formatted stat for display in ImpactBanner
 */
export interface ImpactStat {
  number: string;
  label: string;
  icon: string;
  color?: string;
}

/**
 * Default stats to use as fallback (all zeros)
 */
export const defaultHomeStats: HomeStats = {
  years_of_impact: 0,
  communities_served: 0,
  publications_count: 0,
  beneficiaries_reached: 0,
  regions_covered: 0,
  cases_resolved: 0,
  active_lrms: 0,
  active_wgc_members: 0,
  total_network_members: 0,
  active_projects: 0,
  completed_projects: 0,
  total_projects: 0,
  activities_completed: 0,
  training_sessions: 0,
  districts_reached: 0,
  total_cases: 0,
  open_cases: 0,
  case_success_rate: 0,
  lrm_disputes_resolved: 0,
  news_posts_count: 0,
  featured_stories_count: 0,
  female_beneficiaries: 0,
  male_beneficiaries: 0,
  female_lrms: 0,
  last_refreshed: new Date().toISOString(),
  is_default: true,
};

/**
 * Format number with K/M suffix for large values
 */
function formatNumber(num: number | undefined | null, fallback: number = 0): string {
  const value = num ?? fallback;
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M+`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0).replace(/\.0$/, '')}K+`;
  }
  if (value > 0) {
    return `${value}+`;
  }
  return value.toString();
}

/**
 * Transform API stats to ImpactBanner format
 */
export function transformStatsToImpactFormat(stats: Partial<HomeStats>): ImpactStat[] {
  const yearsOfImpact = stats.years_of_impact ?? 0;
  const regionsCovered = stats.regions_covered ?? 0;

  return [
    {
      number: yearsOfImpact > 0 ? `${yearsOfImpact}+` : '0',
      label: 'Years of Impact',
      icon: 'clock',
      color: 'brand',
    },
    {
      number: formatNumber(stats.communities_served),
      label: 'Communities Served',
      icon: 'users',
      color: 'success',
    },
    {
      number: formatNumber(stats.publications_count),
      label: 'Research Publications',
      icon: 'book',
      color: 'blue',
    },
    {
      number: formatNumber(stats.beneficiaries_reached),
      label: 'Lives Touched',
      icon: 'heart',
      color: 'orange',
    },
    {
      number: regionsCovered > 0 ? regionsCovered.toString() : '0',
      label: 'Regions Covered',
      icon: 'map-pin',
      color: 'brand',
    },
    {
      number: '24/7',
      label: 'Legal Aid Available',
      icon: 'shield',
      color: 'success',
    },
  ];
}

/**
 * Fetch home page stats from API
 *
 * @returns Home page statistics
 */
export async function fetchHomeStats(): Promise<HomeStats> {
  try {
    const endpoint = '/api/stats/home';
    const response = await api.get<StatsAPIResponse>(endpoint);

    if (response.success && response.data) {
      // Merge with defaults to ensure all fields are present
      return { ...defaultHomeStats, ...response.data, is_default: false };
    }

    return defaultHomeStats;
  } catch (error) {
    console.error('Error fetching home stats:', error);
    return defaultHomeStats;
  }
}

/**
 * Fetch and transform stats for ImpactBanner component
 *
 * @returns Array of formatted impact stats
 */
export async function fetchImpactStats(): Promise<ImpactStat[]> {
  const stats = await fetchHomeStats();
  return transformStatsToImpactFormat(stats);
}
