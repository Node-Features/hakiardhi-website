/**
 * Route Implementations for HakiArdhi Public Portal API
 *
 * This file contains reference implementations for all public portal endpoints.
 * Copy these implementations to the appropriate route files in:
 * Backend/v1/src/app/api/public/portal/
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/database/supabase_client';
import { formatZodError } from '@/utils/error_formatter';
import { PortalValidation } from '@/lib/portal/validation';

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Standard API response wrapper
 */
function apiResponse<T>(data: T, meta?: any, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta && { meta }),
    },
    { status }
  );
}

/**
 * Error response wrapper
 */
function errorResponse(message: string, code: string = 'ERROR', status = 400) {
  return NextResponse.json(
    {
      success: false,
      error: { code, message },
    },
    { status }
  );
}

/**
 * Parse query parameters from URL
 */
function getQueryParams(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

/**
 * Calculate pagination metadata
 */
function getPaginationMeta(total: number, page: number, limit: number) {
  return {
    page,
    limit,
    total,
    total_pages: Math.ceil(total / limit),
  };
}

// =====================================================
// STATS ENDPOINT
// Backend/v1/src/app/api/public/portal/stats/route.ts
// =====================================================

export async function GET_Stats(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();

    // Use materialized view for performance
    const { data, error } = await supabase
      .from('mv_home_page_stats')
      .select('*')
      .single();

    if (error) throw error;

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return errorResponse('Failed to fetch statistics', 'STATS_ERROR', 500);
  }
}

// =====================================================
// PROGRAMS ENDPOINTS
// Backend/v1/src/app/api/public/portal/programs/route.ts
// =====================================================

export async function GET_Programs(request: NextRequest) {
  try {
    const params = getQueryParams(request);
    const parsed = PortalValidation.ProgramsFilter.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json({ errors: formatZodError(parsed.error) }, { status: 400 });
    }

    const { page, limit, sort, order, search, category, status, featured } = parsed.data;
    const offset = (page - 1) * limit;

    const supabase = createSupabaseClient();

    // Build query
    let query = supabase
      .from('mv_programs_list')
      .select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (featured !== undefined) {
      query = query.eq('is_featured', featured);
    }

    // Apply sorting and pagination
    query = query
      .order(sort || 'start_date', { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return apiResponse(
      data,
      getPaginationMeta(count || 0, page, limit)
    );
  } catch (error: any) {
    console.error('Error fetching programs:', error);
    return errorResponse('Failed to fetch programs', 'PROGRAMS_ERROR', 500);
  }
}

// GET /api/public/portal/programs/featured
export async function GET_FeaturedPrograms(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('mv_featured_programs')
      .select('*')
      .limit(6);

    if (error) throw error;

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching featured programs:', error);
    return errorResponse('Failed to fetch featured programs', 'PROGRAMS_ERROR', 500);
  }
}

// GET /api/public/portal/programs/categories
export async function GET_ProgramCategories(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('mv_programs_list')
      .select('category')
      .not('category', 'is', null);

    if (error) throw error;

    // Get unique categories with counts
    const categoryCounts = data.reduce((acc: Record<string, number>, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    const categories = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count,
    }));

    return apiResponse(categories);
  } catch (error: any) {
    console.error('Error fetching program categories:', error);
    return errorResponse('Failed to fetch categories', 'CATEGORIES_ERROR', 500);
  }
}

// GET /api/public/portal/programs/[slug]
export async function GET_ProgramBySlug(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('mv_programs_list')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Program not found', 'NOT_FOUND', 404);
      }
      throw error;
    }

    // Optionally fetch related activities
    const { data: activities } = await supabase
      .from('activities')
      .select('id, name, status, start_date, end_date')
      .eq('project_id', data.id)
      .order('start_date', { ascending: false })
      .limit(10);

    return apiResponse({
      ...data,
      activities: activities || [],
    });
  } catch (error: any) {
    console.error('Error fetching program:', error);
    return errorResponse('Failed to fetch program', 'PROGRAM_ERROR', 500);
  }
}

// =====================================================
// PORTFOLIO ENDPOINTS
// Backend/v1/src/app/api/public/portal/portfolio/route.ts
// =====================================================

