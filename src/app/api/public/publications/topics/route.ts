/**
 * Publication Topics Endpoint
 * GET /api/public/publications/topics
 *
 * Returns unique publication topics with counts for filtering
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';
import { apiResponse, errorResponse } from '@/lib/portal/helpers';

const db = supabase(false);

export async function GET(request: NextRequest) {
  try {
    // Fetch all published publications to get topics
    const { data, error } = await db
      .from('publications')
      .select('topics')
      .eq('is_published', true)
      .not('topics', 'is', null);

    if (error) throw error;

    // Flatten topics arrays and count occurrences
    const topicCounts: Record<string, number> = {};
    let totalCount = 0;

    data.forEach((item) => {
      if (Array.isArray(item.topics)) {
        item.topics.forEach((topic: string) => {
          if (topic) {
            topicCounts[topic] = (topicCounts[topic] || 0) + 1;
            totalCount++;
          }
        });
      }
    });

    // Build response with "All" first, then sorted topics
    const topics = [
      { name: 'All', slug: 'all', count: data.length },
      ...Object.entries(topicCounts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, count]) => ({
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and'),
          count,
        })),
    ];

    return apiResponse(topics);
  } catch (error: any) {
    console.error('Error fetching publication topics:', error);
    return errorResponse('Failed to fetch publication topics', 'PUBLICATION_TOPICS_ERROR', 500);
  }
}
