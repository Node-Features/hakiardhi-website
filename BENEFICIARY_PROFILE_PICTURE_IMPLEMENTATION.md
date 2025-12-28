# Beneficiary Profile Picture Upload - Implementation

## ✅ Complete

Beneficiary profile picture upload functionality has been implemented with optional upload/update capabilities and photo consent validation.

---

## 📋 What Was Implemented

### 1. API Endpoint: Profile Picture Upload

**File**: `src/app/api/admin/beneficiaries/[id]/profile-picture/route.ts`

#### POST - Upload/Update Profile Picture

**Endpoint**: `POST /api/admin/beneficiaries/{id}/profile-picture`

**Request Body**:
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...", // Base64 encoded image
  "mime_type": "image/jpeg" // Optional, auto-detected if image has data URL prefix
}
```

**Supported Image Types**:
- JPEG (image/jpeg, image/jpg)
- PNG (image/png)
- GIF (image/gif)
- WebP (image/webp)

**Success Response**:
```json
{
  "success": true,
  "message": "Profile picture uploaded successfully",
  "image_url": "https://supabase-url/storage/v1/object/public/profiles/beneficiaries/beneficiary-id-timestamp.jpg",
  "data": {
    "id": "beneficiary-id",
    "first_name": "Jane",
    "last_name": "Doe",
    "image_url": "https://..."
  }
}
```

**Error Response (No Photo Consent)**:
```json
{
  "message": "Cannot upload photo. Beneficiary has not provided photo consent.",
  "photo_consent": false
}
```

**Features**:
- ✅ Validates image type (only images allowed)
- ✅ **Checks photo consent** - Cannot upload if `photo_consent = false`
- ✅ Automatically deletes old profile picture when uploading new one
- ✅ Generates unique filename: `beneficiary-{id}-{timestamp}.{extension}`
- ✅ Stores in Supabase Storage: `profiles/beneficiaries/` folder
- ✅ Returns public URL
- ✅ Updates beneficiary record with new image URL

#### DELETE - Remove Profile Picture

**Endpoint**: `DELETE /api/admin/beneficiaries/{id}/profile-picture`

**Response**:
```json
{
  "success": true,
  "message": "Profile picture deleted successfully"
}
```

**Features**:
- ✅ Deletes file from Supabase Storage
- ✅ Sets `image_url` to `null` in database
- ✅ Returns 404 if no profile picture exists

---

### 2. Database Schema

**Table**: `beneficiaries`

The table already includes:
```sql
CREATE TABLE public.beneficiaries (
  id uuid PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  sex text CHECK (sex IN ('male', 'female', 'other')),
  role text,
  age_group text,
  is_pwd boolean DEFAULT false,
  phone_number text,
  image_url text,              -- ✅ Already exists
  photo_consent boolean DEFAULT false, -- ✅ Used for validation
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  status user_statuses DEFAULT 'Active',
  region_id uuid,
  district_id uuid,
  village_id uuid
);
```

---

### 3. Route Permissions

**File**: `src/utils/routes_permission.ts`

Added beneficiary profile picture routes:
```typescript
'POST /api/admin/beneficiaries/:id/profile-picture': 'beneficiary_edit'
'DELETE /api/admin/beneficiaries/:id/profile-picture': 'beneficiary_edit'
```

**Permission Required**: `beneficiary_edit`

---

### 4. Existing Endpoints Already Support Image URL

**GET/PUT** `/api/admin/beneficiaries/{id}`
- Already includes `image_url` in response
- PUT endpoint already accepts `image_url` for direct updates

---

## 🎯 Usage Examples

### Example 1: Upload Profile Picture

```typescript
// Frontend upload with consent check
const uploadBeneficiaryPicture = async (beneficiaryId: string, imageFile: File) => {
  // First, check if beneficiary has given photo consent
  const beneficiary = await fetch(`/api/admin/beneficiaries/${beneficiaryId}`);
  const data = await beneficiary.json();

  if (!data.photo_consent) {
    alert('Cannot upload photo. Beneficiary has not provided photo consent.');
    return;
  }

  // Convert file to base64
  const reader = new FileReader();
  reader.readAsDataURL(imageFile);

  reader.onload = async () => {
    const base64Image = reader.result as string;

    const response = await fetch(`/api/admin/beneficiaries/${beneficiaryId}/profile-picture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        image: base64Image
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Upload failed:', error.message);
      return;
    }

    const result = await response.json();
    console.log('Image URL:', result.image_url);
  };
};
```

### Example 2: Delete Profile Picture

```typescript
const deleteBeneficiaryPicture = async (beneficiaryId: string) => {
  const response = await fetch(`/api/admin/beneficiaries/${beneficiaryId}/profile-picture`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  console.log(data.message);
};
```

### Example 3: Enable Photo Consent First

```typescript
const enablePhotoConsent = async (beneficiaryId: string) => {
  // First enable photo consent
  await fetch(`/api/admin/beneficiaries/${beneficiaryId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      photo_consent: true
    })
  });

  // Then upload photo
  await uploadBeneficiaryPicture(beneficiaryId, imageFile);
};
```

---

## 📁 File Storage Structure

Files are stored in Supabase Storage with the following structure:

```
profiles/                           (Storage Bucket)
├── avatars/                       (Users)
│   ├── user-id-1-1234567890.jpg
│   └── user-id-2-1234567891.png
└── beneficiaries/                 (Beneficiaries) ✅ NEW
    ├── beneficiary-abc123-1234567890.jpg
    ├── beneficiary-def456-1234567891.png
    └── beneficiary-ghi789-1234567892.webp
