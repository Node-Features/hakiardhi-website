# Case Details Page - Debug Guide

## Issue Investigation Summary

### Changes Made to Fix Loading Issue

#### 1. **Implemented Lazy Loading for Tab Components**

**File:** `src/app/(admin)/cases/[id]/page.tsx`

**Changes:**
```typescript
// Added lazy imports at top of file
import { lazy, Suspense } from 'react';

// Lazy load heavy components
const CaseStagesAccordion = lazy(() => import('@/components/features/cases/CaseStagesAccordion'));
const CaseFiles = lazy(() => import('@/components/features/cases/CaseFiles'));
const CaseNotes = lazy(() => import('@/components/features/cases/CaseNotes'));
```

**Benefits:**
- ✅ Overview tab loads immediately (not waiting for other tabs)
- ✅ Other tabs load only when clicked (on-demand)
- ✅ Reduces initial bundle size
- ✅ Improves page load performance

#### 2. **Added Suspense Wrappers with Loading States**

Each lazy-loaded component now has a Suspense wrapper:

```typescript
<Suspense fallback={
  <div className="flex items-center justify-center py-12">
    <LoadingSpinner size="lg" text="Loading case stages..." />
  </div>
}>
  <CaseStagesAccordion caseId={caseId} />
</Suspense>
```

**Loading Messages:**
- Case Stages: "Loading case stages..."
- Files: "Loading files..."
- Notes: "Loading notes..."

---

## Components Status

### ✅ Working Components (Loaded Immediately)
- **Overview Tab**
  - Case Information Card
  - Court Date Reminders (`CourtReminders.tsx`)
  - Case Notifications (`CaseNotifications.tsx`)

- **CaseForm** (in edit modal)

### 🔄 Lazy Loaded Components (Load on Demand)
- **Case Stages Tab**
  - CaseStagesAccordion

- **Files Tab**
  - CaseFiles

- **Notes Tab**
  - CaseNotes

---

## How to Debug

### Step 1: Check Browser Console
Open the case details page and check the browser console (F12) for:
1. **TypeScript/Import Errors**
   - Look for module not found errors
   - Check for export/import mismatches

2. **Runtime Errors**
   - Component rendering errors
   - API call failures
   - Null reference errors

### Step 2: Check Network Tab
1. Open DevTools → Network tab
2. Navigate to a case details page
3. Look for:
   - Failed API calls (404, 500 errors)
   - Slow-loading resources
   - Bundle chunk loading issues

### Step 3: Check React DevTools
1. Install React DevTools extension
2. Check component tree
3. Look for:
   - Suspended components
   - Error boundaries triggered
   - Props passing correctly

### Step 4: Verify Component Exports

All components should have default exports:
```bash
# Check exports (run in terminal)
grep -r "export default" src/components/features/cases/
```

**Expected Results:**
```
CaseForm.tsx:        export default function CaseForm
CaseStagesAccordion.tsx: export default function CaseStagesAccordion
CaseFiles.tsx:       export default function CaseFiles
CaseNotes.tsx:       export default function CaseNotes
CourtReminders.tsx:  export default function CourtReminders
CaseNotifications.tsx: export default function CaseNotifications
```

---

## Common Issues & Solutions

### Issue 1: "Cannot find module" Error

**Symptom:** Import errors in console

**Solution:**
```typescript
// Make sure all lazy imports use correct paths
const CaseStagesAccordion = lazy(() =>
  import('@/components/features/cases/CaseStagesAccordion')
);
```

### Issue 2: Blank Page / White Screen

**Symptom:** Page loads but shows nothing

**Possible Causes:**
1. **Missing default export**
   - Check component has `export default`

2. **Suspense fallback error**
   - Check LoadingSpinner component exists

3. **API call failure**
   - Check `casesService.getById(caseId)` returns data
   - Check network tab for failed requests

**Debug Steps:**
```typescript
// Add console logs
console.log('Case ID:', caseId);
console.log('Case Data:', caseData);
console.log('Loading:', isLoading);
console.log('Error:', error);
```

### Issue 3: Tab Switching Not Working

**Symptom:** Clicking tabs doesn't change content

**Solution:**
- Check Tabs component is working
- Verify activeTab state updates
- Check tab IDs match

### Issue 4: Lazy Components Not Loading

**Symptom:** Spinner shows forever

**Possible Causes:**
1. **Component import path wrong**
2. **Component has runtime error**
3. **Suspense boundary not catching**

**Solution:**
```typescript
// Test direct import first
import CaseStagesAccordion from '@/components/features/cases/CaseStagesAccordion';

// If works, then convert to lazy
const CaseStagesAccordion = lazy(() => import('@/components/features/cases/CaseStagesAccordion'));
```

---

## Server Configuration

### Current Setup
- **Frontend (Next.js):** Port 3000
- **Backend (API):** Port 3001

### Environment Variables to Check

**File:** `.env.local` or `.env`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Make sure API calls are pointing to correct backend URL.

---

## Test Checklist

### ✅ Quick Test Procedure

1. **Navigate to cases list**
   - URL: `http://localhost:3000/cases`
   - Should load without errors

