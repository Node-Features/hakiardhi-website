import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';

const db = supabase(true);

/**
 * Consolidated Content API with explicit content_type
 * Content types map to database tables:
 * - 'blog' → blogs table
 * - 'publication' → publications table
 * - 'faq' → faqs table
 * - 'page' → organization_content table
 */

interface ContentItem {
  id: string;
  content_type: string;
  slug?: string;
  title: string;
  content: string;
  meta_description?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  [key: string]: any; // Additional fields specific to content type
}

/**
 * GET /api/admin/content
 * Get all content items from all tables
 */
export async function GET(req: NextRequest) {
  try {
    const allContent: ContentItem[] = [];

    // 1. Get blogs
    const { data: blogs, error: blogsError } = await db
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });

    if (!blogsError && blogs) {
      blogs.forEach((blog) => {
        allContent.push({
          id: blog.id,
          content_type: 'blog',
          slug: blog.slug,
          title: blog.title,
          content: blog.content,
          meta_description: blog.excerpt,
          published: blog.is_published,
          created_at: blog.created_at,
          updated_at: blog.updated_at,
          type: blog.type,
          cover_image: blog.cover_image,
          is_featured: blog.is_featured,
          gallery: blog.gallery,
        });
      });
    }

    // 2. Get publications
    const { data: publications, error: pubError } = await db
      .from('publications')
      .select('*')
      .order('created_at', { ascending: false });

    if (!pubError && publications) {
      publications.forEach((pub) => {
        allContent.push({
          id: pub.id,
          content_type: 'publication',
          title: pub.title,
          abstract: pub.abstract,
          content: pub.content || pub.abstract,
          meta_description: pub.abstract?.substring(0, 160),
          published: pub.is_published,
          created_at: pub.created_at,
          updated_at: pub.updated_at,
          authors: pub.authors,
          publication_date: pub.publication_date,
          type: pub.type,
          topics: pub.topics,
          keywords: pub.keywords,
          download_url: pub.download_url,
          cover_image: pub.cover_image,
          thumbnail_url: pub.thumbnail_url,
          is_featured: pub.is_featured,
          pdf_size: pub.pdf_size,
          pages: pub.pages,
          citation: pub.citation,
          doi: pub.doi,
          isbn: pub.isbn,
          language: pub.language,
          related_publications: pub.related_publications,
          external_links: pub.external_links,
          downloads: pub.downloads,
          views: pub.views,
        });
      });
    }

    // 3. Get FAQs
    const { data: faqs, error: faqsError } = await db
      .from('faqs')
      .select('*')
      .order('created_at', { ascending: false });

    if (!faqsError && faqs) {
      faqs.forEach((faq) => {
        allContent.push({
          id: faq.id,
          content_type: 'faq',
          title: faq.question,
          content: faq.response || '',
          meta_description: faq.response?.substring(0, 160),
          published: true,
          created_at: faq.created_at,
          updated_at: faq.updated_at,
          category: faq.category,
        });
      });
    }

    // 4. Get organization content (pages)
    const { data: orgContent, error: orgError } = await db
      .from('organization_content')
      .select('*')
      .order('created_at', { ascending: false });

    if (!orgError && orgContent) {
      orgContent.forEach((item) => {
        allContent.push({
          id: item.id,
          content_type: 'page',
          title: item.title || item.content_type,
          content: item.content,
          meta_description: item.content?.substring(0, 160),
          published: item.is_active,
          created_at: item.created_at,
          updated_at: item.updated_at,
          page_type: item.content_type,
          icon_name: item.icon_name,
        });
      });
    }

    // Sort by updated_at descending
    allContent.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    return NextResponse.json(allContent);
  } catch (error: any) {
    console.error('Error in GET /api/admin/content:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/content
 * Create new content (uses content_type to determine table)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content_type, ...data } = body;

    // Validation
    if (!content_type) {
      return NextResponse.json(
        { error: 'content_type is required' },
        { status: 400 }
      );
    }

    let createdContent: ContentItem;

    switch (content_type) {
      case 'blog': {
        // Validate required fields for blog
        if (!data.slug || !data.title || !data.content) {
          return NextResponse.json(
            { error: 'Missing required fields: slug, title, content' },
            { status: 400 }
          );
        }

        const { data: blog, error } = await db
          .from('blogs')
          .insert([{
            slug: data.slug,
            title: data.title,
            content: data.content,
            excerpt: data.excerpt || data.meta_description || '',
            type: data.type || 'News',
            cover_image: data.cover_image || null,
            is_published: data.published || false,
            is_featured: data.is_featured || false,
            gallery: data.gallery || [],
            category_id: data.category_id || null,
            author_id: data.author_id || null,
          }])
          .select()
          .single();

        if (error) throw error;

        createdContent = {
          id: blog.id,
          content_type: 'blog',
          slug: blog.slug,
          title: blog.title,
          content: blog.content,
          meta_description: blog.excerpt,
          published: blog.is_published,
          created_at: blog.created_at,
          updated_at: blog.updated_at,
        };
        break;
      }

      case 'publication': {
        // Validate required fields for publication
        if (!data.title || !data.publication_date) {
          return NextResponse.json(
            { error: 'Missing required fields: title, publication_date' },
            { status: 400 }
          );
        }

        const { data: pub, error } = await db
          .from('publications')
          .insert([{
            title: data.title,
            abstract: data.abstract || data.meta_description || '',
            content: data.content || '',
            authors: data.authors || [],
            publication_date: data.publication_date,
            type: data.type || 'Report',
            topics: data.topics || [],
            keywords: data.keywords || [],
            download_url: data.download_url || '#',
            cover_image: data.cover_image || null,
            thumbnail_url: data.thumbnail_url || null,
            is_published: data.published || false,
            is_featured: data.is_featured || false,
            language: data.language || 'English',
            pages: data.pages || null,
            pdf_size: data.pdf_size || null,
            citation: data.citation || null,
            doi: data.doi || null,
            isbn: data.isbn || null,
            related_publications: data.related_publications || [],
            external_links: data.external_links || [],
          }])
          .select()
          .single();

        if (error) {
          console.error('Publication creation error:', error);
          // Check for trigger-related errors
          if (error.message?.includes('UPDATE requires a WHERE clause')) {
            return NextResponse.json(
              {
                error: 'Database trigger error. Please run fix_research_area_count_trigger.sql to fix this issue.',
                details: error.message
              },
              { status: 500 }
            );
          }
          throw error;
        }

        createdContent = {
          id: pub.id,
          content_type: 'publication',
          title: pub.title,
          content: pub.content || pub.abstract,
          meta_description: pub.abstract?.substring(0, 160),
          published: pub.is_published,
          created_at: pub.created_at,
          updated_at: pub.updated_at,
        };
        break;
      }

      case 'faq': {
        // Validate required fields for FAQ
        if (!data.question || !data.response) {
          return NextResponse.json(
            { error: 'Missing required fields: question, response' },
            { status: 400 }
          );
        }

        const { data: faq, error } = await db
          .from('faqs')
          .insert([{
            question: data.question,
            response: data.response,
            category: data.category || 'General',
          }])
          .select()
          .single();

        if (error) throw error;

        createdContent = {
          id: faq.id,
          content_type: 'faq',
          title: faq.question,
          content: faq.response || '',
          meta_description: faq.response?.substring(0, 160),
          published: true,
          created_at: faq.created_at,
          updated_at: faq.updated_at,
        };
        break;
      }

      case 'page': {
        // Validate required fields for page
        if (!data.page_type || !data.title || !data.content) {
          return NextResponse.json(
            { error: 'Missing required fields: page_type, title, content' },
            { status: 400 }
          );
        }

        const { data: page, error } = await db
          .from('organization_content')
          .insert([{
            content_type: data.page_type,
            title: data.title,
            content: data.content,
            icon_name: data.icon_name || null,
            display_order: data.display_order || 0,
            is_active: data.published || true,
          }])
          .select()
          .single();

        if (error) throw error;

        createdContent = {
          id: page.id,
          content_type: 'page',
          title: page.title,
          content: page.content,
          meta_description: page.content?.substring(0, 160),
          published: page.is_active,
          created_at: page.created_at,
          updated_at: page.updated_at,
        };
        break;
      }

      default:
        return NextResponse.json(
          { error: `Invalid content_type: ${content_type}. Valid types: blog, publication, faq, page` },
          { status: 400 }
        );
    }

    return NextResponse.json(createdContent, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/admin/content:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
