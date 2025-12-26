# TODO LIST - HakiArdhi Public Portal v1
**Timeline: November 28 - December 4, 2024**

---

## 📋 Overview
This document outlines the development tasks for the HakiArdhi Public Portal v1 implementation over a one-week sprint.

---

## 🎯 Week Goals 
- Extend existing Supabase database with public portal analytics schema
- Review and extend existing Next.js API routes for bilingual support
- Implement bilingual support (English/Swahili) in React frontend
- Enhance existing analytics service with visitor tracking and GDPR compliance
- Build React frontend and integrate with Next.js backend APIs []

---

## 📅 Daily Task Breakdown

### **Thursday, November 28, 2024** - Database Review & Public Portal Analytics Extension

#### Morning (9:00 AM - 12:00 PM)
- [ ] **Database Schema Review & Extension**
  - [ ] Review existing Supabase database schema (legal_aid_requests, analytics_events, etc.)
  - [ ] Review existing analytics service at `Backend/v1/src/lib/services/analytics.service.ts`
  - [ ] Create additional public portal visitor tracking schema (cookie_consents, visitor_sessions, page_views)
  - [ ] Create migration file for new public portal analytics tables
  - [ ] Run migration via Supabase dashboard or migration script
  - [ ] Set up indexes for performance optimization on new tables

#### Afternoon (1:00 PM - 5:00 PM)
- [ ] **Backend API - Review & Extend Existing Endpoints**
  - [ ] Review existing Next.js API routes at `Backend/v1/src/app/api/public/`
  - [ ] ✅ Verify `/api/public/homepage` endpoint (already exists)
  - [ ] ✅ Verify `/api/public/programs` endpoint (already exists)
  - [ ] ✅ Verify `/api/public/news` endpoint (already exists)
  - [ ] ✅ Verify `/api/public/blogs` endpoint (already exists)
  - [ ] Extend existing endpoints to support `language` query parameter
  - [ ] Create `/api/public/analytics/track` endpoint for visitor tracking
  - [ ] Test endpoints with Thunder Client

#### Evening
- [ ] **Documentation**
  - [ ] Document new analytics tracking endpoints
  - [ ] Create API integration guide for frontend team
  - [ ] Document language parameter usage in existing APIs

**Deliverables:**
- ✅ Public portal analytics schema added to Supabase
- ✅ Existing API endpoints reviewed and extended for bilingual support
- ✅ Analytics tracking endpoint created
- ✅ API documentation updated

---

### **Friday, November 29, 2024** - Analytics Enhancement & GDPR Compliance

#### Morning (9:00 AM - 12:00 PM)
- [ ] **Backend Analytics Enhancement**
  - [ ] Extend existing `AnalyticsService` at `Backend/v1/src/lib/services/analytics.service.ts`
  - [ ] Add visitor fingerprinting methods (device, browser, IP)
  - [ ] Integrate IP geolocation service (GeoIP or similar)
  - [ ] Add methods for page view tracking
  - [ ] Create Next.js middleware for automatic page view tracking

#### Afternoon (1:00 PM - 5:00 PM)
- [ ] **Cookie Consent & GDPR Compliance (Backend)**
  - [ ] Add `cookie_consents` table to Supabase (if not in migration)
  - [ ] Create `/api/public/consent/grant` endpoint
  - [ ] Create `/api/public/consent/revoke` endpoint
  - [ ] Create `/api/public/consent/status` endpoint
  - [ ] Implement data retention policy in analytics service
  - [ ] Enhance IP anonymization in analytics service (already has basic anonymization)

#### Evening
- [ ] **Frontend Analytics Integration (Initial Setup)**
  - [ ] Create `lib/services/analyticsService.ts` for frontend
  - [ ] Implement session tracking logic
  - [ ] Add scroll depth tracking utilities
  - [ ] Implement click event tracking utilities
  - [ ] Create hook for analytics: `useAnalytics()`

