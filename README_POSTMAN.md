# Digital Ecosystem API - Postman Documentation

## 📦 Files Included

### Collection & Environment Files
1. **Digital_Ecosystem_API.postman_collection.json** - Main API collection (100+ endpoints)
2. **Digital_Ecosystem.postman_environment.json** - Environment variables file

### Documentation Files
3. **POSTMAN_IMPORT_GUIDE.md** - Step-by-step import instructions
4. **QUICK_START.md** - Quick reference guide (2-minute setup)
5. **POSTMAN_COLLECTION_GUIDE.md** - Complete documentation (workflows, features, tips)
6. **API_ENDPOINTS_REFERENCE.md** - Comprehensive endpoint reference table

---

## 🚀 Quick Start (3 Steps)

### 1. Import Files
- Open Postman
- Drag & drop both `.json` files into Postman
- OR use Import button → Upload Files

### 2. Configure Environment
- Select "Digital Ecosystem Environment" from dropdown (top-right)
- Click eye icon → Edit
- Set `base_url` (e.g., `http://localhost:3000`)
- Set `default_email` and `default_password`
- Save

### 3. Authenticate
- Run: **Authentication > Login**
- ✅ Access token automatically saved!
- Ready to use all endpoints!

**👉 Full import instructions:** See `POSTMAN_IMPORT_GUIDE.md`

---

## ✨ Key Features

### 🔄 Automatic ID Extraction
No more copy/paste! The collection automatically saves IDs from responses:

```javascript
Create User → user_id saved
Create Case → case_id saved
Create Project → project_id saved
```

Then use them anywhere:
```
GET /api/admin/users/{{created_user_id}}
PUT /api/admin/cases/{{case_id}}
```

### 🔐 Auto-Authentication
Login once, use everywhere:
- `access_token` automatically added to all protected endpoints
- Bearer token authentication configured
- Session management built-in

### 📝 Pre-filled Payloads
Every request includes realistic default data:
- Uses environment variables for IDs
- Follows API validation schemas
- Easy to customize

### 🧪 Test Scripts
Each request includes test scripts that:
- Extract and save response IDs
- Log success messages
- Set up variables for next requests

---

## 📚 Documentation Overview

### 1. POSTMAN_IMPORT_GUIDE.md
**When to use:** First time setup

**Contents:**
- 3 different import methods (drag & drop, button, folder)
- Environment configuration steps
- Verification checklist
- Troubleshooting common import issues

### 2. QUICK_START.md
**When to use:** Quick reference

**Contents:**
- 2-minute setup guide
- Common workflow examples
- Key variables reference
- Troubleshooting table
- Tips and tricks

### 3. POSTMAN_COLLECTION_GUIDE.md
**When to use:** Detailed learning

**Contents:**
- How dynamic variables work
- Complete workflow examples
- Environment variables reference
- Query parameters guide
- Best practices
- Advanced usage (Collection Runner, multiple environments)
- Full troubleshooting guide

### 4. API_ENDPOINTS_REFERENCE.md
**When to use:** Endpoint lookup

**Contents:**
- All 100+ endpoints organized by category
- HTTP methods and paths
- Query parameters for each endpoint
- Variables saved by each endpoint
- Response codes reference

---

## 🗂️ Collection Structure

```
Digital Ecosystem API
├── Authentication (4 endpoints)
│   ├── Login
│   ├── Register
│   ├── Get Session
│   └── Sign Out
│
├── Users (5 endpoints)
│   ├── Create, List, Get, Update, Delete
│
├── Categories (5 endpoints)
│   └── Full CRUD
│
├── Geography
│   ├── Regions (6 endpoints)
│   ├── Districts (5 endpoints)
│   └── Villages (5 endpoints)
│
├── Cases (6+ endpoints)
│   ├── CRUD + Statistics
│   ├── Case Stages (CRUD)
│   └── Stage Attachments
│
├── Legal Aid (10 endpoints)
│   ├── CRUD
│   ├── Assign, Update Stage
│   └── Statistics, Queue, Workload
│
├── Projects (8 endpoints)
│   ├── CRUD
│   └── Locations, Files, Beneficiary Count
│
├── Activities (7 endpoints)
│   ├── CRUD
│   └── Locations, Files
│
├── Beneficiaries (7 endpoints)
│   ├── CRUD
│   └── Activities, Statistics
│
├── Blogs (5 endpoints)
│   └── Full CRUD + Search
│
├── Incidents (3 endpoints)
│   └── Create, List, Statistics
│
├── Analytics (1 endpoint)
│   └── Overview
│
├── Public (8+ endpoints)
│   ├── Stats, Programs, Portfolio
│   └── News, Events (No auth required)
│
└── Chatbot (20+ endpoints)
    ├── Messages & Webhook
    ├── Incident Reporting
    ├── Legal Aid Requests
    ├── Credibility System
    └── GPT Integration
```

