/**
 * Home Page Stats Endpoint
 * GET /api/public/stats/home
 *
 * Returns comprehensive impact statistics for the home page
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';
import { apiResponse, errorResponse } from '@/lib/portal/helpers';

const db = supabase(false);

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await db
      .from('mv_home_page_stats')
      .select('*')
      .single();

    if (error) {
      // If materialized view doesn't exist, return default stats
      if (error.code === 'PGRST116' || error.code === '42P01') {
        return apiResponse({
          years_of_impact: 30,
          communities_served: 1000,
          publications_count: 500,
          beneficiaries_reached: 5000000,
          regions_covered: 25,
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
        });
      }
      throw error;
    }

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching home page stats:', error);
    return errorResponse('Failed to fetch home page stats', 'HOME_STATS_ERROR', 500);
  }
}