**Deliverables:**
- ✅ Backend analytics service enhanced with visitor tracking
- ✅ GDPR-compliant consent API endpoints created
- ✅ Frontend analytics utilities ready for integration

---

### **Saturday, November 30, 2024** - Bilingual Setup & Translation

#### Morning (9:00 AM - 12:00 PM)
- [ ] **i18n Framework Setup**
  - [ ] Install i18next and dependencies
  - [ ] Configure i18n with language detection
  - [ ] Create translation file structure (`public/locales/en/`, `public/locales/sw/`)
  - [ ] Set up location-based language detection (Tanzania → Swahili)

#### Afternoon (1:00 PM - 5:00 PM)
- [ ] **Translation Files - Phase 1**
  - [ ] Create English translation files:
    - [ ] `common.json` (app name, actions, status, messages)
    - [ ] `navigation.json` (menu items, footer links)
    - [ ] `forms.json` (labels, placeholders, validation)
    - [ ] `land.json` (land-specific terminology)
    - [ ] `auth.json` (login, register, password)
    - [ ] `errors.json` (error messages, http codes)

#### Evening
- [ ] **UI Components**
  - [ ] Build LanguageSwitcher component (toggle variant)
  - [ ] Create LanguageDetectionModal for first-time visitors
  - [ ] Implement language preference persistence

**Deliverables:**
- ✅ Bilingual infrastructure ready
- ✅ English translations complete
- ✅ Language switcher functional

---

### **Sunday, December 1, 2024** - Swahili Translation & Content

#### Morning (9:00 AM - 12:00 PM)
- [ ] **Swahili Translation - Phase 1**
  - [ ] Translate `common.json` to Swahili
  - [ ] Translate `navigation.json` to Swahili
  - [ ] Translate `forms.json` to Swahili
  - [ ] Review and quality check translations

#### Afternoon (1:00 PM - 5:00 PM)
- [ ] **Swahili Translation - Phase 2**
  - [ ] Translate `land.json` to Swahili
  - [ ] Translate `auth.json` to Swahili
  - [ ] Translate `errors.json` to Swahili
  - [ ] Create translation glossary document

#### Evening
- [ ] **Translation Testing**
  - [ ] Test all pages in both languages
  - [ ] Check for text overflow/truncation issues
  - [ ] Verify date/number formatting
  - [ ] Test language switching flow

**Deliverables:**
- ✅ Complete Swahili translations
- ✅ Translation quality verified
- ✅ No layout issues with longer text

---

### **Monday, December 2, 2024** - API Integration & Dynamic Content

#### Morning (9:00 AM - 12:00 PM)
- [ ] **Backend - Review & Extend Public APIs**
  - [ ] Review existing `/api/public/about` endpoint (if exists, extend; if not, create)
  - [ ] Review existing `/api/public/gallery` endpoint
  - [ ] Review existing `/api/public/knowledge-hub` endpoint
  - [ ] Review existing `/api/public/projects` endpoints
  - [ ] Review existing `/api/public/publications` endpoints
  - [ ] Ensure all endpoints properly support `language` query parameter (en/sw)
  - [ ] Create multilingual content structure in Supabase (if needed)

#### Afternoon (1:00 PM - 5:00 PM)
- [ ] **Frontend - API Client Setup**
  - [ ] Create API client service (`lib/api/client.ts`) pointing to `http://localhost:3001`
  - [ ] Create type-safe API functions (`lib/api/portal.ts`)
  - [ ] Set up React Query (`@tanstack/react-query`) for data fetching
  - [ ] Create custom hooks: `useHomepage()`, `usePrograms()`, `useNews()`, `useBlogs()`
  - [ ] Create types based on existing API response structures

#### Evening
- [ ] **Homepage Integration**
  - [ ] Replace static homepage data with API calls to `/api/public/homepage`
  - [ ] Implement loading states with skeleton loaders
  - [ ] Add error handling and retry logic
  - [ ] Test with real backend data from Supabase
  - [ ] Verify language switching updates API calls

