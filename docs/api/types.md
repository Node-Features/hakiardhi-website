/**
 * TypeScript Type Definitions for HakiArdhi Public Portal API
 *
 * These types should be placed in:
 * Backend/v1/src/lib/types/portal.types.ts
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

export interface ProgramDetail extends Program {
  full_description: string;
  objectives: string[];
  outcomes: string[];
  impact_metrics: ImpactMetric[];
  partners: string[];
  gallery: GalleryImage[];
  start_date: string;
  end_date: string | null;
  activities?: Activity[];
}

export interface ImpactMetric {
  label: string;
  value: string | number;
  icon?: string;
  description?: string;
}

export interface GalleryImage {
  url: string;
  caption?: string;
  alt?: string;
}

export interface Activity {
  id: string;
  name: string;
  status: string;
  start_date: string;
  end_date: string;
}

// =====================================================
// PORTFOLIO TYPES
// =====================================================

export interface PortfolioItem {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  cover_image: string;
  category: string;
  type: 'Case Study' | 'Project' | 'Initiative' | 'Success Story' | 'Campaign';
  year: string;
  location: string;
  beneficiaries: number;
  tags: string[];
  impact: string[];
  is_featured: boolean;
}

export interface PortfolioItemDetail extends PortfolioItem {
  duration: string;
  partner: string;
  challenge: string;
  approach: string;
  solution: string;
  timeline: TimelineEntry[];
  testimonials: Testimonial[];
  impact_metrics: ImpactMetric[];
  gallery: GalleryImage[];
  key_achievements: string[];
  total_budget?: string;
  funding_breakdown?: FundingItem[];
  funding_sources?: FundingSource[];
  needs_continued_support: boolean;
  support_message?: string;
  donate_url?: string;
  related_projects?: string[];
  external_links?: ExternalLink[];
}

export interface TimelineEntry {
  date: string;
  title: string;
  description: string;
}

export interface FundingItem {
  category: string;
  amount: string;
  percentage: number;
}

export interface FundingSource {
  name: string;
  logo?: string;
}

export interface ExternalLink {
  title: string;
  url: string;
}

// =====================================================
// NEWS & EVENTS TYPES
// =====================================================

export interface NewsEvent {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  type: 'News' | 'Event' | 'Announcement' | 'Update';
  category: string;
  date: string;
  author: string;
  location?: string;
  is_featured: boolean;
  views_count: number;
  tags: string[];
}

export interface NewsEventDetail extends NewsEvent {
  content: string;
  gallery: GalleryImage[];
  related_links: ExternalLink[];
  event_date?: string;
  event_location?: string;
}

// =====================================================
// RESEARCH & PUBLICATIONS TYPES
// =====================================================

export interface Publication {
  id: string;
  title: string;
  authors: string[];
  publication_date: string;
  type: 'Report' | 'Policy Brief' | 'Journal Article' | 'Working Paper' | 'Book' | 'Thesis' | 'Other';
  topics: string[];
  abstract: string;
  download_url: string;
  cover_image?: string;
  downloads: number;
  views: number;
  is_featured: boolean;
  pdf_size?: string;
  pages?: number;
  citation?: string;
}

export interface ResearchArea {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_name?: string;
  cover_image?: string;
  publication_count: number;
}

export interface ResearchStats {
  total_publications: number;
  total_downloads: number;
  total_views: number;
  topic_count: number;
  recent_publications: number;
}

export interface ResearchPartner {
  id: string;
  name: string;
  logo_url?: string;
  website_url?: string;
  description?: string;
  partner_type: string;
}

// =====================================================
// LEGAL AID TYPES
// =====================================================

export interface LegalAidStats {
  total_cases: number;
  resolved_cases: number;
  open_cases: number;
  in_progress_cases: number;
  unique_clients: number;
  regions_served: number;
  resolution_rate: number;
}

export interface LegalService {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  features?: string[];
}

export interface SuccessStory {
  id: string;
  title: string;
  description: string;
  image?: string;
  location: string;
  year: string;
  beneficiaries: number;
  outcome: string;
  testimonial?: Testimonial;
}

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
// LRM NETWORK TYPES
// =====================================================

export interface LRMRegion {
  region_id: string;
  region_name: string;
  lrm_count: number;
  districts_count: number;
  villages_count: number;
  disputes_resolved: number;
  families_educated: number;
  cases_handled: number;
}

export interface LRMRole {
  id: string;
  title: string;
  description: string;
  icon_name?: string;
}

export interface LRMImpactStats {
  total_lrms: number;
  regions_covered: number;
  districts_covered: number;
  total_disputes_resolved: number;
  total_families_educated: number;
  total_cases_handled: number;
  total_activities: number;
}

export interface LRMJoinStep {
  step_number: number;
  title: string;
  description: string;
  icon_name?: string;
  requirements: string[];
}

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
// ABOUT PAGE TYPES
// =====================================================

export interface OrganizationContent {
  vision: string;
  mission: string;
  who_we_are: string;
  core_values: CoreValue[];
  history: string;
}

export interface CoreValue {
  title: string;
  content: string;
  icon_name?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department?: string;
  bio?: string;
  image_url?: string;
  email?: string;
  linkedin_url?: string;
  member_type: 'leadership' | 'board' | 'staff' | 'advisor';
}

export interface TeamSection {
  leadership: TeamMember[];
  board: TeamMember[];
  staff: TeamMember[];
}

export interface Milestone {
  id: string;
  year: string;
  title: string;
  description: string;
  icon_name?: string;
}

// =====================================================
// CONTACT TYPES
// =====================================================

export interface ContactInfo {
  email: string;
  phone: string;
  phone_secondary?: string;
  address: string;
  working_hours: string;
  social_links: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
}

export interface OfficeLocation {
  id: string;
  name: string;
  office_type: 'headquarters' | 'regional' | 'field' | 'partner';
  address: string;
  city: string;
  region: string;
  phone?: string;
  email?: string;
  working_hours?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  map_url?: string;
  is_headquarters: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  response: string;
  category: string;
  is_featured: boolean;
  helpful_count: number;
}

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

export interface DonationCampaign {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  cover_image?: string;
  target_amount: number;
  raised_amount: number;
  currency: string;
  donors_count: number;
  progress_percentage: number;
  start_date: string;
  end_date?: string;
  category: string;
  is_featured: boolean;
  is_active: boolean;
}

export interface DonationOption {
  amount: number;
  label: string;
  impact_description: string;
  is_popular?: boolean;
}

export interface DonationImpact {
  amount_range: string;
  impact_description: string;
  icon_name?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  type: 'mobile_money' | 'card' | 'bank';
  icon_url?: string;
  instructions?: string;
  min_amount?: number;
  max_amount?: number;
}

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

// =====================================================
// TESTIMONIAL & PARTNER TYPES
// =====================================================

export interface Testimonial {
  id: string;
  quote: string;
  author_name: string;
  author_role?: string;
  author_location?: string;
  author_image?: string;
  author_type: 'beneficiary' | 'partner' | 'staff' | 'lrm' | 'community_leader';
  rating?: number;
  video_url?: string;
  is_featured: boolean;
}

export interface Partner {
  id: string;
  name: string;
  slug?: string;
  logo_url?: string;
  website_url?: string;
  description?: string;
  partner_type: 'donor' | 'implementing' | 'research' | 'government' | 'academic' | 'ngo';
  partnership_level?: 'strategic' | 'project' | 'network' | 'supporter';
  is_featured: boolean;
}

// =====================================================
// GALLERY TYPES
// =====================================================

export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  thumbnail_url?: string;
  category: string;
  location?: string;
  taken_date?: string;
  photographer?: string;
  tags: string[];
  is_featured: boolean;
  views_count: number;
}

// =====================================================
// FILTER TYPES (for query params)
// =====================================================

export interface ProgramsFilter extends PaginationParams, CommonFilters {
  status?: 'Pending' | 'Ongoing' | 'Completed' | 'Cancelled';
}

export interface PortfolioFilter extends PaginationParams, CommonFilters {
  type?: 'Case Study' | 'Project' | 'Initiative' | 'Success Story' | 'Campaign';
  year?: string;
}

export interface NewsFilter extends PaginationParams, CommonFilters {
  type?: 'News' | 'Event' | 'Announcement' | 'Update';
}

export interface PublicationsFilter extends PaginationParams, CommonFilters {
  type?: string;
  topic?: string;
  author?: string;
  year?: string;
}

export interface FAQFilter {
  category?: string;
  search?: string;
  featured?: boolean;
}

export interface GalleryFilter extends PaginationParams {
  category?: string;
  project_id?: string;
  featured?: boolean;
}