export async function GET_Portfolio(request: NextRequest) {
  try {
    const params = getQueryParams(request);
    const parsed = PortalValidation.PortfolioFilter.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json({ errors: formatZodError(parsed.error) }, { status: 400 });
    }

    const { page, limit, sort, order, search, category, type, year, featured } = parsed.data;
    const offset = (page - 1) * limit;

    const supabase = createSupabaseClient();

    let query = supabase
      .from('mv_portfolio_list')
      .select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (year) {
      query = query.eq('year', year);
    }
    if (featured !== undefined) {
      query = query.eq('is_featured', featured);
    }

    query = query
      .order(sort || 'created_at', { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return apiResponse(data, getPaginationMeta(count || 0, page, limit));
  } catch (error: any) {
    console.error('Error fetching portfolio:', error);
    return errorResponse('Failed to fetch portfolio', 'PORTFOLIO_ERROR', 500);
  }
}

// GET /api/public/portal/portfolio/[slug]
export async function GET_PortfolioBySlug(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Portfolio item not found', 'NOT_FOUND', 404);
      }
      throw error;
    }

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching portfolio item:', error);
    return errorResponse('Failed to fetch portfolio item', 'PORTFOLIO_ERROR', 500);
  }
}

// =====================================================
// NEWS & EVENTS ENDPOINTS
// Backend/v1/src/app/api/public/portal/news/route.ts
// =====================================================

export async function GET_News(request: NextRequest) {
  try {
    const params = getQueryParams(request);
    const parsed = PortalValidation.NewsFilter.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json({ errors: formatZodError(parsed.error) }, { status: 400 });
    }

    const { page, limit, sort, order, search, category, type, featured } = parsed.data;
    const offset = (page - 1) * limit;

    const supabase = createSupabaseClient();

    let query = supabase
      .from('mv_news_events_list')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (featured !== undefined) {
      query = query.eq('is_featured', featured);
    }

    query = query
      .order(sort || 'date', { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return apiResponse(data, getPaginationMeta(count || 0, page, limit));
  } catch (error: any) {
    console.error('Error fetching news:', error);
    return errorResponse('Failed to fetch news', 'NEWS_ERROR', 500);
  }
}

// GET /api/public/portal/news/featured
export async function GET_FeaturedNews(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('mv_news_events_list')
      .select('*')
      .eq('is_featured', true)
      .order('date', { ascending: false })
      .limit(4);

    if (error) throw error;

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching featured news:', error);
    return errorResponse('Failed to fetch featured news', 'NEWS_ERROR', 500);
  }
}

// GET /api/public/portal/events/upcoming
export async function GET_UpcomingEvents(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('mv_news_events_list')
      .select('*')
      .eq('type', 'Event')
      .gte('date', today)
      .order('date', { ascending: true })
      .limit(10);

    if (error) throw error;

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching upcoming events:', error);
    return errorResponse('Failed to fetch upcoming events', 'EVENTS_ERROR', 500);
  }
}

// GET /api/public/portal/news/[slug]
export async function GET_NewsBySlug(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('mv_news_events_list')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('News item not found', 'NOT_FOUND', 404);
      }
      throw error;
    }

    // Increment view count
    await supabase.rpc('increment_blog_views', { blog_id: data.id });

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching news item:', error);
    return errorResponse('Failed to fetch news item', 'NEWS_ERROR', 500);
  }
}

// =====================================================
// PUBLICATIONS ENDPOINTS
// Backend/v1/src/app/api/public/portal/publications/route.ts
// =====================================================

export async function GET_Publications(request: NextRequest) {
  try {
    const params = getQueryParams(request);
    const parsed = PortalValidation.PublicationsFilter.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json({ errors: formatZodError(parsed.error) }, { status: 400 });
    }

    const { page, limit, sort, order, search, type, topic, author, year, featured } = parsed.data;
    const offset = (page - 1) * limit;

    const supabase = createSupabaseClient();

    let query = supabase
      .from('publications')
      .select('id, title, authors, publication_date, type, topics, abstract, download_url, cover_image, downloads, views, is_featured, pdf_size, pages', { count: 'exact' })
      .eq('is_published', true);

    if (search) {
      query = query.or(`title.ilike.%${search}%,abstract.ilike.%${search}%`);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (topic) {
      query = query.contains('topics', [topic]);
    }
    if (year) {
      query = query.gte('publication_date', `${year}-01-01`).lte('publication_date', `${year}-12-31`);
    }
    if (featured !== undefined) {
      query = query.eq('is_featured', featured);
    }

    query = query
      .order(sort || 'publication_date', { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return apiResponse(data, getPaginationMeta(count || 0, page, limit));
  } catch (error: any) {
    console.error('Error fetching publications:', error);
    return errorResponse('Failed to fetch publications', 'PUBLICATIONS_ERROR', 500);
  }
}

// GET /api/public/portal/publications/[id]
export async function GET_PublicationById(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('publications')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Publication not found', 'NOT_FOUND', 404);
      }
      throw error;
    }

    // Increment view count
    await supabase.rpc('increment_publication_views', { pub_id: id });

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching publication:', error);
    return errorResponse('Failed to fetch publication', 'PUBLICATION_ERROR', 500);
  }
}