**Deliverables:**
- ✅ All public API endpoints support bilingual content
- ✅ Frontend API client configured and type-safe
- ✅ Homepage consuming real data from Next.js backend

---

### **Tuesday, December 3, 2024** - Forms & Interactive Features

#### Morning (9:00 AM - 12:00 PM)
- [ ] **Review Existing Backend Forms Infrastructure**
  - [ ] ✅ Review existing legal aid schema at `Backend/v1/migrations/legal_aid_schema.sql`
  - [ ] ✅ Review existing `/api/admin/legal-aid` endpoint (adapt for public use)
  - [ ] Check for existing contact/newsletter tables in Supabase
  - [ ] Create missing tables (contact_submissions, newsletter_subscribers) if needed
  - [ ] Plan form validation schemas using Zod

#### Afternoon (1:00 PM - 5:00 PM)
- [ ] **Backend - Public Form Submission APIs**
  - [ ] Create `/api/public/forms/contact` endpoint (POST)
  - [ ] Adapt or create `/api/public/forms/legal-aid` endpoint (using existing schema)
  - [ ] Create `/api/public/forms/newsletter` endpoint (POST)
  - [ ] Implement Zod validation for all form endpoints
  - [ ] Add rate limiting to prevent spam submissions
  - [ ] Set up email notification service (SendGrid/AWS SES)

#### Evening
- [ ] **Frontend - Form Components**
  - [ ] Build ContactForm with React Hook Form + Zod validation
  - [ ] Build LegalAidRequestForm (matching existing backend schema)
  - [ ] Build NewsletterSubscriptionForm
  - [ ] Implement bilingual form labels and validation messages
  - [ ] Add form submission handlers with loading states
  - [ ] Add success/error toast notifications

**Deliverables:**
- ✅ Public form submission endpoints created in Next.js backend
- ✅ All forms functional with proper validation
- ✅ Form data being saved to Supabase
- ✅ Email notifications configured

---

### **Wednesday, December 4, 2024** - Testing, QA & Deployment

#### Morning (9:00 AM - 12:00 PM)
- [ ] **Quality Assurance**
  - [ ] Test all pages in both languages
  - [ ] Verify all forms work correctly
  - [ ] Check analytics data collection
  - [ ] Test cookie consent flow
  - [ ] Verify mobile responsiveness
  - [ ] Run accessibility checks (WCAG)

#### Afternoon (1:00 PM - 4:00 PM)
- [ ] **Performance Optimization**
  - [ ] Optimize Supabase queries (review indexes)
  - [ ] Add database indexes for slow queries in Supabase
  - [ ] Implement Next.js API response caching (Next.js cache or Vercel KV)
  - [ ] Optimize image loading (Next.js Image component)
  - [ ] Run Lighthouse performance audit

#### Late Afternoon (4:00 PM - 6:00 PM)
- [ ] **Vercel Deployment Preparation**
  - [ ] Review and test production build locally (`npm run build`)
  - [ ] Prepare environment variables for Vercel
  - [ ] Configure `vercel.json` for routing and settings
  - [ ] Set up Vercel project in dashboard
  - [ ] Configure custom domain (if applicable)

#### Evening
- [ ] **Deploy to Vercel & Documentation**
  - [ ] Deploy backend to Vercel (Next.js on port 3001 if needed)
  - [ ] Deploy frontend to Vercel
  - [ ] Configure environment variables in Vercel dashboard
  - [ ] Test production deployment
  - [ ] Update README with setup and deployment instructions
  - [ ] Document deployment process
  - [ ] Create user guide for content management

**Deliverables:**
- ✅ All features tested and working
- ✅ Performance optimized
- ✅ Successfully deployed to Vercel
- ✅ Documentation complete

---

## 🔧 Technical Stack