---

## 🔑 Key Environment Variables

### Auto-Populated (Don't Edit)
These are automatically set by test scripts:

**After Login:**
- `access_token` - Bearer token for authentication
- `user_id` - Current user's ID
- `user_email` - Current user's email

**After Creating Resources:**
- `category_id`, `region_id`, `district_id`, `village_id`
- `case_id`, `legal_aid_id`, `project_id`, `activity_id`
- `blog_id`, `beneficiary_id`, `incident_id`
- And many more...

**After Listing Resources:**
- `first_user_id`, `first_case_id`, `first_region_id`, etc.
- Always saves the first item from list responses

### Manual Configuration Required
Set these before using the collection:

- `base_url` - Your API server URL
- `default_email` - Login email
- `default_password` - Login password
- `phone_number` - Test phone number (optional)

---

## 🎯 Common Workflows

### Example 1: Create and Manage a Legal Case

```
1. Login
   → Saves: access_token, user_id

2. Create Category (if needed)
   → Saves: category_id

3. Create Case
   → Uses: category_id, user_id
   → Saves: case_id

4. Add Case Stage
   → Uses: case_id
   → Saves: stage_id

5. Update Case Status
   → Uses: case_id

6. Get Case Details
   → Uses: case_id
```

### Example 2: Set Up Geography

```
1. Login

2. Create Region
   → Saves: region_id

3. Create District
   → Uses: region_id
   → Saves: district_id

4. Create Village
   → Uses: region_id, district_id
   → Saves: village_id

Now use these in Projects, Incidents, Legal Aid, etc.
```

### Example 3: Legal Aid Request

```
1. Login
2. Set up Geography (if needed)
3. Create Legal Aid Request
   → Uses: region_id, district_id, village_id
   → Saves: legal_aid_id
4. Assign Lawyer
   → Uses: legal_aid_id, user_id
5. Update Stage
   → Uses: legal_aid_id
```

---

## 📊 API Coverage

| Category | Endpoints | CRUD | Advanced Features |
|----------|-----------|------|-------------------|
| Authentication | 4 | - | Session management |
| Users | 5 | ✅ | Role-based |
| Categories | 5 | ✅ | Type filtering |
| Geography | 16 | ✅ | Statistics, hierarchy |
| Cases | 15+ | ✅ | Stages, attachments, stats |
| Legal Aid | 10 | ✅ | Workflow, assignment, queue |
| Projects | 8 | ✅ | Multi-location, files |
| Activities | 7 | ✅ | Project linkage |
| Beneficiaries | 7 | ✅ | Activity tracking |
| Blogs | 5 | ✅ | Search, filtering |
| Incidents | 3 | Partial | Statistics |
| Analytics | 1 | - | Dashboard data |
| Public | 8+ | Read-only | No auth required |
| Chatbot | 20+ | - | Flows, AI, validation |

**Total:** 100+ endpoints across 14 categories

---

## 🔍 How to Find Information

### "How do I import the collection?"
→ Read: `POSTMAN_IMPORT_GUIDE.md`

### "How do I get started quickly?"
→ Read: `QUICK_START.md` (2-minute setup)

### "What are all the available endpoints?"
→ Read: `API_ENDPOINTS_REFERENCE.md`

