import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';

const db = supabase(true);

/**
 * GET /api/admin/team
 * Get all team members
 */
export async function GET(req: NextRequest) {
  try {
    const { data, error } = await db
      .from('team_members')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in GET /api/admin/team:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/team
 * Create new team member
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.name || !body.role || !body.member_type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, role, member_type' },
        { status: 400 }
      );
    }

    const { data, error } = await db
      .from('team_members')
      .insert([{
        name: body.name,
        role: body.role,
        member_type: body.member_type,
        department: body.department || null,
        bio: body.bio || null,
        image_url: body.image_url || null,
        email: body.email || null,
        phone: body.phone || null,
        linkedin_url: body.linkedin_url || null,
        twitter_url: body.twitter_url || null,
        display_order: body.display_order || 0,
        is_active: body.is_active !== undefined ? body.is_active : true,
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/admin/team:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
