/**
 * Program Categories Endpoint
 * GET /api/public/portal/programs/categories
 *
 * Returns unique program categories with counts
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';
import { apiResponse, errorResponse } from '@/lib/portal/helpers';

const db = supabase(false);

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await db
      .from('mv_programs_list')
      .select('category')
      .not('category', 'is', null);

    if (error) throw error;

    // Get unique categories with counts
    const categoryCounts = data.reduce((acc: Record<string, number>, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    const categories = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count,
    }));

    return apiResponse(categories);
  } catch (error: any) {
    console.error('Error fetching program categories:', error);
    return errorResponse('Failed to fetch categories', 'CATEGORIES_ERROR', 500);
  }
}