// POST /api/public/portal/publications/[id]/download
export async function POST_PublicationDownload(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const supabase = createSupabaseClient();

    // Increment download count
    await supabase.rpc('increment_publication_downloads', { pub_id: id });

    return apiResponse({ success: true });
  } catch (error: any) {
    console.error('Error tracking download:', error);
    return errorResponse('Failed to track download', 'DOWNLOAD_ERROR', 500);
  }
}

// =====================================================
// RESEARCH ENDPOINTS
// Backend/v1/src/app/api/public/portal/research/
// =====================================================

// GET /api/public/portal/research/stats
export async function GET_ResearchStats(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('mv_research_stats')
      .select('*')
      .single();

    if (error) throw error;

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching research stats:', error);
    return errorResponse('Failed to fetch research statistics', 'STATS_ERROR', 500);
  }
}

// GET /api/public/portal/research/areas
export async function GET_ResearchAreas(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('research_areas')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching research areas:', error);
    return errorResponse('Failed to fetch research areas', 'AREAS_ERROR', 500);
  }
}

// GET /api/public/portal/research/partners
export async function GET_ResearchPartners(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('research_partners')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching research partners:', error);
    return errorResponse('Failed to fetch research partners', 'PARTNERS_ERROR', 500);
  }
}

// =====================================================
// LEGAL AID ENDPOINTS
// Backend/v1/src/app/api/public/portal/legal-aid/
// =====================================================

// GET /api/public/portal/legal-aid/stats
export async function GET_LegalAidStats(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('mv_legal_aid_stats')
      .select('*')
      .single();

    if (error) throw error;

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching legal aid stats:', error);
    return errorResponse('Failed to fetch legal aid statistics', 'STATS_ERROR', 500);
  }
}

// POST /api/public/portal/legal-aid/submit
export async function POST_LegalAidCase(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = PortalValidation.CaseSubmission.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ errors: formatZodError(parsed.error) }, { status: 400 });
    }

    const supabase = createSupabaseClient();

    // Generate reference number
    const reference_number = `LA-${Date.now().toString(36).toUpperCase()}`;

    const { data, error } = await supabase
      .from('cases')
      .insert({
        title: `Legal Aid Request - ${parsed.data.case_type}`,
        reference_number,
        description: parsed.data.description,
        status: 'Open',
        // Store additional info in metadata or create related records
      })
      .select('id, reference_number')
      .single();

    if (error) throw error;

    return apiResponse(
      {
        success: true,
        reference_number: data.reference_number,
        message: 'Your case has been submitted successfully. You will be contacted soon.',
      },
      null,
      201
    );
  } catch (error: any) {
    console.error('Error submitting legal aid case:', error);
    return errorResponse('Failed to submit case', 'SUBMISSION_ERROR', 500);
  }
}

// =====================================================
// LRM NETWORK ENDPOINTS
// Backend/v1/src/app/api/public/portal/lrm/
// =====================================================

// GET /api/public/portal/lrm/regions
export async function GET_LRMRegions(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('mv_lrm_by_region')
      .select('*')
      .order('lrm_count', { ascending: false });

    if (error) throw error;

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching LRM regions:', error);
    return errorResponse('Failed to fetch LRM regions', 'LRM_ERROR', 500);
  }
}

// GET /api/public/portal/lrm/stats
export async function GET_LRMStats(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('mv_lrm_impact_stats')
      .select('*')
      .single();

    if (error) throw error;

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching LRM stats:', error);
    return errorResponse('Failed to fetch LRM statistics', 'LRM_ERROR', 500);
  }
}

// GET /api/public/portal/lrm/roles
export async function GET_LRMRoles(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('lrm_roles')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching LRM roles:', error);
    return errorResponse('Failed to fetch LRM roles', 'LRM_ERROR', 500);
  }
}

// POST /api/public/portal/lrm/apply
export async function POST_LRMApplication(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = PortalValidation.LRMApplication.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ errors: formatZodError(parsed.error) }, { status: 400 });
    }

    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('lrm_applications')
      .insert({
        ...parsed.data,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) throw error;

    return apiResponse(
      {
        success: true,
        application_id: data.id,
        message: 'Your application has been submitted successfully. We will review it and contact you.',
      },
      null,
      201
    );
  } catch (error: any) {
    console.error('Error submitting LRM application:', error);
    return errorResponse('Failed to submit application', 'APPLICATION_ERROR', 500);
  }
}

