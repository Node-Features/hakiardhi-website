import { authApi } from '../interceptors';

export interface Partner {
  id: string;
  name: string;
  slug: string;
  partner_type: 'donor' | 'implementing' | 'research' | 'government' | 'academic' | 'ngo' | 'private_sector' | 'international';
  logo_url?: string | null;
  logo_url_dark?: string | null;
  website_url?: string | null;
  description?: string | null;
  partnership_level?: 'strategic' | 'project' | 'network' | 'supporter' | null;
  partnership_start?: string | null;
  partnership_end?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  country?: string | null;
  social_links?: Record<string, any>;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePartnerRequest {
  name: string;
  partner_type: 'donor' | 'implementing' | 'research' | 'government' | 'academic' | 'ngo' | 'private_sector' | 'international';
  slug?: string;
  logo_url?: string;
  logo_url_dark?: string;
  website_url?: string;
  description?: string;
  partnership_level?: 'strategic' | 'project' | 'network' | 'supporter';
  partnership_start?: string;
  partnership_end?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  country?: string;
  social_links?: Record<string, any>;
  is_active?: boolean;
  is_featured?: boolean;
  display_order?: number;
}

export interface UpdatePartnerRequest extends Partial<CreatePartnerRequest> {}

/**
 * Partners API Service
 */
export const partnerService = {
  /**
   * Get all partners
   * GET /api/admin/partners
   */
  getAll: async () => {
    return authApi.get<Partner[]>('/api/admin/partners');
  },

  /**
   * Get single partner by ID
   * GET /api/admin/partners/:id
   */
  getById: async (id: string) => {
    return authApi.get<Partner>(`/api/admin/partners/${id}`);
  },

  /**
   * Create new partner
   * POST /api/admin/partners
   */
  create: async (data: CreatePartnerRequest) => {
    return authApi.post<Partner>('/api/admin/partners', data);
  },

  /**
   * Update partner
   * PUT /api/admin/partners/:id
   */
  update: async (id: string, data: UpdatePartnerRequest) => {
    return authApi.put<Partner>(`/api/admin/partners/${id}`, data);
  },

  /**
   * Delete partner
   * DELETE /api/admin/partners/:id
   */
  delete: async (id: string) => {
    return authApi.delete(`/api/admin/partners/${id}`);
  },
};
