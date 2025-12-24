# Postman Collection - Quick Start Guide

## Import & Setup (2 minutes)

1. **Import Files**
   - Open Postman
   - Import: `Digital_Ecosystem_API.postman_collection.json`
   - Import: `Digital_Ecosystem.postman_environment.json`

2. **Select Environment**
   - Click environment dropdown (top right)
   - Select "Digital Ecosystem Environment"

3. **Configure**
   - Click eye icon to view environment
   - Set `base_url` (default: `http://localhost:3000`)
   - Set `default_email` and `default_password`

4. **Authenticate**
   - Run: **Authentication > Login**
   - ✅ Token automatically saved!

## How It Works

### No More Copy/Paste! 🎉

The collection automatically saves IDs from responses:

```
Create User → Saves user_id
Create Region → Saves region_id
Create Case → Saves case_id
```

Then use them in other requests:
```
GET /api/admin/users/{{created_user_id}}
PUT /api/admin/cases/{{case_id}}
```

## Common Workflows

### 1. Basic Setup
```
1. Login
2. Create Category
3. Create Region → District → Village
```

### 2. Create a Legal Case
```
1. Login
2. Create Category (if needed)
3. Create Case (uses category_id, user_id)
4. Add Case Stage
5. Update Case Status
```

### 3. Legal Aid Request
```
1. Login
2. Setup Geography (Region/District/Village)
3. Create Legal Aid Request
4. Assign Lawyer
5. Update Stage
```

### 4. Project Management
```
1. Login
2. Setup Geography
3. Create Project
4. Create Activity
5. Add Beneficiaries
```

## Key Variables

### Auto-saved After Login
- `access_token` - Used for all authenticated requests
- `user_id` - Current user's ID

### Auto-saved After Create Operations
- `category_id` - Last created category
- `region_id` → `district_id` → `village_id` - Geography hierarchy
- `case_id` - Last created case
- `legal_aid_id` - Last created legal aid request
- `project_id` - Last created project
- `blog_id` - Last created blog
- `beneficiary_id` - Last created beneficiary

### Auto-saved From List Operations
All list endpoints save the first item's ID:
- `first_user_id`
- `first_case_id`
- `first_region_id`
- etc.

## Endpoint Categories

| Category | Key Endpoints |
|----------|---------------|
| **Authentication** | Login, Register, Session |
| **Users** | Full CRUD |
| **Categories** | Full CRUD + Type filtering |
| **Geography** | Regions, Districts, Villages |
| **Cases** | CRUD + Stages + Attachments |
| **Legal Aid** | CRUD + Assign + Workflow |
| **Projects** | CRUD + Locations + Files |
| **Activities** | CRUD + Link to Projects |
| **Beneficiaries** | CRUD + Statistics |
| **Blogs** | CRUD + Search |
| **Incidents** | CRUD + Location filtering |
| **Public** | Stats, Programs, News (No auth) |
| **Chatbot** | Incidents & Legal Aid flows |

## Common Query Parameters

Most list endpoints support:
- `page=1` - Page number
- `limit=10` - Results per page
- `search=term` - Search keyword
- `status=value` - Filter by status

Enable disabled parameters in the Params tab!

## Tips

✅ **Check Console** - Open Postman Console (View menu) to see saved variables
✅ **Watch Variables** - Click eye icon to see environment variables
✅ **Run Folders** - Use Collection Runner to execute entire workflows
✅ **Geography First** - Always create Region → District → Village before location-based resources

## Troubleshooting

| Problem | Solution |
|---------|----------|
| 401 Unauthorized | Run Login again |
| Empty UUID in request | Create the parent resource first |
| Variable not saving | Check console for errors, verify environment is selected |

## Response Structure

**Success:**
```json
{
  "success": true,
  "data": {...},
  "meta": { "page": 1, "total": 100 }
}
```

**Error:**
```json
{
  "errors": { "field": "error message" }
}
```

---

**Need More Details?** See `POSTMAN_COLLECTION_GUIDE.md` for complete documentation.
