# Digital Ecosystem API - Postman Collection Guide

## Overview

This Postman collection provides a comprehensive, dynamic, and reusable way to interact with all Digital Ecosystem API endpoints. It eliminates the need for manual ID copy/paste by using environment variables and automated test scripts to extract and save IDs from API responses.

## Files

1. **Digital_Ecosystem_API.postman_collection.json** - Main API collection with all endpoints
2. **Digital_Ecosystem.postman_environment.json** - Environment variables file

## Features

### 1. Dynamic Variable Extraction

Each endpoint that creates or lists resources has **test scripts** that automatically extract and save IDs to environment variables. This means you never have to manually copy/paste IDs!

**Example:**
- When you create a user, the `user_id` is automatically saved
- When you list users, the first user's ID is saved as `first_user_id`
- These variables can be used in subsequent requests

### 2. Automatic Authentication

The Login endpoint automatically saves:
- `access_token` - Used for Bearer authentication in all protected endpoints
- `refresh_token` - For token refresh
- `user_id` - Current logged-in user ID
- `user_email` - Current user's email
- `user_role_id` - User's role ID

### 3. Pre-configured Default Payloads

All POST/PUT requests include realistic default payloads that use environment variables where appropriate.

## Getting Started

### Step 1: Import the Collection

1. Open Postman
2. Click **Import** button
3. Import both files:
   - `Digital_Ecosystem_API.postman_collection.json`
   - `Digital_Ecosystem.postman_environment.json`

### Step 2: Configure Environment

1. Select **Digital Ecosystem Environment** from the environment dropdown
2. Update the following variables:
   - `base_url` - Your API base URL (default: `http://localhost:3000`)
   - `default_email` - Your admin email for login
   - `default_password` - Your admin password for login

### Step 3: Authenticate

1. Navigate to **Authentication > Login**
2. Click **Send**
3. The test script will automatically save your access token and user details

You're now ready to use all authenticated endpoints!

## How Dynamic Variables Work

### Variable Storage Pattern

Each endpoint follows this pattern:

**When creating a resource:**
```javascript
// Test script automatically runs after response
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set('resource_id', response.data.id);
    console.log('✅ Resource ID saved:', response.data.id);
}
```

**When listing resources:**
```javascript
// Saves the first item's ID for quick access
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.data && response.data.length > 0) {
        pm.environment.set('first_resource_id', response.data[0].id);
    }
}
```

### Using Saved Variables

Variables are referenced using double curly braces: `{{variable_name}}`

**Example:** Get user by ID
```
GET {{base_url}}/api/admin/users/{{created_user_id}}
```

The `{{created_user_id}}` is automatically replaced with the actual UUID from the previous create request.

## Workflow Examples

### Example 1: Complete Case Management Flow

```
1. Authentication > Login
   → Saves: access_token, user_id

2. Categories > Create Category
   → Saves: category_id

3. Cases > Create Case
   → Uses: category_id, user_id
   → Saves: case_id, case_reference

4. Cases > Case Stages > Create Case Stage
   → Uses: case_id
   → Saves: stage_id

5. Cases > Update Case
   → Uses: case_id
   → Updates the case status

6. Cases > Get Case by ID
   → Uses: case_id
   → Retrieves complete case details
```

### Example 2: Geography Setup Flow

```
1. Geography > Regions > Create Region
   → Saves: region_id

2. Geography > Districts > Create District
   → Uses: region_id
   → Saves: district_id

3. Geography > Villages > Create Village
   → Uses: region_id, district_id
   → Saves: village_id

4. Now you can use these IDs in Projects, Incidents, etc.
```

### Example 3: Legal Aid Request Flow

```
1. Authentication > Login
   → Saves: access_token

2. Geography endpoints (if not already created)
   → Saves: region_id, district_id, village_id

3. Legal Aid > Create Legal Aid Request
   → Uses: region_id, district_id, village_id
   → Saves: legal_aid_id, legal_aid_case_number

4. Legal Aid > Assign Lawyer
   → Uses: legal_aid_id, user_id

5. Legal Aid > Update Stage
   → Uses: legal_aid_id
   → Moves request through workflow stages

6. Legal Aid > Get Legal Aid by ID
   → Uses: legal_aid_id
   → Check current status
```

### Example 4: Project and Activities Flow

```
1. Geography setup (Region, District, Village)
   → Saves: region_id, district_id, village_id

2. Projects > Create Project
   → Uses: region_id, district_id, village_id
   → Saves: project_id

3. Activities > Create Activity
   → Uses: project_id
   → Saves: activity_id

4. Beneficiaries > Create Beneficiary
   → Uses: region_id, district_id, village_id
   → Saves: beneficiary_id

5. Projects > Project Beneficiaries Count
   → Uses: project_id
   → Get statistics
```

## Environment Variables Reference

### Authentication Variables
- `access_token` - Bearer token for API authentication
- `refresh_token` - Token for refreshing access
- `user_id` - Current logged-in user ID
- `user_email` - Current user's email
- `user_role_id` - User's role ID

### Resource ID Variables
Each resource type has two ID variables:
- `{resource}_id` - Last created resource
- `first_{resource}_id` - First item from list endpoint

**Examples:**
- User: `created_user_id`, `first_user_id`
- Case: `case_id`, `first_case_id`
- Project: `project_id`, `first_project_id`
- Legal Aid: `legal_aid_id`, `first_legal_aid_id`

### Geography Variables
- `region_id` / `first_region_id`
- `district_id` / `first_district_id`
- `village_id` / `first_village_id`

### Specialized Variables
- `case_reference` - Case reference number
- `legal_aid_case_number` - Legal aid case number
- `stage_id` - Case stage ID
- `attachment_id` - Attachment ID
- `flow_id` - Chatbot flow ID
- `report_id` - Incident report ID
- `request_id` - Legal aid request ID
- `phone_number` - Default phone number for testing

