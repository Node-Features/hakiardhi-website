# Frontend Integration Guide for HakiArdhi Public Portal

This guide explains how to integrate the frontend with the new Public Portal API endpoints.

## API Client Setup

### Create API Client

Create a centralized API client in your frontend:

```typescript
// lib/api/client.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}/api/public/portal${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'API request failed');
  }

  return data;
}

export const api = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint),
  post: <T>(endpoint: string, body: any) =>
    fetchApi<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
```

### Type-Safe API Functions

```typescript
// lib/api/portal.ts

import { api } from './client';
import type {
  ImpactStats,
  Program,
  ProgramDetail,
  NewsEvent,
  Publication,
  // ... other types
} from '@/types/portal';

// Stats
export const getStats = () =>
  api.get<ImpactStats>('/stats');

// Programs
export const getPrograms = (params?: {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  search?: string;
}) => {
  const query = new URLSearchParams(params as any).toString();
  return api.get<Program[]>(`/programs${query ? `?${query}` : ''}`);
};

export const getFeaturedPrograms = () =>
  api.get<Program[]>('/programs/featured');

export const getProgramBySlug = (slug: string) =>
  api.get<ProgramDetail>(`/programs/${slug}`);

export const getProgramCategories = () =>
  api.get<{ name: string; count: number }[]>('/programs/categories');

// Portfolio
export const getPortfolio = (params?: {
  page?: number;
  limit?: number;
  category?: string;
  type?: string;
  year?: string;
}) => {
  const query = new URLSearchParams(params as any).toString();
  return api.get(`/portfolio${query ? `?${query}` : ''}`);
};

export const getPortfolioBySlug = (slug: string) =>
  api.get(`/portfolio/${slug}`);

// News & Events
export const getNews = (params?: {
  page?: number;
  limit?: number;
  type?: string;
  category?: string;
}) => {
  const query = new URLSearchParams(params as any).toString();
  return api.get<NewsEvent[]>(`/news${query ? `?${query}` : ''}`);
};

export const getFeaturedNews = () =>
  api.get<NewsEvent[]>('/news/featured');

export const getUpcomingEvents = () =>
  api.get<NewsEvent[]>('/events/upcoming');

export const getNewsBySlug = (slug: string) =>
  api.get(`/news/${slug}`);

// Publications
export const getPublications = (params?: {
  page?: number;
  limit?: number;
  type?: string;
  topic?: string;
  year?: string;
}) => {
  const query = new URLSearchParams(params as any).toString();
  return api.get<Publication[]>(`/publications${query ? `?${query}` : ''}`);
};

export const getPublicationById = (id: string) =>
  api.get(`/publications/${id}`);

export const trackDownload = (id: string) =>
  api.post(`/publications/${id}/download`, {});

// Research
export const getResearchStats = () =>
  api.get('/research/stats');

export const getResearchAreas = () =>
  api.get('/research/areas');

// Legal Aid
export const getLegalAidStats = () =>
  api.get('/legal-aid/stats');

export const submitLegalAidCase = (data: {
  name: string;
  phone: string;
  email?: string;
  region_id: string;
  district_id: string;
  village_id?: string;
  case_type: string;
  description: string;
}) => api.post('/legal-aid/submit', data);

// LRM Network
export const getLRMRegions = () =>
  api.get('/lrm/regions');

export const getLRMStats = () =>
  api.get('/lrm/stats');

export const getLRMRoles = () =>
  api.get('/lrm/roles');

export const submitLRMApplication = (data: any) =>
  api.post('/lrm/apply', data);

// About
export const getOrganizationInfo = () =>
  api.get('/about/organization');

export const getTeamMembers = () =>
  api.get('/about/team');

export const getMilestones = () =>
  api.get('/about/milestones');

// Contact
export const getOffices = () =>
  api.get('/contact/offices');

export const getFAQs = (params?: {
  category?: string;
  search?: string;
}) => {
  const query = new URLSearchParams(params as any).toString();
  return api.get(`/faqs${query ? `?${query}` : ''}`);
};

export const submitContactForm = (data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) => api.post('/contact/submit', data);

export const subscribeNewsletter = (data: {
  email: string;
  name?: string;
}) => api.post('/newsletter/subscribe', data);

// Donations
export const getDonationCampaigns = () =>
  api.get('/donate/campaigns');

export const getPaymentMethods = () =>
  api.get('/donate/options');

export const getDonationImpact = () =>
  api.get('/donate/impact');

export const processDonation = (data: any) =>
  api.post('/donate/process', data);

// Social Proof
export const getTestimonials = (featured?: boolean) =>
  api.get(`/testimonials${featured ? '?featured=true' : ''}`);

export const getPartners = (featured?: boolean) =>
  api.get(`/partners${featured ? '?featured=true' : ''}`);

// Gallery
export const getGallery = (params?: {
  page?: number;
  limit?: number;
  category?: string;
}) => {
  const query = new URLSearchParams(params as any).toString();
  return api.get(`/gallery${query ? `?${query}` : ''}`);
};
```

