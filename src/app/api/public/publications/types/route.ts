/**
 * Publication Types Endpoint
 * GET /api/public/publications/types
 *
 * Returns unique publication types with counts for filtering
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';
import { apiResponse, errorResponse } from '@/lib/portal/helpers';

const db = supabase(false);

export async function GET(request: NextRequest) {
  try {
    // Fetch all published publications to get type counts
    const { data, error } = await db
      .from('publications')
      .select('type')
      .eq('is_published', true)
      .not('type', 'is', null);

    if (error) throw error;

    // Calculate counts per type
    const typeCounts = data.reduce((acc: Record<string, number>, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});

    // Calculate total count
    const totalCount = data.length;

    // Build response with "All" first, then sorted types
    const types = [
      { name: 'All', slug: 'all', count: totalCount },
      ...Object.entries(typeCounts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, count]) => ({
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
          count,
        })),
    ];

    return apiResponse(types);
  } catch (error: any) {
    console.error('Error fetching publication types:', error);
    return errorResponse('Failed to fetch publication types', 'PUBLICATION_TYPES_ERROR', 500);
  }
}
