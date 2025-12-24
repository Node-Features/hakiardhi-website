/**
 * TypeScript Type Definitions for HakiArdhi Public Portal API
 */

// =====================================================
// COMMON TYPES
// =====================================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface CommonFilters {
  search?: string;
  category?: string;
  status?: string;
  type?: string;
  featured?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

// =====================================================
// HOME PAGE TYPES
// =====================================================

export interface ImpactStats {
  completed_projects: number;
  ongoing_projects: number;
  cases_resolved: number;
  beneficiaries_reached: number;
  active_lrms: number;
  regions_covered: number;
  publications_count: number;
  last_refreshed?: string;
}

// =====================================================
// PROGRAMS TYPES
// =====================================================

export interface Program {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  image: string;
  date: string;
  location: string;
  participants: number;
  status: 'Pending' | 'Ongoing' | 'Completed' | 'Cancelled';
  is_featured: boolean;
}

export interface Activity {
  id: string;
  name: string;
  status: string;
  start_date: string;
  end_date: string;
}

// =====================================================
// CASE SUBMISSION TYPES
// =====================================================

export interface CaseSubmission {
  name: string;
  phone: string;
  email?: string;
  region_id: string;
  district_id: string;
  village_id?: string;
  case_type: string;
  description: string;
  documents?: string[];
}

export interface CaseSubmissionResponse {
  success: boolean;
  reference_number: string;
  message: string;
}

// =====================================================
// LRM APPLICATION TYPES
// =====================================================

export interface LRMApplication {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  region_id: string;
  district_id: string;
  village_id?: string;
  motivation: string;
  experience?: string;
  education?: string;
  languages: string[];
  availability: 'Full-time' | 'Part-time' | 'Weekends';
  documents?: string[];
}

// =====================================================
// CONTACT TYPES
// =====================================================

export interface ContactFormSubmission {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category?: string;
}

export interface ContactFormResponse {
  success: boolean;
  ticket_id: string;
  message: string;
}

export interface NewsletterSubscription {
  email: string;
  name?: string;
  interests?: string[];
}

// =====================================================
// DONATION TYPES
// =====================================================

export interface DonationRequest {
  amount: number;
  currency: string;
  campaign_id?: string;
  frequency: 'one-time' | 'monthly' | 'quarterly' | 'yearly';
  payment_method: string;
  donor_name?: string;
  donor_email: string;
  donor_phone?: string;
  is_anonymous: boolean;
  dedication_type?: 'in_honor' | 'in_memory';
  dedication_name?: string;
  message?: string;
}

export interface DonationResponse {
  success: boolean;
  transaction_reference: string;
  payment_url?: string;
  message: string;
}