## React Query Integration

For optimal caching and state management, use React Query:

```typescript
// lib/api/hooks.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as portalApi from './portal';

// Stats
export const useStats = () =>
  useQuery({
    queryKey: ['stats'],
    queryFn: portalApi.getStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

// Programs
export const usePrograms = (params?: Parameters<typeof portalApi.getPrograms>[0]) =>
  useQuery({
    queryKey: ['programs', params],
    queryFn: () => portalApi.getPrograms(params),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

export const useFeaturedPrograms = () =>
  useQuery({
    queryKey: ['programs', 'featured'],
    queryFn: portalApi.getFeaturedPrograms,
    staleTime: 15 * 60 * 1000,
  });

export const useProgram = (slug: string) =>
  useQuery({
    queryKey: ['program', slug],
    queryFn: () => portalApi.getProgramBySlug(slug),
    enabled: !!slug,
  });

// Portfolio
export const usePortfolio = (params?: Parameters<typeof portalApi.getPortfolio>[0]) =>
  useQuery({
    queryKey: ['portfolio', params],
    queryFn: () => portalApi.getPortfolio(params),
  });

export const usePortfolioItem = (slug: string) =>
  useQuery({
    queryKey: ['portfolio', slug],
    queryFn: () => portalApi.getPortfolioBySlug(slug),
    enabled: !!slug,
  });

// News
export const useNews = (params?: Parameters<typeof portalApi.getNews>[0]) =>
  useQuery({
    queryKey: ['news', params],
    queryFn: () => portalApi.getNews(params),
  });

export const useFeaturedNews = () =>
  useQuery({
    queryKey: ['news', 'featured'],
    queryFn: portalApi.getFeaturedNews,
  });

// Publications
export const usePublications = (params?: Parameters<typeof portalApi.getPublications>[0]) =>
  useQuery({
    queryKey: ['publications', params],
    queryFn: () => portalApi.getPublications(params),
  });

// Form Submissions
export const useSubmitContactForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: portalApi.submitContactForm,
    onSuccess: () => {
      // Optionally invalidate related queries
    },
  });
};

export const useSubscribeNewsletter = () =>
  useMutation({
    mutationFn: portalApi.subscribeNewsletter,
  });

export const useProcessDonation = () =>
  useMutation({
    mutationFn: portalApi.processDonation,
  });

// LRM Application
export const useSubmitLRMApplication = () =>
  useMutation({
    mutationFn: portalApi.submitLRMApplication,
  });

// Legal Aid Case
export const useSubmitLegalAidCase = () =>
  useMutation({
    mutationFn: portalApi.submitLegalAidCase,
  });
```

## Page Implementation Examples

### Homepage

```tsx
// app/page.tsx

import {
  useStats,
  useFeaturedPrograms,
  useFeaturedNews,
} from '@/lib/api/hooks';

export default function HomePage() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: programs, isLoading: programsLoading } = useFeaturedPrograms();
  const { data: news, isLoading: newsLoading } = useFeaturedNews();

  return (
    <main>
      {/* Impact Statistics */}
      <section>
        {statsLoading ? (
          <StatsSkeletons />
        ) : (
          <ImpactStats stats={stats?.data} />
        )}
      </section>

      {/* Featured Programs */}
      <section>
        <h2>Our Programs</h2>
        {programsLoading ? (
          <ProgramCardSkeletons count={6} />
        ) : (
          <ProgramGrid programs={programs?.data || []} />
        )}
      </section>

      {/* Latest News */}
      <section>
        <h2>Latest News</h2>
        {newsLoading ? (
          <NewsCardSkeletons count={3} />
        ) : (
          <NewsGrid news={news?.data || []} />
        )}
      </section>
    </main>
  );
}
```

### Programs Page with Filtering

