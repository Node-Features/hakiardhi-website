# Automatic Data Collection Implementation Plan

This document outlines the implementation plan for automatically collecting visitor data when users access the Public Portal website.

## Overview

The system will automatically collect the following information from website visitors:

1. IP address and browser type
2. Device information and operating system
3. Pages visited and time spent on the website
4. Referring website addresses
5. Cookies and similar tracking technologies

---

## 1. IP Address and Browser Type Collection

### Implementation Approach

#### Backend Collection (Recommended)

```typescript
// middleware/analyticsCollector.ts
import { Request, Response, NextFunction } from 'express';

interface VisitorInfo {
  ipAddress: string;
  browserType: string;
  userAgent: string;
  timestamp: Date;
}

export const collectVisitorInfo = (req: Request, res: Response, next: NextFunction) => {
  const visitorInfo: VisitorInfo = {
    ipAddress: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] as string,
    browserType: parseBrowserType(req.headers['user-agent']),
    userAgent: req.headers['user-agent'] || 'Unknown',
    timestamp: new Date()
  };

  // Store in analytics database
  saveVisitorInfo(visitorInfo);
  next();
};

function parseBrowserType(userAgent: string | undefined): string {
  if (!userAgent) return 'Unknown';

  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';

  return 'Other';
}
```

#### Frontend Collection (Supplementary)

```typescript
// services/analytics/browserInfo.ts
export interface BrowserInfo {
  browserName: string;
  browserVersion: string;
  language: string;
  cookiesEnabled: boolean;
  doNotTrack: boolean;
}

export const collectBrowserInfo = (): BrowserInfo => {
  const userAgent = navigator.userAgent;

  return {
    browserName: detectBrowser(userAgent),
    browserVersion: detectBrowserVersion(userAgent),
    language: navigator.language,
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack === '1'
  };
};
```

### Database Schema

```sql
CREATE TABLE visitor_browser_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  ip_country VARCHAR(100),
  ip_city VARCHAR(100),
  browser_type VARCHAR(50) NOT NULL,
  browser_version VARCHAR(20),
  user_agent TEXT,
  language VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_ip_address (ip_address),
  INDEX idx_created_at (created_at)
);
```

### Privacy Considerations

- IP addresses should be anonymized after 30 days (hash or truncate last octet)
- Implement IP geolocation for aggregate analytics only
- Respect Do Not Track browser settings

---

## 2. Device Information and Operating System Collection

### Implementation Approach

#### Frontend Collection

```typescript
// services/analytics/deviceInfo.ts
export interface DeviceInfo {
  deviceType: 'desktop' | 'tablet' | 'mobile';
  operatingSystem: string;
  osVersion: string;
  screenResolution: string;
  screenColorDepth: number;
  touchEnabled: boolean;
  hardwareConcurrency: number;
  deviceMemory: number | null;
}

export const collectDeviceInfo = (): DeviceInfo => {
  const userAgent = navigator.userAgent;

  return {
    deviceType: detectDeviceType(),
    operatingSystem: detectOS(userAgent),
    osVersion: detectOSVersion(userAgent),
    screenResolution: `${screen.width}x${screen.height}`,
    screenColorDepth: screen.colorDepth,
    touchEnabled: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: (navigator as any).deviceMemory || null
  };
};

function detectDeviceType(): 'desktop' | 'tablet' | 'mobile' {
  const userAgent = navigator.userAgent.toLowerCase();

  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return 'tablet';
  }

  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(userAgent)) {
    return 'mobile';
  }

  return 'desktop';
}

function detectOS(userAgent: string): string {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac OS')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';

  return 'Unknown';
}

function detectOSVersion(userAgent: string): string {
  const patterns: Record<string, RegExp> = {
    'Windows': /Windows NT (\d+\.\d+)/,
    'macOS': /Mac OS X (\d+[._]\d+)/,
    'Android': /Android (\d+\.\d+)/,
    'iOS': /OS (\d+_\d+)/
  };

  for (const [os, pattern] of Object.entries(patterns)) {
    const match = userAgent.match(pattern);
    if (match) {
      return match[1].replace('_', '.');
    }
  }

  return 'Unknown';
}
```

### Database Schema

```sql
CREATE TABLE visitor_device_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  device_type VARCHAR(20) NOT NULL,
  operating_system VARCHAR(50) NOT NULL,
  os_version VARCHAR(20),
  screen_resolution VARCHAR(20),
  screen_color_depth INTEGER,
  touch_enabled BOOLEAN DEFAULT FALSE,
  hardware_concurrency INTEGER,
  device_memory DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (session_id) REFERENCES visitor_sessions(id),
  INDEX idx_device_type (device_type),
  INDEX idx_operating_system (operating_system)
);
```