2. **Click on any case**
   - URL: `http://localhost:3000/cases/[id]`
   - Overview tab should load immediately
   - Should see: Case Information, Court Reminders, Notifications

3. **Click "Case Stages" tab**
   - Should show loading spinner briefly
   - Then load CaseStagesAccordion

4. **Click "Files" tab**
   - Should show loading spinner
   - Then load CaseFiles

5. **Click "Notes" tab**
   - Should show loading spinner
   - Then load CaseNotes

6. **Click "Edit Case" button**
   - Modal should open
   - CaseForm should render with data

### Expected Performance

- **Initial load:** < 2 seconds
- **Tab switching:** < 500ms
- **No blank screens**
- **No console errors**

---

## Browser Console Commands

Run these in browser console to debug:

```javascript
// Check if case data loaded
console.log('Case Data:', window.__NEXT_DATA__);

// Force reload
location.reload();

// Check React version
console.log('React:', React.version);

// Check if Suspense is supported
console.log('Suspense:', typeof React.Suspense);
```

---

## Next.js Specific Checks

### 1. Check Build
```bash
# Clean build
rm -rf .next
npm run build

# If build succeeds, the code is valid
# If build fails, check error messages
```

### 2. Check TypeScript
```bash
# Type check
npm run type-check

# Or
npx tsc --noEmit
```

### 3. Check Linting
```bash
# Lint check
npm run lint
```

---

## File Structure Verification

Make sure these files exist:

```
src/
├── app/
│   └── (admin)/
│       └── cases/
│           ├── page.tsx              ✅ Cases list
│           └── [id]/
│               └── page.tsx          ✅ Case details (UPDATED)
├── components/
│   └── features/
│       └── cases/
│           ├── CaseForm.tsx          ✅ (UPDATED with sections)
│           ├── CaseStagesAccordion.tsx ✅ (Lazy loaded)
│           ├── CaseFiles.tsx         ✅ (Lazy loaded)
│           ├── CaseNotes.tsx         ✅ (Lazy loaded)
│           ├── CourtReminders.tsx    ✅ (Direct import)
│           └── CaseNotifications.tsx ✅ (Direct import)
```

---

## API Endpoints to Test

### 1. Get Case By ID
```bash
curl http://localhost:3001/api/cases/{case-id}
```

**Expected Response:**
```json
{
  "data": {
    "id": "...",
    "title": "...",
    "reference_number": "...",
    "submitted_by": "...",
    "assigned_to": "...",
    "category_id": "...",
    "description": "...",
    "status": "Open",
    "created_at": "...",
    "updated_at": "..."
  }
}
```

### 2. Get Case Stages
```bash
curl http://localhost:3001/api/cases/{case-id}/stages
```

### 3. Get Case Files
```bash
curl http://localhost:3001/api/cases/{case-id}/files
```

### 4. Get Case Notes
```bash
curl http://localhost:3001/api/cases/{case-id}/notes
```

---

## If Still Not Loading

### Emergency Rollback

If the page still doesn't load, you can temporarily rollback the lazy loading:

**File:** `src/app/(admin)/cases/[id]/page.tsx`

```typescript
// REMOVE these lines:
import { lazy, Suspense } from 'react';
const CaseStagesAccordion = lazy(() => import('...'));
const CaseFiles = lazy(() => import('...'));
const CaseNotes = lazy(() => import('...'));

// ADD these lines back:
import CaseStagesAccordion from '@/components/features/cases/CaseStagesAccordion';
import CaseFiles from '@/components/features/cases/CaseFiles';
import CaseNotes from '@/components/features/cases/CaseNotes';

// REMOVE Suspense wrappers in tab content
// Just use: <CaseStagesAccordion caseId={caseId} />
```

---

## Contact Points for Debugging

### Files Modified in This Session
1. ✅ `src/components/features/cases/CaseForm.tsx` - Added visual sections
2. ✅ `src/app/(admin)/cases/[id]/page.tsx` - Added lazy loading, integrated new components
3. ✅ `src/components/features/cases/CourtReminders.tsx` - Already existed
4. ✅ `src/components/features/cases/CaseNotifications.tsx` - Already existed

### Files NOT Modified (Should work as before)
- ❌ `CaseStagesAccordion.tsx`
- ❌ `CaseFiles.tsx`
- ❌ `CaseNotes.tsx`

---

## Summary

**What Changed:**
- ✅ Lazy loading for 3 tab components (Stages, Files, Notes)
- ✅ Overview tab loads immediately with Court Reminders and Notifications
- ✅ Suspense fallbacks with loading spinners
- ✅ CaseForm enhanced with visual sections

**Expected Result:**
- ⚡ Faster initial page load
- ⚡ Smoother user experience
- ⚡ Better performance on slow connections

**How to Verify It Works:**
1. Navigate to any case details page
2. Overview tab should load immediately
3. Other tabs should load when clicked
4. No errors in console
5. All features functional

---

**Last Updated:** December 9, 2025
**Status:** Awaiting user testing at `http://localhost:3000/cases/[id]`
