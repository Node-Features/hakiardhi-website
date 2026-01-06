import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';

const db = supabase(true);

/**
 * GET /api/admin/milestones
 * Get all organization milestones
 */
export async function GET(req: NextRequest) {
  try {
    const { data, error } = await db
      .from('organization_milestones')
      .select('*')
      .order('year', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in GET /api/admin/milestones:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/milestones
 * Create new milestone
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.year || !body.title || !body.description) {
      return NextResponse.json(
        { error: 'Missing required fields: year, title, description' },
        { status: 400 }
      );
    }

    const { data, error } = await db
      .from('organization_milestones')
      .insert([{
        year: body.year,
        title: body.title,
        description: body.description,
        icon_name: body.icon_name || null,
        display_order: body.display_order || 0,
        is_active: body.is_active !== undefined ? body.is_active : true,
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/admin/milestones:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
