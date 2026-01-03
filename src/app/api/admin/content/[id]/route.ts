import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';

const db = supabase(true);

/**
 * Get table and ID field based on content_type
 */
function getTableInfo(content_type: string): { table: string; publishField: string } {
  switch (content_type) {
    case 'blog':
      return { table: 'blogs', publishField: 'is_published' };
    case 'publication':
      return { table: 'publications', publishField: 'is_published' };
    case 'faq':
      return { table: 'faqs', publishField: 'status' }; // FAQs use status field
    case 'page':
      return { table: 'organization_content', publishField: 'is_active' };
    default:
      throw new Error(`Invalid content_type: ${content_type}`);
  }
}

/**
 * GET /api/admin/content/:id?content_type=<type>
 * Get single content item by ID and content_type
 */
export async function GET(
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

    const { table } = getTableInfo(content_type);

    const { data, error } = await db
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // Return the raw data with content_type added
    return NextResponse.json({ ...data, content_type });
  } catch (error: any) {
    console.error('Error in GET /api/admin/content/:id:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/content/:id
 * Update content item (content_type in body determines table)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { content_type, ...updateData } = body;

    if (!content_type) {
      return NextResponse.json(
        { error: 'content_type is required in request body' },
        { status: 400 }
      );
    }

    const { table } = getTableInfo(content_type);

    // Build update object based on content_type
    const updates: any = { updated_at: new Date().toISOString() };

    switch (content_type) {
      case 'blog':
        if (updateData.slug !== undefined) updates.slug = updateData.slug;
        if (updateData.title !== undefined) updates.title = updateData.title;
        if (updateData.content !== undefined) updates.content = updateData.content;
        if (updateData.excerpt !== undefined) updates.excerpt = updateData.excerpt;
        if (updateData.type !== undefined) updates.type = updateData.type;
        if (updateData.cover_image !== undefined) updates.cover_image = updateData.cover_image;
        if (updateData.published !== undefined) updates.is_published = updateData.published;
        if (updateData.is_featured !== undefined) updates.is_featured = updateData.is_featured;
        if (updateData.gallery !== undefined) updates.gallery = updateData.gallery;
        break;

      case 'publication':
        if (updateData.title !== undefined) updates.title = updateData.title;
        if (updateData.abstract !== undefined) updates.abstract = updateData.abstract;
        if (updateData.content !== undefined) updates.content = updateData.content;
        if (updateData.authors !== undefined) updates.authors = updateData.authors;
        if (updateData.publication_date !== undefined) updates.publication_date = updateData.publication_date;
        if (updateData.type !== undefined) updates.type = updateData.type;
        if (updateData.topics !== undefined) updates.topics = updateData.topics;
        if (updateData.keywords !== undefined) updates.keywords = updateData.keywords;
        if (updateData.download_url !== undefined) updates.download_url = updateData.download_url;
        if (updateData.cover_image !== undefined) updates.cover_image = updateData.cover_image;
        if (updateData.thumbnail_url !== undefined) updates.thumbnail_url = updateData.thumbnail_url;
        if (updateData.published !== undefined) updates.is_published = updateData.published;
        if (updateData.is_featured !== undefined) updates.is_featured = updateData.is_featured;
        if (updateData.language !== undefined) updates.language = updateData.language;
        if (updateData.pages !== undefined) updates.pages = updateData.pages;
        if (updateData.pdf_size !== undefined) updates.pdf_size = updateData.pdf_size;
        if (updateData.citation !== undefined) updates.citation = updateData.citation;
        if (updateData.doi !== undefined) updates.doi = updateData.doi;
        if (updateData.isbn !== undefined) updates.isbn = updateData.isbn;
        if (updateData.related_publications !== undefined) updates.related_publications = updateData.related_publications;
        if (updateData.external_links !== undefined) updates.external_links = updateData.external_links;
        break;

      case 'faq':
        if (updateData.question !== undefined) updates.question = updateData.question;
        if (updateData.response !== undefined) updates.response = updateData.response;
        if (updateData.category !== undefined) updates.category = updateData.category;
        break;

      case 'page':
        if (updateData.title !== undefined) updates.title = updateData.title;
        if (updateData.content !== undefined) updates.content = updateData.content;
        if (updateData.page_type !== undefined) updates.content_type = updateData.page_type;
        if (updateData.icon_name !== undefined) updates.icon_name = updateData.icon_name;
        if (updateData.display_order !== undefined) updates.display_order = updateData.display_order;
        if (updateData.published !== undefined) updates.is_active = updateData.published;
        break;
    }

    const { data, error } = await db
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating content:', error);
      return NextResponse.json(
        { error: 'Failed to update content', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ ...data, content_type });
  } catch (error: any) {
    console.error('Error in PUT /api/admin/content/:id:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/content/:id?content_type=<type>
 * Delete content item
 */
export async function DELETE(
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

    const { table } = getTableInfo(content_type);

    const { error } = await db
      .from(table)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting content:', error);
      return NextResponse.json(
        { error: 'Failed to delete content', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/content/:id:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