```

**Bucket**: `profiles` (shared with users)
**Folder**: `beneficiaries` (separate from users)
**Filename Format**: `beneficiary-{id}-{timestamp}.{extension}`

---

## 🔄 Upload Flow

### Upload/Update Flow:

```
1. User sends POST request with base64 image
   ↓
2. Backend validates image type
   ↓
3. Check if beneficiary exists
   ↓
4. ✅ CHECK PHOTO CONSENT (beneficiary.photo_consent must be true)
   ↓
5. If consent is false → Return 403 Forbidden
   ↓
6. If beneficiary has old picture → Delete from storage
   ↓
7. Upload new image to Supabase Storage (profiles/beneficiaries/)
   ↓
8. Get public URL
   ↓
9. Update beneficiary record with new image_url
   ↓
10. Return success with image URL
```

### Delete Flow:

```
1. User sends DELETE request
   ↓
2. Check if beneficiary exists and has profile picture
   ↓
3. Extract file path from image_url
   ↓
4. Delete file from Supabase Storage
   ↓
5. Set image_url to null in database
   ↓
6. Return success message
```

---

## ✅ Key Features

### Photo Consent Validation ⭐
- ✅ **Cannot upload photo if `photo_consent = false`**
- ✅ Returns 403 Forbidden with clear error message
- ✅ Respects beneficiary privacy and consent

### Security
- ✅ Validates image MIME type (only images allowed)
- ✅ Requires authentication (Bearer token)
- ✅ Requires `beneficiary_edit` permission
- ✅ Validates beneficiary exists before upload
- ✅ Sanitizes file paths

### Storage Management
- ✅ Automatic cleanup of old profile pictures
- ✅ Unique filenames prevent conflicts
- ✅ Public URLs for easy access
- ✅ Organized folder structure (separate from users)

### Optional Upload
- ✅ Profile picture is completely optional
- ✅ Beneficiaries can exist without profile pictures
- ✅ Can upload, update, or delete at any time
- ✅ Can set image_url via regular beneficiary update

### Error Handling
- ✅ Validates photo consent
- ✅ Validates image format
- ✅ Handles missing beneficiaries
- ✅ Handles upload failures
- ✅ Continues if old picture delete fails
- ✅ Detailed error messages

---

## 🧪 Testing

### Test 1: Upload Profile Picture (With Consent)

```bash
# Get beneficiary ID and access token first
BENEFICIARY_ID="your-beneficiary-id"
TOKEN="your-access-token"

# Ensure beneficiary has photo consent enabled
curl -X PUT "http://localhost:3001/api/admin/beneficiaries/$BENEFICIARY_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"photo_consent": true}'

# Upload profile picture
BASE64_IMAGE="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."

curl -X POST "http://localhost:3001/api/admin/beneficiaries/$BENEFICIARY_ID/profile-picture" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"image\": \"$BASE64_IMAGE\",
    \"mime_type\": \"image/jpeg\"
  }"

# Expected: 200 OK with image_url
```

### Test 2: Upload Without Photo Consent (Should Fail)

```bash
# Disable photo consent
curl -X PUT "http://localhost:3001/api/admin/beneficiaries/$BENEFICIARY_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"photo_consent": false}'

