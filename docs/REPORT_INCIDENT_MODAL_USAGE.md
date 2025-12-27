# Report Incident Modal - Usage Guide

## Overview

The `ReportIncidentModal` component is **fully implemented** with smart beneficiary detection and auto-population. This guide shows you how to use it in your application.

## Features Implemented ✅

- ✅ **Smart Phone Lookup** - Auto-detects existing beneficiaries
- ✅ **Auto-Population** - Fills all fields when beneficiary is found
- ✅ **Visual Feedback** - Shows green checkmark for existing beneficiaries
- ✅ **Real-time Validation** - Validates as user types
- ✅ **Cascading Dropdowns** - Region → District → Village
- ✅ **Auto-Creation** - Creates new beneficiary if doesn't exist
- ✅ **Responsive Design** - Works on all screen sizes
- ✅ **Loading States** - Shows spinner during API calls
- ✅ **Error Handling** - User-friendly error messages

## Quick Start

### 1. Import the Modal

```tsx
import { ReportIncidentModal } from '@/components/features/incidents';
```

### 2. Add State Management

```tsx
'use client';

import { useState } from 'react';
import { ReportIncidentModal } from '@/components/features/incidents';
import { Button } from '@/components/ui/button';

export default function YourPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = (incident: any) => {
    console.log('Incident created:', incident);
    // Refresh your incidents list, show toast, etc.
  };

  return (
    <div>
      <Button onClick={() => setIsModalOpen(true)}>
        Report Incident
      </Button>

      <ReportIncidentModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `open` | `boolean` | Yes | Controls modal visibility |
| `onOpenChange` | `(open: boolean) => void` | Yes | Called when modal should open/close |
| `onSuccess` | `(incident: any) => void` | No | Called after successful incident creation |

## Usage Examples

### Example 1: Basic Usage

```tsx
import { useState } from 'react';
import { ReportIncidentModal } from '@/components/features/incidents';

function IncidentsPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Report New Incident
      </button>

      <ReportIncidentModal
        open={showModal}
        onOpenChange={setShowModal}
      />
    </>
  );
}
```

### Example 2: With Success Callback

```tsx
import { useState } from 'react';
import { toast } from 'sonner';
import { ReportIncidentModal } from '@/components/features/incidents';
import { useRouter } from 'next/navigation';

function IncidentsPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const handleIncidentCreated = (incident: any) => {
    toast.success(`Incident created: ${incident.name}`);

    // Refresh the page data
    router.refresh();

    // Or navigate to incident details
    // router.push(`/admin/incidents/${incident.id}`);
  };

  return (
    <ReportIncidentModal
      open={showModal}
      onOpenChange={setShowModal}
      onSuccess={handleIncidentCreated}
    />
  );
}
```

### Example 3: In a Navigation Menu

```tsx
import { useState } from 'react';
import { ReportIncidentModal } from '@/components/features/incidents';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

function NavigationBar() {
  const [showReportModal, setShowReportModal] = useState(false);

  return (
    <nav>
      {/* Your navigation items */}

      <Button
        onClick={() => setShowReportModal(true)}
        variant="default"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Report Incident
      </Button>

      <ReportIncidentModal
        open={showReportModal}
        onOpenChange={setShowReportModal}
        onSuccess={(incident) => {
          console.log('New incident:', incident);
          setShowReportModal(false);
        }}
      />
    </nav>
  );
}
```

### Example 4: With Query Invalidation (React Query)

```tsx
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ReportIncidentModal } from '@/components/features/incidents';
import { toast } from 'sonner';

function IncidentsList() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const handleSuccess = (incident: any) => {
    toast.success('Incident reported successfully');

    // Invalidate and refetch incidents list
    queryClient.invalidateQueries({ queryKey: ['incidents'] });

    setShowModal(false);
  };

  return (
    <div>
      <button onClick={() => setShowModal(true)}>
        Report Incident
      </button>

      <ReportIncidentModal
        open={showModal}
        onOpenChange={setShowModal}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
```

### Example 5: Keyboard Shortcut Trigger

```tsx
import { useState, useEffect } from 'react';
import { ReportIncidentModal } from '@/components/features/incidents';

function App() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + I to open report incident modal
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault();
        setShowModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div>
      <p>Press Ctrl+I (or Cmd+I) to report an incident</p>

      <ReportIncidentModal
        open={showModal}
        onOpenChange={setShowModal}
      />
    </div>
  );
}
```

## How It Works

### Step 1: User Opens Modal
Modal loads region and category data from the API.

### Step 2: User Enters Phone Number
```
User types: +255712345678
     ↓
