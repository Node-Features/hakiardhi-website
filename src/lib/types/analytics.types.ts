// Shared analytics types

export interface ViewMetadata {
  userId?: string;
  sessionId?: string;
  ipAddress?: string; // Anonymized
  userAgent?: string;
  referrer?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
  timestamp: Date;
}

export interface DownloadMetadata extends ViewMetadata {
  quality: 'full' | 'low_data';
  fileSize: number;
  downloadDuration?: number; // milliseconds
}

export interface ShareMetadata extends ViewMetadata {
  platform: SocialPlatform;
  shareUrl: string;
}

export type SocialPlatform =
  | 'facebook'
  | 'twitter'
  | 'linkedin'
  | 'whatsapp'
  | 'email'
  | 'direct_link';

export interface AnalyticsEvent {
  type: 'view' | 'download' | 'share' | 'search' | 'interaction';
  resourceId: string;
  resourceType: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface DownloadStats {
  total: number;
  byQuality: {
    full: number;
    low_data: number;
  };
  byPeriod: {
    date: string;
    count: number;
  }[];
  topLocations: {
    location: string;
    count: number;
  }[];
}

export interface GeographicDistribution {
  byCountry: Record<string, number>;
  byRegion: Record<string, number>;
  ruralVsUrban: {
    rural: number;
    urban: number;
  };
}

export interface EngagementMetrics {
  views: number;
  uniqueVisitors: number;
  downloads: number;
  shares: number;
  averageTimeSpent?: number; // seconds
  completionRate?: number; // percentage
  returnVisitorRate?: number; // percentage
}

export interface AnalyticsFilters {
  resourceType?: string;
  resourceIds?: string[];
  dateRange?: DateRange;
  location?: string;
  platform?: string;
}

export interface AnalyticsReport {
  period: DateRange;
  overview: {
    totalViews: number;
    totalDownloads: number;
    totalShares: number;
    uniqueVisitors: number;
  };
  trends: {
    date: string;
    views: number;
    downloads: number;
  }[];
  topResources: {
    id: string;
    title: string;
    views: number;
    downloads: number;
  }[];
  geographic: GeographicDistribution;
  engagement: EngagementMetrics;
}

// Dashboard Analytics Types
export type IntervalType = 'month' | 'quarter' | 'year' | 'date';

export interface DashboardFilters {
  project_uuid?: string | null;
  region_uuid?: string | null;
  interval_type?: IntervalType;
  year?: number;
  quarter?: number;
  month?: number;
  start_date?: string;
  end_date?: string;
}

export interface GlobalSummary {
  total_users: number;
  total_projects: number;
  total_regions: number;
  total_activities: number;
  total_beneficiaries: number;
  total_incidents: number;
  total_cases: number;
  active_projects: number;
  completed_projects: number;
}

export interface ProjectSummary {
  project_id: string;
  title: string;
  total_activities: number;
  completed_activities: number;
  total_beneficiaries: number;
  start_date: string;
  end_date: string | null;
  status: string;
}

export interface RegionSummary {
  region_id: string;
  region_name: string;
  beneficiaries: number;
  incidents: number;
  cases: number;
  projects: number;
}

export interface DashboardOverview {
  summary: {
    global: GlobalSummary;
    projects: ProjectSummary[];
    regions: RegionSummary[];
  };
}