---

## 3. Pages Visited and Time Spent Tracking

### Implementation Approach

#### Page View Tracking

```typescript
// services/analytics/pageTracking.ts
export interface PageView {
  sessionId: string;
  pageUrl: string;
  pageTitle: string;
  entryTime: Date;
  exitTime: Date | null;
  timeOnPage: number | null;
  scrollDepth: number;
}

class PageTracker {
  private currentPage: PageView | null = null;
  private scrollDepth: number = 0;

  init(sessionId: string): void {
    this.trackPageEntry(sessionId);
    this.setupScrollTracking();
    this.setupVisibilityTracking();
    this.setupBeforeUnload();
  }

  private trackPageEntry(sessionId: string): void {
    this.currentPage = {
      sessionId,
      pageUrl: window.location.href,
      pageTitle: document.title,
      entryTime: new Date(),
      exitTime: null,
      timeOnPage: null,
      scrollDepth: 0
    };
  }

  private setupScrollTracking(): void {
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
          const scrollPosition = window.scrollY;
          const depth = Math.round((scrollPosition / scrollHeight) * 100);

          if (depth > this.scrollDepth) {
            this.scrollDepth = depth;
          }

          ticking = false;
        });
        ticking = true;
      }
    });
  }

  private setupVisibilityTracking(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.sendPageData();
      }
    });
  }

  private setupBeforeUnload(): void {
    window.addEventListener('beforeunload', () => {
      this.sendPageData();
    });
  }

  private sendPageData(): void {
    if (!this.currentPage) return;

    this.currentPage.exitTime = new Date();
    this.currentPage.timeOnPage =
      (this.currentPage.exitTime.getTime() - this.currentPage.entryTime.getTime()) / 1000;
    this.currentPage.scrollDepth = this.scrollDepth;

    // Use sendBeacon for reliable delivery
    navigator.sendBeacon('/api/analytics/pageview', JSON.stringify(this.currentPage));
  }
}

export const pageTracker = new PageTracker();
```

#### Session Management

```typescript
// services/analytics/sessionManager.ts
export interface Session {
  id: string;
  startTime: Date;
  lastActivityTime: Date;
  pageViews: number;
  isActive: boolean;
}

class SessionManager {
  private session: Session | null = null;
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  getOrCreateSession(): Session {
    const existingSession = this.loadSession();

    if (existingSession && this.isSessionValid(existingSession)) {
      this.updateActivity(existingSession);
      return existingSession;
    }

    return this.createNewSession();
  }

  private createNewSession(): Session {
    const session: Session = {
      id: this.generateSessionId(),
      startTime: new Date(),
      lastActivityTime: new Date(),
      pageViews: 0,
      isActive: true
    };

    this.saveSession(session);
    return session;
  }

  private isSessionValid(session: Session): boolean {
    const now = new Date().getTime();
    const lastActivity = new Date(session.lastActivityTime).getTime();
    return (now - lastActivity) < this.SESSION_TIMEOUT;
  }

  private generateSessionId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private loadSession(): Session | null {
    const data = sessionStorage.getItem('analytics_session');
    return data ? JSON.parse(data) : null;
  }

  private saveSession(session: Session): void {
    sessionStorage.setItem('analytics_session', JSON.stringify(session));
  }

  private updateActivity(session: Session): void {
    session.lastActivityTime = new Date();
    session.pageViews++;
    this.saveSession(session);
  }
}

export const sessionManager = new SessionManager();
```

### Database Schema

```sql
CREATE TABLE visitor_sessions (
  id UUID PRIMARY KEY,
  visitor_id UUID,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  total_duration INTEGER,
  page_views_count INTEGER DEFAULT 0,
  is_bounce BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_start_time (start_time),
  INDEX idx_visitor_id (visitor_id)
);

CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  page_url TEXT NOT NULL,
  page_title VARCHAR(500),
  entry_time TIMESTAMP NOT NULL,
  exit_time TIMESTAMP,
  time_on_page INTEGER,
  scroll_depth INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (session_id) REFERENCES visitor_sessions(id),
  INDEX idx_session_id (session_id),
  INDEX idx_page_url (page_url(255)),
  INDEX idx_entry_time (entry_time)
);
```

---

## 4. Referring Website Addresses Collection

### Implementation Approach

#### Frontend Collection

