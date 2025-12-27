# Beneficiary-Incident Integration Guide

## Overview
This guide explains how to replace the "Reported By" dropdown with a smart beneficiary form that auto-populates when a phone number is entered.

## Backend Endpoints Created

### 1. Beneficiary Lookup Endpoint
**GET** `/api/admin/beneficiaries/lookup?phone_number={phone}`

**Purpose**: Check if a beneficiary exists by phone number and return their details

**Response**:
```json
{
  "success": true,
  "exists": true,
  "data": {
    "id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "sex": "male",
    "age_group": "18-35",
    "is_pwd": false,
    "phone_number": "+255712345678",
    "region_id": "uuid",
    "district_id": "uuid",
    "village_id": "uuid",
    "photo_consent": false,
    "regions": { "id": "uuid", "name": "Dar es Salaam" },
    "districts": { "id": "uuid", "name": "Kinondoni" },
    "villages": { "id": "uuid", "name": "Mikocheni" }
  },
  "message": "Beneficiary found: John Doe"
}
```

If not found:
```json
{
  "success": true,
  "exists": false,
  "data": null,
  "message": "No beneficiary found with this phone number"
}
```

### 2. Enhanced Incident Creation Endpoint
**POST** `/api/admin/incidents/create-with-beneficiary`

**Purpose**: Create incident with automatic beneficiary creation/linking

**Request Body**:
```json
{
  "name": "Land Dispute in Kilimani",
  "description": "Detailed description of the incident...",
  "region_id": "uuid",
  "district_id": "uuid",
  "village_id": "uuid",
  "category_id": "uuid",
  "priority": "medium",
  "beneficiary": {
    "phone_number": "+255712345678",
    "first_name": "John",
    "last_name": "Doe",
    "sex": "male",
    "age_group": "18-35",
    "is_pwd": false,
    "photo_consent": false,
    // Optional - will use incident location if not provided
    "region_id": "uuid",
    "district_id": "uuid",
    "village_id": "uuid"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Incident created and linked to existing beneficiary",
  "data": {
    "incident": { /* incident object */ },
    "beneficiary": { /* beneficiary object */ },
    "beneficiary_created": false  // true if new beneficiary was created
  }
}
```

## Frontend Implementation

### Step 1: Replace Reported By Dropdown

**Before** (Dropdown):
```tsx
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
          {/* Users list */}
        </SelectContent>
      </Select>
    </FormItem>
  )}
/>
```

**After** (Beneficiary Form Section):
```tsx
{/* Beneficiary Section */}
<div className="space-y-4 border rounded-lg p-4">
  <h3 className="text-lg font-semibold">Reporter Details (Beneficiary)</h3>

  {/* Phone Number with Auto-lookup */}
  <FormField
    control={form.control}
    name="beneficiary.phone_number"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Phone Number *</FormLabel>
        <FormControl>
          <Input
            {...field}
            placeholder="+255712345678"
            onBlur={async (e) => {
              // Auto-lookup beneficiary when phone number is entered
              if (e.target.value.length >= 10) {
                await lookupBeneficiary(e.target.value);
              }
            }}
          />
        </FormControl>
        {beneficiaryExists && (
          <p className="text-sm text-green-600">
            ✓ Beneficiary found: {beneficiaryData?.first_name} {beneficiaryData?.last_name}
          </p>
        )}
        <FormMessage />
      </FormItem>
    )}
  />

  {/* First Name */}
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

  {/* Last Name */}
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

  {/* Sex */}
  <FormField
    control={form.control}
    name="beneficiary.sex"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Sex</FormLabel>
        <Select onValueChange={field.onChange} value={field.value}>
          <SelectTrigger>
            <SelectValue placeholder="Select sex" />
          </SelectTrigger>
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

  {/* Age Group */}
  <FormField
    control={form.control}
    name="beneficiary.age_group"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Age Group</FormLabel>
        <Select onValueChange={field.onChange} value={field.value}>
          <SelectTrigger>
            <SelectValue placeholder="Select age group" />
          </SelectTrigger>
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

  {/* Person with Disability */}
  <FormField
    control={form.control}
    name="beneficiary.is_pwd"
    render={({ field }) => (
      <FormItem className="flex items-center space-x-2">
        <FormControl>
          <Checkbox
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        </FormControl>
        <FormLabel className="!mt-0">Person with Disability (PWD)</FormLabel>
      </FormItem>
    )}
  />

  {/* Photo Consent */}
  <FormField
    control={form.control}
    name="beneficiary.photo_consent"
    render={({ field }) => (
      <FormItem className="flex items-center space-x-2">
        <FormControl>
          <Checkbox
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        </FormControl>
        <FormLabel className="!mt-0">Photo Consent Given</FormLabel>
      </FormItem>
    )}
  />
</div>
```

### Step 2: Add Beneficiary Lookup Logic