### Backend (Already Implemented)
- **Framework:** Next.js 15.5.4 (App Router with API Routes)
- **Database:** Supabase (PostgreSQL 14+)
- **Client:** @supabase/supabase-js ^2.39.0
- **Authentication:** Supabase Auth (bcryptjs for password hashing)
- **Analytics Service:** Custom analytics service (already implemented)
- **AI Integration:** OpenAI ^4.28.0
- **Validation:** Zod ^3.25.76

### Frontend (To Be Built)
- **Framework:** React 18 + TypeScript
- **Routing:** React Router v6
- **State Management:** React Query + Context API
- **UI Library:** Tailwind CSS
- **i18n:** i18next + react-i18next
- **Forms:** React Hook Form + Zod

### DevOps
- **Backend Hosting:** Vercel (Next.js backend runs on port 3001)
- **Database:** Supabase (managed PostgreSQL)
- **CI/CD:** GitHub Actions
- **Monitoring:** Custom analytics + Sentry
- **Email:** SendGrid / AWS SES

---

## 📊 Key Metrics to Track

### Development Progress
- [ ] Backend: Review existing Next.js API routes (25+ already exist)
- [ ] Backend: Create public portal analytics tables in Supabase
- [ ] Backend: Create consent & form submission endpoints (3-5 new endpoints)
- [ ] Frontend: Translation files completed: 0/12
- [ ] Frontend: UI components built: 0/15
- [ ] Frontend: API integration hooks created: 0/8

### Quality Metrics
- [ ] Code coverage: Target 80%+
- [ ] Lighthouse score: Target 90+
- [ ] Translation coverage: 100%
- [ ] WCAG compliance: Level AA
- [ ] Mobile responsiveness: All breakpoints

---

## ⚠️ Critical Priorities

### Must-Have for Launch
1. ✅ Public portal analytics schema added to Supabase
2. ✅ Visitor tracking and analytics collecting data
3. ✅ Both languages (EN/SW) working with i18next
4. ✅ Homepage displaying real data from Next.js backend
5. ✅ Contact form and legal aid request form functional
6. ✅ GDPR-compliant cookie consent system

### Nice-to-Have (Post-Launch)
- [ ] AI-powered chatbot
- [ ] Advanced search filters
- [ ] User accounts and dashboards
- [ ] Payment integration for donations
- [ ] Email marketing automation

---

## 🚨 Risks & Mitigation

| Risk | Impact | Mitigation Strategy |
|------|--------|---------------------|
| Supabase migration fails | High | Test migrations on staging/dev environment first |
| Translation quality issues | Medium | Hire professional Swahili translator |
| Next.js API performance slow | High | Use Next.js caching and Supabase indexes |
| Analytics not collecting data | Medium | Leverage existing analytics service, add monitoring |
| Frontend-backend integration issues | Medium | Backend already exists - review API contracts early |
| CORS issues between frontend and backend | Medium | Configure Next.js API CORS properly for port 3001 |

---

## 📞 Team Contacts

| Role | Name | Contact |
|------|------|---------|
| Backend Developer | [Name] | [Email/Phone] |
| Frontend Developer | [Name] | [Email/Phone] |
| Translator (Swahili) | [Name] | [Email/Phone] |
| QA Tester | [Name] | [Email/Phone] |
| Project Manager | [Name] | [Email/Phone] |

---

## 📝 Notes

### Important Considerations
- Backend runs on port 3001, frontend will run on separate port (3000)
- Ensure all forms have proper validation (React Hook Form + Zod client-side, Zod server-side)
- Test with real Tanzanian users for language detection
- Backup Supabase database before running any migrations
- Use environment variables for Supabase keys and API endpoints
- Implement rate limiting on public form submission endpoints
- Add CAPTCHA to prevent spam (hCaptcha or Google reCAPTCHA)
- Review existing Supabase Row Level Security (RLS) policies before creating new tables

### Performance Targets
- Page load time: < 2 seconds
- Time to interactive: < 3 seconds
- API response time: < 200ms
- Database query time: < 100ms