```typescript
// services/analytics/referrerTracking.ts
export interface ReferrerInfo {
  referrerUrl: string;
  referrerDomain: string;
  referrerType: 'direct' | 'organic' | 'social' | 'referral' | 'paid' | 'email';
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
}

export const collectReferrerInfo = (): ReferrerInfo => {
  const referrer = document.referrer;
  const urlParams = new URLSearchParams(window.location.search);

  return {
    referrerUrl: referrer || 'direct',
    referrerDomain: extractDomain(referrer),
    referrerType: classifyReferrer(referrer, urlParams),
    utmSource: urlParams.get('utm_source'),
    utmMedium: urlParams.get('utm_medium'),
    utmCampaign: urlParams.get('utm_campaign'),
    utmContent: urlParams.get('utm_content'),
    utmTerm: urlParams.get('utm_term')
  };
};

function extractDomain(url: string): string {
  if (!url) return 'direct';

  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return 'unknown';
  }
}

function classifyReferrer(referrer: string, urlParams: URLSearchParams): ReferrerInfo['referrerType'] {
  // Check UTM parameters first
  const utmMedium = urlParams.get('utm_medium');
  if (utmMedium) {
    if (utmMedium === 'cpc' || utmMedium === 'ppc') return 'paid';
    if (utmMedium === 'email') return 'email';
    if (utmMedium === 'social') return 'social';
  }

  if (!referrer) return 'direct';

  const domain = extractDomain(referrer).toLowerCase();

  // Search engines
  const searchEngines = ['google', 'bing', 'yahoo', 'duckduckgo', 'baidu', 'yandex'];
  if (searchEngines.some(engine => domain.includes(engine))) {
    return 'organic';
  }

  // Social networks
  const socialNetworks = ['facebook', 'twitter', 'linkedin', 'instagram', 'pinterest', 'reddit', 'tiktok'];
  if (socialNetworks.some(network => domain.includes(network))) {
    return 'social';
  }

  return 'referral';
}
```

### Database Schema

```sql
CREATE TABLE visitor_referrers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  referrer_url TEXT,
  referrer_domain VARCHAR(255),
  referrer_type VARCHAR(20) NOT NULL,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_content VARCHAR(100),
  utm_term VARCHAR(100),
  landing_page TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (session_id) REFERENCES visitor_sessions(id),
  INDEX idx_referrer_type (referrer_type),
  INDEX idx_utm_source (utm_source),
  INDEX idx_utm_campaign (utm_campaign)
);
```

---

## 5. Cookies and Similar Tracking Technologies

### Implementation Approach

#### Cookie Management Service