```typescript
// Add to your component
const [beneficiaryExists, setBeneficiaryExists] = useState(false);
const [beneficiaryData, setBeneficiaryData] = useState<any>(null);

const lookupBeneficiary = async (phoneNumber: string) => {
  try {
    const response = await apiWithAuth.get(
      `/admin/beneficiaries/lookup?phone_number=${encodeURIComponent(phoneNumber)}`
    );

    if (response.data.exists && response.data.data) {
      // Beneficiary found - auto-populate form
      setBeneficiaryExists(true);
      setBeneficiaryData(response.data.data);

      // Auto-fill form fields
      form.setValue('beneficiary.first_name', response.data.data.first_name);
      form.setValue('beneficiary.last_name', response.data.data.last_name);
      form.setValue('beneficiary.sex', response.data.data.sex);
      form.setValue('beneficiary.age_group', response.data.data.age_group);
      form.setValue('beneficiary.is_pwd', response.data.data.is_pwd);
      form.setValue('beneficiary.photo_consent', response.data.data.photo_consent);

      // Optionally populate location if not set
      if (!form.getValues('region_id')) {
        form.setValue('beneficiary.region_id', response.data.data.region_id);
        form.setValue('beneficiary.district_id', response.data.data.district_id);
        form.setValue('beneficiary.village_id', response.data.data.village_id);
      }

      toast.success(`Beneficiary found: ${response.data.data.first_name} ${response.data.data.last_name}`);
    } else {
      // Beneficiary not found
      setBeneficiaryExists(false);
      setBeneficiaryData(null);
      toast.info('New beneficiary will be created');
    }
  } catch (error) {
    console.error('Error looking up beneficiary:', error);
    toast.error('Failed to lookup beneficiary');
  }
};
```

### Step 3: Update Form Submit Handler

```typescript
const onSubmit = async (values: any) => {
  try {
    setIsSubmitting(true);

    // Use the new endpoint with beneficiary handling
    const response = await apiWithAuth.post(
      '/admin/incidents/create-with-beneficiary',
      values
    );

    if (response.data.success) {
      toast.success(response.data.message);

      // Show additional info if beneficiary was created
      if (response.data.data.beneficiary_created) {
        toast.info('New beneficiary profile created');
      }

      // Reset form and navigate
      form.reset();
      router.push('/admin/incidents');
    }
  } catch (error: any) {
    console.error('Error creating incident:', error);

    if (error.response?.data?.errors) {
      // Handle validation errors
      Object.entries(error.response.data.errors).forEach(([field, message]) => {
        toast.error(`${field}: ${message}`);
      });
    } else {
      toast.error(error.response?.data?.message || 'Failed to create incident');
    }
  } finally {
    setIsSubmitting(false);
  }
};
```

### Step 4: Update Form Schema

```typescript
const formSchema = z.object({
  // Incident fields
  name: z.string().min(5, "Incident name must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  region_id: z.string().uuid("Valid region ID is required"),
  district_id: z.string().uuid("Valid district ID is required"),
  village_id: z.string().uuid("Valid village ID is required"),
  category_id: z.string().uuid("Valid category ID is required"),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),

  // Beneficiary fields (nested)
  beneficiary: z.object({
    phone_number: z.string().min(10, "Phone number must be at least 10 characters"),
    first_name: z.string().min(2, "First name must be at least 2 characters"),
    last_name: z.string().min(2, "Last name must be at least 2 characters"),
    sex: z.enum(['male', 'female', 'other']).optional(),
    age_group: z.string().optional(),
    is_pwd: z.boolean().optional(),
    photo_consent: z.boolean().optional(),
  }),
});
```

## User Flow

1. **User enters phone number** → System checks if beneficiary exists
2. **If exists**:
   - ✅ Auto-populates all beneficiary fields
   - Shows success message "Beneficiary found: John Doe"
   - User can edit fields if needed
   - On submit: Links incident to existing beneficiary
3. **If not exists**:
   - ℹ️ Shows message "New beneficiary will be created"
   - User fills in required fields
   - On submit: Creates new beneficiary and links to incident

## Benefits

- ✅ **No duplicates**: Automatically finds and reuses existing beneficiaries
- ✅ **Fast data entry**: Auto-populates fields for known beneficiaries
- ✅ **Smart defaults**: Uses incident location for beneficiary if not specified
- ✅ **Clear feedback**: Users know immediately if beneficiary exists
- ✅ **Flexible**: Can edit auto-populated fields if needed
- ✅ **Database integrity**: Single source of truth for beneficiary data

## API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/beneficiaries/lookup` | GET | Check if beneficiary exists by phone |
| `/api/admin/incidents/create-with-beneficiary` | POST | Create incident with auto beneficiary handling |
| `/api/admin/beneficiaries` | GET | List all beneficiaries (existing) |
| `/api/admin/beneficiaries` | POST | Create beneficiary manually (existing) |
