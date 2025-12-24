/**
 * Portal API Validation Schemas
 * Zod validation schemas for public portal API endpoints
 */

import { z } from 'zod';

// =====================================================
// COMMON VALIDATION SCHEMAS
// =====================================================

const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

const CommonFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  featured: z.coerce.boolean().optional(),
});

// =====================================================
// PROGRAMS VALIDATION
// =====================================================

export const ProgramsFilterSchema = PaginationSchema.merge(CommonFiltersSchema);

// =====================================================
// PORTFOLIO VALIDATION
// =====================================================

export const PortfolioFilterSchema = PaginationSchema.merge(CommonFiltersSchema).extend({
  year: z.string().optional(),
});

// =====================================================
// NEWS & EVENTS VALIDATION
// =====================================================

export const NewsFilterSchema = PaginationSchema.merge(CommonFiltersSchema);

// =====================================================
// PUBLICATIONS VALIDATION
// =====================================================

export const PublicationsFilterSchema = PaginationSchema.merge(CommonFiltersSchema).extend({
  topic: z.string().optional(),
  author: z.string().optional(),
  year: z.string().optional(),
});

// =====================================================
// FAQ VALIDATION
// =====================================================

export const FAQFilterSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  featured: z.coerce.boolean().optional(),
});

// =====================================================
// GALLERY VALIDATION
// =====================================================

export const GalleryFilterSchema = PaginationSchema.extend({
  category: z.string().optional(),
  project_id: z.string().uuid().optional(),
  featured: z.coerce.boolean().optional(),
});

// =====================================================
// CASE SUBMISSION VALIDATION
// =====================================================

export const CaseSubmissionSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number format'),
  email: z.string().email('Invalid email address').optional(),
  region_id: z.string().uuid('Invalid region ID'),
  district_id: z.string().uuid('Invalid district ID'),
  village_id: z.string().uuid().optional(),
  case_type: z.string().min(3, 'Case type is required'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000),
  documents: z.array(z.string().url()).optional(),
});

// =====================================================
// LRM APPLICATION VALIDATION
// =====================================================

export const LRMApplicationSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters').max(50),
  last_name: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  phone_number: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number format'),
  region_id: z.string().uuid('Invalid region ID'),
  district_id: z.string().uuid('Invalid district ID'),
  village_id: z.string().uuid().optional(),
  motivation: z.string().min(50, 'Motivation must be at least 50 characters').max(1000),
  experience: z.string().max(1000).optional(),
  education: z.string().max(500).optional(),
  languages: z.array(z.string()).min(1, 'At least one language is required'),
  availability: z.enum(['Full-time', 'Part-time', 'Weekends']),
  documents: z.array(z.string().url()).optional(),
});

// =====================================================
// CONTACT FORM VALIDATION
// =====================================================

export const ContactFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number format').optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  message: z.string().min(20, 'Message must be at least 20 characters').max(2000),
  category: z.string().optional(),
});

// =====================================================
// NEWSLETTER VALIDATION
// =====================================================

export const NewsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  interests: z.array(z.string()).optional(),
});

// =====================================================
// DONATION VALIDATION
// =====================================================

export const DonationRequestSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  currency: z.string().default('TZS'),
  campaign_id: z.string().uuid().optional(),
  frequency: z.enum(['one-time', 'monthly', 'quarterly', 'yearly']).default('one-time'),
  payment_method: z.string().min(1, 'Payment method is required'),
  donor_name: z.string().max(100).optional(),
  donor_email: z.string().email('Invalid email address'),
  donor_phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number format').optional(),
  is_anonymous: z.boolean().default(false),
  dedication_type: z.enum(['in_honor', 'in_memory']).optional(),
  dedication_name: z.string().max(100).optional(),
  message: z.string().max(500).optional(),
});

// Export all validation schemas
export const PortalValidation = {
  ProgramsFilter: ProgramsFilterSchema,
  PortfolioFilter: PortfolioFilterSchema,
  NewsFilter: NewsFilterSchema,
  PublicationsFilter: PublicationsFilterSchema,
  FAQFilter: FAQFilterSchema,
  GalleryFilter: GalleryFilterSchema,
  CaseSubmission: CaseSubmissionSchema,
  LRMApplication: LRMApplicationSchema,
  ContactForm: ContactFormSchema,
  Newsletter: NewsletterSchema,
  DonationRequest: DonationRequestSchema,
};