### Security Checklist
- [ ] SQL injection prevention (Supabase/Postgres parameterized queries)
- [ ] XSS protection (React auto-escaping + DOMPurify for rich content)
- [ ] CSRF protection on form submissions
- [ ] Rate limiting on public API endpoints (Next.js middleware)
- [ ] Input sanitization with Zod validation
- [ ] HTTPS enforced in production
- [ ] Secure headers configured (Next.js security headers)
- [ ] Supabase RLS policies properly configured

---

## ✅ Definition of Done

A task is complete when:
1. Code is written and tested
2. No console errors or warnings
3. Works in both languages (EN/SW)
4. Mobile responsive
5. Meets accessibility standards
6. Documented in code comments
7. Merged to main branch

---

---

## 📦 Existing Backend Infrastructure

### What Already Exists (Backend/v1)
✅ **Next.js 15.5.4** backend with App Router
✅ **Supabase** database connection configured
✅ **25+ API endpoints** in `/api/public/` including:
   - `/api/public/homepage` - Homepage data with language support
   - `/api/public/programs` - Programs/projects listing
   - `/api/public/news` - News articles
   - `/api/public/blogs` - Blog posts
   - `/api/public/gallery` - Gallery items
   - `/api/public/projects` - Projects with statistics
   - `/api/public/publications` - Publications listing
   - `/api/public/knowledge-hub` - Knowledge resources

✅ **Analytics Service** - `Backend/v1/src/lib/services/analytics.service.ts`
   - IP anonymization
   - Event tracking (view, download, share)
   - Geographic distribution
   - Engagement metrics

✅ **Database Tables** (Supabase):
   - `legal_aid_requests` - Legal aid case management
   - `analytics_events` - Analytics event tracking
   - `download_quality_stats` - Download statistics
   - `stage_history` - Case stage tracking
   - Plus 20+ other tables for projects, activities, beneficiaries, etc.

### What Needs to Be Built
🔨 **Frontend**: Complete React application for public portal
🔨 **Analytics Extension**: Public visitor tracking tables and consent management
🔨 **Form Endpoints**: Public-facing form submission APIs
🔨 **i18n Integration**: Bilingual support throughout frontend and backend responses

---

---

## 🚀 Vercel Deployment Guide

### Prerequisites
- [ ] Vercel account created (https://vercel.com)
- [ ] GitHub repository with code
- [ ] Supabase project set up with production database
- [ ] Environment variables documented

---

### Backend Deployment (Next.js Backend)

#### Step 1: Prepare Backend for Deployment
```bash
cd Backend/v1
npm run build
```

#### Step 2: Create vercel.json (if not exists)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "SUPABASE_URL": "@supabase-url",
    "SUPABASE_KEY": "@supabase-key",
    "SERVICE_ROLE": "@service-role-key",
    "OPENAI_API_KEY": "@openai-api-key"
  }
}
```

#### Step 3: Deploy Backend via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

#### Step 4: Set Environment Variables in Vercel Dashboard
Navigate to: Project Settings → Environment Variables

**Required Variables:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Supabase anon/public key
- `SERVICE_ROLE` - Supabase service role key (for admin operations)
- `OPENAI_API_KEY` - OpenAI API key (if using AI features)
- `NEXT_PUBLIC_API_URL` - Backend API URL (e.g., https://api.hakiardhi.org)

#### Step 5: Configure Custom Domain (Backend)
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add custom domain: `api.hakiardhi.org` or `backend.hakiardhi.org`
3. Update DNS records as instructed by Vercel
4. Wait for SSL certificate provisioning (automatic)

---

### Frontend Deployment (React Frontend)

#### Step 1: Prepare Frontend for Deployment
```bash
cd Frontend/Public_portal/v1
npm run build
```

#### Step 2: Create vercel.json for Frontend
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "dest": "/static/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_API_URL": "@api-url",
    "REACT_APP_SUPABASE_URL": "@supabase-url",
    "REACT_APP_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

#### Step 3: Deploy Frontend via Vercel
```bash
cd Frontend/Public_portal/v1
vercel --prod
```

#### Step 4: Set Frontend Environment Variables
Navigate to: Project Settings → Environment Variables

**Required Variables:**
- `REACT_APP_API_URL` - Backend API URL (e.g., https://api.hakiardhi.org)
- `REACT_APP_SUPABASE_URL` - Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY` - Supabase anonymous key
- `REACT_APP_ENVIRONMENT` - `production`

