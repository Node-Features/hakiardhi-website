import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';

const db = supabase(true);

/**
 * GET /api/admin/team/:id
 * Get single team member by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await db
      .from('team_members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in GET /api/admin/team/:id:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/team/:id
 * Update team member
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { data, error } = await db
      .from('team_members')
      .update({
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
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in PUT /api/admin/team/:id:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/team/:id
 * Delete team member
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await db
      .from('team_members')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Team member deleted successfully' });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/team/:id:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
