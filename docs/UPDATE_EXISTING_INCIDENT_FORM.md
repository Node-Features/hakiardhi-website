# Update Existing Incident Form - Integration Guide

## Overview
This guide shows how to update your **existing** incident form to use the new beneficiary lookup and auto-creation APIs.

## Backend APIs Ready ✅

1. **GET** `/admin/beneficiaries/lookup?phone_number={phone}` - Check if beneficiary exists
2. **POST** `/admin/incidents/create-with-beneficiary` - Create incident with auto beneficiary handling

## Step-by-Step Integration

### Step 1: Update Form Schema

Replace the `reported_by` field with nested beneficiary fields:

```typescript
// BEFORE
const formSchema = z.object({
  name: z.string().min(5),
  description: z.string().min(20),
  region_id: z.string().uuid(),
  district_id: z.string().uuid(),
  village_id: z.string().uuid(),
  category_id: z.string().uuid(),
  reported_by: z.string().uuid(), // ❌ Remove this
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
});

// AFTER
const formSchema = z.object({
  name: z.string().min(5),
  description: z.string().min(20),
  region_id: z.string().uuid(),
  district_id: z.string().uuid(),
  village_id: z.string().uuid(),
  category_id: z.string().uuid(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),

  // ✅ Add nested beneficiary object
  beneficiary: z.object({
    phone_number: z.string().min(10),
    first_name: z.string().min(2),
    last_name: z.string().min(2),
    sex: z.enum(['male', 'female', 'other']).optional(),
    age_group: z.string().optional(),
    is_pwd: z.boolean().default(false),
    photo_consent: z.boolean().default(false),
  }),
});
```

### Step 2: Add Beneficiary Lookup State

Add these state variables to your component:

```typescript
const [isLoadingBeneficiary, setIsLoadingBeneficiary] = useState(false);
const [beneficiaryExists, setBeneficiaryExists] = useState(false);
const [beneficiaryData, setBeneficiaryData] = useState<any>(null);
```

### Step 3: Add Lookup Function

Add this function to handle phone number lookup:

```typescript
const lookupBeneficiary = async (phoneNumber: string) => {
  if (phoneNumber.length < 10) return;

  setIsLoadingBeneficiary(true);
  try {
    const response = await apiWithAuth.get(
      `/admin/beneficiaries/lookup?phone_number=${encodeURIComponent(phoneNumber)}`
    );

    if (response.data.exists && response.data.data) {
      // Beneficiary found - auto-populate
      setBeneficiaryExists(true);
      setBeneficiaryData(response.data.data);

      // Auto-fill form fields
      form.setValue("beneficiary.first_name", response.data.data.first_name);
      form.setValue("beneficiary.last_name", response.data.data.last_name);
      if (response.data.data.sex) {
        form.setValue("beneficiary.sex", response.data.data.sex);
      }
      if (response.data.data.age_group) {
        form.setValue("beneficiary.age_group", response.data.data.age_group);
      }
      form.setValue("beneficiary.is_pwd", response.data.data.is_pwd || false);
      form.setValue("beneficiary.photo_consent", response.data.data.photo_consent || false);

      toast.success(`Beneficiary found: ${response.data.data.first_name} ${response.data.data.last_name}`);
    } else {
      // Not found
      setBeneficiaryExists(false);
      setBeneficiaryData(null);
      toast.info("New beneficiary will be created");
    }
  } catch (error) {
    console.error("Error looking up beneficiary:", error);
    setBeneficiaryExists(false);
    setBeneficiaryData(null);
  } finally {
    setIsLoadingBeneficiary(false);
  }
};
```

### Step 4: Replace "Reported By" Dropdown

Find and **replace** the "Reported By" dropdown section with this beneficiary form section:

