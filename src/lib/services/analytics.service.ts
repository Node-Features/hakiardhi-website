import { supabase } from '../database/supabase_client';
import {
  ViewMetadata,
  DownloadMetadata,
  ShareMetadata,
  AnalyticsEvent,
  DateRange,
  DownloadStats,
  GeographicDistribution,
  EngagementMetrics,
  AnalyticsFilters,
  AnalyticsReport,
  DashboardFilters,
  DashboardOverview,
  IntervalType,
} from '../types/analytics.types';

export class AnalyticsService {
  /**
   * Track a view event
   */
  async trackView(
    resourceId: string,
    resourceType: string,
    metadata: ViewMetadata
  ): Promise<void> {
    const event: AnalyticsEvent = {
      type: 'view',
      resourceId,
      resourceType,
      metadata: {
        ...metadata,
        ipAddress: this.anonymizeIP(metadata.ipAddress || ''),
      },
      timestamp: new Date(),
    };

    await this.logEvent(event);

    // Increment view count
    await this.incrementCounter(resourceId, 'view_count');
  }

  /**
   * Track a download event
   */
  async trackDownload(
    resourceId: string,
    resourceType: string,
    metadata: DownloadMetadata
  ): Promise<void> {
    const event: AnalyticsEvent = {
      type: 'download',
      resourceId,
      resourceType,
      metadata: {
        ...metadata,
        ipAddress: this.anonymizeIP(metadata.ipAddress || ''),
      },
      timestamp: new Date(),
    };

    await this.logEvent(event);

    // Increment download count
    await this.incrementCounter(resourceId, 'download_count');

    // Track quality preference
    if (metadata.quality) {
      await this.trackQualityPreference(resourceId, metadata.quality);
    }
  }

  /**
   * Track a share event
   */
  async trackShare(
    resourceId: string,
    resourceType: string,
    metadata: ShareMetadata
  ): Promise<void> {
    const event: AnalyticsEvent = {
      type: 'share',
      resourceId,
      resourceType,
      metadata: {
        ...metadata,
        ipAddress: this.anonymizeIP(metadata.ipAddress || ''),
      },
      timestamp: new Date(),
    };

    await this.logEvent(event);

    // Increment share count
    await this.incrementCounter(resourceId, 'share_count');
  }