// =====================================================
// ABOUT PAGE ENDPOINTS
// Backend/v1/src/app/api/public/portal/about/
// =====================================================

// GET /api/public/portal/about/organization
export async function GET_OrganizationInfo(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('organization_content')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    // Organize data by content type
    const organized = {
      vision: data.find(d => d.content_type === 'vision'),
      mission: data.find(d => d.content_type === 'mission'),
      who_we_are: data.find(d => d.content_type === 'who_we_are'),
      core_values: data.filter(d => d.content_type === 'value'),
      history: data.find(d => d.content_type === 'history'),
    };

    return apiResponse(organized);
  } catch (error: any) {
    console.error('Error fetching organization info:', error);
    return errorResponse('Failed to fetch organization info', 'ORG_ERROR', 500);
  }
}

// GET /api/public/portal/about/team
export async function GET_TeamMembers(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    // Organize by member type
    const organized = {
      leadership: data.filter(m => m.member_type === 'leadership'),
      board: data.filter(m => m.member_type === 'board'),
      staff: data.filter(m => m.member_type === 'staff'),
    };

    return apiResponse(organized);
  } catch (error: any) {
    console.error('Error fetching team members:', error);
    return errorResponse('Failed to fetch team members', 'TEAM_ERROR', 500);
  }
}

// GET /api/public/portal/about/milestones
export async function GET_Milestones(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('organization_milestones')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching milestones:', error);
    return errorResponse('Failed to fetch milestones', 'MILESTONES_ERROR', 500);
  }
}

// =====================================================
// CONTACT ENDPOINTS
// Backend/v1/src/app/api/public/portal/contact/
// =====================================================

// GET /api/public/portal/contact/offices
export async function GET_Offices(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('office_locations')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching offices:', error);
    return errorResponse('Failed to fetch offices', 'OFFICES_ERROR', 500);
  }
}

// POST /api/public/portal/contact/submit
export async function POST_ContactForm(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = PortalValidation.ContactForm.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ errors: formatZodError(parsed.error) }, { status: 400 });
    }

    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('contact_submissions')
      .insert({
        ...parsed.data,
        status: 'pending',
      })
      .select('id, ticket_number')
      .single();

    if (error) throw error;

    return apiResponse(
      {
        success: true,
        ticket_id: data.ticket_number,
        message: 'Your message has been received. We will respond within 24-48 hours.',
      },
      null,
      201
    );
  } catch (error: any) {
    console.error('Error submitting contact form:', error);
    return errorResponse('Failed to submit message', 'CONTACT_ERROR', 500);
  }
}

// POST /api/public/portal/newsletter/subscribe
export async function POST_Newsletter(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = PortalValidation.Newsletter.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ errors: formatZodError(parsed.error) }, { status: 400 });
    }

    const supabase = createSupabaseClient();

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('newsletter_subscriptions')
      .select('id, status')
      .eq('email', parsed.data.email)
      .single();

    if (existing) {
      if (existing.status === 'active') {
        return errorResponse('Email already subscribed', 'ALREADY_SUBSCRIBED', 409);
      }
      // Reactivate subscription
      await supabase
        .from('newsletter_subscriptions')
        .update({ status: 'active', subscribed_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabase.from('newsletter_subscriptions').insert({
        ...parsed.data,
        status: 'active',
      });
    }

    return apiResponse(
      {
        success: true,
        message: 'Successfully subscribed to newsletter.',
      },
      null,
      201
    );
  } catch (error: any) {
    console.error('Error subscribing to newsletter:', error);
    return errorResponse('Failed to subscribe', 'NEWSLETTER_ERROR', 500);
  }
}

// =====================================================
// FAQ ENDPOINTS
// Backend/v1/src/app/api/public/portal/faqs/route.ts
// =====================================================

export async function GET_FAQs(request: NextRequest) {
  try {
    const params = getQueryParams(request);
    const parsed = PortalValidation.FAQFilter.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json({ errors: formatZodError(parsed.error) }, { status: 400 });
    }

    const { category, search, featured } = parsed.data;

    const supabase = createSupabaseClient();

    let query = supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true);

    if (category) {
      query = query.eq('category', category);
    }
    if (search) {
      query = query.or(`question.ilike.%${search}%,response.ilike.%${search}%`);
    }
    if (featured !== undefined) {
      query = query.eq('is_featured', featured);
    }

    query = query.order('display_order', { ascending: true });

    const { data, error } = await query;

    if (error) throw error;

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching FAQs:', error);
    return errorResponse('Failed to fetch FAQs', 'FAQ_ERROR', 500);
  }
}

