// Statistics API Services
import { api } from '../client';

export interface CaseStats {
  totalCases: number;
  openCases: number;
  closedCases: number;
  resolvedCases: number;
  by_status: Record<string, number>;
  averageResolutionTime: string;
}

export interface ImpactStatistic {
  id: string;
  stat_key: string;
  label: string;
  value: number;
  value_suffix?: string;
  description?: string;
  icon_name?: string;
  category?: string;
  display_order: number;
  is_public: boolean;
  last_calculated: string;
  created_at: string;
  updated_at: string;
}

export interface GeneralStats {
  total_beneficiaries: number;
  total_projects: number;
  total_activities: number;
  total_cases: number;
  total_lrm_members: number;
  active_beneficiaries: number;
  active_projects: number;
  completed_projects: number;
  impact_statistics: ImpactStatistic[];
}

export interface CaseStatsResponse {
  success: boolean;
  data: CaseStats;
}

export interface GeneralStatsResponse {
  success: boolean;
  data: GeneralStats;
}

/**
 * Statistics Service
 * Provides methods to fetch various statistics for the dashboard
 */
export const statsService = {
  /**
   * Get case statistics
   */
  getCaseStats: async (): Promise<CaseStatsResponse> => {
    return api.get<CaseStatsResponse>('/api/admin/cases/stats');
  },

  /**
   * Get general/impact statistics
   */
  getGeneralStats: async (): Promise<GeneralStatsResponse> => {
    return api.get<GeneralStatsResponse>('/api/admin/statistics');
  },
};