#### Step 5: Configure Custom Domain (Frontend)
1. Add domain: `www.hakiardhi.org` or `portal.hakiardhi.org`
2. Update DNS A/CNAME records
3. Verify SSL certificate

---

### Alternative: Deploy via GitHub Integration

#### Option 1: Automatic Deployment from GitHub

1. **Connect GitHub Repository**
   - Go to Vercel Dashboard → Add New Project
   - Import your GitHub repository
   - Select `Backend/v1` for backend deployment
   - Select `Frontend/Public_portal/v1` for frontend deployment

2. **Configure Build Settings**

   **For Backend (Next.js):**
   - Framework Preset: `Next.js`
   - Root Directory: `Backend/v1`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

   **For Frontend (React):**
   - Framework Preset: `Create React App`
   - Root Directory: `Frontend/Public_portal/v1`
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

3. **Set Environment Variables**
   - Add all required environment variables in project settings
   - Select environments: Production, Preview, Development

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy
   - Every push to `main` branch triggers auto-deployment

---

### Post-Deployment Configuration

#### 1. CORS Configuration
Update Next.js API routes to allow frontend domain:

```typescript
// Backend/v1/src/middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'https://portal.hakiardhi.org');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}
```

#### 2. Supabase Configuration
- Update Supabase dashboard → Authentication → URL Configuration
- Add Vercel frontend URL to allowed redirect URLs
- Configure CORS in Supabase if needed

#### 3. Test Deployment
```bash
# Test backend API
curl https://api.hakiardhi.org/api/public/homepage?language=english

# Test frontend
open https://portal.hakiardhi.org
```

#### 4. Monitor Deployment
- Vercel Dashboard → Analytics
- Check function logs for errors
- Monitor performance metrics
- Set up Vercel alerts for downtime

---

### CI/CD with GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Vercel CLI
        run: npm install -g vercel
      - name: Deploy Backend to Vercel
        run: |
          cd Backend/v1
          vercel --token=${{ secrets.VERCEL_TOKEN }} --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID_BACKEND }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Vercel CLI
        run: npm install -g vercel
      - name: Deploy Frontend to Vercel
        run: |
          cd Frontend/Public_portal/v1
          vercel --token=${{ secrets.VERCEL_TOKEN }} --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID_FRONTEND }}
```

---

### Troubleshooting Common Issues

| Issue | Solution |
|-------|----------|
| Build fails on Vercel | Check Node.js version in `package.json` engines field |
| API calls return 404 | Verify API URL environment variable is correct |
| CORS errors | Configure CORS headers in Next.js middleware |
| Environment variables not working | Redeploy after adding variables (don't just restart) |
| SSL certificate issues | Wait 24-48 hours for DNS propagation |
| Port conflicts | Remove port specifications in production URLs |

---

### Performance Optimization on Vercel

- [ ] Enable Vercel Edge Functions for API routes (faster globally)
- [ ] Use Vercel Image Optimization for images
- [ ] Enable Vercel Analytics for monitoring
- [ ] Set up Vercel KV for caching (Redis alternative)
- [ ] Configure ISR (Incremental Static Regeneration) for frequently updated pages

---

### Rollback Procedure

If deployment fails:

```bash
# List recent deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

Or via Vercel Dashboard:
1. Go to Deployments tab
2. Find previous successful deployment
3. Click "..." → Promote to Production

---

**Last Updated:** November 27, 2024
**Version:** 1.1 (Revised based on actual backend architecture)
**Status:** 🟡 In Progress