// =====================================================
// DONATION ENDPOINTS
// Backend/v1/src/app/api/public/portal/donate/
// =====================================================

// GET /api/public/portal/donate/campaigns
export async function GET_DonationCampaigns(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('donation_campaigns')
      .select('*')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Add progress percentage
    const campaignsWithProgress = data.map(campaign => ({
      ...campaign,
      progress_percentage: Math.round((campaign.raised_amount / campaign.target_amount) * 100),
    }));

    return apiResponse(campaignsWithProgress);
  } catch (error: any) {
    console.error('Error fetching campaigns:', error);
    return errorResponse('Failed to fetch campaigns', 'CAMPAIGNS_ERROR', 500);
  }
}

// GET /api/public/portal/donate/options
export async function GET_PaymentMethods(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching payment methods:', error);
    return errorResponse('Failed to fetch payment methods', 'PAYMENT_ERROR', 500);
  }
}

// GET /api/public/portal/donate/impact
export async function GET_DonationImpact(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('donation_impact')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching donation impact:', error);
    return errorResponse('Failed to fetch donation impact', 'IMPACT_ERROR', 500);
  }
}

// POST /api/public/portal/donate/process
export async function POST_ProcessDonation(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = PortalValidation.DonationRequest.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ errors: formatZodError(parsed.error) }, { status: 400 });
    }

    const supabase = createSupabaseClient();

    // Create donation record
    const { data, error } = await supabase
      .from('donations')
      .insert({
        ...parsed.data,
        status: 'pending',
      })
      .select('id, transaction_reference')
      .single();

    if (error) throw error;

    // TODO: Integrate with payment gateway to get payment_url
    // For now, return placeholder
    const payment_url = `https://payment.example.com/pay/${data.transaction_reference}`;

    return apiResponse(
      {
        success: true,
        transaction_reference: data.transaction_reference,
        payment_url,
        message: 'Donation initiated. Please complete payment.',
      },
      null,
      201
    );
  } catch (error: any) {
    console.error('Error processing donation:', error);
    return errorResponse('Failed to process donation', 'DONATION_ERROR', 500);
  }
}

// =====================================================
// TESTIMONIALS & PARTNERS ENDPOINTS
// Backend/v1/src/app/api/public/portal/testimonials/route.ts
// Backend/v1/src/app/api/public/portal/partners/route.ts
// =====================================================

export async function GET_Testimonials(request: NextRequest) {
  try {
    const params = getQueryParams(request);
    const featured = params.featured === 'true';

    const supabase = createSupabaseClient();

    let query = supabase
      .from('testimonials')
      .select('*')
      .eq('is_published', true);

    if (featured) {
      query = query.eq('is_featured', true).limit(3);
    }

    query = query.order('display_order', { ascending: true });

    const { data, error } = await query;

    if (error) throw error;

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching testimonials:', error);
    return errorResponse('Failed to fetch testimonials', 'TESTIMONIALS_ERROR', 500);
  }
}

export async function GET_Partners(request: NextRequest) {
  try {
    const params = getQueryParams(request);
    const featured = params.featured === 'true';

    const supabase = createSupabaseClient();

    let query = supabase
      .from('partners')
      .select('*')
      .eq('is_active', true);

    if (featured) {
      query = query.eq('is_featured', true);
    }

    query = query.order('display_order', { ascending: true });

    const { data, error } = await query;

    if (error) throw error;

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching partners:', error);
    return errorResponse('Failed to fetch partners', 'PARTNERS_ERROR', 500);
  }
}

// =====================================================
// GALLERY ENDPOINTS
// Backend/v1/src/app/api/public/portal/gallery/route.ts
// =====================================================

export async function GET_Gallery(request: NextRequest) {
  try {
    const params = getQueryParams(request);
    const parsed = PortalValidation.GalleryFilter.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json({ errors: formatZodError(parsed.error) }, { status: 400 });
    }

    const { page, limit, category, project_id, featured } = parsed.data;
    const offset = (page - 1) * limit;

    const supabase = createSupabaseClient();

    let query = supabase
      .from('gallery_items')
      .select('*', { count: 'exact' })
      .eq('is_published', true);

    if (category) {
      query = query.eq('category', category);
    }
    if (project_id) {
      query = query.eq('project_id', project_id);
    }
    if (featured !== undefined) {
      query = query.eq('is_featured', featured);
    }

    query = query
      .order('taken_date', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return apiResponse(data, getPaginationMeta(count || 0, page, limit));
  } catch (error: any) {
    console.error('Error fetching gallery:', error);
    return errorResponse('Failed to fetch gallery', 'GALLERY_ERROR', 500);
  }
}
