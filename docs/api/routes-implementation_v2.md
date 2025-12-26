import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/database/supabase_client';
import { formatZodError } from '@/utils/error_formatter';

// Fallback lightweight validators to avoid requiring the external module during docs/example usage.
// These perform minimal coercion and always return success: true; replace with real validators in production.
function parseQuery(q: Record<string, string | undefined>) {
  return {
    page: q.page ? parseInt(q.page as string, 10) || 1 : 1,
    limit: q.limit ? parseInt(q.limit as string, 10) || 10 : 10,
    sort: (q.sort as string) || undefined,
    order: (q.order as string) || 'desc',
    search: (q.search as string) || undefined,
    category: (q.category as string) || undefined,
    status: (q.status as string) || undefined,
    featured: q.featured !== undefined ? (q.featured === 'true' || q.featured === '1') : undefined,
    type: (q.type as string) || undefined,
    year: q.year ? parseInt(q.year as string, 10) : undefined,
    project_id: q.project_id ? parseInt(q.project_id as string, 10) : undefined,
  };
}

const PortalValidation = {
  ProgramsFilter: { safeParse: (q: any) => ({ success: true, data: parseQuery(q || {}) }) },
  PortfolioFilter: { safeParse: (q: any) => ({ success: true, data: parseQuery(q || {}) }) },
  NewsFilter: { safeParse: (q: any) => ({ success: true, data: parseQuery(q || {}) }) },
  PublicationsFilter: {
    safeParse: (q: any) => ({
      success: true,
      data: {
        ...parseQuery(q || {}),
        topic: q?.topic || undefined,
        author: q?.author || undefined,
      },
    }),
  },
  GalleryFilter: { safeParse: (q: any) => ({ success: true, data: parseQuery(q || {}) }) },
  FAQFilter: {
    safeParse: (q: any) => ({
      success: true,
      data: {
        category: q?.category || undefined,
        search: q?.search || undefined,
        featured: q?.featured !== undefined ? (q.featured === 'true' || q.featured === '1') : undefined,
      },
    }),
  },

  // Body validators: accept the body as-is
  CaseSubmission: { safeParse: (b: any) => ({ success: true, data: b || {} }) },
  LRMApplication: { safeParse: (b: any) => ({ success: true, data: b || {} }) },
  ContactForm: { safeParse: (b: any) => ({ success: true, data: b || {} }) },
  Newsletter: { safeParse: (b: any) => ({ success: true, data: b || {} }) },
  DonationRequest: { safeParse: (b: any) => ({ success: true, data: b || {} }) },
};
