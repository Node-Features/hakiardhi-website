/**
 * Zod Validation Schemas for HakiArdhi Public Portal API
 *
 * These schemas should be placed in:
 * Backend/v1/src/lib/portal/validation.ts
 */

import { z } from 'zod';

// =====================================================
// COMMON SCHEMAS
// =====================================================

export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const SearchFilterSchema = z.object({
  search: z.string().max(200).optional(),
  category: z.string().max(100).optional(),
  status: z.string().max(50).optional(),
  type: z.string().max(50).optional(),
  featured: z.coerce.boolean().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export const UUIDSchema = z.string().uuid('Invalid UUID format');

export const SlugSchema = z.string().min(1).max(255).regex(/^[a-z0-9-]+$/, 'Invalid slug format');

// =====================================================
// PROGRAMS SCHEMAS
// =====================================================

export const ProgramsFilterSchema = PaginationSchema.merge(SearchFilterSchema).extend({
  status: z.enum(['Pending', 'Ongoing', 'Completed', 'Cancelled']).optional(),
});

export const ProgramParamsSchema = z.object({
  slug: SlugSchema,
});

// =====================================================
// PORTFOLIO SCHEMAS
// =====================================================

export const PortfolioFilterSchema = PaginationSchema.merge(SearchFilterSchema).extend({
  type: z.enum(['Case Study', 'Project', 'Initiative', 'Success Story', 'Campaign']).optional(),
  year: z.string().regex(/^\d{4}$/, 'Invalid year format').optional(),
});

export const PortfolioParamsSchema = z.object({
  slug: SlugSchema,
});

// =====================================================
// NEWS & EVENTS SCHEMAS
// =====================================================

export const NewsFilterSchema = PaginationSchema.merge(SearchFilterSchema).extend({
  type: z.enum(['News', 'Event', 'Announcement', 'Update']).optional(),
});

export const NewsParamsSchema = z.object({
  slug: SlugSchema,
});

// =====================================================
// PUBLICATIONS SCHEMAS
// =====================================================

export const PublicationsFilterSchema = PaginationSchema.merge(SearchFilterSchema).extend({
  type: z.enum(['Report', 'Policy Brief', 'Journal Article', 'Working Paper', 'Book', 'Thesis', 'Other']).optional(),
  topic: z.string().max(100).optional(),
  author: z.string().max(255).optional(),
  year: z.string().regex(/^\d{4}$/, 'Invalid year format').optional(),
});

export const PublicationParamsSchema = z.object({
  id: UUIDSchema,
});

// =====================================================
// LEGAL AID SCHEMAS
// =====================================================

export const CaseSubmissionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255),
  phone: z.string().min(10, 'Invalid phone number').max(15).regex(/^\+?[0-9]+$/, 'Invalid phone format'),
  email: z.string().email('Invalid email').max(255).optional(),
  region_id: UUIDSchema,
  district_id: UUIDSchema,
  village_id: UUIDSchema.optional(),
  case_type: z.string().min(1, 'Case type is required').max(100),
  description: z.string().min(50, 'Description must be at least 50 characters').max(5000),
  documents: z.array(z.string().url()).max(5).optional(),
});

// =====================================================
// LRM SCHEMAS
// =====================================================

export const LRMApplicationSchema = z.object({
  first_name: z.string().min(2).max(255),
  last_name: z.string().min(2).max(255),
  email: z.string().email().max(255),
  phone_number: z.string().min(10).max(15).regex(/^\+?[0-9]+$/),
  region_id: UUIDSchema,
  district_id: UUIDSchema,
  village_id: UUIDSchema.optional(),
  motivation: z.string().min(100, 'Motivation must be at least 100 characters').max(2000),
  experience: z.string().max(2000).optional(),
  education: z.string().max(255).optional(),
  languages: z.array(z.string().max(50)).min(1, 'At least one language is required'),
  availability: z.enum(['Full-time', 'Part-time', 'Weekends']),
  documents: z.array(z.string().url()).max(5).optional(),
});

