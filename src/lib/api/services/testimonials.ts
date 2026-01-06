import { authApi } from '../interceptors';

export interface Testimonial {
  id: string;
  quote: string;
  author_name: string;
  author_role?: string | null;
  author_location?: string | null;
  author_image?: string | null;
  author_type?: 'beneficiary' | 'partner' | 'staff' | 'lrm' | 'community_leader' | 'government' | null;
  project_id?: string | null;
  case_id?: string | null;
  portfolio_item_id?: string | null;
  rating?: number | null;
  video_url?: string | null;
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
  approved_by?: string | null;
  approved_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTestimonialRequest {
  quote: string;
  author_name: string;
  author_role?: string;
  author_location?: string;
  author_image?: string;
  author_type?: 'beneficiary' | 'partner' | 'staff' | 'lrm' | 'community_leader' | 'government';
  project_id?: string;
  case_id?: string;
  portfolio_item_id?: string;
  rating?: number;
  video_url?: string;
  is_featured?: boolean;
  is_published?: boolean;
  display_order?: number;
}

export interface UpdateTestimonialRequest extends Partial<CreateTestimonialRequest> {}

/**
 * Testimonials API Service
 */
export const testimonialService = {
  /**
   * Get all testimonials
   * GET /api/admin/testimonials
   */
  getAll: async () => {
    return authApi.get<Testimonial[]>('/api/admin/testimonials');
  },

  /**
   * Get single testimonial by ID
   * GET /api/admin/testimonials/:id
   */
  getById: async (id: string) => {
    return authApi.get<Testimonial>(`/api/admin/testimonials/${id}`);
  },

  /**
   * Create new testimonial
   * POST /api/admin/testimonials
   */
  create: async (data: CreateTestimonialRequest) => {
    return authApi.post<Testimonial>('/api/admin/testimonials', data);
  },

  /**
   * Update testimonial
   * PUT /api/admin/testimonials/:id
   */
  update: async (id: string, data: UpdateTestimonialRequest) => {
    return authApi.post<Testimonial>(`/api/admin/testimonials/${id}`, data);
  },

  /**
   * Delete testimonial
   * DELETE /api/admin/testimonials/:id
   */
  delete: async (id: string) => {
    return authApi.delete(`/api/admin/testimonials/${id}`);
  },
};