```tsx
{/* REMOVE THIS - Old Dropdown */}
{/*
<FormField
  control={form.control}
  name="reported_by"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Reported By *</FormLabel>
      <Select onValueChange={field.onChange} value={field.value}>
        <SelectTrigger>
          <SelectValue placeholder="Select reporter" />
        </SelectTrigger>
        <SelectContent>
          {users.map(...)}
        </SelectContent>
      </Select>
    </FormItem>
  )}
/>
*/}

{/* ✅ ADD THIS - New Beneficiary Section */}
<div className="space-y-4 border rounded-lg p-4 bg-slate-50">
  <div className="flex items-center justify-between">
    <h3 className="text-lg font-semibold">Reporter Details</h3>
    {beneficiaryExists && (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle2 className="h-4 w-4" />
        <span className="text-xs font-medium">Existing Beneficiary</span>
      </div>
    )}
  </div>

  {/* Phone Number with Auto-lookup */}
  <FormField
    control={form.control}
    name="beneficiary.phone_number"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Phone Number *</FormLabel>
        <FormControl>
          <div className="relative">
            <Input
              {...field}
              placeholder="+255712345678"
              onBlur={async (e) => await lookupBeneficiary(e.target.value)}
            />
            {isLoadingBeneficiary && (
              <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
            )}
          </div>
        </FormControl>
        {beneficiaryExists && beneficiaryData && (
          <FormDescription className="text-green-600 text-xs">
            ✓ {beneficiaryData.first_name} {beneficiaryData.last_name}
          </FormDescription>
        )}
        <FormMessage />
      </FormItem>
    )}
  />

  {/* Name Fields */}
  <div className="grid grid-cols-2 gap-4">
    <FormField
      control={form.control}
      name="beneficiary.first_name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>First Name *</FormLabel>
          <FormControl>
            <Input {...field} placeholder="John" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={form.control}
      name="beneficiary.last_name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Last Name *</FormLabel>
          <FormControl>
            <Input {...field} placeholder="Doe" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>

  {/* Sex & Age Group */}
  <div className="grid grid-cols-2 gap-4">
    <FormField
      control={form.control}
      name="beneficiary.sex"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Sex</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={form.control}
      name="beneficiary.age_group"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Age Group</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="0-17">0-17 (Child)</SelectItem>
              <SelectItem value="18-35">18-35 (Youth)</SelectItem>
              <SelectItem value="36-59">36-59 (Adult)</SelectItem>
              <SelectItem value="60+">60+ (Elderly)</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>

  {/* Checkboxes */}
  <div className="flex gap-6">
    <FormField
      control={form.control}
      name="beneficiary.is_pwd"
      render={({ field }) => (
        <FormItem className="flex items-center space-x-2 space-y-0">
          <FormControl>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <FormLabel className="text-sm font-normal">Person with Disability (PWD)</FormLabel>
        </FormItem>
      )}
    />

    <FormField
      control={form.control}
      name="beneficiary.photo_consent"
      render={({ field }) => (
        <FormItem className="flex items-center space-x-2 space-y-0">
          <FormControl>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <FormLabel className="text-sm font-normal">Photo Consent</FormLabel>
        </FormItem>
      )}
    />
  </div>
</div>
```

### Step 5: Update Submit Handler

Change the API endpoint from the old one to the new one:

```typescript
// BEFORE
const onSubmit = async (values: any) => {
  setIsSubmitting(true);
  try {
    const response = await apiWithAuth.post(
      "/admin/incidents",  // ❌ Old endpoint
      values
    );
    // ...
  } catch (error) {
    // ...
  }
};

// AFTER
const onSubmit = async (values: any) => {
  setIsSubmitting(true);
  try {
    const response = await apiWithAuth.post(
      "/admin/incidents/create-with-beneficiary",  // ✅ New endpoint
      values
    );

    if (response.data.success) {
      toast.success(response.data.message);

      // Show if beneficiary was created
      if (response.data.data.beneficiary_created) {
        toast.info("New beneficiary profile created");
      }

      // Your existing success logic...
    }
  } catch (error: any) {
    // Your existing error handling...
  } finally {
    setIsSubmitting(false);
  }
};
```

### Step 6: Add Required Imports

Make sure you have these imports at the top of your file:

```typescript
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
```

## Summary of Changes

| What Changed | Before | After |
|-------------|--------|-------|
| **Form Field** | `reported_by` (UUID) | `beneficiary` (object with details) |
| **UI Component** | Dropdown (select user) | Smart form with auto-lookup |
| **API Endpoint** | `/admin/incidents` | `/admin/incidents/create-with-beneficiary` |
| **User Experience** | Manual selection | Type phone → auto-fill |
| **Beneficiary Creation** | Manual (separate step) | Automatic (if doesn't exist) |

## User Flow

1. User types phone number → **onBlur** triggers lookup
2. **If exists**: Auto-fills all fields, shows green "✓ Found"
3. **If not exists**: Shows blue "New Beneficiary" message
4. User completes/edits remaining fields
5. On submit:
   - **Existing**: Links incident to beneficiary
   - **New**: Creates beneficiary + links to incident

## Benefits

✅ **No Duplicates**: Automatically detects existing beneficiaries
✅ **Fast Entry**: Auto-populates known beneficiaries
✅ **User-Friendly**: Clear visual feedback
✅ **Flexible**: Can edit auto-filled data
✅ **Seamless**: One-step creation for both incident + beneficiary

## Testing

1. Test with **existing beneficiary** phone number
   - Should auto-fill all fields
   - Should show green checkmark
   - On submit: Should link to existing beneficiary

2. Test with **new phone number**
   - Should show "New beneficiary" message
   - Fields should be empty for manual entry
   - On submit: Should create new beneficiary + incident

3. Test **editing auto-filled data**
   - Auto-filled data should be editable
   - Modified data should be saved

## Need Help?

- Check `docs/BENEFICIARY_INCIDENT_INTEGRATION.md` for detailed examples
- API responses documented in Swagger/OpenAPI docs
- Backend endpoints are in `src/app/api/admin/`
