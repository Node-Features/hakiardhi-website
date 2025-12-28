# User Profile Picture Upload - Implementation

## ✅ Complete

User profile picture upload functionality has been implemented with optional upload/update capabilities.

---

## 📋 What Was Implemented

### 1. Database Schema Update

**File**: `migrations/add_user_image_url.sql`

Added `image_url` column to users table:

```sql
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS image_url text;
```

**Migration Command**:
```bash
psql -U user -d database -f migrations/add_user_image_url.sql
```

---

### 2. New API Endpoint: Profile Picture Upload

**File**: `src/app/api/admin/users/[id]/profile-picture/route.ts`

#### POST - Upload/Update Profile Picture

**Endpoint**: `POST /api/admin/users/{id}/profile-picture`

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

**Response**:
```json
{
  "message": "Profile picture uploaded successfully",
  "image_url": "https://supabase-url/storage/v1/object/public/profiles/avatars/user-id-timestamp.jpg",
  "user": {
    "id": "user-id",
    "first_name": "John",
    "last_name": "Doe",
    "image_url": "https://..."
  }
}
```

**Features**:
- ✅ Validates image type (only images allowed)
- ✅ Automatically deletes old profile picture when uploading new one
- ✅ Generates unique filename: `{user-id}-{timestamp}.{extension}`
- ✅ Stores in Supabase Storage: `profiles/avatars/` folder
- ✅ Returns public URL
- ✅ Updates user record with new image URL

#### DELETE - Remove Profile Picture

**Endpoint**: `DELETE /api/admin/users/{id}/profile-picture`

**Response**:
```json
{
  "message": "Profile picture deleted successfully"
}
```

**Features**:
- ✅ Deletes file from Supabase Storage
- ✅ Sets `image_url` to `null` in database
- ✅ Returns 404 if no profile picture exists

---

### 3. Updated Validation Schema

**File**: `src/lib/users/validation.ts`

Added `image_url` to `UserUpdateSchema`:

```typescript
image_url: z
  .string()
  .url({ message: "Image URL must be a valid URL" })
  .optional()
  .nullable(),
```

---

### 4. Updated Users Endpoints

**File**: `src/app/api/admin/users/[id]/route.ts`

#### GET /api/admin/users/{id}

Now returns `image_url`:
```json
{
  "user": {
    "id": "...",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "image_url": "https://...", // ✅ NEW
    "role": {...},
    "permissions": [...]
  }
}
```

#### PUT /api/admin/users/{id}

Now accepts and updates `image_url`:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "image_url": "https://..." // ✅ Optional
}
```

---

### 5. Route Permissions

**File**: `src/utils/routes_permission.ts`

Added profile picture routes:
```typescript
'POST /api/admin/users/:id/profile-picture': 'user_update',
'DELETE /api/admin/users/:id/profile-picture': 'user_update',
```

**Permission Required**: `user_update`

---

## 🎯 Usage Examples

### Example 1: Upload Profile Picture

```typescript
// Frontend
const uploadProfilePicture = async (userId: string, imageFile: File) => {
  // Convert file to base64
  const reader = new FileReader();
  reader.readAsDataURL(imageFile);

  reader.onload = async () => {
    const base64Image = reader.result as string;

    const response = await fetch(`/api/admin/users/${userId}/profile-picture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        image: base64Image,
        mime_type: imageFile.type
      })
    });

    const data = await response.json();
    console.log('Upload successful:', data.image_url);
  };
};
```

### Example 2: Upload with Image URL

```typescript
// If you already have a base64 string
const uploadFromBase64 = async (userId: string, base64String: string) => {
  const response = await fetch(`/api/admin/users/${userId}/profile-picture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      image: base64String // Can be with or without data URL prefix
    })
  });

  const data = await response.json();
  return data.image_url;
};
```

### Example 3: Delete Profile Picture

```typescript
const deleteProfilePicture = async (userId: string) => {
  const response = await fetch(`/api/admin/users/${userId}/profile-picture`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  console.log(data.message);
};
```

### Example 4: Update User with Profile Picture URL

```typescript
// If you want to set image_url directly (without uploading file)
const updateUserProfile = async (userId: string, profileData: any) => {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      image_url: profileData.image_url // Optional
    })
  });

  return await response.json();
};
```

---

## 📁 File Storage Structure

Files are stored in Supabase Storage with the following structure:

```
profiles/                    (Storage Bucket)
└── avatars/                (Folder)
    ├── user-id-1-1234567890.jpg
    ├── user-id-2-1234567891.png
    └── user-id-3-1234567892.webp
```

**Bucket**: `profiles` (defined in `StorageBuckets.PROFILES`)
**Folder**: `avatars`
**Filename Format**: `{userId}-{timestamp}.{extension}`

---

## 🔄 Update Flow

### Upload/Update Flow:

```
1. User sends POST request with base64 image
   ↓
