import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';

const db = supabase(true);

/**
 * GET /api/admin/partners
 * Get all partners
 */
export async function GET(req: NextRequest) {
  try {
    const { data, error } = await db
      .from('partners')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in GET /api/admin/partners:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/partners
 * Create new partner
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.name || !body.partner_type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, partner_type' },
        { status: 400 }
      );
    }

    // Generate slug from name if not provided
    const slug = body.slug || body.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-');

    const { data, error } = await db
      .from('partners')
      .insert([{
        name: body.name,
        slug: slug,
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
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/admin/partners:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
