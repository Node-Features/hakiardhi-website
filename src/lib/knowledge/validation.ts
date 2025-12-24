import { z } from 'zod';

// Publication Types
const PublicationTypeSchema = z.enum([
  'training_manual',
  'fact_sheet',
  'poster',
  'annual_report',
  'policy_brief',
  'reader',
  'newsletter',
  'occasional_paper',
  'calendar',
  'special_publication',
]);

const PublicationLanguageSchema = z.enum(['english', 'swahili']);
const AccessLevelSchema = z.enum(['public', 'restricted', 'internal']);
const PublicationStatusSchema = z.enum(['draft', 'review', 'published', 'archived', 'withdrawn']);

// Publication Validation
export const PublicationValidation = z.object({
  title: z.string().min(10).max(500),
  title_alternate: z.string().max(500).optional(),
  type: PublicationTypeSchema,
  description: z.string().min(50).max(5000),
  author: z.string().min(2).max(500),
  contributors: z.array(z.string()).optional(),
  publication_year: z.number().int().min(1990).max(new Date().getFullYear()),
  publication_date: z.string(), // YYYY-MM-DD
  themes: z.array(z.string()).min(1), // At least one theme
  language: PublicationLanguageSchema,
  audience: z.array(z.string()).min(1), // At least one audience
  keywords: z.array(z.string()).optional(),
  isbn: z.string().max(20).optional(),
  edition: z.string().max(100).optional(),
  series: z.string().max(200).optional(),
  access_level: AccessLevelSchema.optional(),
  featured: z.boolean().optional(),
  table_of_contents: z.any().optional(), // JSONB structure
  related_publication_ids: z.array(z.string().uuid()).optional(),
});

export const PublicationUpdateValidation = PublicationValidation.partial();

// New Version Validation
export const NewVersionValidation = z.object({
  version_type: z.enum(['major', 'minor']),
  version_notes: z.string().min(50).max(2000),
  updated_fields: z.array(z.string()).optional(),
});

// FAQ Validation
export const FAQValidation = z.object({
  question: z.string().min(10).max(1000),
  answer: z.string().min(20).max(5000),
  category: z.string().min(2).max(200),
  language: PublicationLanguageSchema,
  keywords: z.array(z.string()).optional(),
  related_publications: z.array(z.string().uuid()).optional(),
  related_blogs: z.array(z.string().uuid()).optional(),
  priority: z.number().int().min(0).max(100).optional(),
});

export const FAQUpdateValidation = FAQValidation.partial();

// Chatbot Log Validation
export const ChatbotLogValidation = z.object({
  user_query: z.string().min(3).max(1000),
  bot_response: z.string().min(1).max(5000),
  matched_faq_id: z.string().uuid().optional(),
  confidence_score: z.number().min(0).max(1).optional(),
  channel: z.enum(['whatsapp', 'web', 'sms', 'mobile_app']),
  language: PublicationLanguageSchema,
  user_satisfied: z.boolean().optional(),
  feedback_comment: z.string().max(1000).optional(),
});

// Search Validation
export const SearchValidation = z.object({
  q: z.string().min(3).max(500),
  types: z.array(z.string()).optional(),
  theme: z.string().optional(),
  language: PublicationLanguageSchema.optional(),
  year: z.number().int().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export type PublicationInput = z.infer<typeof PublicationValidation>;
export type PublicationUpdateInput = z.infer<typeof PublicationUpdateValidation>;
export type NewVersionInput = z.infer<typeof NewVersionValidation>;
export type FAQInput = z.infer<typeof FAQValidation>;
export type FAQUpdateInput = z.infer<typeof FAQUpdateValidation>;
export type ChatbotLogInput = z.infer<typeof ChatbotLogValidation>;
export type SearchInput = z.infer<typeof SearchValidation>;