2. Backend validates image type
   ↓
3. Check if user exists
   ↓
4. If user has old profile picture → Delete from storage
   ↓
5. Upload new image to Supabase Storage (profiles/avatars/)
   ↓
6. Get public URL
   ↓
7. Update user record with new image_url
   ↓
8. Return success with image URL
```

### Delete Flow:

```
1. User sends DELETE request
   ↓
2. Check if user exists and has profile picture
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

## ✅ Features

### Security
- ✅ Validates image MIME type (only images allowed)
- ✅ Requires authentication (Bearer token)
- ✅ Requires `user_update` permission
- ✅ Validates user exists before upload
- ✅ Sanitizes file paths

### Storage Management
- ✅ Automatic cleanup of old profile pictures
- ✅ Unique filenames prevent conflicts
- ✅ Public URLs for easy access
- ✅ Organized folder structure

### Optional Upload
- ✅ Profile picture is completely optional
- ✅ Users can exist without profile pictures
- ✅ Can upload, update, or delete at any time
- ✅ Can set image_url via regular user update

### Error Handling
- ✅ Validates image format
- ✅ Handles missing users
- ✅ Handles upload failures
- ✅ Continues if old picture delete fails
- ✅ Detailed error messages

---

## 🧪 Testing

### Test 1: Upload Profile Picture

```bash
# Get user ID and access token first
USER_ID="your-user-id"
TOKEN="your-access-token"

# Create a test image (base64 encoded)
BASE64_IMAGE="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."

curl -X POST "http://localhost:3001/api/admin/users/$USER_ID/profile-picture" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"image\": \"$BASE64_IMAGE\",
    \"mime_type\": \"image/jpeg\"
  }"

# Expected: 200 OK with image_url
```

### Test 2: Get User with Profile Picture

```bash
curl -X GET "http://localhost:3001/api/admin/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN"

# Expected: User object with image_url field
```

### Test 3: Delete Profile Picture

```bash
curl -X DELETE "http://localhost:3001/api/admin/users/$USER_ID/profile-picture" \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK
```

### Test 4: Upload Without Permission

```bash
# Use token without user_update permission
curl -X POST "http://localhost:3001/api/admin/users/$USER_ID/profile-picture" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LIMITED_TOKEN" \
  -d "{\"image\": \"$BASE64_IMAGE\"}"

# Expected: 403 Forbidden (if RBAC enabled)
```

---

## 📊 Database Schema

```sql
-- users table now includes:
CREATE TABLE public.users (
  id uuid PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone_number text,
  sex text,
  age_group text,
  photo_consent boolean DEFAULT false,
  status user_statuses DEFAULT 'Inactive',
  password text NOT NULL,
  image_url text,              -- ✅ NEW FIELD
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

---

## 🔐 Permissions Required

| Action | Endpoint | Permission |
|--------|----------|------------|
| Upload profile picture | `POST /api/admin/users/:id/profile-picture` | `user_update` |
| Delete profile picture | `DELETE /api/admin/users/:id/profile-picture` | `user_update` |
| View profile picture | `GET /api/admin/users/:id` | `user_view` |
| Update image_url directly | `PUT /api/admin/users/:id` | `user_update` |

---

## 📝 Notes

1. **Optional Field**: Profile pictures are completely optional. Users can exist without them.

2. **Automatic Cleanup**: When uploading a new profile picture, the old one is automatically deleted to save storage space.

3. **Public URLs**: Profile pictures are stored with public URLs for easy access in the frontend.

4. **File Size**: Current bucket limit is 50MB per file (configured in storage.service.ts).

5. **Supported Formats**: JPEG, PNG, GIF, WebP

6. **MIME Type Detection**: If the base64 string includes a data URL prefix (e.g., `data:image/jpeg;base64,...`), the MIME type is automatically detected.

7. **Idempotent Updates**: Uploading the same or different image multiple times will replace the previous one.

---

## 🚀 Next Steps

To use the profile picture upload feature:

1. **Run Migration**:
   ```bash
   psql -U user -d database -f migrations/add_user_image_url.sql
   ```

2. **Restart Backend Server**:
   ```bash
   npm run dev
   ```

3. **Test Upload**: Use the examples above or create a frontend component

4. **Frontend Integration**:
   - Add file input for image selection
   - Convert to base64
   - Call POST endpoint
   - Display returned image_url

---

## Summary

✅ **Database**: `image_url` field added to users table
✅ **API Endpoints**: Upload, delete profile pictures
✅ **Validation**: Image type validation
✅ **Storage**: Supabase Storage with organized structure
✅ **Permissions**: `user_update` required
✅ **Optional**: Profile pictures are completely optional
✅ **Cleanup**: Automatic deletion of old pictures
✅ **Public URLs**: Easy frontend integration

**Result**: Users can now optionally upload, update, and delete their profile pictures.