### "How do the dynamic variables work?"
→ Read: `POSTMAN_COLLECTION_GUIDE.md` → "How Dynamic Variables Work"

### "What's a good workflow for testing?"
→ Read: `POSTMAN_COLLECTION_GUIDE.md` → "Workflow Examples"
→ OR `QUICK_START.md` → "Common Workflows"

### "How do I filter results?"
→ Read: `API_ENDPOINTS_REFERENCE.md` → Query params for each endpoint
→ OR `POSTMAN_COLLECTION_GUIDE.md` → "Query Parameters"

### "I'm getting an error, what do I do?"
→ Read: `QUICK_START.md` → "Troubleshooting"
→ OR `POSTMAN_COLLECTION_GUIDE.md` → "Troubleshooting"

---

## ⚡ Pro Tips

1. **Use Collection Runner**
   - Run entire workflows automatically
   - Right-click folder → Run

2. **Watch the Console**
   - View → Show Postman Console
   - See all saved variables in real-time

3. **Multiple Environments**
   - Create separate environments for Dev, Staging, Production
   - Switch between them easily

4. **Enable Query Params**
   - Many query params are included but disabled
   - Enable them in the Params tab as needed

5. **Save Responses**
   - Click "Save Response" to create examples
   - Great for documentation and testing

6. **Use Tests**
   - All endpoints have test scripts
   - They automatically verify and save data

---

## 🐛 Common Issues

### 401 Unauthorized
**Fix:** Run Login endpoint again to refresh token

### Empty UUID in request
**Fix:** Create the parent resource first (e.g., create category before using `{{category_id}}`)

### Variable not saving
**Fix:**
- Verify environment is selected (top-right dropdown)
- Check Postman Console for errors
- Ensure response was successful (200/201)

### Base URL not working
**Fix:**
- Verify API server is running
- Check `base_url` in environment (no trailing slash)
- Test with: `http://localhost:3000` (or your port)

---

## 📖 Learning Path

**Beginner:**
1. Read `POSTMAN_IMPORT_GUIDE.md`
2. Import files
3. Read `QUICK_START.md`
4. Try Login → List Users

**Intermediate:**
1. Complete a workflow from `QUICK_START.md`
2. Browse `API_ENDPOINTS_REFERENCE.md`
3. Try different query parameters

**Advanced:**
1. Read full `POSTMAN_COLLECTION_GUIDE.md`
2. Use Collection Runner
3. Create custom test scripts
4. Set up multiple environments

---

## 🎓 Additional Resources

### Postman Learning
- Official Docs: https://learning.postman.com/
- Video Tutorials: https://www.youtube.com/c/Postman

### API Documentation
- Swagger comments in route files
- Location: `Backend/v1/src/app/api/`

### Collection Features
- Environment variables
- Test scripts (JavaScript)
- Pre-request scripts
- Collection variables
- Dynamic variables

---

## 📝 Summary

This Postman collection provides:

✅ **100+ endpoints** covering all API functionality
✅ **Automatic ID extraction** - no manual copy/paste
✅ **Pre-configured authentication** - login once, use everywhere
✅ **Default payloads** - realistic test data included
✅ **Complete documentation** - 4 guides covering all aspects
✅ **Workflow examples** - real-world usage patterns
✅ **Dynamic variables** - seamless request chaining

**Time to productivity:** 2 minutes
**Manual work eliminated:** 90%+
**Documentation:** Complete

---

## 🚦 Getting Started Now

1. **Import** → See `POSTMAN_IMPORT_GUIDE.md`
2. **Configure** → Set base_url, email, password
3. **Login** → Run Authentication > Login
4. **Explore** → Try any endpoint!

**Need help?** Check the appropriate guide:
- Setup issues → `POSTMAN_IMPORT_GUIDE.md`
- Quick reference → `QUICK_START.md`
- Detailed info → `POSTMAN_COLLECTION_GUIDE.md`
- Endpoint lookup → `API_ENDPOINTS_REFERENCE.md`

---

**Happy Testing! 🚀**

*Last Updated: December 2025*
*Collection Version: 1.0*
*API Coverage: 100+ endpoints*