```typescript
// services/analytics/cookieManager.ts
export interface CookieOptions {
  expires?: number; // days
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

export interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

class CookieManager {
  private readonly CONSENT_COOKIE = 'cookie_consent';
  private readonly VISITOR_ID_COOKIE = 'visitor_id';
  private readonly SESSION_COOKIE = 'session_id';

  // Set a cookie
  set(name: string, value: string, options: CookieOptions = {}): void {
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (options.expires) {
      const date = new Date();
      date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
      cookieString += `; expires=${date.toUTCString()}`;
    }

    cookieString += `; path=${options.path || '/'}`;

    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }

    if (options.secure) {
      cookieString += '; secure';
    }

    cookieString += `; samesite=${options.sameSite || 'Lax'}`;

    document.cookie = cookieString;
  }

  // Get a cookie value
  get(name: string): string | null {
    const matches = document.cookie.match(
      new RegExp(`(?:^|; )${name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1')}=([^;]*)`)
    );
    return matches ? decodeURIComponent(matches[1]) : null;
  }

  // Delete a cookie
  delete(name: string, options: CookieOptions = {}): void {
    this.set(name, '', { ...options, expires: -1 });
  }

  // Set visitor ID cookie (persistent)
  setVisitorId(visitorId: string): void {
    this.set(this.VISITOR_ID_COOKIE, visitorId, {
      expires: 365, // 1 year
      secure: true,
      sameSite: 'Lax'
    });
  }

  // Get or create visitor ID
  getOrCreateVisitorId(): string {
    let visitorId = this.get(this.VISITOR_ID_COOKIE);

    if (!visitorId) {
      visitorId = this.generateUUID();
      this.setVisitorId(visitorId);
    }

    return visitorId;
  }

  // Consent management
  setConsent(preferences: ConsentPreferences): void {
    this.set(this.CONSENT_COOKIE, JSON.stringify(preferences), {
      expires: 365,
      secure: true,
      sameSite: 'Lax'
    });
  }

  getConsent(): ConsentPreferences | null {
    const consent = this.get(this.CONSENT_COOKIE);
    return consent ? JSON.parse(consent) : null;
  }

  hasConsent(category: keyof ConsentPreferences): boolean {
    const consent = this.getConsent();
    return consent ? consent[category] : false;
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

export const cookieManager = new CookieManager();
```

#### Consent Banner Component

```typescript
// components/CookieConsentBanner.tsx
import React, { useState, useEffect } from 'react';
import { cookieManager, ConsentPreferences } from '../services/analytics/cookieManager';

const CookieConsentBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    personalization: false
  });

  useEffect(() => {
    const consent = cookieManager.getConsent();
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: ConsentPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true
    };
    cookieManager.setConsent(allAccepted);
    setShowBanner(false);
    initializeTracking(allAccepted);
  };

  const handleAcceptNecessary = () => {
    const necessaryOnly: ConsentPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false
    };
    cookieManager.setConsent(necessaryOnly);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    cookieManager.setConsent(preferences);
    setShowBanner(false);
    initializeTracking(preferences);
  };

  const initializeTracking = (prefs: ConsentPreferences) => {
    if (prefs.analytics) {
      // Initialize analytics tracking
      window.dispatchEvent(new CustomEvent('analyticsConsentGranted'));
    }
  };

  if (!showBanner) return null;

  return (
    <div className="cookie-consent-banner">
      <div className="banner-content">
        <h3>Cookie Settings</h3>
        <p>
          We use cookies to enhance your browsing experience, serve personalized
          content, and analyze our traffic. Please choose your preferences below.
        </p>

        {showSettings ? (
          <div className="cookie-settings">
            <label>
              <input type="checkbox" checked disabled />
              Necessary (Required)
            </label>
            <label>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) => setPreferences({
                  ...preferences,
                  analytics: e.target.checked
                })}
              />
              Analytics
            </label>
            <label>
              <input
                type="checkbox"
                checked={preferences.marketing}
                onChange={(e) => setPreferences({
                  ...preferences,
                  marketing: e.target.checked
                })}
              />
              Marketing
            </label>
            <label>
              <input
                type="checkbox"
                checked={preferences.personalization}
                onChange={(e) => setPreferences({
                  ...preferences,
                  personalization: e.target.checked
                })}
              />
              Personalization
            </label>
            <button onClick={handleSavePreferences}>Save Preferences</button>
          </div>
        ) : (
          <div className="banner-actions">
            <button onClick={handleAcceptAll}>Accept All</button>
            <button onClick={handleAcceptNecessary}>Necessary Only</button>
            <button onClick={() => setShowSettings(true)}>Customize</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieConsentBanner;
```

#### LocalStorage Tracking (Alternative to Cookies)

```typescript
// services/analytics/storageManager.ts
export class StorageManager {
  private readonly STORAGE_PREFIX = 'ha_analytics_';

  set(key: string, value: any): void {
    try {
      localStorage.setItem(
        this.STORAGE_PREFIX + key,
        JSON.stringify({ value, timestamp: Date.now() })
      );
    } catch (e) {
      console.warn('LocalStorage not available:', e);
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.STORAGE_PREFIX + key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      return parsed.value as T;
    } catch {
      return null;
    }
  }

  remove(key: string): void {
    localStorage.removeItem(this.STORAGE_PREFIX + key);
  }

  clear(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.STORAGE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  }
}

export const storageManager = new StorageManager();
```

### Database Schema

```sql
CREATE TABLE cookie_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID NOT NULL,
  necessary BOOLEAN DEFAULT TRUE,
  analytics BOOLEAN DEFAULT FALSE,
  marketing BOOLEAN DEFAULT FALSE,
  personalization BOOLEAN DEFAULT FALSE,
  consent_date TIMESTAMP NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_visitor_id (visitor_id),
  INDEX idx_consent_date (consent_date)
);

CREATE TABLE tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  visitor_id UUID,
  event_type VARCHAR(50) NOT NULL,
  event_name VARCHAR(100) NOT NULL,
  event_data JSONB,
  page_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (session_id) REFERENCES visitor_sessions(id),
  INDEX idx_event_type (event_type),
  INDEX idx_event_name (event_name),
  INDEX idx_created_at (created_at)
);
```

---

## Unified Analytics Service

### Main Analytics Service

```typescript
// services/analytics/analyticsService.ts
import { cookieManager } from './cookieManager';
import { sessionManager } from './sessionManager';
import { pageTracker } from './pageTracking';
import { collectBrowserInfo } from './browserInfo';
import { collectDeviceInfo } from './deviceInfo';
import { collectReferrerInfo } from './referrerTracking';

