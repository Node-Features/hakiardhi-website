import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';

const db = supabase(true);

/**
 * GET /api/admin/testimonials
 * Get all testimonials
 */
export async function GET(req: NextRequest) {
  try {
    const { data, error } = await db
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in GET /api/admin/testimonials:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/testimonials
 * Create new testimonial
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.quote || !body.author_name) {
      return NextResponse.json(
        { error: 'Missing required fields: quote, author_name' },
        { status: 400 }
      );
    }

    const { data, error } = await db
      .from('testimonials')
      .insert([{
        quote: body.quote,
        author_name: body.author_name,
        author_role: body.author_role || null,
        author_location: body.author_location || null,
        author_image: body.author_image || null,
        author_type: body.author_type || null,
        project_id: body.project_id || null,
        case_id: body.case_id || null,
        portfolio_item_id: body.portfolio_item_id || null,
        rating: body.rating || null,
        video_url: body.video_url || null,
        is_featured: body.is_featured || false,
        is_published: body.is_published !== undefined ? body.is_published : false,
        display_order: body.display_order || 0,
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/admin/testimonials:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
