# Analytics Statistics Specification

This document defines the statistical metrics derived from collected visitor data, with support for monthly, quarterly, and annual filtering.

---

## Table of Contents

1. [Time Period Filtering](#time-period-filtering)
2. [Visitor & Traffic Statistics](#visitor--traffic-statistics)
3. [Engagement & Behavior Metrics](#engagement--behavior-metrics)
4. [Acquisition & Referrer Analytics](#acquisition--referrer-analytics)
5. [Technology & Device Statistics](#technology--device-statistics)
6. [Geographic Analytics](#geographic-analytics)
7. [Conversion & Goal Tracking](#conversion--goal-tracking)
8. [Performance Metrics](#performance-metrics)
9. [Statistical Aggregation Queries](#statistical-aggregation-queries)
10. [Dashboard Implementation](#dashboard-implementation)

---

## Time Period Filtering

### Filter Definitions

```typescript
// types/analytics.ts
export type TimePeriod = 'monthly' | 'quarterly' | 'annually';

export interface DateRange {
  startDate: Date;
  endDate: Date;
  period: TimePeriod;
  label: string;
}

export interface TimeFilter {
  period: TimePeriod;
  year: number;
  month?: number;      // 1-12, for monthly filter
  quarter?: number;    // 1-4, for quarterly filter
}

// Generate date ranges based on filter
export const getDateRange = (filter: TimeFilter): DateRange => {
  const { period, year, month, quarter } = filter;

  switch (period) {
    case 'monthly':
      return {
        startDate: new Date(year, (month || 1) - 1, 1),
        endDate: new Date(year, month || 1, 0, 23, 59, 59),
        period: 'monthly',
        label: `${getMonthName(month || 1)} ${year}`
      };

    case 'quarterly':
      const qStart = ((quarter || 1) - 1) * 3;
      return {
        startDate: new Date(year, qStart, 1),
        endDate: new Date(year, qStart + 3, 0, 23, 59, 59),
        period: 'quarterly',
        label: `Q${quarter} ${year}`
      };

    case 'annually':
      return {
        startDate: new Date(year, 0, 1),
        endDate: new Date(year, 11, 31, 23, 59, 59),
        period: 'annually',
        label: `${year}`
      };
  }
};
```

### Comparison Periods

```typescript
export interface ComparisonData {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

// Calculate period-over-period comparison
export const calculateComparison = (current: number, previous: number): ComparisonData => {
  const change = current - previous;
  const changePercent = previous !== 0 ? (change / previous) * 100 : 0;

  return {
    current,
    previous,
    change,
    changePercent: Math.round(changePercent * 100) / 100,
    trend: changePercent > 1 ? 'up' : changePercent < -1 ? 'down' : 'stable'
  };
};
```

---

## Visitor & Traffic Statistics

### 1. Core Visitor Metrics

| Metric | Description | Formula | Granularity |
|--------|-------------|---------|-------------|
| **Total Visitors** | Unique visitors in period | COUNT(DISTINCT visitor_id) | M/Q/A |
| **New Visitors** | First-time visitors | COUNT(DISTINCT visitor_id) WHERE first_visit IN period | M/Q/A |
| **Returning Visitors** | Repeat visitors | Total - New Visitors | M/Q/A |
| **New Visitor Rate** | % of new visitors | (New Visitors / Total Visitors) × 100 | M/Q/A |
| **Return Visitor Rate** | % of returning visitors | (Returning Visitors / Total Visitors) × 100 | M/Q/A |

### 2. Session Metrics

| Metric | Description | Formula | Granularity |
|--------|-------------|---------|-------------|
| **Total Sessions** | All sessions in period | COUNT(session_id) | M/Q/A |
| **Sessions per Visitor** | Avg sessions per user | Total Sessions / Total Visitors | M/Q/A |
| **Avg Session Duration** | Mean time per session | AVG(session_duration) | M/Q/A |
| **Median Session Duration** | Median time per session | PERCENTILE_CONT(0.5) | M/Q/A |
| **Session Duration Distribution** | Bucketed duration counts | GROUP BY duration_bucket | M/Q/A |

### 3. Traffic Volume Trends

```typescript
export interface VisitorStatistics {
  // Core counts
  totalVisitors: number;
  newVisitors: number;
  returningVisitors: number;
  totalSessions: number;

  // Rates
  newVisitorRate: number;
  returningVisitorRate: number;
  sessionsPerVisitor: number;

  // Duration metrics
  avgSessionDuration: number;
  medianSessionDuration: number;
  totalTimeOnSite: number;

  // Trends
  dailyVisitors: Array<{ date: string; count: number }>;
  weeklyVisitors: Array<{ week: string; count: number }>;
  peakHours: Array<{ hour: number; avgVisitors: number }>;
  peakDays: Array<{ dayOfWeek: string; avgVisitors: number }>;

  // Comparisons
  visitorComparison: ComparisonData;
  sessionComparison: ComparisonData;
}
```

### SQL Queries

```sql
-- Total and unique visitors for period
SELECT
  COUNT(DISTINCT visitor_id) AS total_visitors,
  COUNT(DISTINCT CASE
    WHEN visitor_id NOT IN (
      SELECT DISTINCT visitor_id FROM visitor_sessions
      WHERE start_time < :start_date
    ) THEN visitor_id
  END) AS new_visitors,
  COUNT(*) AS total_sessions,
  AVG(total_duration) AS avg_session_duration,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_duration) AS median_duration
FROM visitor_sessions
WHERE start_time BETWEEN :start_date AND :end_date;

-- Daily visitor trend
SELECT
  DATE(start_time) AS visit_date,
  COUNT(DISTINCT visitor_id) AS unique_visitors,
  COUNT(*) AS sessions
FROM visitor_sessions
WHERE start_time BETWEEN :start_date AND :end_date
GROUP BY DATE(start_time)
ORDER BY visit_date;

-- Peak hours analysis
SELECT
  EXTRACT(HOUR FROM start_time) AS hour_of_day,
  COUNT(DISTINCT visitor_id) AS avg_visitors,
  COUNT(*) AS total_sessions
FROM visitor_sessions
WHERE start_time BETWEEN :start_date AND :end_date
GROUP BY EXTRACT(HOUR FROM start_time)
ORDER BY hour_of_day;
```

---

## Engagement & Behavior Metrics

### 1. Page View Statistics

| Metric | Description | Formula | Granularity |
|--------|-------------|---------|-------------|
| **Total Page Views** | All page views | COUNT(page_view_id) | M/Q/A |
| **Unique Page Views** | Distinct page/session | COUNT(DISTINCT page_url, session_id) | M/Q/A |
| **Pages per Session** | Avg pages viewed | Total Page Views / Total Sessions | M/Q/A |
| **Avg Time on Page** | Mean time per page | AVG(time_on_page) | M/Q/A |
| **Top Pages** | Most viewed pages | GROUP BY page_url ORDER BY COUNT DESC | M/Q/A |
| **Exit Pages** | Last pages before leaving | WHERE is_exit = true | M/Q/A |
| **Entry Pages** | First pages visited | WHERE is_entry = true | M/Q/A |

### 2. Bounce & Engagement Rates

| Metric | Description | Formula | Granularity |
|--------|-------------|---------|-------------|
| **Bounce Rate** | Single-page sessions | (Bounced Sessions / Total Sessions) × 100 | M/Q/A |
| **Page Bounce Rate** | Bounces per page | (Page Bounces / Page Entries) × 100 | M/Q/A |
| **Engagement Rate** | Non-bounced sessions | 100 - Bounce Rate | M/Q/A |
| **Scroll Depth** | Avg scroll percentage | AVG(scroll_depth) | M/Q/A |
| **Read Rate** | Scrolled > 75% | (Deep Scrolls / Total Views) × 100 | M/Q/A |

### 3. Content Performance

```typescript
export interface EngagementStatistics {
  // Page metrics
  totalPageViews: number;
  uniquePageViews: number;
  pagesPerSession: number;
  avgTimeOnPage: number;

  // Bounce metrics
  bounceRate: number;
  engagementRate: number;
  avgScrollDepth: number;

  // Top content
  topPages: Array<{
    pageUrl: string;
    pageTitle: string;
    views: number;
    uniqueViews: number;
    avgTimeOnPage: number;
    bounceRate: number;
    exitRate: number;
  }>;

  // Entry/Exit analysis
  topEntryPages: Array<{
    pageUrl: string;
    entries: number;
    bounceRate: number;
  }>;

  topExitPages: Array<{
    pageUrl: string;
    exits: number;
    exitRate: number;
  }>;

  // Scroll depth distribution
  scrollDepthDistribution: {
    '0-25%': number;
    '25-50%': number;
    '50-75%': number;
    '75-100%': number;
  };

  // Comparisons
  pageViewComparison: ComparisonData;
  bounceRateComparison: ComparisonData;
}
```

### SQL Queries

```sql
-- Page view statistics
SELECT
  COUNT(*) AS total_page_views,
  COUNT(DISTINCT CONCAT(session_id, page_url)) AS unique_page_views,
  AVG(time_on_page) AS avg_time_on_page,
  AVG(scroll_depth) AS avg_scroll_depth
FROM page_views
WHERE entry_time BETWEEN :start_date AND :end_date;

-- Bounce rate calculation
SELECT
  COUNT(*) AS total_sessions,
  SUM(CASE WHEN is_bounce THEN 1 ELSE 0 END) AS bounced_sessions,
  (SUM(CASE WHEN is_bounce THEN 1 ELSE 0 END)::FLOAT / COUNT(*)) * 100 AS bounce_rate
FROM visitor_sessions
WHERE start_time BETWEEN :start_date AND :end_date;

-- Top pages with metrics
SELECT
  page_url,
  page_title,
  COUNT(*) AS views,
  COUNT(DISTINCT session_id) AS unique_views,
  AVG(time_on_page) AS avg_time_on_page,
  AVG(scroll_depth) AS avg_scroll_depth,
  (SUM(CASE WHEN is_exit THEN 1 ELSE 0 END)::FLOAT / COUNT(*)) * 100 AS exit_rate
FROM page_views
WHERE entry_time BETWEEN :start_date AND :end_date
GROUP BY page_url, page_title
ORDER BY views DESC
LIMIT 20;

-- Scroll depth distribution
SELECT
  CASE
    WHEN scroll_depth <= 25 THEN '0-25%'
    WHEN scroll_depth <= 50 THEN '25-50%'
    WHEN scroll_depth <= 75 THEN '50-75%'
    ELSE '75-100%'
  END AS depth_bucket,
  COUNT(*) AS count,
  (COUNT(*)::FLOAT / SUM(COUNT(*)) OVER()) * 100 AS percentage
FROM page_views
WHERE entry_time BETWEEN :start_date AND :end_date
GROUP BY depth_bucket
ORDER BY depth_bucket;
```

---

## Acquisition & Referrer Analytics

### 1. Traffic Source Metrics

| Metric | Description | Formula | Granularity |
|--------|-------------|---------|-------------|
| **Sessions by Source** | Traffic by channel | GROUP BY referrer_type | M/Q/A |
| **Direct Traffic** | No referrer | COUNT WHERE referrer_type = 'direct' | M/Q/A |
| **Organic Search** | Search engine traffic | COUNT WHERE referrer_type = 'organic' | M/Q/A |
| **Social Traffic** | Social media referrals | COUNT WHERE referrer_type = 'social' | M/Q/A |
| **Referral Traffic** | External site links | COUNT WHERE referrer_type = 'referral' | M/Q/A |
| **Paid Traffic** | Advertising campaigns | COUNT WHERE referrer_type = 'paid' | M/Q/A |
| **Email Traffic** | Email campaigns | COUNT WHERE referrer_type = 'email' | M/Q/A |

### 2. Campaign Performance

| Metric | Description | Formula | Granularity |
|--------|-------------|---------|-------------|
| **Campaign Sessions** | Sessions per campaign | GROUP BY utm_campaign | M/Q/A |
| **Campaign Bounce Rate** | Bounce per campaign | Bounces / Sessions per campaign | M/Q/A |
| **Source/Medium** | Combined attribution | GROUP BY utm_source, utm_medium | M/Q/A |
| **Campaign ROI** | Return on investment | (Revenue - Cost) / Cost | M/Q/A |

### 3. Referrer Quality Metrics

```typescript
export interface AcquisitionStatistics {
  // Traffic sources
  trafficBySource: Array<{
    source: string;
    sessions: number;
    percentage: number;
    newUsers: number;
    bounceRate: number;
    avgSessionDuration: number;
    pagesPerSession: number;
  }>;

  // Top referrers
  topReferrers: Array<{
    domain: string;
    sessions: number;
    newUsers: number;
    bounceRate: number;
  }>;

  // Campaign performance
  campaignPerformance: Array<{
    campaign: string;
    source: string;
    medium: string;
    sessions: number;
    newUsers: number;
    bounceRate: number;
    conversions: number;
    conversionRate: number;
  }>;

  // Search terms (if available)
  topSearchTerms: Array<{
    term: string;
    sessions: number;
    bounceRate: number;
  }>;

  // Social breakdown
  socialTraffic: Array<{
    network: string;
    sessions: number;
    percentage: number;
    avgEngagement: number;
  }>;

  // Source quality score
  sourceQualityScores: Array<{
    source: string;
    qualityScore: number; // 0-100 based on bounce, duration, pages
  }>;

  // Comparisons
  organicComparison: ComparisonData;
  directComparison: ComparisonData;
  referralComparison: ComparisonData;
}
```

### SQL Queries

```sql
-- Traffic by source with quality metrics
SELECT
  vr.referrer_type AS source,
  COUNT(DISTINCT vs.id) AS sessions,
  COUNT(DISTINCT vs.visitor_id) AS unique_visitors,
  (COUNT(DISTINCT vs.id)::FLOAT / SUM(COUNT(DISTINCT vs.id)) OVER()) * 100 AS percentage,
  AVG(vs.total_duration) AS avg_session_duration,
  (SUM(CASE WHEN vs.is_bounce THEN 1 ELSE 0 END)::FLOAT / COUNT(*)) * 100 AS bounce_rate,
  AVG(vs.page_views_count) AS pages_per_session
FROM visitor_sessions vs
JOIN visitor_referrers vr ON vs.id = vr.session_id
WHERE vs.start_time BETWEEN :start_date AND :end_date
GROUP BY vr.referrer_type
ORDER BY sessions DESC;

-- Campaign performance
SELECT
  vr.utm_campaign AS campaign,
  vr.utm_source AS source,
  vr.utm_medium AS medium,
  COUNT(DISTINCT vs.id) AS sessions,
  COUNT(DISTINCT CASE WHEN vs.visitor_id NOT IN (
    SELECT DISTINCT visitor_id FROM visitor_sessions
    WHERE start_time < :start_date
  ) THEN vs.visitor_id END) AS new_users,
  (SUM(CASE WHEN vs.is_bounce THEN 1 ELSE 0 END)::FLOAT / COUNT(*)) * 100 AS bounce_rate,
  AVG(vs.total_duration) AS avg_duration
FROM visitor_sessions vs
JOIN visitor_referrers vr ON vs.id = vr.session_id
WHERE vs.start_time BETWEEN :start_date AND :end_date
  AND vr.utm_campaign IS NOT NULL
GROUP BY vr.utm_campaign, vr.utm_source, vr.utm_medium
ORDER BY sessions DESC;

-- Top referring domains
SELECT
  vr.referrer_domain,
  COUNT(DISTINCT vs.id) AS sessions,
  (SUM(CASE WHEN vs.is_bounce THEN 1 ELSE 0 END)::FLOAT / COUNT(*)) * 100 AS bounce_rate,
  AVG(vs.total_duration) AS avg_duration
FROM visitor_sessions vs
JOIN visitor_referrers vr ON vs.id = vr.session_id
WHERE vs.start_time BETWEEN :start_date AND :end_date
  AND vr.referrer_type = 'referral'
GROUP BY vr.referrer_domain
ORDER BY sessions DESC
LIMIT 20;
```

---

## Technology & Device Statistics

### 1. Browser Analytics

| Metric | Description | Formula | Granularity |
|--------|-------------|---------|-------------|
| **Browser Distribution** | Users per browser | GROUP BY browser_type | M/Q/A |
| **Browser Version** | Specific versions | GROUP BY browser_type, version | M/Q/A |
| **Browser Bounce Rate** | Bounce per browser | Bounces per browser / Sessions | M/Q/A |
| **Browser Engagement** | Engagement score | Composite of duration, pages | M/Q/A |

### 2. Operating System Analytics

| Metric | Description | Formula | Granularity |
|--------|-------------|---------|-------------|
| **OS Distribution** | Users per OS | GROUP BY operating_system | M/Q/A |
| **OS Version** | Specific versions | GROUP BY os, os_version | M/Q/A |
| **Mobile OS Share** | iOS vs Android | Mobile OS breakdown | M/Q/A |

### 3. Device Analytics

| Metric | Description | Formula | Granularity |
|--------|-------------|---------|-------------|
| **Device Category** | Desktop/Mobile/Tablet | GROUP BY device_type | M/Q/A |
| **Screen Resolution** | Common resolutions | GROUP BY screen_resolution | M/Q/A |
| **Touch Capability** | Touch vs non-touch | GROUP BY touch_enabled | M/Q/A |
| **Mobile Engagement** | Mobile vs Desktop | Compare engagement by device | M/Q/A |

### Statistics Interface

```typescript
export interface TechnologyStatistics {
  // Browser breakdown
  browserDistribution: Array<{
    browser: string;
    sessions: number;
    percentage: number;
    bounceRate: number;
    avgDuration: number;
  }>;

  browserVersions: Array<{
    browser: string;
    version: string;
    sessions: number;
  }>;

  // OS breakdown
  osDistribution: Array<{
    os: string;
    sessions: number;
    percentage: number;
    bounceRate: number;
  }>;

  osVersions: Array<{
    os: string;
    version: string;
    sessions: number;
  }>;

  // Device breakdown
  deviceDistribution: Array<{
    deviceType: 'desktop' | 'mobile' | 'tablet';
    sessions: number;
    percentage: number;
    bounceRate: number;
    avgDuration: number;
    pagesPerSession: number;
  }>;

  // Screen resolutions
  screenResolutions: Array<{
    resolution: string;
    sessions: number;
    percentage: number;
  }>;

  // Technical capabilities
  touchEnabled: {
    touch: number;
    nonTouch: number;
  };

  cookiesEnabled: {
    enabled: number;
    disabled: number;
  };

  // Trends
  mobileShare: number;
  mobileShareTrend: ComparisonData;

  // Comparisons
  desktopVsMobile: {
    desktop: { sessions: number; bounceRate: number; avgDuration: number };
    mobile: { sessions: number; bounceRate: number; avgDuration: number };
    tablet: { sessions: number; bounceRate: number; avgDuration: number };
  };
}
```

### SQL Queries

```sql
-- Browser distribution with metrics
SELECT
  vbi.browser_type,
  COUNT(DISTINCT vs.id) AS sessions,
  (COUNT(DISTINCT vs.id)::FLOAT / SUM(COUNT(DISTINCT vs.id)) OVER()) * 100 AS percentage,
  (SUM(CASE WHEN vs.is_bounce THEN 1 ELSE 0 END)::FLOAT / COUNT(*)) * 100 AS bounce_rate,
  AVG(vs.total_duration) AS avg_duration
FROM visitor_sessions vs
JOIN visitor_browser_info vbi ON vs.id = vbi.session_id
WHERE vs.start_time BETWEEN :start_date AND :end_date
GROUP BY vbi.browser_type
ORDER BY sessions DESC;

-- Device type comparison
SELECT
  vdi.device_type,
  COUNT(DISTINCT vs.id) AS sessions,
  (COUNT(DISTINCT vs.id)::FLOAT / SUM(COUNT(DISTINCT vs.id)) OVER()) * 100 AS percentage,
  (SUM(CASE WHEN vs.is_bounce THEN 1 ELSE 0 END)::FLOAT / COUNT(*)) * 100 AS bounce_rate,
  AVG(vs.total_duration) AS avg_duration,
  AVG(vs.page_views_count) AS pages_per_session
FROM visitor_sessions vs
JOIN visitor_device_info vdi ON vs.id = vdi.session_id
WHERE vs.start_time BETWEEN :start_date AND :end_date
GROUP BY vdi.device_type
ORDER BY sessions DESC;

-- Screen resolution distribution
SELECT
  vdi.screen_resolution,
  COUNT(*) AS sessions,
  (COUNT(*)::FLOAT / SUM(COUNT(*)) OVER()) * 100 AS percentage
FROM visitor_device_info vdi
JOIN visitor_sessions vs ON vs.id = vdi.session_id
WHERE vs.start_time BETWEEN :start_date AND :end_date
GROUP BY vdi.screen_resolution
ORDER BY sessions DESC
LIMIT 15;

-- OS market share
SELECT
  vdi.operating_system,
  COUNT(DISTINCT vs.id) AS sessions,
  (COUNT(DISTINCT vs.id)::FLOAT / SUM(COUNT(DISTINCT vs.id)) OVER()) * 100 AS percentage
FROM visitor_sessions vs
JOIN visitor_device_info vdi ON vs.id = vdi.session_id
WHERE vs.start_time BETWEEN :start_date AND :end_date
GROUP BY vdi.operating_system
ORDER BY sessions DESC;
```

---

## Geographic Analytics

### 1. Location Metrics

| Metric | Description | Formula | Granularity |
|--------|-------------|---------|-------------|
| **Country Distribution** | Visitors by country | GROUP BY country | M/Q/A |
| **City Distribution** | Visitors by city | GROUP BY city | M/Q/A |
| **Region/State** | Visitors by region | GROUP BY region | M/Q/A |
| **Language Preference** | Browser language | GROUP BY language | M/Q/A |

### Statistics Interface

```typescript
export interface GeographicStatistics {
  // Country breakdown
  countryDistribution: Array<{
    country: string;
    countryCode: string;
    sessions: number;
    percentage: number;
    newUsers: number;
    bounceRate: number;
    avgDuration: number;
  }>;

  // City breakdown
  cityDistribution: Array<{
    city: string;
    country: string;
    sessions: number;
    percentage: number;
  }>;

  // Language preferences
  languageDistribution: Array<{
    language: string;
    sessions: number;
    percentage: number;
  }>;

  // Geographic trends
  topGrowingRegions: Array<{
    region: string;
    growth: number;
    sessions: number;
  }>;

  // Map data
  geoMapData: Array<{
    lat: number;
    lng: number;
    value: number;
  }>;
}
```

---

## Conversion & Goal Tracking

### 1. Conversion Metrics

| Metric | Description | Formula | Granularity |
|--------|-------------|---------|-------------|
| **Goal Completions** | Total conversions | COUNT(conversion_id) | M/Q/A |
| **Conversion Rate** | % sessions converting | (Conversions / Sessions) × 100 | M/Q/A |
| **Goal Value** | Total conversion value | SUM(goal_value) | M/Q/A |
| **Per Session Value** | Avg value per session | Total Value / Sessions | M/Q/A |

### 2. Funnel Analysis

| Metric | Description | Formula | Granularity |
|--------|-------------|---------|-------------|
| **Funnel Completion** | End-to-end conversion | Final Step / First Step | M/Q/A |
| **Step Drop-off** | Lost users per step | (Step N - Step N+1) / Step N | M/Q/A |
| **Funnel Abandonment** | Where users leave | GROUP BY exit_step | M/Q/A |

### Statistics Interface

```typescript
export interface ConversionStatistics {
  // Overall conversions
  totalConversions: number;
  conversionRate: number;
  totalGoalValue: number;
  avgOrderValue: number;

  // Goal breakdown
  goalCompletions: Array<{
    goalName: string;
    completions: number;
    conversionRate: number;
    goalValue: number;
  }>;

  // Conversion by source
  conversionsBySource: Array<{
    source: string;
    conversions: number;
    conversionRate: number;
    value: number;
  }>;

  // Funnel metrics
  funnelAnalysis: Array<{
    funnelName: string;
    steps: Array<{
      stepName: string;
      users: number;
      dropOffRate: number;
      conversionRate: number;
    }>;
  }>;

  // Time to conversion
  avgTimeToConversion: number;
  conversionsByDayOfWeek: Array<{ day: string; conversions: number }>;
  conversionsByHour: Array<{ hour: number; conversions: number }>;

  // Comparisons
  conversionComparison: ComparisonData;
  revenueComparison: ComparisonData;
}
```

---

## Performance Metrics

### 1. Site Performance

| Metric | Description | Formula | Granularity |
|--------|-------------|---------|-------------|
| **Avg Page Load Time** | Time to load | AVG(load_time) | M/Q/A |
| **Server Response Time** | Backend latency | AVG(server_time) | M/Q/A |
| **DOM Interactive** | Time to interactive | AVG(dom_interactive) | M/Q/A |
| **Page Speed Score** | Performance index | Composite score | M/Q/A |

### Statistics Interface

```typescript
export interface PerformanceStatistics {
  avgPageLoadTime: number;
  avgServerResponseTime: number;
  avgDomInteractive: number;

  // Performance by page
  pagePerformance: Array<{
    pageUrl: string;
    avgLoadTime: number;
    sampleSize: number;
  }>;

  // Performance by device
  performanceByDevice: {
    desktop: number;
    mobile: number;
    tablet: number;
  };

  // Performance trends
  loadTimeTrend: Array<{ date: string; avgLoadTime: number }>;
}
```

---

## Statistical Aggregation Queries

### Unified Statistics Query Builder

```typescript
// services/analytics/statisticsService.ts
import { Pool } from 'pg';

export class StatisticsService {
  constructor(private db: Pool) {}

  async getVisitorStatistics(filter: TimeFilter): Promise<VisitorStatistics> {
    const { startDate, endDate } = getDateRange(filter);

    const query = `
      WITH period_data AS (
        SELECT
          COUNT(DISTINCT visitor_id) AS total_visitors,
          COUNT(*) AS total_sessions,
          AVG(total_duration) AS avg_duration,
          SUM(total_duration) AS total_time,
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_duration) AS median_duration
        FROM visitor_sessions
        WHERE start_time BETWEEN $1 AND $2
      ),
      new_visitors AS (
        SELECT COUNT(DISTINCT visitor_id) AS count
        FROM visitor_sessions vs
        WHERE start_time BETWEEN $1 AND $2
          AND NOT EXISTS (
            SELECT 1 FROM visitor_sessions
            WHERE visitor_id = vs.visitor_id
              AND start_time < $1
          )
      ),
      previous_period AS (
        SELECT COUNT(DISTINCT visitor_id) AS total_visitors
        FROM visitor_sessions
        WHERE start_time BETWEEN $1 - ($2 - $1) AND $1
      )
      SELECT
        pd.*,
        nv.count AS new_visitors,
        pd.total_visitors - nv.count AS returning_visitors,
        (nv.count::FLOAT / NULLIF(pd.total_visitors, 0)) * 100 AS new_visitor_rate,
        pp.total_visitors AS previous_visitors
      FROM period_data pd, new_visitors nv, previous_period pp;
    `;

    const result = await this.db.query(query, [startDate, endDate]);
    return this.mapVisitorStatistics(result.rows[0]);
  }

  async getEngagementStatistics(filter: TimeFilter): Promise<EngagementStatistics> {
    const { startDate, endDate } = getDateRange(filter);

    const query = `
      SELECT
        COUNT(*) AS total_page_views,
        COUNT(DISTINCT CONCAT(session_id::text, page_url)) AS unique_page_views,
        AVG(time_on_page) AS avg_time_on_page,
        AVG(scroll_depth) AS avg_scroll_depth
      FROM page_views
      WHERE entry_time BETWEEN $1 AND $2;
    `;

    const bounceQuery = `
      SELECT
        (SUM(CASE WHEN is_bounce THEN 1 ELSE 0 END)::FLOAT / COUNT(*)) * 100 AS bounce_rate
      FROM visitor_sessions
      WHERE start_time BETWEEN $1 AND $2;
    `;

    const [pageResults, bounceResults] = await Promise.all([
      this.db.query(query, [startDate, endDate]),
      this.db.query(bounceQuery, [startDate, endDate])
    ]);

    return this.mapEngagementStatistics(pageResults.rows[0], bounceResults.rows[0]);
  }

  async getAcquisitionStatistics(filter: TimeFilter): Promise<AcquisitionStatistics> {
    const { startDate, endDate } = getDateRange(filter);

    const query = `
      SELECT
        vr.referrer_type AS source,
        COUNT(DISTINCT vs.id) AS sessions,
        (COUNT(DISTINCT vs.id)::FLOAT / SUM(COUNT(DISTINCT vs.id)) OVER()) * 100 AS percentage,
        COUNT(DISTINCT CASE
          WHEN vs.visitor_id NOT IN (
            SELECT DISTINCT visitor_id FROM visitor_sessions WHERE start_time < $1
          ) THEN vs.visitor_id
        END) AS new_users,
        (SUM(CASE WHEN vs.is_bounce THEN 1 ELSE 0 END)::FLOAT / COUNT(*)) * 100 AS bounce_rate,
        AVG(vs.total_duration) AS avg_duration,
        AVG(vs.page_views_count) AS pages_per_session
      FROM visitor_sessions vs
      JOIN visitor_referrers vr ON vs.id = vr.session_id
      WHERE vs.start_time BETWEEN $1 AND $2
      GROUP BY vr.referrer_type
      ORDER BY sessions DESC;
    `;

    const result = await this.db.query(query, [startDate, endDate]);
    return this.mapAcquisitionStatistics(result.rows);
  }

  async getTechnologyStatistics(filter: TimeFilter): Promise<TechnologyStatistics> {
    const { startDate, endDate } = getDateRange(filter);

    const browserQuery = `
      SELECT
        vbi.browser_type,
        COUNT(DISTINCT vs.id) AS sessions,
        (COUNT(DISTINCT vs.id)::FLOAT / SUM(COUNT(DISTINCT vs.id)) OVER()) * 100 AS percentage,
        (SUM(CASE WHEN vs.is_bounce THEN 1 ELSE 0 END)::FLOAT / COUNT(*)) * 100 AS bounce_rate,
        AVG(vs.total_duration) AS avg_duration
      FROM visitor_sessions vs
      JOIN visitor_browser_info vbi ON vs.id = vbi.session_id
      WHERE vs.start_time BETWEEN $1 AND $2
      GROUP BY vbi.browser_type
      ORDER BY sessions DESC;
    `;

    const deviceQuery = `
      SELECT
        vdi.device_type,
        COUNT(DISTINCT vs.id) AS sessions,
        (COUNT(DISTINCT vs.id)::FLOAT / SUM(COUNT(DISTINCT vs.id)) OVER()) * 100 AS percentage,
        (SUM(CASE WHEN vs.is_bounce THEN 1 ELSE 0 END)::FLOAT / COUNT(*)) * 100 AS bounce_rate,
        AVG(vs.total_duration) AS avg_duration,
        AVG(vs.page_views_count) AS pages_per_session
      FROM visitor_sessions vs
      JOIN visitor_device_info vdi ON vs.id = vdi.session_id
      WHERE vs.start_time BETWEEN $1 AND $2
      GROUP BY vdi.device_type
      ORDER BY sessions DESC;
    `;

    const [browserResults, deviceResults] = await Promise.all([
      this.db.query(browserQuery, [startDate, endDate]),
      this.db.query(deviceQuery, [startDate, endDate])
    ]);

    return this.mapTechnologyStatistics(browserResults.rows, deviceResults.rows);
  }

  // Aggregate all statistics
  async getAllStatistics(filter: TimeFilter): Promise<DashboardStatistics> {
    const [visitor, engagement, acquisition, technology] = await Promise.all([
      this.getVisitorStatistics(filter),
      this.getEngagementStatistics(filter),
      this.getAcquisitionStatistics(filter),
      this.getTechnologyStatistics(filter)
    ]);

    return {
      period: getDateRange(filter),
      visitor,
      engagement,
      acquisition,
      technology
    };
  }
}
```

---

## Dashboard Implementation

### API Endpoints

```typescript
// routes/statistics.ts
import { Router } from 'express';
import { StatisticsController } from '../controllers/statisticsController';

const router = Router();
const controller = new StatisticsController();

// Get all statistics for dashboard
router.get('/dashboard', controller.getDashboardStatistics);

// Individual statistic endpoints
router.get('/visitors', controller.getVisitorStatistics);
router.get('/engagement', controller.getEngagementStatistics);
router.get('/acquisition', controller.getAcquisitionStatistics);
router.get('/technology', controller.getTechnologyStatistics);
router.get('/geographic', controller.getGeographicStatistics);
router.get('/conversions', controller.getConversionStatistics);

// Export endpoints
router.get('/export/csv', controller.exportCSV);
router.get('/export/pdf', controller.exportPDF);

export default router;
```

### Controller Implementation

```typescript
// controllers/statisticsController.ts
import { Request, Response } from 'express';
import { StatisticsService } from '../services/analytics/statisticsService';

export class StatisticsController {
  private service: StatisticsService;

  constructor() {
    this.service = new StatisticsService(db);
  }

  getDashboardStatistics = async (req: Request, res: Response) => {
    try {
      const filter: TimeFilter = {
        period: req.query.period as TimePeriod || 'monthly',
        year: parseInt(req.query.year as string) || new Date().getFullYear(),
        month: req.query.month ? parseInt(req.query.month as string) : undefined,
        quarter: req.query.quarter ? parseInt(req.query.quarter as string) : undefined
      };

      const statistics = await this.service.getAllStatistics(filter);

      res.json({
        success: true,
        data: statistics,
        filter: {
          ...filter,
          dateRange: getDateRange(filter)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve statistics'
      });
    }
  };
}
```

### React Dashboard Hook

```typescript
// hooks/useAnalyticsStatistics.ts
import { useState, useEffect } from 'react';
import { TimeFilter, DashboardStatistics } from '../types/analytics';

export const useAnalyticsStatistics = (filter: TimeFilter) => {
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          period: filter.period,
          year: filter.year.toString(),
          ...(filter.month && { month: filter.month.toString() }),
          ...(filter.quarter && { quarter: filter.quarter.toString() })
        });

        const response = await fetch(`/api/statistics/dashboard?${params}`);
        const data = await response.json();

        if (data.success) {
          setStatistics(data.data);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [filter]);

  return { statistics, loading, error };
};
```

### Time Period Selector Component

```typescript
// components/TimePeriodSelector.tsx
import React from 'react';
import { TimeFilter, TimePeriod } from '../types/analytics';

interface Props {
  value: TimeFilter;
  onChange: (filter: TimeFilter) => void;
}

export const TimePeriodSelector: React.FC<Props> = ({ value, onChange }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

  return (
    <div className="time-period-selector">
      <select
        value={value.period}
        onChange={(e) => onChange({ ...value, period: e.target.value as TimePeriod })}
      >
        <option value="monthly">Monthly</option>
        <option value="quarterly">Quarterly</option>
        <option value="annually">Annually</option>
      </select>

      <select
        value={value.year}
        onChange={(e) => onChange({ ...value, year: parseInt(e.target.value) })}
      >
        {years.map(year => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>

      {value.period === 'monthly' && (
        <select
          value={value.month || 1}
          onChange={(e) => onChange({ ...value, month: parseInt(e.target.value) })}
        >
          {months.map((month, i) => (
            <option key={i} value={i + 1}>{month}</option>
          ))}
        </select>
      )}

      {value.period === 'quarterly' && (
        <select
          value={value.quarter || 1}
          onChange={(e) => onChange({ ...value, quarter: parseInt(e.target.value) })}
        >
          {quarters.map((q, i) => (
            <option key={i} value={i + 1}>{q}</option>
          ))}
        </select>
      )}
    </div>
  );
};
```

---

## Summary Statistics Card Types

### Key Performance Indicators (KPIs)

```typescript
export interface KPICard {
  title: string;
  value: number | string;
  format: 'number' | 'percent' | 'duration' | 'currency';
  comparison: ComparisonData;
  sparkline?: number[];
  icon?: string;
}

export const dashboardKPIs: KPICard[] = [
  {
    title: 'Total Visitors',
    value: statistics.visitor.totalVisitors,
    format: 'number',
    comparison: statistics.visitor.visitorComparison
  },
  {
    title: 'Bounce Rate',
    value: statistics.engagement.bounceRate,
    format: 'percent',
    comparison: statistics.engagement.bounceRateComparison
  },
  {
    title: 'Avg Session Duration',
    value: statistics.visitor.avgSessionDuration,
    format: 'duration',
    comparison: statistics.visitor.sessionComparison
  },
  {
    title: 'Pages per Session',
    value: statistics.engagement.pagesPerSession,
    format: 'number',
    comparison: statistics.engagement.pageViewComparison
  }
];
```

---

## Export Formats

### CSV Export

```typescript
export const exportToCSV = (statistics: DashboardStatistics, filename: string) => {
  const rows = [
    ['Metric', 'Value', 'Previous', 'Change %'],
    ['Total Visitors', statistics.visitor.totalVisitors, statistics.visitor.visitorComparison.previous, statistics.visitor.visitorComparison.changePercent],
    ['New Visitors', statistics.visitor.newVisitors, '', ''],
    ['Bounce Rate', statistics.engagement.bounceRate, statistics.engagement.bounceRateComparison.previous, statistics.engagement.bounceRateComparison.changePercent],
    // ... more rows
  ];

  const csv = rows.map(row => row.join(',')).join('\n');
  downloadFile(csv, `${filename}.csv`, 'text/csv');
};
```

---

## Scheduled Reports

### Report Generation Service

```typescript
// services/reportScheduler.ts
export class ReportScheduler {
  // Generate monthly report on 1st of each month
  async generateMonthlyReport(year: number, month: number): Promise<void> {
    const filter: TimeFilter = { period: 'monthly', year, month };
    const statistics = await statisticsService.getAllStatistics(filter);

    await this.sendReportEmail(statistics, 'Monthly Analytics Report');
  }

  // Generate quarterly report
  async generateQuarterlyReport(year: number, quarter: number): Promise<void> {
    const filter: TimeFilter = { period: 'quarterly', year, quarter };
    const statistics = await statisticsService.getAllStatistics(filter);

    await this.sendReportEmail(statistics, `Q${quarter} Analytics Report`);
  }

  // Generate annual report
  async generateAnnualReport(year: number): Promise<void> {
    const filter: TimeFilter = { period: 'annually', year };
    const statistics = await statisticsService.getAllStatistics(filter);

    await this.sendReportEmail(statistics, `${year} Annual Analytics Report`);
  }
}
```

---

## Next Steps

1. Implement database migrations for statistics tables
2. Create materialized views for performance
3. Build dashboard UI components
4. Set up automated report generation
5. Configure data visualization charts
6. Implement data export functionality
7. Set up alerting for anomalies
8. Create API documentation
