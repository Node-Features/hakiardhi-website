# Bilingual Implementation Guide (English/Swahili)

This document provides a comprehensive implementation plan for adding bilingual support (English and Swahili) to the Hakiardhi Public Portal.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [i18n Framework Setup](#i18n-framework-setup)
4. [Translation Management](#translation-management)
5. [UI Components](#ui-components)
6. [Content Translation](#content-translation)
7. [API & Backend Support](#api--backend-support)
8. [Database Schema](#database-schema)
9. [SEO Considerations](#seo-considerations)
10. [Testing & Quality Assurance](#testing--quality-assurance)
11. [Translation Glossary](#translation-glossary)

---

## Overview

### Supported Languages

| Language | Code | Native Name | Direction |
|----------|------|-------------|-----------|
| English | `en` | English | LTR |
| Swahili | `sw` | Kiswahili | LTR |

### Implementation Goals

1. **Complete UI Translation** - All interface elements in both languages
2. **Dynamic Content Translation** - Database-driven content in both languages
3. **Location-Based Default Language** - Auto-detect language based on user's geographic location
4. **User Preference Persistence** - Remember language choice across sessions
5. **SEO Optimization** - Proper hreflang tags and localized URLs
6. **Accessible Switching** - Easy language toggle from any page
7. **Fallback Support** - Graceful fallback when translations missing

---

## Architecture

### Internationalization Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   React     │  │   i18next   │  │  Language   │          │
│  │ Components  │◄─┤  Provider   │◄─┤  Detector   │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│                   Translation Sources                        │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  Static JSON │  Backend API │  CMS Content │  Database      │
│  (UI Text)   │  (Dynamic)   │  (Articles)  │  (Records)     │
└──────────────┴──────────────┴──────────────┴────────────────┘
```

### File Structure

```
Frontend/Public_Portal/
├── public/
│   └── locales/
│       ├── en/
│       │   ├── common.json
│       │   ├── navigation.json
│       │   ├── forms.json
│       │   ├── errors.json
│       │   ├── land.json
│       │   └── auth.json
│       └── sw/
│           ├── common.json
│           ├── navigation.json
│           ├── forms.json
│           ├── errors.json
│           ├── land.json
│           └── auth.json
├── src/
│   ├── i18n/
│   │   ├── index.ts
│   │   ├── config.ts
│   │   ├── languageDetector.ts
│   │   └── resources.ts
│   ├── hooks/
│   │   └── useTranslation.ts
│   ├── components/
│   │   └── LanguageSwitcher/
│   │       ├── index.tsx
│   │       └── styles.css
│   └── contexts/
│       └── LanguageContext.tsx
```

---

## i18n Framework Setup

### 1. Install Dependencies

```bash
npm install i18next react-i18next i18next-http-backend i18next-browser-languagedetector
```

### 2. i18n Configuration

```typescript
// src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

export const supportedLanguages = ['en', 'sw'] as const;
export type SupportedLanguage = typeof supportedLanguages[number];

export const languageNames: Record<SupportedLanguage, string> = {
  en: 'English',
  sw: 'Kiswahili'
};

export const defaultLanguage: SupportedLanguage = 'en';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Supported languages
    supportedLngs: supportedLanguages,
    fallbackLng: defaultLanguage,

    // Namespaces
    ns: ['common', 'navigation', 'forms', 'errors', 'land', 'auth'],
    defaultNS: 'common',

    // Backend configuration
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    // Detection configuration
    detection: {
      order: ['localStorage', 'cookie', 'geolocation', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      lookupCookie: 'i18next',
      caches: ['localStorage', 'cookie'],
    },

    // React configuration
    react: {
      useSuspense: true,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p', 'span'],
    },

    // Interpolation
    interpolation: {
      escapeValue: false, // React already escapes
      formatSeparator: ',',
      format: (value, format, lng) => {
        if (format === 'uppercase') return value.toUpperCase();
        if (format === 'lowercase') return value.toLowerCase();
        if (value instanceof Date) {
          return new Intl.DateTimeFormat(lng).format(value);
        }
        if (typeof value === 'number') {
          return new Intl.NumberFormat(lng).format(value);
        }
        return value;
      },
    },

    // Debug (disable in production)
    debug: process.env.NODE_ENV === 'development',
  });

export default i18n;
```

### 3. Location-Based Language Detection

Automatically detect the user's location and set the default language accordingly. Users from Tanzania and East African countries default to Swahili.

#### Geolocation Detection Service

```typescript
// src/i18n/geolocationDetector.ts
import { SupportedLanguage } from './config';

interface GeoLocation {
  country: string;
  countryCode: string;
  region?: string;
  city?: string;
}

// Countries where Swahili is primary or widely spoken
const SWAHILI_COUNTRIES = [
  'TZ', // Tanzania
  'KE', // Kenya
  'UG', // Uganda
  'RW', // Rwanda
  'BI', // Burundi
  'CD', // Democratic Republic of Congo
  'MZ', // Mozambique (some regions)
];

// Countries where English is preferred
const ENGLISH_COUNTRIES = [
  'US', 'GB', 'CA', 'AU', 'NZ', 'IE', 'ZA', // Primary English
  'IN', 'PK', 'NG', 'GH', 'ZW', // English as official
];

export class GeolocationDetector {
  private static instance: GeolocationDetector;
  private cachedLocation: GeoLocation | null = null;

  static getInstance(): GeolocationDetector {
    if (!GeolocationDetector.instance) {
      GeolocationDetector.instance = new GeolocationDetector();
    }
    return GeolocationDetector.instance;
  }

  // Detect location using IP-based geolocation API
  async detectLocation(): Promise<GeoLocation | null> {
    // Return cached result if available
    if (this.cachedLocation) {
      return this.cachedLocation;
    }

    try {
      // Try multiple geolocation services for reliability
      const location = await this.tryGeolocationServices();

      if (location) {
        this.cachedLocation = location;
        // Cache in sessionStorage for performance
        sessionStorage.setItem('geo-location', JSON.stringify(location));
      }

      return location;
    } catch (error) {
      console.warn('Geolocation detection failed:', error);
      return null;
    }
  }

  private async tryGeolocationServices(): Promise<GeoLocation | null> {
    // Check sessionStorage first
    const cached = sessionStorage.getItem('geo-location');
    if (cached) {
      return JSON.parse(cached);
    }

    // Service 1: ip-api.com (free, no key required)
    try {
      const response = await fetch('http://ip-api.com/json/?fields=country,countryCode,region,city');
      if (response.ok) {
        const data = await response.json();
        return {
          country: data.country,
          countryCode: data.countryCode,
          region: data.region,
          city: data.city
        };
      }
    } catch (e) {
      // Try next service
    }

    // Service 2: ipapi.co (free tier available)
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        return {
          country: data.country_name,
          countryCode: data.country_code,
          region: data.region,
          city: data.city
        };
      }
    } catch (e) {
      // Try next service
    }

    // Service 3: Backend API (recommended for production)
    try {
      const response = await fetch('/api/geolocation');
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      // All services failed
    }

    return null;
  }

  // Get recommended language based on location
  async getRecommendedLanguage(): Promise<SupportedLanguage> {
    const location = await this.detectLocation();

    if (!location) {
      return 'en'; // Default to English if detection fails
    }

    // Check if country is in Swahili-speaking list
    if (SWAHILI_COUNTRIES.includes(location.countryCode)) {
      return 'sw';
    }

    // Default to English for other countries
    return 'en';
  }

  // Get location info for analytics
  getLocationInfo(): GeoLocation | null {
    return this.cachedLocation;
  }
}

export const geolocationDetector = GeolocationDetector.getInstance();
```

#### Custom i18next Language Detector Plugin

```typescript
// src/i18n/customDetector.ts
import { geolocationDetector } from './geolocationDetector';

const geolocationDetectorPlugin = {
  name: 'geolocation',

  async: true, // This detector is async

  detect: async (callback: (lng: string) => void) => {
    try {
      const language = await geolocationDetector.getRecommendedLanguage();
      callback(language);
    } catch (error) {
      callback('en'); // Fallback to English
    }
  },

  cacheUserLanguage: (lng: string) => {
    // Language will be cached by other detectors (localStorage, cookie)
  }
};

export default geolocationDetectorPlugin;
```

#### Updated i18n Configuration with Geolocation

```typescript
// src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import geolocationDetectorPlugin from './customDetector';

// Add custom geolocation detector
const languageDetector = new LanguageDetector();
languageDetector.addDetector(geolocationDetectorPlugin);

i18n
  .use(HttpBackend)
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: ['en', 'sw'],
    fallbackLng: 'en',

    detection: {
      // Priority order for language detection
      order: [
        'localStorage',      // 1. User's saved preference (highest priority)
        'cookie',            // 2. Cookie preference
        'geolocation',       // 3. Location-based detection
        'navigator',         // 4. Browser language
        'htmlTag',           // 5. HTML lang attribute
      ],

      // Cache user preference
      caches: ['localStorage', 'cookie'],

      // Cookie settings
      cookieMinutes: 43200, // 30 days
      cookieDomain: '.hakiardhi.or.tz',
    },

    // Other config...
  });
```

#### Backend Geolocation API

```typescript
// Backend: routes/geolocation.ts
import { Request, Response } from 'express';
import geoip from 'geoip-lite';

export const getGeolocation = (req: Request, res: Response) => {
  // Get client IP
  const ip = req.ip ||
             req.headers['x-forwarded-for'] ||
             req.connection.remoteAddress;

  // Handle localhost/development
  if (ip === '127.0.0.1' || ip === '::1') {
    return res.json({
      country: 'Tanzania',
      countryCode: 'TZ',
      region: 'Dar es Salaam',
      city: 'Dar es Salaam',
      isDevelopment: true
    });
  }

  // Lookup IP location
  const geo = geoip.lookup(ip as string);

  if (!geo) {
    return res.status(404).json({ error: 'Location not found' });
  }

  res.json({
    country: geo.country,
    countryCode: geo.country,
    region: geo.region,
    city: geo.city,
    timezone: geo.timezone,
    coordinates: geo.ll
  });
};
```

#### First Visit Language Detection Flow

```typescript
// src/hooks/useLanguageDetection.ts
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { geolocationDetector } from '../i18n/geolocationDetector';

interface DetectionResult {
  detectedLanguage: string;
  location: {
    country: string;
    countryCode: string;
  } | null;
  isFirstVisit: boolean;
}

export const useLanguageDetection = () => {
  const { i18n } = useTranslation();
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [showLanguagePrompt, setShowLanguagePrompt] = useState(false);

  useEffect(() => {
    const detectLanguage = async () => {
      // Check if user has already set a preference
      const hasPreference = localStorage.getItem('hakiardhi-lang');

      if (hasPreference) {
        setDetectionResult({
          detectedLanguage: hasPreference,
          location: geolocationDetector.getLocationInfo(),
          isFirstVisit: false
        });
        return;
      }

      // First visit - detect location
      const recommendedLang = await geolocationDetector.getRecommendedLanguage();
      const location = geolocationDetector.getLocationInfo();

      setDetectionResult({
        detectedLanguage: recommendedLang,
        location,
        isFirstVisit: true
      });

      // Set the detected language
      await i18n.changeLanguage(recommendedLang);

      // Show confirmation prompt for first-time visitors
      if (location && location.countryCode) {
        setShowLanguagePrompt(true);
      }
    };

    detectLanguage();
  }, [i18n]);

  const confirmLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('hakiardhi-lang', lang);
    setShowLanguagePrompt(false);
  };

  return {
    detectionResult,
    showLanguagePrompt,
    setShowLanguagePrompt,
    confirmLanguage
  };
};
```

#### Language Confirmation Modal Component

```typescript
// src/components/LanguageDetectionModal.tsx
import React from 'react';
import { useLanguageDetection } from '../hooks/useLanguageDetection';

export const LanguageDetectionModal: React.FC = () => {
  const {
    detectionResult,
    showLanguagePrompt,
    setShowLanguagePrompt,
    confirmLanguage
  } = useLanguageDetection();

  if (!showLanguagePrompt || !detectionResult) return null;

  const isSwahiliRegion = detectionResult.detectedLanguage === 'sw';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md mx-4">
        <div className="text-center">
          {/* Globe icon */}
          <div className="w-16 h-16 bg-hakiardhi-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-hakiardhi-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {isSwahiliRegion ? 'Chagua Lugha Yako' : 'Choose Your Language'}
          </h2>

          <p className="text-gray-600 mb-6">
            {isSwahiliRegion
              ? `Tumeona uko ${detectionResult.location?.country || 'Afrika Mashariki'}. Ungependa kutumia Kiswahili?`
              : `We detected you're in ${detectionResult.location?.country || 'your region'}. Would you prefer English?`
            }
          </p>

          <div className="space-y-3">
            {/* Primary language button (detected) */}
            <button
              onClick={() => confirmLanguage(detectionResult.detectedLanguage)}
              className="w-full py-3 px-4 bg-hakiardhi-red text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <span>{isSwahiliRegion ? '🇹🇿' : '🇬🇧'}</span>
              <span>{isSwahiliRegion ? 'Endelea na Kiswahili' : 'Continue in English'}</span>
            </button>

            {/* Secondary language button */}
            <button
              onClick={() => confirmLanguage(isSwahiliRegion ? 'en' : 'sw')}
              className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <span>{isSwahiliRegion ? '🇬🇧' : '🇹🇿'}</span>
              <span>{isSwahiliRegion ? 'Switch to English' : 'Badilisha kwa Kiswahili'}</span>
            </button>
          </div>

          {/* Dismiss option */}
          <button
            onClick={() => setShowLanguagePrompt(false)}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            {isSwahiliRegion ? 'Nitachagua baadaye' : "I'll choose later"}
          </button>
        </div>
      </div>
    </div>
  );
};
```

#### Detection Priority Matrix

| Priority | Source | Description | When Used |
|----------|--------|-------------|-----------|
| 1 | localStorage | User's explicit saved preference | Returning visitors |
| 2 | Cookie | Cross-subdomain preference | Logged in users |
| 3 | Geolocation | IP-based country detection | First visit |
| 4 | Navigator | Browser language setting | Fallback |
| 5 | HTML Tag | Default from server | Final fallback |

#### Country-Language Mapping

```typescript
// src/i18n/languageMapping.ts

export const countryLanguageMap: Record<string, string> = {
  // East African - Swahili
  'TZ': 'sw', // Tanzania
  'KE': 'sw', // Kenya
  'UG': 'sw', // Uganda
  'RW': 'sw', // Rwanda
  'BI': 'sw', // Burundi

  // All other countries - English
  'DEFAULT': 'en'
};

export const getLanguageForCountry = (countryCode: string): string => {
  return countryLanguageMap[countryCode] || countryLanguageMap['DEFAULT'];
};
```

#### Environment Configuration

```env
# .env.local

# Geolocation API (choose one)
NEXT_PUBLIC_GEOIP_SERVICE=ip-api
# NEXT_PUBLIC_GEOIP_SERVICE=ipapi
# NEXT_PUBLIC_GEOIP_SERVICE=maxmind

# MaxMind GeoIP (if using)
MAXMIND_LICENSE_KEY=your-license-key
MAXMIND_ACCOUNT_ID=your-account-id

# Default language for development
NEXT_PUBLIC_DEFAULT_DEV_LANGUAGE=sw

# Default country for development (Tanzania)
NEXT_PUBLIC_DEFAULT_DEV_COUNTRY=TZ
```

### 4. App Integration

```typescript
// src/index.tsx
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n/config';

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <Suspense fallback={<LoadingScreen />}>
      <App />
    </Suspense>
  </React.StrictMode>
);
```

---

## Translation Management

### 1. English Translations

```json
// public/locales/en/common.json
{
  "app": {
    "name": "Hakiardhi Public Portal",
    "tagline": "Land Rights Information System",
    "copyright": "© {{year}} Hakiardhi. All rights reserved."
  },
  "actions": {
    "submit": "Submit",
    "cancel": "Cancel",
    "save": "Save",
    "delete": "Delete",
    "edit": "Edit",
    "view": "View",
    "search": "Search",
    "filter": "Filter",
    "reset": "Reset",
    "back": "Back",
    "next": "Next",
    "previous": "Previous",
    "download": "Download",
    "upload": "Upload",
    "print": "Print",
    "share": "Share",
    "close": "Close",
    "confirm": "Confirm",
    "loading": "Loading...",
    "processing": "Processing..."
  },
  "status": {
    "active": "Active",
    "inactive": "Inactive",
    "pending": "Pending",
    "approved": "Approved",
    "rejected": "Rejected",
    "completed": "Completed",
    "in_progress": "In Progress"
  },
  "messages": {
    "success": "Operation completed successfully",
    "error": "An error occurred. Please try again.",
    "confirm_delete": "Are you sure you want to delete this item?",
    "no_results": "No results found",
    "loading_data": "Loading data..."
  },
  "time": {
    "today": "Today",
    "yesterday": "Yesterday",
    "this_week": "This Week",
    "this_month": "This Month",
    "this_year": "This Year"
  },
  "pagination": {
    "showing": "Showing {{from}} to {{to}} of {{total}} results",
    "per_page": "Per page",
    "page": "Page {{current}} of {{total}}"
  }
}
```

```json
// public/locales/en/navigation.json
{
  "main": {
    "home": "Home",
    "about": "About Us",
    "services": "Services",
    "resources": "Resources",
    "news": "News & Updates",
    "contact": "Contact Us",
    "faq": "FAQ",
    "help": "Help"
  },
  "services": {
    "land_search": "Land Search",
    "title_verification": "Title Verification",
    "boundary_disputes": "Boundary Disputes",
    "land_registration": "Land Registration",
    "property_valuation": "Property Valuation",
    "legal_assistance": "Legal Assistance"
  },
  "user": {
    "login": "Login",
    "register": "Register",
    "logout": "Logout",
    "profile": "My Profile",
    "dashboard": "Dashboard",
    "settings": "Settings",
    "notifications": "Notifications"
  },
  "footer": {
    "quick_links": "Quick Links",
    "legal": "Legal",
    "privacy_policy": "Privacy Policy",
    "terms_of_service": "Terms of Service",
    "cookie_policy": "Cookie Policy",
    "accessibility": "Accessibility",
    "sitemap": "Sitemap"
  },
  "breadcrumb": {
    "home": "Home"
  }
}
```

```json
// public/locales/en/forms.json
{
  "labels": {
    "first_name": "First Name",
    "last_name": "Last Name",
    "full_name": "Full Name",
    "email": "Email Address",
    "phone": "Phone Number",
    "password": "Password",
    "confirm_password": "Confirm Password",
    "address": "Address",
    "city": "City",
    "region": "Region",
    "district": "District",
    "ward": "Ward",
    "village": "Village",
    "postal_code": "Postal Code",
    "date_of_birth": "Date of Birth",
    "national_id": "National ID Number",
    "gender": "Gender",
    "occupation": "Occupation"
  },
  "placeholders": {
    "enter_email": "Enter your email address",
    "enter_password": "Enter your password",
    "enter_phone": "e.g., +255 XXX XXX XXX",
    "search": "Search...",
    "select_option": "Select an option"
  },
  "validation": {
    "required": "This field is required",
    "email_invalid": "Please enter a valid email address",
    "phone_invalid": "Please enter a valid phone number",
    "password_min": "Password must be at least {{min}} characters",
    "password_match": "Passwords do not match",
    "date_invalid": "Please enter a valid date",
    "number_invalid": "Please enter a valid number",
    "file_too_large": "File size must be less than {{size}}",
    "file_type_invalid": "Invalid file type. Allowed: {{types}}"
  },
  "gender_options": {
    "male": "Male",
    "female": "Female",
    "other": "Other",
    "prefer_not_to_say": "Prefer not to say"
  }
}
```

```json
// public/locales/en/land.json
{
  "titles": {
    "land_search": "Land Search",
    "search_results": "Search Results",
    "parcel_details": "Parcel Details",
    "ownership_history": "Ownership History",
    "title_information": "Title Information",
    "boundary_information": "Boundary Information"
  },
  "search": {
    "by_parcel_number": "Search by Parcel Number",
    "by_owner_name": "Search by Owner Name",
    "by_location": "Search by Location",
    "advanced_search": "Advanced Search",
    "enter_parcel_number": "Enter parcel number (e.g., 12345/678)",
    "enter_owner_name": "Enter owner's name",
    "select_region": "Select Region",
    "select_district": "Select District"
  },
  "parcel": {
    "parcel_number": "Parcel Number",
    "plot_number": "Plot Number",
    "block_number": "Block Number",
    "area": "Area",
    "area_unit": "Square Meters",
    "land_use": "Land Use",
    "land_type": "Land Type",
    "registration_date": "Registration Date",
    "last_updated": "Last Updated"
  },
  "ownership": {
    "current_owner": "Current Owner",
    "previous_owners": "Previous Owners",
    "ownership_type": "Ownership Type",
    "acquisition_date": "Acquisition Date",
    "acquisition_method": "Acquisition Method",
    "share_percentage": "Share Percentage"
  },
  "title": {
    "title_number": "Title Number",
    "title_type": "Title Type",
    "issue_date": "Issue Date",
    "expiry_date": "Expiry Date",
    "status": "Status",
    "encumbrances": "Encumbrances",
    "restrictions": "Restrictions"
  },
  "land_use_types": {
    "residential": "Residential",
    "commercial": "Commercial",
    "agricultural": "Agricultural",
    "industrial": "Industrial",
    "mixed_use": "Mixed Use",
    "public": "Public",
    "recreational": "Recreational"
  },
  "ownership_types": {
    "freehold": "Freehold",
    "leasehold": "Leasehold",
    "customary": "Customary",
    "government": "Government",
    "communal": "Communal"
  },
  "acquisition_methods": {
    "purchase": "Purchase",
    "inheritance": "Inheritance",
    "gift": "Gift",
    "government_grant": "Government Grant",
    "court_order": "Court Order"
  }
}
```

```json
// public/locales/en/auth.json
{
  "login": {
    "title": "Welcome Back",
    "subtitle": "Sign in to your account",
    "email_label": "Email Address",
    "password_label": "Password",
    "remember_me": "Remember me",
    "forgot_password": "Forgot password?",
    "submit": "Sign In",
    "no_account": "Don't have an account?",
    "register_link": "Register here"
  },
  "register": {
    "title": "Create Account",
    "subtitle": "Join Hakiardhi Public Portal",
    "personal_info": "Personal Information",
    "account_info": "Account Information",
    "terms_agreement": "I agree to the <terms>Terms of Service</terms> and <privacy>Privacy Policy</privacy>",
    "submit": "Create Account",
    "have_account": "Already have an account?",
    "login_link": "Sign in here"
  },
  "forgot_password": {
    "title": "Forgot Password",
    "subtitle": "Enter your email to receive reset instructions",
    "submit": "Send Reset Link",
    "back_to_login": "Back to login",
    "success_message": "If an account exists with this email, you will receive reset instructions."
  },
  "reset_password": {
    "title": "Reset Password",
    "subtitle": "Enter your new password",
    "new_password": "New Password",
    "confirm_password": "Confirm New Password",
    "submit": "Reset Password"
  },
  "verify_email": {
    "title": "Verify Your Email",
    "message": "We've sent a verification link to {{email}}",
    "resend": "Resend verification email",
    "check_spam": "Please check your spam folder if you don't see it."
  },
  "errors": {
    "invalid_credentials": "Invalid email or password",
    "account_locked": "Account is locked. Please contact support.",
    "email_not_verified": "Please verify your email before logging in",
    "session_expired": "Your session has expired. Please log in again.",
    "too_many_attempts": "Too many login attempts. Please try again later."
  }
}
```

```json
// public/locales/en/errors.json
{
  "http": {
    "400": "Bad Request",
    "401": "Unauthorized",
    "403": "Forbidden",
    "404": "Page Not Found",
    "500": "Internal Server Error",
    "502": "Bad Gateway",
    "503": "Service Unavailable"
  },
  "pages": {
    "not_found": {
      "title": "Page Not Found",
      "message": "The page you're looking for doesn't exist or has been moved.",
      "action": "Go to Homepage"
    },
    "server_error": {
      "title": "Server Error",
      "message": "Something went wrong on our end. Please try again later.",
      "action": "Try Again"
    },
    "maintenance": {
      "title": "Under Maintenance",
      "message": "We're currently performing maintenance. Please check back soon.",
      "estimated_time": "Estimated completion: {{time}}"
    }
  },
  "network": {
    "offline": "You appear to be offline. Please check your connection.",
    "timeout": "Request timed out. Please try again.",
    "connection_failed": "Failed to connect to server."
  }
}
```

### 2. Swahili Translations

```json
// public/locales/sw/common.json
{
  "app": {
    "name": "Portali ya Umma ya Hakiardhi",
    "tagline": "Mfumo wa Taarifa za Haki za Ardhi",
    "copyright": "© {{year}} Hakiardhi. Haki zote zimehifadhiwa."
  },
  "actions": {
    "submit": "Wasilisha",
    "cancel": "Ghairi",
    "save": "Hifadhi",
    "delete": "Futa",
    "edit": "Hariri",
    "view": "Tazama",
    "search": "Tafuta",
    "filter": "Chuja",
    "reset": "Weka upya",
    "back": "Rudi",
    "next": "Endelea",
    "previous": "Iliyopita",
    "download": "Pakua",
    "upload": "Pakia",
    "print": "Chapisha",
    "share": "Shiriki",
    "close": "Funga",
    "confirm": "Thibitisha",
    "loading": "Inapakia...",
    "processing": "Inachakata..."
  },
  "status": {
    "active": "Hai",
    "inactive": "Haifanyi kazi",
    "pending": "Inasubiri",
    "approved": "Imeidhinishwa",
    "rejected": "Imekataliwa",
    "completed": "Imekamilika",
    "in_progress": "Inaendelea"
  },
  "messages": {
    "success": "Operesheni imekamilika kwa mafanikio",
    "error": "Hitilafu imetokea. Tafadhali jaribu tena.",
    "confirm_delete": "Una uhakika unataka kufuta kipengee hiki?",
    "no_results": "Hakuna matokeo yaliyopatikana",
    "loading_data": "Inapakia data..."
  },
  "time": {
    "today": "Leo",
    "yesterday": "Jana",
    "this_week": "Wiki hii",
    "this_month": "Mwezi huu",
    "this_year": "Mwaka huu"
  },
  "pagination": {
    "showing": "Inaonyesha {{from}} hadi {{to}} kati ya matokeo {{total}}",
    "per_page": "Kwa ukurasa",
    "page": "Ukurasa {{current}} wa {{total}}"
  }
}
```

```json
// public/locales/sw/navigation.json
{
  "main": {
    "home": "Nyumbani",
    "about": "Kuhusu Sisi",
    "services": "Huduma",
    "resources": "Rasilimali",
    "news": "Habari na Masasisho",
    "contact": "Wasiliana Nasi",
    "faq": "Maswali Yanayoulizwa Mara kwa Mara",
    "help": "Msaada"
  },
  "services": {
    "land_search": "Utafutaji wa Ardhi",
    "title_verification": "Uthibitishaji wa Hati",
    "boundary_disputes": "Migogoro ya Mipaka",
    "land_registration": "Usajili wa Ardhi",
    "property_valuation": "Tathmini ya Mali",
    "legal_assistance": "Msaada wa Kisheria"
  },
  "user": {
    "login": "Ingia",
    "register": "Jisajili",
    "logout": "Toka",
    "profile": "Wasifu Wangu",
    "dashboard": "Dashibodi",
    "settings": "Mipangilio",
    "notifications": "Arifa"
  },
  "footer": {
    "quick_links": "Viungo vya Haraka",
    "legal": "Kisheria",
    "privacy_policy": "Sera ya Faragha",
    "terms_of_service": "Masharti ya Huduma",
    "cookie_policy": "Sera ya Vidakuzi",
    "accessibility": "Ufikivu",
    "sitemap": "Ramani ya Tovuti"
  },
  "breadcrumb": {
    "home": "Nyumbani"
  }
}
```

```json
// public/locales/sw/forms.json
{
  "labels": {
    "first_name": "Jina la Kwanza",
    "last_name": "Jina la Ukoo",
    "full_name": "Jina Kamili",
    "email": "Anwani ya Barua Pepe",
    "phone": "Nambari ya Simu",
    "password": "Neno la Siri",
    "confirm_password": "Thibitisha Neno la Siri",
    "address": "Anwani",
    "city": "Jiji",
    "region": "Mkoa",
    "district": "Wilaya",
    "ward": "Kata",
    "village": "Kijiji",
    "postal_code": "Nambari ya Posta",
    "date_of_birth": "Tarehe ya Kuzaliwa",
    "national_id": "Nambari ya Kitambulisho cha Taifa",
    "gender": "Jinsia",
    "occupation": "Kazi"
  },
  "placeholders": {
    "enter_email": "Ingiza anwani yako ya barua pepe",
    "enter_password": "Ingiza neno lako la siri",
    "enter_phone": "mfano, +255 XXX XXX XXX",
    "search": "Tafuta...",
    "select_option": "Chagua chaguo"
  },
  "validation": {
    "required": "Sehemu hii inahitajika",
    "email_invalid": "Tafadhali ingiza anwani sahihi ya barua pepe",
    "phone_invalid": "Tafadhali ingiza nambari sahihi ya simu",
    "password_min": "Neno la siri lazima liwe na angalau herufi {{min}}",
    "password_match": "Maneno ya siri hayalingani",
    "date_invalid": "Tafadhali ingiza tarehe sahihi",
    "number_invalid": "Tafadhali ingiza nambari sahihi",
    "file_too_large": "Ukubwa wa faili lazima uwe chini ya {{size}}",
    "file_type_invalid": "Aina ya faili si sahihi. Inaruhusiwa: {{types}}"
  },
  "gender_options": {
    "male": "Mwanaume",
    "female": "Mwanamke",
    "other": "Nyingine",
    "prefer_not_to_say": "Sipendelei kusema"
  }
}
```

```json
// public/locales/sw/land.json
{
  "titles": {
    "land_search": "Utafutaji wa Ardhi",
    "search_results": "Matokeo ya Utafutaji",
    "parcel_details": "Maelezo ya Kiwanja",
    "ownership_history": "Historia ya Umiliki",
    "title_information": "Taarifa za Hati",
    "boundary_information": "Taarifa za Mipaka"
  },
  "search": {
    "by_parcel_number": "Tafuta kwa Nambari ya Kiwanja",
    "by_owner_name": "Tafuta kwa Jina la Mmiliki",
    "by_location": "Tafuta kwa Eneo",
    "advanced_search": "Utafutaji wa Kina",
    "enter_parcel_number": "Ingiza nambari ya kiwanja (mfano, 12345/678)",
    "enter_owner_name": "Ingiza jina la mmiliki",
    "select_region": "Chagua Mkoa",
    "select_district": "Chagua Wilaya"
  },
  "parcel": {
    "parcel_number": "Nambari ya Kiwanja",
    "plot_number": "Nambari ya Ploti",
    "block_number": "Nambari ya Bloki",
    "area": "Eneo",
    "area_unit": "Mita za Mraba",
    "land_use": "Matumizi ya Ardhi",
    "land_type": "Aina ya Ardhi",
    "registration_date": "Tarehe ya Usajili",
    "last_updated": "Ilisasishwa Mwisho"
  },
  "ownership": {
    "current_owner": "Mmiliki wa Sasa",
    "previous_owners": "Wamiliki wa Awali",
    "ownership_type": "Aina ya Umiliki",
    "acquisition_date": "Tarehe ya Kupata",
    "acquisition_method": "Njia ya Kupata",
    "share_percentage": "Asilimia ya Sehemu"
  },
  "title": {
    "title_number": "Nambari ya Hati",
    "title_type": "Aina ya Hati",
    "issue_date": "Tarehe ya Kutolewa",
    "expiry_date": "Tarehe ya Kumalizika",
    "status": "Hali",
    "encumbrances": "Vikwazo",
    "restrictions": "Masharti"
  },
  "land_use_types": {
    "residential": "Makazi",
    "commercial": "Biashara",
    "agricultural": "Kilimo",
    "industrial": "Viwanda",
    "mixed_use": "Matumizi Mchanganyiko",
    "public": "Umma",
    "recreational": "Burudani"
  },
  "ownership_types": {
    "freehold": "Umiliki Kamili",
    "leasehold": "Upangaji",
    "customary": "Kimila",
    "government": "Serikali",
    "communal": "Jumuiya"
  },
  "acquisition_methods": {
    "purchase": "Ununuzi",
    "inheritance": "Urithi",
    "gift": "Zawadi",
    "government_grant": "Ruzuku ya Serikali",
    "court_order": "Amri ya Mahakama"
  }
}
```

```json
// public/locales/sw/auth.json
{
  "login": {
    "title": "Karibu Tena",
    "subtitle": "Ingia kwenye akaunti yako",
    "email_label": "Anwani ya Barua Pepe",
    "password_label": "Neno la Siri",
    "remember_me": "Nikumbuke",
    "forgot_password": "Umesahau neno la siri?",
    "submit": "Ingia",
    "no_account": "Huna akaunti?",
    "register_link": "Jisajili hapa"
  },
  "register": {
    "title": "Fungua Akaunti",
    "subtitle": "Jiunge na Portali ya Umma ya Hakiardhi",
    "personal_info": "Taarifa za Kibinafsi",
    "account_info": "Taarifa za Akaunti",
    "terms_agreement": "Ninakubaliana na <terms>Masharti ya Huduma</terms> na <privacy>Sera ya Faragha</privacy>",
    "submit": "Fungua Akaunti",
    "have_account": "Tayari una akaunti?",
    "login_link": "Ingia hapa"
  },
  "forgot_password": {
    "title": "Umesahau Neno la Siri",
    "subtitle": "Ingiza barua pepe yako kupokea maelekezo ya kuweka upya",
    "submit": "Tuma Kiungo cha Kuweka Upya",
    "back_to_login": "Rudi kwenye kuingia",
    "success_message": "Ikiwa akaunti ipo na barua pepe hii, utapokea maelekezo ya kuweka upya."
  },
  "reset_password": {
    "title": "Weka Upya Neno la Siri",
    "subtitle": "Ingiza neno lako jipya la siri",
    "new_password": "Neno Jipya la Siri",
    "confirm_password": "Thibitisha Neno Jipya la Siri",
    "submit": "Weka Upya Neno la Siri"
  },
  "verify_email": {
    "title": "Thibitisha Barua Pepe Yako",
    "message": "Tumetuma kiungo cha uthibitisho kwa {{email}}",
    "resend": "Tuma tena barua pepe ya uthibitisho",
    "check_spam": "Tafadhali angalia folda yako ya spam kama huioni."
  },
  "errors": {
    "invalid_credentials": "Barua pepe au neno la siri si sahihi",
    "account_locked": "Akaunti imefungwa. Tafadhali wasiliana na msaada.",
    "email_not_verified": "Tafadhali thibitisha barua pepe yako kabla ya kuingia",
    "session_expired": "Kikao chako kimekwisha. Tafadhali ingia tena.",
    "too_many_attempts": "Majaribio mengi ya kuingia. Tafadhali jaribu tena baadaye."
  }
}
```

```json
// public/locales/sw/errors.json
{
  "http": {
    "400": "Ombi Baya",
    "401": "Hujaidhinishwa",
    "403": "Imekatazwa",
    "404": "Ukurasa Haujapatikana",
    "500": "Hitilafu ya Seva ya Ndani",
    "502": "Lango Baya",
    "503": "Huduma Haipatikani"
  },
  "pages": {
    "not_found": {
      "title": "Ukurasa Haujapatikana",
      "message": "Ukurasa unaoutafuta haupo au umehamishwa.",
      "action": "Nenda Ukurasa wa Nyumbani"
    },
    "server_error": {
      "title": "Hitilafu ya Seva",
      "message": "Kitu kimeenda vibaya upande wetu. Tafadhali jaribu tena baadaye.",
      "action": "Jaribu Tena"
    },
    "maintenance": {
      "title": "Chini ya Matengenezo",
      "message": "Kwa sasa tunafanya matengenezo. Tafadhali rudi hivi karibuni.",
      "estimated_time": "Muda unaokadiriwa kukamilika: {{time}}"
    }
  },
  "network": {
    "offline": "Unaonekana huna mtandao. Tafadhali angalia muunganisho wako.",
    "timeout": "Ombi limechukua muda mrefu. Tafadhali jaribu tena.",
    "connection_failed": "Imeshindwa kuunganisha na seva."
  }
}
```

---

## UI Components

### 1. Language Switcher Component

```typescript
// src/components/LanguageSwitcher/index.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supportedLanguages, languageNames, SupportedLanguage } from '../../i18n/config';
import './styles.css';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'toggle' | 'flags';
  showLabel?: boolean;
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'dropdown',
  showLabel = true,
  className = ''
}) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = i18n.language as SupportedLanguage;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = async (lang: SupportedLanguage) => {
    await i18n.changeLanguage(lang);
    setIsOpen(false);

    // Update document lang attribute
    document.documentElement.lang = lang;

    // Track language change in analytics
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
  };

  // Toggle variant (simple switch)
  if (variant === 'toggle') {
    return (
      <div className={`language-switcher toggle ${className}`}>
        {supportedLanguages.map((lang) => (
          <button
            key={lang}
            onClick={() => changeLanguage(lang)}
            className={`toggle-btn ${currentLanguage === lang ? 'active' : ''}`}
            aria-pressed={currentLanguage === lang}
            aria-label={`Switch to ${languageNames[lang]}`}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  // Flags variant
  if (variant === 'flags') {
    return (
      <div className={`language-switcher flags ${className}`}>
        {supportedLanguages.map((lang) => (
          <button
            key={lang}
            onClick={() => changeLanguage(lang)}
            className={`flag-btn ${currentLanguage === lang ? 'active' : ''}`}
            aria-pressed={currentLanguage === lang}
            aria-label={`Switch to ${languageNames[lang]}`}
          >
            <img
              src={`/images/flags/${lang}.svg`}
              alt={languageNames[lang]}
              className="flag-icon"
            />
            {showLabel && <span>{languageNames[lang]}</span>}
          </button>
        ))}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={`language-switcher dropdown ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="dropdown-trigger"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="current-lang">
          {showLabel ? languageNames[currentLanguage] : currentLanguage.toUpperCase()}
        </span>
        <svg
          className={`chevron ${isOpen ? 'open' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" fill="none" />
        </svg>
      </button>

      {isOpen && (
        <ul className="dropdown-menu" role="listbox">
          {supportedLanguages.map((lang) => (
            <li key={lang} role="option" aria-selected={currentLanguage === lang}>
              <button
                onClick={() => changeLanguage(lang)}
                className={`dropdown-item ${currentLanguage === lang ? 'active' : ''}`}
              >
                {languageNames[lang]}
                {currentLanguage === lang && (
                  <svg className="check" width="16" height="16" viewBox="0 0 16 16">
                    <path d="M13.5 4.5l-7 7-3-3" stroke="currentColor" fill="none" />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;
```

```css
/* src/components/LanguageSwitcher/styles.css */
.language-switcher {
  position: relative;
  font-family: inherit;
}

/* Dropdown Variant */
.language-switcher.dropdown .dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  transition: all 0.2s ease;
}

.language-switcher.dropdown .dropdown-trigger:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.language-switcher.dropdown .chevron {
  transition: transform 0.2s ease;
}

.language-switcher.dropdown .chevron.open {
  transform: rotate(180deg);
}

.language-switcher.dropdown .dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 150px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  list-style: none;
  padding: 4px;
  margin: 0;
  z-index: 1000;
}

.language-switcher.dropdown .dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  text-align: left;
  transition: background 0.15s ease;
}

.language-switcher.dropdown .dropdown-item:hover {
  background: #f1f5f9;
}

.language-switcher.dropdown .dropdown-item.active {
  color: #2563eb;
  font-weight: 500;
}

/* Toggle Variant */
.language-switcher.toggle {
  display: flex;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}

.language-switcher.toggle .toggle-btn {
  padding: 8px 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  transition: all 0.2s ease;
}

.language-switcher.toggle .toggle-btn:not(:last-child) {
  border-right: 1px solid #e2e8f0;
}

.language-switcher.toggle .toggle-btn:hover {
  background: #f8fafc;
}

.language-switcher.toggle .toggle-btn.active {
  background: #2563eb;
  color: white;
}

/* Flags Variant */
.language-switcher.flags {
  display: flex;
  gap: 8px;
}

.language-switcher.flags .flag-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #64748b;
  transition: all 0.2s ease;
}

.language-switcher.flags .flag-btn:hover {
  background: #f8fafc;
}

.language-switcher.flags .flag-btn.active {
  border-color: #2563eb;
  color: #2563eb;
}

.language-switcher.flags .flag-icon {
  width: 20px;
  height: 15px;
  border-radius: 2px;
}
```

### 2. Translated Text Component

```typescript
// src/components/Trans/index.tsx
import React from 'react';
import { Trans as I18nTrans, useTranslation } from 'react-i18next';

interface TransProps {
  i18nKey: string;
  ns?: string;
  values?: Record<string, any>;
  components?: Record<string, React.ReactElement>;
  children?: React.ReactNode;
}

export const Trans: React.FC<TransProps> = ({
  i18nKey,
  ns,
  values,
  components,
  children
}) => {
  return (
    <I18nTrans
      i18nKey={i18nKey}
      ns={ns}
      values={values}
      components={components}
    >
      {children}
    </I18nTrans>
  );
};

// Helper component for formatted numbers
export const FormattedNumber: React.FC<{ value: number; style?: string }> = ({
  value,
  style = 'decimal'
}) => {
  const { i18n } = useTranslation();

  const formatted = new Intl.NumberFormat(i18n.language, {
    style: style as any,
    minimumFractionDigits: style === 'currency' ? 2 : 0
  }).format(value);

  return <>{formatted}</>;
};

// Helper component for formatted dates
export const FormattedDate: React.FC<{
  value: Date | string;
  format?: 'short' | 'medium' | 'long' | 'full';
}> = ({ value, format = 'medium' }) => {
  const { i18n } = useTranslation();

  const date = typeof value === 'string' ? new Date(value) : value;

  const options: Intl.DateTimeFormatOptions = {
    short: { month: 'numeric', day: 'numeric', year: '2-digit' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
  }[format];

  const formatted = new Intl.DateTimeFormat(i18n.language, options).format(date);

  return <>{formatted}</>;
};

export default Trans;
```

### 3. Usage in Components

```typescript
// Example: LandSearchPage.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormattedDate, FormattedNumber } from '../components/Trans';

export const LandSearchPage: React.FC = () => {
  const { t } = useTranslation(['land', 'common']);

  return (
    <div className="land-search-page">
      <h1>{t('land:titles.land_search')}</h1>

      <form className="search-form">
        <div className="form-group">
          <label>{t('land:search.by_parcel_number')}</label>
          <input
            type="text"
            placeholder={t('land:search.enter_parcel_number')}
          />
        </div>

        <div className="form-group">
          <label>{t('land:search.select_region')}</label>
          <select>
            <option value="">{t('common:actions.select_option')}</option>
            {/* Options */}
          </select>
        </div>

        <button type="submit">
          {t('common:actions.search')}
        </button>
      </form>

      {/* Results */}
      <div className="results">
        <h2>{t('land:titles.search_results')}</h2>

        <div className="parcel-card">
          <p>
            <strong>{t('land:parcel.parcel_number')}:</strong> 12345/678
          </p>
          <p>
            <strong>{t('land:parcel.area')}:</strong>{' '}
            <FormattedNumber value={500} /> {t('land:parcel.area_unit')}
          </p>
          <p>
            <strong>{t('land:parcel.registration_date')}:</strong>{' '}
            <FormattedDate value="2023-05-15" format="long" />
          </p>
        </div>
      </div>
    </div>
  );
};
```

---

## Content Translation

### 1. Database Schema for Multilingual Content

```sql
-- Translatable content table
CREATE TABLE content_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Content reference
    content_type VARCHAR(50) NOT NULL, -- page, article, faq, etc.
    content_id UUID NOT NULL,

    -- Language
    language_code VARCHAR(5) NOT NULL, -- en, sw

    -- Translated fields
    title VARCHAR(500),
    slug VARCHAR(500),
    summary TEXT,
    body TEXT,
    meta_title VARCHAR(200),
    meta_description VARCHAR(500),

    -- Status
    status VARCHAR(20) DEFAULT 'draft', -- draft, published, archived
    is_auto_translated BOOLEAN DEFAULT FALSE,

    -- Audit
    translated_by UUID,
    reviewed_by UUID,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT uq_content_translation UNIQUE (content_type, content_id, language_code)
);

-- Index for fast lookups
CREATE INDEX idx_content_translations_lookup
ON content_translations(content_type, content_id, language_code);
```

### 2. Content Service

```typescript
// services/contentService.ts
import { SupportedLanguage } from '../i18n/config';

interface TranslatedContent {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  body?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export class ContentService {
  async getContent(
    contentType: string,
    contentId: string,
    language: SupportedLanguage
  ): Promise<TranslatedContent | null> {
    const response = await fetch(
      `/api/content/${contentType}/${contentId}?lang=${language}`
    );

    if (!response.ok) {
      // Try fallback language
      if (language !== 'en') {
        return this.getContent(contentType, contentId, 'en');
      }
      return null;
    }

    return response.json();
  }

  async getContentList(
    contentType: string,
    language: SupportedLanguage,
    options?: {
      page?: number;
      limit?: number;
      category?: string;
    }
  ): Promise<{ items: TranslatedContent[]; total: number }> {
    const params = new URLSearchParams({
      lang: language,
      page: String(options?.page || 1),
      limit: String(options?.limit || 10),
      ...(options?.category && { category: options.category })
    });

    const response = await fetch(`/api/content/${contentType}?${params}`);
    return response.json();
  }
}

export const contentService = new ContentService();
```

### 3. Localized Content Hook

```typescript
// hooks/useLocalizedContent.ts
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { contentService } from '../services/contentService';
import { SupportedLanguage } from '../i18n/config';

export function useLocalizedContent<T>(
  contentType: string,
  contentId: string
) {
  const { i18n } = useTranslation();
  const [content, setContent] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await contentService.getContent(
          contentType,
          contentId,
          i18n.language as SupportedLanguage
        );
        setContent(data as T);
      } catch (err) {
        setError('Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [contentType, contentId, i18n.language]);

  return { content, loading, error };
}
```

---

## API & Backend Support

### 1. Language Middleware

```typescript
// middleware/language.ts
import { Request, Response, NextFunction } from 'express';

export const languageMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Get language from query, header, or cookie
  const lang =
    req.query.lang ||
    req.headers['accept-language']?.split(',')[0]?.split('-')[0] ||
    req.cookies?.i18next ||
    'en';

  // Validate language
  const supportedLangs = ['en', 'sw'];
  req.language = supportedLangs.includes(lang as string) ? lang : 'en';

  next();
};

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      language: string;
    }
  }
}
```

### 2. Localized API Responses

```typescript
// controllers/landController.ts
import { Request, Response } from 'express';

export const getParcelDetails = async (req: Request, res: Response) => {
  const { parcelId } = req.params;
  const { language } = req;

  // Get parcel with translations
  const parcel = await db.query(`
    SELECT
      p.*,
      pt.land_use_label,
      pt.ownership_type_label
    FROM parcels p
    LEFT JOIN parcel_translations pt
      ON p.id = pt.parcel_id AND pt.language_code = $2
    WHERE p.id = $1
  `, [parcelId, language]);

  if (!parcel) {
    return res.status(404).json({
      error: language === 'sw'
        ? 'Kiwanja hakijapatikana'
        : 'Parcel not found'
    });
  }

  res.json(parcel);
};
```

### 3. Error Messages

```typescript
// utils/errorMessages.ts
type ErrorKey =
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR';

const errorMessages: Record<ErrorKey, Record<string, string>> = {
  NOT_FOUND: {
    en: 'Resource not found',
    sw: 'Rasilimali haijapatikana'
  },
  UNAUTHORIZED: {
    en: 'You are not authorized to perform this action',
    sw: 'Hujaidhinishwa kufanya kitendo hiki'
  },
  VALIDATION_ERROR: {
    en: 'Please check your input and try again',
    sw: 'Tafadhali angalia ulichoingiza na jaribu tena'
  },
  SERVER_ERROR: {
    en: 'An unexpected error occurred',
    sw: 'Hitilafu isiyotarajiwa imetokea'
  }
};

export const getErrorMessage = (key: ErrorKey, lang: string = 'en'): string => {
  return errorMessages[key]?.[lang] || errorMessages[key]?.en || key;
};
```

---

## Database Schema

### Multilingual Reference Tables

```sql
-- Regions with translations
CREATE TABLE regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE region_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL,
    name VARCHAR(200) NOT NULL,
    CONSTRAINT uq_region_translation UNIQUE (region_id, language_code)
);

-- Districts with translations
CREATE TABLE districts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id UUID NOT NULL REFERENCES regions(id),
    code VARCHAR(10) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE district_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL,
    name VARCHAR(200) NOT NULL,
    CONSTRAINT uq_district_translation UNIQUE (district_id, language_code)
);

-- Land use types with translations
CREATE TABLE land_use_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE land_use_type_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    land_use_type_id UUID NOT NULL REFERENCES land_use_types(id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    CONSTRAINT uq_land_use_translation UNIQUE (land_use_type_id, language_code)
);

-- FAQ with translations
CREATE TABLE faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE faq_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faq_id UUID NOT NULL REFERENCES faqs(id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    CONSTRAINT uq_faq_translation UNIQUE (faq_id, language_code)
);
```

### Query Example

```sql
-- Get all regions with translations
SELECT
    r.id,
    r.code,
    rt.name
FROM regions r
JOIN region_translations rt ON r.id = rt.region_id
WHERE rt.language_code = $1
ORDER BY rt.name;

-- Get FAQ by category with translations
SELECT
    f.id,
    f.category,
    ft.question,
    ft.answer
FROM faqs f
JOIN faq_translations ft ON f.id = ft.faq_id
WHERE f.is_published = TRUE
  AND f.category = $1
  AND ft.language_code = $2
ORDER BY f.sort_order;
```

---

## SEO Considerations

### 1. HTML Language Attribute

```typescript
// Set document language on change
useEffect(() => {
  document.documentElement.lang = i18n.language;
}, [i18n.language]);
```

### 2. Hreflang Tags

```typescript
// components/SEO/LanguageAlternates.tsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { supportedLanguages } from '../../i18n/config';

export const LanguageAlternates: React.FC = () => {
  const location = useLocation();
  const baseUrl = 'https://portal.hakiardhi.or.tz';

  return (
    <Helmet>
      {supportedLanguages.map((lang) => (
        <link
          key={lang}
          rel="alternate"
          hrefLang={lang}
          href={`${baseUrl}/${lang}${location.pathname}`}
        />
      ))}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${baseUrl}/en${location.pathname}`}
      />
    </Helmet>
  );
};
```

### 3. Localized URLs

```typescript
// utils/localizedRoutes.ts
import { SupportedLanguage } from '../i18n/config';

export const getLocalizedPath = (
  path: string,
  lang: SupportedLanguage
): string => {
  return `/${lang}${path}`;
};

// Route configuration
const routes = {
  home: {
    en: '/',
    sw: '/'
  },
  landSearch: {
    en: '/land-search',
    sw: '/utafutaji-ardhi'
  },
  about: {
    en: '/about',
    sw: '/kuhusu'
  },
  contact: {
    en: '/contact',
    sw: '/wasiliana'
  },
  faq: {
    en: '/faq',
    sw: '/maswali'
  }
};

export const getLocalizedRoute = (
  routeKey: keyof typeof routes,
  lang: SupportedLanguage
): string => {
  return routes[routeKey][lang];
};
```

### 4. Meta Tags

```typescript
// components/SEO/PageMeta.tsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface PageMetaProps {
  titleKey: string;
  descriptionKey: string;
  ns?: string;
}

export const PageMeta: React.FC<PageMetaProps> = ({
  titleKey,
  descriptionKey,
  ns = 'common'
}) => {
  const { t, i18n } = useTranslation(ns);

  return (
    <Helmet>
      <html lang={i18n.language} />
      <title>{t(titleKey)} | Hakiardhi</title>
      <meta name="description" content={t(descriptionKey)} />
      <meta property="og:title" content={t(titleKey)} />
      <meta property="og:description" content={t(descriptionKey)} />
      <meta property="og:locale" content={i18n.language === 'sw' ? 'sw_TZ' : 'en_US'} />
    </Helmet>
  );
};
```

---

## Testing & Quality Assurance

### 1. Translation Coverage Test

```typescript
// tests/translations.test.ts
import en from '../public/locales/en/common.json';
import sw from '../public/locales/sw/common.json';

describe('Translation Coverage', () => {
  const getKeys = (obj: any, prefix = ''): string[] => {
    return Object.entries(obj).flatMap(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null) {
        return getKeys(value, fullKey);
      }
      return fullKey;
    });
  };

  it('should have all English keys in Swahili', () => {
    const enKeys = getKeys(en);
    const swKeys = getKeys(sw);

    const missingInSw = enKeys.filter(key => !swKeys.includes(key));

    expect(missingInSw).toHaveLength(0);
    if (missingInSw.length > 0) {
      console.log('Missing in Swahili:', missingInSw);
    }
  });

  it('should have all Swahili keys in English', () => {
    const enKeys = getKeys(en);
    const swKeys = getKeys(sw);

    const missingInEn = swKeys.filter(key => !enKeys.includes(key));

    expect(missingInEn).toHaveLength(0);
  });

  it('should not have empty translations', () => {
    const checkEmpty = (obj: any, lang: string, prefix = ''): string[] => {
      return Object.entries(obj).flatMap(([key, value]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null) {
          return checkEmpty(value, lang, fullKey);
        }
        if (value === '' || value === null) {
          return `${lang}:${fullKey}`;
        }
        return [];
      });
    };

    const emptyEn = checkEmpty(en, 'en');
    const emptySw = checkEmpty(sw, 'sw');

    expect([...emptyEn, ...emptySw]).toHaveLength(0);
  });
});
```

### 2. Visual Testing

```typescript
// tests/visual/languageSwitcher.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../src/i18n/config';
import { LanguageSwitcher } from '../../src/components/LanguageSwitcher';

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  it('should display current language', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    );

    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('should switch to Swahili', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    );

    fireEvent.click(screen.getByText('English'));
    fireEvent.click(screen.getByText('Kiswahili'));

    expect(i18n.language).toBe('sw');
  });
});
```

### 3. E2E Testing

```typescript
// cypress/e2e/bilingual.cy.ts
describe('Bilingual Support', () => {
  it('should switch language and persist preference', () => {
    cy.visit('/');

    // Default should be English
    cy.get('h1').should('contain', 'Hakiardhi Public Portal');

    // Switch to Swahili
    cy.get('[data-testid="language-switcher"]').click();
    cy.get('[data-testid="lang-sw"]').click();

    // Page should update
    cy.get('h1').should('contain', 'Portali ya Umma ya Hakiardhi');

    // Reload page - should remain in Swahili
    cy.reload();
    cy.get('h1').should('contain', 'Portali ya Umma ya Hakiardhi');
  });

  it('should display forms in selected language', () => {
    cy.visit('/sw/land-search');

    cy.get('label').first().should('contain', 'Nambari ya Kiwanja');
    cy.get('button[type="submit"]').should('contain', 'Tafuta');
  });
});
```

---

## Translation Glossary

### Land & Property Terms

| English | Swahili | Notes |
|---------|---------|-------|
| Land | Ardhi | |
| Parcel | Kiwanja | |
| Plot | Ploti | |
| Title Deed | Hati ya Ardhi | |
| Ownership | Umiliki | |
| Boundary | Mpaka | |
| Survey | Upimaji | |
| Registration | Usajili | |
| Valuation | Tathmini | |
| Encumbrance | Kikwazo | |
| Freehold | Umiliki Kamili | |
| Leasehold | Upangaji | |
| Customary | Kimila | |

### Legal Terms

| English | Swahili |
|---------|---------|
| Certificate | Cheti |
| Application | Maombi |
| Approval | Idhini |
| Dispute | Mgogoro |
| Litigation | Kesi |
| Agreement | Mkataba |
| Consent | Ridhaa |
| Witness | Shahidi |

### Administrative Terms

| English | Swahili |
|---------|---------|
| Region | Mkoa |
| District | Wilaya |
| Ward | Kata |
| Village | Kijiji |
| Municipality | Manispaa |
| City | Jiji |

### Common Actions

| English | Swahili |
|---------|---------|
| Submit | Wasilisha |
| Search | Tafuta |
| Download | Pakua |
| Upload | Pakia |
| Verify | Thibitisha |
| Cancel | Ghairi |
| Approve | Idhinisha |
| Reject | Kataa |

---

## Implementation Checklist

- [ ] Install i18next dependencies
- [ ] Configure i18n with language detection
- [ ] Create translation JSON files for all namespaces
- [ ] Build LanguageSwitcher component
- [ ] Implement content translation service
- [ ] Update database schema for translations
- [ ] Add language middleware to API
- [ ] Implement SEO meta tags
- [ ] Set up translation testing
- [ ] Create translation glossary
- [ ] Train content team on translation workflow
- [ ] QA all pages in both languages

---

## Next Steps

1. **Phase 1**: Core UI translation (2 weeks)
   - Navigation, buttons, labels, messages
   - LanguageSwitcher component
   - Persistence mechanism

2. **Phase 2**: Content translation (3 weeks)
   - Database schema updates
   - API endpoints for multilingual content
   - CMS integration

3. **Phase 3**: SEO & Polish (1 week)
   - Hreflang tags
   - Localized URLs
   - Meta tags

4. **Phase 4**: Testing & Launch (1 week)
   - Translation coverage tests
   - Visual regression tests
   - User acceptance testing
