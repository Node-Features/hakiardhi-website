/**
 * Donation Campaigns Endpoint
 * GET /api/public/portal/donate/campaigns
 *
 * Returns active donation campaigns with progress
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';
import { apiResponse, errorResponse } from '@/lib/portal/helpers';

const db = supabase(false);

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await db
      .from('donation_campaigns')
      .select('*')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Add progress percentage
    const campaignsWithProgress = data.map((campaign) => ({
      ...campaign,
      progress_percentage: Math.round(
        (campaign.raised_amount / campaign.target_amount) * 100
      ),
    }));

    return apiResponse(campaignsWithProgress);
  } catch (error: any) {
    console.error('Error fetching campaigns:', error);
    return errorResponse('Failed to fetch campaigns', 'CAMPAIGNS_ERROR', 500);
  }
}
