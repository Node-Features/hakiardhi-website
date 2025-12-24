/**
 * Publication Download Tracker Endpoint
 * POST /api/public/portal/publications/[id]/download
 *
 * Increments download count for a publication
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';
import { apiResponse, errorResponse } from '@/lib/portal/helpers';

const db = supabase(false);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Increment download count
    await db.rpc('increment_publication_downloads', { pub_id: id });

    return apiResponse({ success: true });
  } catch (error: any) {
    console.error('Error tracking download:', error);
    return errorResponse('Failed to track download', 'DOWNLOAD_ERROR', 500);
  }
}