## API Endpoint Categories

### 1. Authentication
- Login
- Register
- Get Session
- Sign Out

### 2. Users (CRUD)
- Create, List, Get, Update, Delete

### 3. Categories (CRUD)
- Create, List, Get, Update, Delete
- Filter by type (blog, incident, etc.)

### 4. Geography
- **Regions:** CRUD + Statistics + Projects by Region
- **Districts:** CRUD + Filter by Region
- **Villages:** CRUD + Filter by District

### 5. Cases (Legal Cases)
- CRUD operations
- Case statistics
- **Case Stages:** CRUD for case workflow stages
- **Stage Attachments:** Manage case documents

### 6. Legal Aid
- CRUD operations
- Assign lawyers
- Update stages (workflow management)
- Statistics and analytics
- Queue management
- Lawyer workload tracking

### 7. Projects
- CRUD operations
- Multi-location support
- Project locations
- Project files
- Beneficiary count tracking

### 8. Activities
- CRUD operations
- Linked to projects
- Activity locations
- Activity files

### 9. Beneficiaries
- CRUD operations
- Link to activities
- Statistics

### 10. Blogs
- CRUD operations
- Search functionality
- Category filtering

### 11. Incidents
- CRUD operations
- Location-based filtering
- Statistics

### 12. Analytics
- Overview analytics dashboard

### 13. Public Endpoints (No Auth Required)
- Public stats
- Programs (list, featured, categories, by slug)
- Portfolio (list, by slug)
- News (list, featured)
- Upcoming events

### 14. Chatbot
- Send messages
- Webhook integration
- Conversation history
- Chatbot logs
- **Incident Reporting:** Start, process steps, submit, check status
- **Legal Aid Requests:** Start, process steps, submit, check status, cancel

## Query Parameters

Most list endpoints support these query parameters:

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

### Filtering
Common filters (varies by endpoint):
- `status` - Filter by status
- `search` - Search in relevant fields
- `category_id` - Filter by category
- `region_id` - Filter by region
- `district_id` - Filter by district
- `village_id` - Filter by village
- `assigned_to` - Filter by assigned user
- `priority` - Filter by priority level

**Note:** Query parameters marked as "disabled" in the collection can be enabled in the Params tab.

## Response Formats

### Success Responses

**Create (201):**
```json
{
  "success": true,
  "message": "Resource created successfully",
  "data": {
    "id": "uuid",
    ...
  }
}
```

**List (200):**
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "total_pages": 10
  }
}
```

### Error Responses

**Validation Error (400):**
```json
{
  "errors": {
    "field_name": "Error message"
  }
}
```

**Authentication Error (401):**
```json
{
  "message": "Unauthorized"
}
```

## Best Practices

### 1. Start with Authentication
Always run the Login endpoint first to get your access token.

### 2. Set Up Geography First
If working with location-based features, create Region → District → Village before creating projects, incidents, etc.

### 3. Create Categories Early
Create necessary categories before creating blogs, cases, or incidents.

### 4. Use List Endpoints for Discovery
Run list endpoints to populate the `first_*_id` variables with existing data.

### 5. Check Console Logs
Test scripts log saved variables to the Postman console. Open console (View > Show Postman Console) to see what's being saved.

### 6. Monitor Environment Variables
Keep the environment variables panel open (click the eye icon) to see current values.

### 7. Reset Variables When Needed
If you want to start fresh, clear the environment variables by clicking "Reset All" in the environment settings.

## Troubleshooting

### Issue: 401 Unauthorized

**Solution:**
1. Run **Authentication > Login** again
2. Check that `access_token` is saved in environment
3. Verify the token hasn't expired

### Issue: 400 Bad Request with UUID errors

**Solution:**
1. Check that referenced IDs exist (e.g., `category_id`, `region_id`)
2. Run the create endpoints for missing resources first
3. Verify environment variables are populated (click eye icon)

### Issue: Variables not saving

**Solution:**
1. Ensure you have the **Digital Ecosystem Environment** selected
2. Check the test script ran successfully in the response test results
3. Look for errors in the Postman Console

### Issue: Request using empty UUID

**Solution:**
1. Run the parent create endpoint first (e.g., create region before using `{{region_id}}`)
2. Check if the variable is actually saved in the environment
3. Manually set the variable if needed for testing

## Advanced Usage

### Chaining Requests

Use Postman's **Collection Runner** to execute entire workflows:

1. Click on a folder (e.g., "Cases")
2. Click **Run** button
3. Select the environment
4. Click **Run {Folder Name}**

This will execute all requests in sequence, with variables being saved and used automatically.

### Multiple Environments

Create multiple environments for different stages:

- **Development** - `http://localhost:3000`
- **Staging** - `https://staging-api.example.com`
- **Production** - `https://api.example.com`

Simply switch environments in the dropdown to test against different servers.

### Custom Test Scripts

You can add custom test scripts to any request:

```javascript
pm.test("Response time is less than 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});

pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
```

## API Documentation

For detailed API specifications, refer to the Swagger documentation comments in the route files at:
`Backend/v1/src/app/api/`

## Support

If you encounter issues with the collection:

1. Check the Postman Console for errors
2. Verify environment variables are properly set
3. Ensure your API server is running
4. Check the response body for error messages

## Collection Maintenance

When new endpoints are added to the API:

1. Add the new request to the appropriate folder
2. Add test scripts to extract relevant IDs
3. Update environment variables if new ones are needed
4. Update this guide with the new workflow

---

**Last Updated:** December 2025
**Version:** 1.0
**Collection Coverage:** 100+ endpoints across 14 categories