// =====================================================
// CONTACT SCHEMAS
// =====================================================

export const ContactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255),
  email: z.string().email('Invalid email').max(255),
  phone: z.string().min(10).max(15).regex(/^\+?[0-9]+$/).optional(),
  subject: z.enum(['General', 'Legal Aid', 'Partnership', 'Media', 'Donation', 'Volunteer', 'Other']),
  message: z.string().min(20, 'Message must be at least 20 characters').max(5000),
  category: z.string().max(50).optional(),
});

export const NewsletterSchema = z.object({
  email: z.string().email('Invalid email').max(255),
  name: z.string().max(255).optional(),
  interests: z.array(z.string().max(50)).optional(),
});

// =====================================================
// FAQ SCHEMAS
// =====================================================

export const FAQFilterSchema = z.object({
  category: z.enum(['General', 'Legal Aid', 'LRM Network', 'Donations', 'Programs', 'Research', 'Contact']).optional(),
  search: z.string().max(200).optional(),
  featured: z.coerce.boolean().optional(),
});

// =====================================================
// DONATION SCHEMAS
// =====================================================

export const DonationRequestSchema = z.object({
  amount: z.number().positive().min(1000, 'Minimum donation is 1,000 TZS'),
  currency: z.string().length(3).default('TZS'),
  campaign_id: UUIDSchema.optional(),
  frequency: z.enum(['one-time', 'monthly', 'quarterly', 'yearly']).default('one-time'),
  payment_method: z.string().min(1),
  donor_name: z.string().max(255).optional(),
  donor_email: z.string().email(),
  donor_phone: z.string().min(10).max(15).regex(/^\+?[0-9]+$/).optional(),
  is_anonymous: z.boolean().default(false),
  dedication_type: z.enum(['in_honor', 'in_memory']).optional(),
  dedication_name: z.string().max(255).optional(),
  message: z.string().max(500).optional(),
});

// =====================================================
// GALLERY SCHEMAS
// =====================================================

export const GalleryFilterSchema = PaginationSchema.extend({
  category: z.string().max(100).optional(),
  project_id: UUIDSchema.optional(),
  featured: z.coerce.boolean().optional(),
});

export const GalleryParamsSchema = z.object({
  id: UUIDSchema,
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Parse URL search params into a typed object
 */
export function parseSearchParams<T extends z.ZodType>(
  schema: T,
  searchParams: URLSearchParams
): z.infer<T> {
  const obj: Record<string, any> = {};

  searchParams.forEach((value, key) => {
    obj[key] = value;
  });

  return schema.parse(obj);
}

/**
 * Safe parse with default values
 */
export function safeParseWithDefaults<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: any[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: result.error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message,
    })),
  };
}

// =====================================================
// EXPORT ALL SCHEMAS
// =====================================================

export const PortalValidation = {
  // Common
  Pagination: PaginationSchema,
  SearchFilter: SearchFilterSchema,
  UUID: UUIDSchema,
  Slug: SlugSchema,

  // Programs
  ProgramsFilter: ProgramsFilterSchema,
  ProgramParams: ProgramParamsSchema,

  // Portfolio
  PortfolioFilter: PortfolioFilterSchema,
  PortfolioParams: PortfolioParamsSchema,

  // News
  NewsFilter: NewsFilterSchema,
  NewsParams: NewsParamsSchema,

  // Publications
  PublicationsFilter: PublicationsFilterSchema,
  PublicationParams: PublicationParamsSchema,

  // Legal Aid
  CaseSubmission: CaseSubmissionSchema,

  // LRM
  LRMApplication: LRMApplicationSchema,

  // Contact
  ContactForm: ContactFormSchema,
  Newsletter: NewsletterSchema,

  // FAQ
  FAQFilter: FAQFilterSchema,

  // Donation
  DonationRequest: DonationRequestSchema,

  // Gallery
  GalleryFilter: GalleryFilterSchema,
  GalleryParams: GalleryParamsSchema,
};

export default PortalValidation;