```tsx
// app/programs/page.tsx

'use client';

import { useState } from 'react';
import { usePrograms, useProgramCategories } from '@/lib/api/hooks';

export default function ProgramsPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    category: '',
    status: '',
    search: '',
  });

  const { data, isLoading, error } = usePrograms(filters);
  const { data: categories } = useProgramCategories();

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  if (error) {
    return <ErrorMessage message="Failed to load programs" />;
  }

  return (
    <div>
      {/* Filters */}
      <div className="filters">
        <SearchInput
          value={filters.search}
          onChange={(value) => handleFilterChange('search', value)}
          placeholder="Search programs..."
        />

        <Select
          value={filters.category}
          onChange={(value) => handleFilterChange('category', value)}
          options={categories?.data || []}
          placeholder="All Categories"
        />

        <Select
          value={filters.status}
          onChange={(value) => handleFilterChange('status', value)}
          options={[
            { value: '', label: 'All Status' },
            { value: 'Ongoing', label: 'Ongoing' },
            { value: 'Completed', label: 'Completed' },
          ]}
        />
      </div>

      {/* Results */}
      {isLoading ? (
        <ProgramCardSkeletons count={12} />
      ) : (
        <>
          <ProgramGrid programs={data?.data || []} />

          {data?.meta && (
            <Pagination
              currentPage={data.meta.page}
              totalPages={data.meta.total_pages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
```

### Contact Form

```tsx
// components/ContactForm.tsx

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSubmitContactForm } from '@/lib/api/hooks';
import { toast } from 'sonner';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  subject: z.enum(['General', 'Legal Aid', 'Partnership', 'Media', 'Other']),
  message: z.string().min(20, 'Message must be at least 20 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const mutation = useSubmitContactForm();

  const onSubmit = async (data: ContactFormData) => {
    try {
      const result = await mutation.mutateAsync(data);
      toast.success(`Message sent! Reference: ${result.data.ticket_id}`);
      reset();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" {...register('name')} />
        {errors.name && <span>{errors.name.message}</span>}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register('email')} />
        {errors.email && <span>{errors.email.message}</span>}
      </div>

      <div>
        <label htmlFor="phone">Phone (optional)</label>
        <input id="phone" {...register('phone')} />
      </div>

      <div>
        <label htmlFor="subject">Subject</label>
        <select id="subject" {...register('subject')}>
          <option value="General">General Inquiry</option>
          <option value="Legal Aid">Legal Aid</option>
          <option value="Partnership">Partnership</option>
          <option value="Media">Media</option>
          <option value="Other">Other</option>
        </select>
        {errors.subject && <span>{errors.subject.message}</span>}
      </div>

      <div>
        <label htmlFor="message">Message</label>
        <textarea id="message" rows={5} {...register('message')} />
        {errors.message && <span>{errors.message.message}</span>}
      </div>

      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
```

## Server-Side Rendering (SSR)

For pages that need SEO optimization, use server-side data fetching:

```tsx
// app/programs/[slug]/page.tsx

import { getProgramBySlug } from '@/lib/api/portal';
import { notFound } from 'next/navigation';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props) {
  try {
    const response = await getProgramBySlug(params.slug);
    const program = response.data;

    return {
      title: `${program.title} | HakiArdhi`,
      description: program.description,
      openGraph: {
        title: program.title,
        description: program.description,
        images: [program.image],
      },
    };
  } catch {
    return {
      title: 'Program Not Found',
    };
  }
}

export default async function ProgramPage({ params }: Props) {
  try {
    const response = await getProgramBySlug(params.slug);
    const program = response.data;

    return (
      <article>
        <h1>{program.title}</h1>
        <img src={program.image} alt={program.title} />
        <div dangerouslySetInnerHTML={{ __html: program.full_description }} />

        {/* Objectives */}
        <section>
          <h2>Objectives</h2>
          <ul>
            {program.objectives.map((obj, i) => (
              <li key={i}>{obj}</li>
            ))}
          </ul>
        </section>

        {/* Impact Metrics */}
        <section>
          <h2>Impact</h2>
          <div className="metrics-grid">
            {program.impact_metrics.map((metric, i) => (
              <div key={i} className="metric-card">
                <span className="value">{metric.value}</span>
                <span className="label">{metric.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Gallery */}
        {program.gallery.length > 0 && (
          <section>
            <h2>Gallery</h2>
            <GalleryGrid images={program.gallery} />
          </section>
        )}
      </article>
    );
  } catch {
    notFound();
  }
}
```

## Error Handling

```tsx
// components/ErrorBoundary.tsx

'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>Please try refreshing the page</p>
          <button onClick={() => window.location.reload()}>
            Refresh
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001

# Production
# NEXT_PUBLIC_API_URL=https://api.hakiardhi.or.tz
```

## Related Documentation

- [API Design Document](./API_DESIGN_AND_INTEGRATION_PLAN.md)
- [API Implementation](./api/README.md)
- [OpenAPI Specification](./openapi/swagger.yaml)
- [Types Reference](./api/types.ts)
