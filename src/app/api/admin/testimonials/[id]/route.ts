import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';

const db = supabase(true);

/**
 * GET /api/admin/testimonials/:id
 * Get single testimonial by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await db
      .from('testimonials')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in GET /api/admin/testimonials/:id:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/testimonials/:id
 * Update testimonial
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { data, error } = await db
      .from('testimonials')
      .update({
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
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in PUT /api/admin/testimonials/:id:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/testimonials/:id
 * Delete testimonial
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await db
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Testimonial deleted successfully' });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/testimonials/:id:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
