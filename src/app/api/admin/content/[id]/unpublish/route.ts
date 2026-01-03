import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';

const db = supabase(true);

/**
 * POST /api/admin/content/:id/unpublish?content_type=<type>
 * Unpublish content item
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const content_type = searchParams.get('content_type');

    if (!content_type) {
      return NextResponse.json(
        { error: 'content_type query parameter is required' },
        { status: 400 }
      );
    }

    let table: string;
    let publishField: string;

    switch (content_type) {
      case 'blog':
        table = 'blogs';
        publishField = 'is_published';
        break;
      case 'publication':
        table = 'publications';
        publishField = 'is_published';
        break;
      case 'faq':
        // FAQs don't have a published field
        return NextResponse.json({
          success: true,
          message: 'FAQs cannot be unpublished',
        });
      case 'page':
        table = 'organization_content';
        publishField = 'is_active';
        break;
      default:
        return NextResponse.json(
          { error: `Invalid content_type: ${content_type}` },
          { status: 400 }
        );
    }

    const { error } = await db
      .from(table)
      .update({ [publishField]: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error unpublishing content:', error);
      return NextResponse.json(
        { error: 'Failed to unpublish content', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Content unpublished successfully',
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/content/:id/unpublish:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
