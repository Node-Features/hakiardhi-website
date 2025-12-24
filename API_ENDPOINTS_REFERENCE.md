# Digital Ecosystem API - Endpoints Reference

## Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/admin/auth/login` | User login | No |
| POST | `/api/admin/auth/register` | Register new user | No |
| GET | `/api/admin/auth/session` | Get current session | Yes |
| POST | `/api/admin/auth/signout` | Sign out user | Yes |
| POST | `/api/admin/auth/forget_password` | Password reset request | No |

## Users

| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| POST | `/api/admin/users` | Create user | `created_user_id` |
| GET | `/api/admin/users` | List users | `first_user_id` |
| GET | `/api/admin/users/:id` | Get user by ID | - |
| PUT | `/api/admin/users/:id` | Update user | - |
| DELETE | `/api/admin/users/:id` | Delete user | - |

**Query Params:** `page`, `limit`

## Roles & Permissions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/roles` | List roles |
| GET | `/api/admin/roles/:id` | Get role by ID |
| PUT | `/api/admin/roles/:id` | Update role |
| DELETE | `/api/admin/roles/:id` | Delete role |
| GET | `/api/admin/permissions/:id` | Get permission by ID |
| PUT | `/api/admin/permissions/:id` | Update permission |
| DELETE | `/api/admin/permissions/:id` | Delete permission |

## Categories

| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| POST | `/api/admin/categories` | Create category | `category_id` |
| GET | `/api/admin/categories` | List categories | `first_category_id` |
| GET | `/api/admin/categories/:id` | Get category by ID | - |
| PUT | `/api/admin/categories/:id` | Update category | - |
| DELETE | `/api/admin/categories/:id` | Delete category | - |

**Query Params:** `page`, `limit`, `type`

## Geography

### Regions

| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| POST | `/api/admin/regions` | Create region | `region_id` |
| GET | `/api/admin/regions` | List regions | `first_region_id` |
| GET | `/api/admin/regions/:id` | Get region by ID | - |
| PUT | `/api/admin/regions/:id` | Update region | - |
| DELETE | `/api/admin/regions/:id` | Delete region | - |
| GET | `/api/admin/regions/projects_by_region` | Projects grouped by region | - |

**Query Params:** `page`, `limit`, `search`, `include_stats`, `has_projects`

### Districts

| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| POST | `/api/admin/districts` | Create district | `district_id` |
| GET | `/api/admin/districts` | List districts | `first_district_id` |
| GET | `/api/admin/districts/:id` | Get district by ID | - |
| PUT | `/api/admin/districts/:id` | Update district | - |
| DELETE | `/api/admin/districts/:id` | Delete district | - |

**Query Params:** `page`, `limit`, `region_id`

### Villages

| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| POST | `/api/admin/villages` | Create village | `village_id` |
| GET | `/api/admin/villages` | List villages | `first_village_id` |
| GET | `/api/admin/villages/:id` | Get village by ID | - |
| PUT | `/api/admin/villages/:id` | Update village | - |
| DELETE | `/api/admin/villages/:id` | Delete village | - |

**Query Params:** `page`, `limit`, `district_id`

## Cases

| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| POST | `/api/admin/cases` | Create case | `case_id`, `case_reference` |
| GET | `/api/admin/cases` | List cases | `first_case_id` |
| GET | `/api/admin/cases/:id` | Get case by ID | - |
| PUT | `/api/admin/cases/:id` | Update case | - |
| DELETE | `/api/admin/cases/:id` | Delete case | - |
| GET | `/api/admin/cases/stats` | Case statistics | - |

**Query Params:** `page`, `limit`, `status`, `category_id`, `assigned_to`, `submitted_by`, `reference_number`, `search`

**Statuses:** Open, Under Review, Investigation, Legal Action, Mediation, Ongoing, Resolved, Closed

### Case Stages

| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| POST | `/api/admin/cases/:id/stages` | Create stage | `stage_id` |
| GET | `/api/admin/cases/:id/stages` | List stages | - |
| GET | `/api/admin/cases/:id/stages/:stageId` | Get stage by ID | - |
| PUT | `/api/admin/cases/:id/stages/:stageId` | Update stage | - |
| DELETE | `/api/admin/cases/:id/stages/:stageId` | Delete stage | - |

### Stage Attachments

| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| GET | `/api/admin/cases/:id/stages/:stageId/attachments` | List attachments | `attachment_id` |
| DELETE | `/api/admin/cases/:id/stages/:stageId/attachments/:attachmentId` | Delete attachment | - |

## Legal Aid

| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| POST | `/api/admin/legal-aid` | Create legal aid request | `legal_aid_id`, `legal_aid_case_number` |
| GET | `/api/admin/legal-aid` | List requests | `first_legal_aid_id` |
| GET | `/api/admin/legal-aid/:id` | Get request by ID | - |
| PUT | `/api/admin/legal-aid/:id` | Update request | - |
| DELETE | `/api/admin/legal-aid/:id` | Delete request | - |
| POST | `/api/admin/legal-aid/:id/assign` | Assign lawyer to request | - |
| POST | `/api/admin/legal-aid/:id/stage` | Update stage | - |
| GET | `/api/admin/legal-aid/statistics` | Legal aid statistics | - |
| GET | `/api/admin/legal-aid/queue` | Request queue | - |
| GET | `/api/admin/legal-aid/workload` | Lawyer workload | - |

**Query Params:** `page`, `limit`, `status`, `region_id`, `district_id`, `assigned_lawyer_id`, `priority`, `case_type`, `has_active_court_case`, `search`

**Priorities:** Low, Medium, High, Urgent

**Stages:** Intake - Pending Review, Eligibility Check, Document Collection, Case Review, Lawyer Assignment, Ongoing, Closed

## Projects

| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| POST | `/api/admin/projects` | Create project | `project_id` |
| GET | `/api/admin/projects` | List projects | `first_project_id` |
| GET | `/api/admin/projects/:id` | Get project by ID | - |
| PUT | `/api/admin/projects/:id` | Update project | - |
| DELETE | `/api/admin/projects/:id` | Delete project | - |
| GET | `/api/admin/projects/:id/locations` | Project locations | - |
| GET | `/api/admin/projects/:id/files` | Project files | - |
| GET | `/api/admin/projects/:id/beneficiaries/count` | Beneficiaries count | - |

**Query Params:** `page`, `limit`, `status`, `region_id`, `district_id`, `village_id`, `start_date_from`, `start_date_to`

**Statuses:** Planning, Active, Completed, On Hold

## Activities

| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| POST | `/api/admin/activities` | Create activity | `activity_id` |
| GET | `/api/admin/activities` | List activities | `first_activity_id` |
| GET | `/api/admin/activities/:id` | Get activity by ID | - |
| PUT | `/api/admin/activities/:id` | Update activity | - |
| DELETE | `/api/admin/activities/:id` | Delete activity | - |
| GET | `/api/admin/activities/:id/locations` | Activity locations | - |
| GET | `/api/admin/activities/:id/files` | Activity files | - |

**Query Params:** `page`, `limit`, `project_id`, `status`

## Beneficiaries

| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| POST | `/api/admin/beneficiaries` | Create beneficiary | `beneficiary_id` |
| GET | `/api/admin/beneficiaries` | List beneficiaries | `first_beneficiary_id` |
| GET | `/api/admin/beneficiaries/:id` | Get beneficiary by ID | - |
| PUT | `/api/admin/beneficiaries/:id` | Update beneficiary | - |
| DELETE | `/api/admin/beneficiaries/:id` | Delete beneficiary | - |
| GET | `/api/admin/beneficiaries/:id/activities` | Beneficiary activities | - |
| GET | `/api/admin/beneficiaries/statistics` | Beneficiary statistics | - |

**Query Params:** `page`, `limit`, `region_id`, `district_id`, `village_id`, `sex`, `age_group`

## Blogs

| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| POST | `/api/admin/blogs` | Create blog | `blog_id` |
| GET | `/api/admin/blogs` | List blogs | `first_blog_id` |
| GET | `/api/admin/blogs/:id` | Get blog by ID | - |
| PUT | `/api/admin/blogs/:id` | Update blog | - |
| DELETE | `/api/admin/blogs/:id` | Delete blog | - |

**Query Params:** `page`, `limit`, `category_id`, `author_id`, `search`

## Incidents

| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| POST | `/api/admin/incidents` | Create incident | `incident_id` |
| GET | `/api/admin/incidents` | List incidents | `first_incident_id` |
| GET | `/api/admin/incidents/stats` | Incident statistics | - |