Modal calls: GET /admin/beneficiaries/lookup?phone_number=+255712345678
     ↓
If found: Auto-fills all beneficiary fields ✅
If not found: Shows "New beneficiary will be created" ℹ️
```

### Step 3: User Completes Form
- Selects region → districts load
- Selects district → villages load
- Fills in incident details
- Reviews/edits beneficiary info

### Step 4: User Submits
```
Modal calls: POST /admin/incidents/create-with-beneficiary
     ↓
Backend checks phone number:
     ↓
If exists: Links to existing beneficiary
If new: Creates beneficiary + incident
     ↓
Returns: { incident, beneficiary, beneficiary_created }
     ↓
Modal shows success message
Calls onSuccess callback
Closes modal
```

## Visual States

### Loading Beneficiary
```
Phone Number: [+255712345678] 🔄
```

### Beneficiary Found
```
Phone Number: [+255712345678] ✓
✓ John Doe

[All fields auto-filled with green checkmark indicator]
```

### New Beneficiary
```
Phone Number: [+255712345678] ℹ️
New beneficiary will be created

[Empty fields ready for input]
```

## Validation Rules

| Field | Rule |
|-------|------|
| Incident Name | Min 5 characters |
| Description | Min 20 characters |
| Region | Required UUID |
| District | Required UUID |
| Village | Required UUID |
| Category | Required UUID |
| Phone Number | Min 10 characters |
| First Name | Min 2 characters |
| Last Name | Min 2 characters |
| Sex | Optional (male/female/other) |
| Age Group | Optional |
| PWD | Optional boolean |
| Photo Consent | Optional boolean |

## API Endpoints Used

1. **GET** `/admin/regions?limit=1000` - Load regions
2. **GET** `/admin/categories?limit=1000&type=incident` - Load categories
3. **GET** `/admin/districts?region_id={id}&limit=1000` - Load districts
4. **GET** `/admin/villages?district_id={id}&limit=1000` - Load villages
5. **GET** `/admin/beneficiaries/lookup?phone_number={phone}` - Check beneficiary
6. **POST** `/admin/incidents/create-with-beneficiary` - Create incident

## Customization

### Custom Success Handler

```tsx
<ReportIncidentModal
  open={open}
  onOpenChange={setOpen}
  onSuccess={(incident) => {
    // Custom success logic
    console.log('Incident ID:', incident.id);
    console.log('Reporter:', incident.beneficiary);

    // Show custom notification
    toast.success(`Incident #${incident.id.slice(0, 8)} created`);

    // Navigate
    router.push(`/incidents/${incident.id}`);
  }}
/>
```

### Pre-open Modal on Page Load

```tsx
function QuickReportPage() {
  const [open, setOpen] = useState(true); // Open by default

  return (
    <ReportIncidentModal
      open={open}
      onOpenChange={setOpen}
      onSuccess={(incident) => {
        // After success, redirect
        router.push('/incidents');
      }}
    />
  );
}
```

## Troubleshooting

### Modal doesn't open
- Check `open` prop is set to `true`
- Ensure component is rendered in the DOM

### Beneficiary lookup doesn't work
- Check API endpoint `/admin/beneficiaries/lookup` is accessible
- Verify phone number format (min 10 characters)
- Check network tab for API errors

### Form doesn't submit
- Check validation errors in form fields
- Verify all required fields are filled
- Check console for error messages

### Districts/Villages don't load
- Ensure region/district is selected first
- Check API endpoints are returning data
- Verify cascade logic is working

## Next Steps

1. ✅ Modal is ready to use
2. Import and add to your page
3. Add trigger button/link
4. Test with existing and new phone numbers
5. Customize success handler as needed

## Support

- API Documentation: See Swagger docs
- Component Source: `src/components/features/incidents/ReportIncidentModal.tsx`
- Integration Guide: `docs/UPDATE_EXISTING_INCIDENT_FORM.md`