  /**
   * Get download statistics
   */
  async getDownloadStats(
    resourceId: string,
    dateRange?: DateRange
  ): Promise<DownloadStats> {
    const client = supabase();

    let query = client
      .from('analytics_events')
      .select('*')
      .eq('resource_id', resourceId)
      .eq('type', 'download');

    if (dateRange) {
      query = query
        .gte('timestamp', dateRange.from.toISOString())
        .lte('timestamp', dateRange.to.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    const stats: DownloadStats = {
      total: data?.length || 0,
      byQuality: {
        full: data?.filter((e) => e.metadata?.quality === 'full').length || 0,
        low_data: data?.filter((e) => e.metadata?.quality === 'low_data').length || 0,
      },
      byPeriod: this.groupByPeriod(data || []).map(({ date, views, downloads }) => ({
        date,
        count: views + downloads,
      })),
      topLocations: this.getTopLocations(data || []),
    };

    return stats;
  }

  /**
   * Get geographic distribution
   */
  async getGeographicReach(
    resourceId: string,
    dateRange?: DateRange
  ): Promise<GeographicDistribution> {
    const client = supabase();

    let query = client
      .from('analytics_events')
      .select('metadata')
      .eq('resource_id', resourceId);

    if (dateRange) {
      query = query
        .gte('timestamp', dateRange.from.toISOString())
        .lte('timestamp', dateRange.to.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    const byRegion: Record<string, number> = {};
    const byCountry: Record<string, number> = {};
    let rural = 0;
    let urban = 0;

    data?.forEach((event) => {
      const location = event.metadata?.location;
      if (location?.region) {
        byRegion[location.region] = (byRegion[location.region] || 0) + 1;
      }
      if (location?.country) {
        byCountry[location.country] = (byCountry[location.country] || 0) + 1;
      }
      // Simple heuristic: if city is present, assume urban
      if (location?.city) {
        urban++;
      } else {
        rural++;
      }
    });

    return {
      byCountry,
      byRegion,
      ruralVsUrban: {
        rural,
        urban,
      },
    };
  }

  /**
   * Get engagement metrics
   */
  async getUserEngagement(
    resourceId: string,
    dateRange?: DateRange
  ): Promise<EngagementMetrics> {
    const client = supabase();

    let query = client
      .from('analytics_events')
      .select('*')
      .eq('resource_id', resourceId);

    if (dateRange) {
      query = query
        .gte('timestamp', dateRange.from.toISOString())
        .lte('timestamp', dateRange.to.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    const views = data?.filter((e) => e.type === 'view').length || 0;
    const downloads = data?.filter((e) => e.type === 'download').length || 0;
    const shares = data?.filter((e) => e.type === 'share').length || 0;

    // Calculate unique visitors (by session_id or ip)
    const uniqueSessions = new Set(
      data?.map((e) => e.metadata?.sessionId || e.metadata?.ipAddress)
    );

    return {
      views,
      downloads,
      shares,
      uniqueVisitors: uniqueSessions.size,
    };
  }

  /**
   * Generate comprehensive analytics report
   */
  async generateAnalyticsReport(
    filters: AnalyticsFilters
  ): Promise<AnalyticsReport> {
    const client = supabase();

    let query = client.from('analytics_events').select('*');

    if (filters.resourceType) {
      query = query.eq('resource_type', filters.resourceType);
    }

    if (filters.resourceIds) {
      query = query.in('resource_id', filters.resourceIds);
    }

    if (filters.dateRange) {
      query = query
        .gte('timestamp', filters.dateRange.from.toISOString())
        .lte('timestamp', filters.dateRange.to.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    const views = data?.filter((e) => e.type === 'view') || [];
    const downloads = data?.filter((e) => e.type === 'download') || [];
    const shares = data?.filter((e) => e.type === 'share') || [];

    const uniqueVisitors = new Set(
      data?.map((e) => e.metadata?.sessionId || e.metadata?.ipAddress)
    ).size;

    // Top resources
    const resourceCounts: Record<string, { views: number; downloads: number }> = {};
    data?.forEach((event) => {
      if (!resourceCounts[event.resource_id]) {
        resourceCounts[event.resource_id] = { views: 0, downloads: 0 };
      }
      if (event.type === 'view') resourceCounts[event.resource_id].views++;
      if (event.type === 'download') resourceCounts[event.resource_id].downloads++;
    });

    const topResources = Object.entries(resourceCounts)
      .map(([id, counts]) => ({
        id,
        title: '', // Would fetch from resource table
        views: counts.views,
        downloads: counts.downloads,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    return {
      period: filters.dateRange || {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: new Date(),
      },
      overview: {
        totalViews: views.length,
        totalDownloads: downloads.length,
        totalShares: shares.length,
        uniqueVisitors,
      },
      trends: this.groupByPeriod(data || []),
      topResources,
      geographic: await this.getGeographicReach(filters.resourceIds?.[0] || ''),
      engagement: {
        views: views.length,
        downloads: downloads.length,
        shares: shares.length,
        uniqueVisitors,
      },
    };
  }

  /**
   * Log analytics event to database
   */
  private async logEvent(event: AnalyticsEvent): Promise<void> {
    const client = supabase();

    const { error } = await client.from('analytics_events').insert({
      type: event.type,
      resource_id: event.resourceId,
      resource_type: event.resourceType,
      metadata: event.metadata,
      timestamp: event.timestamp,
    });

    if (error) {
      console.error('Failed to log analytics event:', error);
    }
  }

  /**
   * Increment counter (view_count, download_count, etc.)
   */
  private async incrementCounter(
    resourceId: string,
    counterField: string
  ): Promise<void> {
    // This would update the specific resource table
    // Implementation depends on resource type
    // For now, this is a placeholder
  }

  /**
   * Track quality preference (full vs low_data)
   */
  private async trackQualityPreference(
    resourceId: string,
    quality: 'full' | 'low_data'
  ): Promise<void> {
    const client = supabase();

    await client.from('download_quality_stats').upsert({
      resource_id: resourceId,
      quality,
      count: 1,
    });
  }

  /**
   * Anonymize IP address (GDPR compliance)
   */
  private anonymizeIP(ip: string): string {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    }
    return ip;
  }

  /**
   * Group events by period (day/week/month)
   */
  private groupByPeriod(events: any[]): { date: string; views: number; downloads: number }[] {
    const grouped: Record<string, { views: number; downloads: number }> = {};

    events.forEach((event) => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = { views: 0, downloads: 0 };
      }
      if (event.type === 'view') {
        grouped[date].views += 1;
      }
      if (event.type === 'download') {
        grouped[date].downloads += 1;
      }
    });

    return Object.entries(grouped)
      .map(([date, { views, downloads }]) => ({ date, views, downloads }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get top locations from events
   */
  private getTopLocations(events: any[]): { location: string; count: number }[] {
    const locationCounts: Record<string, number> = {};

    events.forEach((event) => {
      const location = event.metadata?.location?.region || 'Unknown';
      locationCounts[location] = (locationCounts[location] || 0) + 1;
    });

    return Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Get admin dashboard overview using Supabase RPC
   * Calls: rpc_get_admin_dashboard(project_uuid, region_uuid, interval_type, year, quarter, month, start_date, end_date)
   *
   * TEMPORARY: Falls back to basic parameters if RPC function hasn't been updated yet
   */
  async getAdminDashboard(filters: DashboardFilters): Promise<DashboardOverview> {
    const client = supabase(true); // Use service role for admin access

    try {
      // Try with all new parameters first
      let result = await client.rpc('rpc_get_admin_dashboard', {
        project_uuid: filters.project_uuid || null,
        region_uuid: filters.region_uuid || null,
        interval_type: filters.interval_type || 'year',
        filter_year: filters.year || null,
        filter_quarter: filters.quarter || null,
        filter_month: filters.month || null,
        filter_start_date: filters.start_date || null,
        filter_end_date: filters.end_date || null,
      });

      // Supabase error code PGRST202 = function not found with given parameters
      if (result.error && result.error.code === 'PGRST202') {
        console.warn('⚠️  RPC function signature mismatch, trying fallback parameters...');

        // Try with project_uuid, region_uuid, interval_type
        result = await client.rpc('rpc_get_admin_dashboard', {
          project_uuid: filters.project_uuid || null,
          region_uuid: filters.region_uuid || null,
          interval_type: filters.interval_type || 'month',
        });

        // If still fails, try with just project_uuid and interval_type
        if (result.error && result.error.code === 'PGRST202') {
          console.warn('⚠️  Trying without region_uuid parameter...');
          result = await client.rpc('rpc_get_admin_dashboard', {
            project_uuid: filters.project_uuid || null,
            interval_type: filters.interval_type || 'month',
          });
        }

        // If still fails, try with just interval_type
        if (result.error && result.error.code === 'PGRST202') {
          console.warn('⚠️  Trying with only interval_type parameter...');
          result = await client.rpc('rpc_get_admin_dashboard', {
            interval_type: filters.interval_type || 'month',
          });
        }

        if (!result.error) {
          console.warn('⚠️  Dashboard loaded with limited filters');
          console.warn('⚠️  Update RPC function to enable all filters: Backend/v1/DATABASE_FILTER_UPDATE.md');
        }
      }

      if (result.error) {
        console.error('Error calling rpc_get_admin_dashboard:', result.error);
        throw new Error(`Failed to fetch dashboard data: ${result.error.message}`);
      }

      if (!result.data) {
        throw new Error('No data returned from dashboard RPC');
      }

      // The RPC should return data in the expected format
      // If it doesn't match exactly, transform it here
      return result.data as DashboardOverview;
    } catch (err) {
      console.error('Dashboard analytics error:', err);
      throw err;
    }
  }
}

export const analyticsService = new AnalyticsService();