# Try to upload photo
curl -X POST "http://localhost:3001/api/admin/beneficiaries/$BENEFICIARY_ID/profile-picture" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"image\": \"$BASE64_IMAGE\"}"

# Expected: 403 Forbidden
# Response: {"message": "Cannot upload photo. Beneficiary has not provided photo consent.", "photo_consent": false}
```

### Test 3: Get Beneficiary with Profile Picture

```bash
curl -X GET "http://localhost:3001/api/admin/beneficiaries/$BENEFICIARY_ID" \
  -H "Authorization: Bearer $TOKEN"

# Expected: Beneficiary object with image_url field
```

### Test 4: Delete Profile Picture

```bash
curl -X DELETE "http://localhost:3001/api/admin/beneficiaries/$BENEFICIARY_ID/profile-picture" \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK
```

---

## 🔐 Permissions Required

| Action | Endpoint | Permission |
|--------|----------|------------|
| Upload profile picture | `POST /api/admin/beneficiaries/:id/profile-picture` | `beneficiary_edit` |
| Delete profile picture | `DELETE /api/admin/beneficiaries/:id/profile-picture` | `beneficiary_edit` |
| View profile picture | `GET /api/admin/beneficiaries/:id` | `beneficiary_view` |
| Update image_url directly | `PUT /api/admin/beneficiaries/:id` | `beneficiary_edit` |
| Update photo consent | `PUT /api/admin/beneficiaries/:id` | `beneficiary_edit` |

---

## 📊 Comparison: Users vs Beneficiaries

| Feature | Users | Beneficiaries |
|---------|-------|---------------|
| **Photo Consent Check** | ❌ Not required | ✅ **Required** - Cannot upload without consent |
| **Storage Folder** | `profiles/avatars/` | `profiles/beneficiaries/` |
| **Filename Format** | `{userId}-{timestamp}.{ext}` | `beneficiary-{id}-{timestamp}.{ext}` |
| **Permission Required** | `user_update` | `beneficiary_edit` |
| **Upload Endpoint** | `/users/:id/profile-picture` | `/beneficiaries/:id/profile-picture` |
| **Privacy Protection** | Standard | **Enhanced** (consent required) |

---

## 📝 Important Notes

### Photo Consent

**Critical**: Beneficiaries must have `photo_consent = true` before uploading photos.

This is a **privacy protection** feature that:
- ✅ Respects beneficiary rights
- ✅ Ensures GDPR/privacy compliance
- ✅ Prevents unauthorized photo uploads
- ✅ Gives beneficiaries control over their data

**Workflow**:
1. Ask beneficiary for photo consent
2. Update `photo_consent` field to `true`
3. Then upload profile picture

### File Management

1. **Automatic Cleanup**: Old pictures are automatically deleted when uploading new ones
2. **Storage Limit**: 50MB per file (configured in storage.service.ts)
3. **Public Access**: All profile pictures have public URLs
4. **Separate Storage**: Beneficiary photos stored separately from user avatars

### Best Practices

1. **Always check consent first** before showing upload UI
2. **Display consent status** in beneficiary profile
3. **Provide option to enable consent** before upload
4. **Show clear error messages** when consent is missing
5. **Respect privacy** - don't force photo uploads

---

## 🚀 Next Steps

To use the beneficiary profile picture upload feature:

1. **Verify Database**: Ensure `image_url` and `photo_consent` fields exist in beneficiaries table

2. **Test Upload**: Use the examples above

3. **Frontend Integration**:
   - Add photo consent checkbox in beneficiary form
   - Add file input for image selection (only if consent = true)
   - Convert to base64
   - Call POST endpoint
   - Display returned image_url

4. **UI Considerations**:
   - Show consent status prominently
   - Disable upload button if consent = false
   - Provide option to enable consent
   - Show clear error messages

---

## Summary

✅ **API Endpoints**: Upload, delete beneficiary profile pictures
✅ **Photo Consent**: Required before upload (privacy protection)
✅ **Storage**: Organized in `profiles/beneficiaries/` folder
✅ **Permissions**: `beneficiary_edit` required
✅ **Optional**: Profile pictures completely optional
✅ **Cleanup**: Automatic deletion of old pictures
✅ **Public URLs**: Easy frontend integration
✅ **Privacy First**: Respects beneficiary consent and rights

**Key Difference from Users**: Beneficiaries require `photo_consent = true` before uploading photos, providing enhanced privacy protection.