**Query Params:** `page`, `limit`, `search`, `region_id`, `district_id`, `village_id`, `category_id`, `reported_by`

## Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/analytics/overview` | Overview dashboard statistics |

## Public Endpoints (No Authentication Required)

### General

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/stats` | Public statistics |
| GET | `/api/overview` | System overview |

### Programs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/programs` | List all programs |
| GET | `/api/public/programs/featured` | Featured programs |
| GET | `/api/public/programs/categories` | Program categories |
| GET | `/api/public/programs/:slug` | Get program by slug |

### Portfolio

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/portfolio` | List portfolio items |
| GET | `/api/public/portfolio/:slug` | Get portfolio item by slug |

### News

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/news` | List news articles |
| GET | `/api/public/news/featured` | Featured news |

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/events/upcoming` | Upcoming events |

## Chatbot Endpoints

### Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chatbot/send` | Send message |
| POST | `/api/chatbot/send-interactive` | Send interactive message |
| POST | `/api/chatbot/send-list` | Send list message |
| POST | `/api/chatbot/webhook` | WhatsApp webhook |
| GET | `/api/chatbot/conversations/:phone_number` | Get conversation history |
| GET | `/api/chatbot/logs` | Chatbot logs |

### Incident Reports (via Chatbot)

| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| POST | `/api/chatbot/incidents/start` | Start incident report | `flow_id` |
| POST | `/api/chatbot/incidents/process-step` | Process incident step | - |
| POST | `/api/chatbot/incidents/submit` | Submit incident | `report_id` |
| POST | `/api/chatbot/incidents/upload-media` | Upload media for incident | - |
| GET | `/api/chatbot/incidents/status/:report_id` | Get report status | - |
| POST | `/api/chatbot/incidents/notify-reporter` | Notify reporter | - |
| POST | `/api/chatbot/incidents/validate` | Validate incident | - |

### Legal Aid (via Chatbot)

| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| POST | `/api/chatbot/legal-aid/start` | Start legal aid request | `flow_id` |
| POST | `/api/chatbot/legal-aid/process-step` | Process legal aid step | - |
| POST | `/api/chatbot/legal-aid/submit` | Submit legal aid request | `request_id` |
| GET | `/api/chatbot/legal-aid/status/:request_id` | Get request status | - |
| POST | `/api/chatbot/legal-aid/cancel` | Cancel legal aid request | - |

### Credibility System

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chatbot/credibility/register-validator` | Register validator |
| POST | `/api/chatbot/credibility/assign-validators` | Assign validators |
| POST | `/api/chatbot/credibility/tier1-validate` | Tier 1 validation |
| POST | `/api/chatbot/credibility/tier2-validate` | Tier 2 validation |
| POST | `/api/chatbot/credibility/tier3-validate` | Tier 3 validation |
| POST | `/api/chatbot/credibility/validator-response` | Validator response |
| POST | `/api/chatbot/credibility/flag-suspicious` | Flag suspicious report |
| POST | `/api/chatbot/credibility/calculate-score` | Calculate credibility score |
| GET | `/api/chatbot/credibility/pending-validations` | Pending validations |
| GET | `/api/chatbot/credibility/validation-history/:report_id` | Validation history |

### GPT Integration

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chatbot/gpt/process` | Process with GPT |
| POST | `/api/chatbot/gpt/classify-intent` | Classify user intent |
| POST | `/api/chatbot/gpt/smart-replies` | Generate smart replies |
| POST | `/api/chatbot/gpt/insights` | Generate insights |
| POST | `/api/chatbot/gpt/translate` | Translate text |
| POST | `/api/chatbot/gpt/summarize-case` | Summarize case |

## Background Jobs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/qstash/worker` | QStash worker endpoint |
| GET | `/api/jobs/messages` | List message jobs |
| GET | `/api/jobs/uploads` | List upload jobs |
| GET | `/api/jobs/uploads/:jobId` | Get upload job status |

---

## Request Headers

All authenticated endpoints require:
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

## Common Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success (GET, PUT, DELETE) |
| 201 | Created (POST) |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized / Invalid Token |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

**Total Endpoints:** 100+
**Categories:** 14
**Authentication:** Bearer Token (JWT)
