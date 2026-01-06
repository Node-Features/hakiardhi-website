import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';

const db = supabase(true);

/**
 * GET /api/admin/partners/:id
 * Get single partner by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await db
      .from('partners')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in GET /api/admin/partners/:id:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/partners/:id
 * Update partner
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { data, error } = await db
      .from('partners')
      .update({
        name: body.name,
        slug: body.slug,
        partner_type: body.partner_type,
        logo_url: body.logo_url || null,
        logo_url_dark: body.logo_url_dark || null,
        website_url: body.website_url || null,
        description: body.description || null,
        partnership_level: body.partnership_level || null,
        partnership_start: body.partnership_start || null,
        partnership_end: body.partnership_end || null,
        contact_name: body.contact_name || null,
        contact_email: body.contact_email || null,
        contact_phone: body.contact_phone || null,
        country: body.country || null,
        social_links: body.social_links || {},
        is_active: body.is_active !== undefined ? body.is_active : true,
        is_featured: body.is_featured || false,
        display_order: body.display_order || 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in PUT /api/admin/partners/:id:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/partners/:id
 * Delete partner
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await db
      .from('partners')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Partner deleted successfully' });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/partners/:id:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