class AnalyticsService {
  private initialized = false;
  private consentGranted = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    // Check for consent
    const consent = cookieManager.getConsent();
    this.consentGranted = consent?.analytics || false;

    // Listen for consent changes
    window.addEventListener('analyticsConsentGranted', () => {
      this.consentGranted = true;
      this.startTracking();
    });

    if (this.consentGranted) {
      this.startTracking();
    }

    this.initialized = true;
  }

  private async startTracking(): Promise<void> {
    // Get or create session
    const session = sessionManager.getOrCreateSession();

    // Collect all visitor information
    const visitorData = {
      sessionId: session.id,
      visitorId: cookieManager.getOrCreateVisitorId(),
      browser: collectBrowserInfo(),
      device: collectDeviceInfo(),
      referrer: collectReferrerInfo(),
      timestamp: new Date().toISOString()
    };

    // Send initial data to server
    await this.sendToServer('/api/analytics/visitor', visitorData);

    // Initialize page tracking
    pageTracker.init(session.id);
  }

  // Track custom events
  trackEvent(eventName: string, eventData?: Record<string, any>): void {
    if (!this.consentGranted) return;

    const event = {
      sessionId: sessionManager.getOrCreateSession().id,
      eventName,
      eventData,
      pageUrl: window.location.href,
      timestamp: new Date().toISOString()
    };

    this.sendToServer('/api/analytics/event', event);
  }

  private async sendToServer(endpoint: string, data: any): Promise<void> {
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }
}

export const analyticsService = new AnalyticsService();
```

### React Integration Hook

```typescript
// hooks/useAnalytics.ts
import { useEffect } from 'react';
import { analyticsService } from '../services/analytics/analyticsService';

export const useAnalytics = () => {
  useEffect(() => {
    analyticsService.init();
  }, []);

  return {
    trackEvent: (name: string, data?: Record<string, any>) => {
      analyticsService.trackEvent(name, data);
    }
  };
};
```

---

## API Endpoints

### Backend Routes

```typescript
// routes/analytics.ts
import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';

const router = Router();
const controller = new AnalyticsController();

// Collect visitor information
router.post('/visitor', controller.recordVisitor);

// Record page view
router.post('/pageview', controller.recordPageView);

// Record custom event
router.post('/event', controller.recordEvent);

// Get analytics dashboard data
router.get('/dashboard', controller.getDashboardData);

export default router;
```

---

## Privacy and Compliance

### GDPR Compliance

1. **Consent Before Collection**: Never collect analytics data without explicit consent
2. **Right to Access**: Provide users ability to request their data
3. **Right to Deletion**: Allow users to delete their analytics data
4. **Data Minimization**: Only collect necessary data
5. **Purpose Limitation**: Use data only for stated purposes

### Data Retention Policy

| Data Type | Retention Period | Action After Expiry |
|-----------|------------------|---------------------|
| IP Addresses | 30 days | Anonymize |
| Session Data | 90 days | Archive/Delete |
| Page Views | 1 year | Aggregate |
| Event Data | 1 year | Aggregate |
| Consent Records | 3 years | Archive |

### Implementation Checklist

- [ ] Implement cookie consent banner
- [ ] Create privacy policy page
- [ ] Add data export functionality
- [ ] Implement data deletion API
- [ ] Set up automated data retention jobs
- [ ] Configure server-side anonymization
- [ ] Test consent flow across browsers
- [ ] Verify compliance with local regulations

---

## Deployment Considerations

### Environment Variables

```env
# Analytics Configuration
ANALYTICS_ENABLED=true
ANALYTICS_ENDPOINT=/api/analytics
SESSION_TIMEOUT_MINUTES=30
IP_ANONYMIZATION_ENABLED=true
DATA_RETENTION_DAYS=365

# Cookie Settings
COOKIE_DOMAIN=.yourdomain.com
COOKIE_SECURE=true
COOKIE_SAMESITE=Lax
```

### Performance Optimization

1. **Debounce scroll tracking** to reduce event frequency
2. **Use `sendBeacon`** for reliable delivery on page unload
3. **Batch events** to reduce API calls
4. **Implement client-side caching** for repeated data

### Monitoring

- Track analytics service availability
- Monitor data pipeline latency
- Alert on consent rate drops
- Review data quality regularly

---

## Next Steps

1. Review and approve implementation plan
2. Set up database tables and migrations
3. Implement backend API endpoints
4. Create frontend analytics service
5. Build cookie consent banner
6. Test across browsers and devices
7. Deploy to staging environment
8. Conduct privacy impact assessment
9. Deploy to production
