
import { supabase } from '../database/supabase_client';
import type { ProjectWithRegions } from '../types/regions.types';

export class RegionsService {
  /**
   * Get all projects with their associated regions
   * Calls Supabase RPC: rpc_get_projects_with_regions()
   *
   * @returns Promise<ProjectWithRegions[]> - Array of projects with their regions
   * @throws Error if the RPC call fails
   */
  async getProjectsWithRegions(): Promise<ProjectWithRegions[]> {
    const client = supabase(true); // Use service role for admin access

    try {
      const { data, error } = await client.rpc('rpc_get_projects_with_regions');

      if (error) {
        console.error('Error calling rpc_get_projects_with_regions:', error);
        throw new Error(`Failed to fetch projects with regions: ${error.message}`);
      }

      if (!data) {
        // Return empty array if no data
        return [];
      }

      // The RPC returns JSONB, so data should already be in the correct format
      return data as ProjectWithRegions[];
    } catch (err) {
      console.error('Projects by region error:', err);
      throw err;
    }
  }
}

export const regionsService = new RegionsService();
