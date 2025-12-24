# Digital Ecosystem API - Complete Endpoints List

## Summary Statistics

**Total Endpoints:** 150+
**Categories:** 18
**Public Endpoints:** 50+
**Admin Endpoints:** 70+
**Chatbot Endpoints:** 30+

---

## Public Endpoints (No Authentication Required)

### General & Statistics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/stats` | Public portal statistics |
| GET | `/api/overview` | System overview |

### Programs
| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| GET | `/api/public/programs` | List all programs | - |
| GET | `/api/public/programs/featured` | Featured programs | - |
| GET | `/api/public/programs/categories` | Program categories | - |
| GET | `/api/public/programs/:slug` | Get program by slug | - |

### Publications **[NEW]**
| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| GET | `/api/public/publications` | List publications with filters | `publication_id` |
| GET | `/api/public/publications/:id` | Get publication by ID | - |
| GET | `/api/public/publications/:id/download` | Download publication PDF | - |

**Query Parameters:**
- `page`, `limit` - Pagination
- `search` - Search in title/abstract
- `type` - Filter by type (report, policy, research, etc.)
- `topic` - Filter by topic
- `year` - Filter by publication year
- `featured` - Show only featured publications
- `sort` - Sort field (publication_date, views, downloads)
- `order` - Sort order (asc, desc)

### Research **[NEW]**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/research/stats` | Research statistics |
| GET | `/api/public/research/areas` | Research focus areas |
| GET | `/api/public/research/partners` | Research partners |

### Legal Aid (Public) **[NEW]**
| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| GET | `/api/public/legal-aid/stats` | Legal aid statistics | - |
| POST | `/api/public/legal-aid/submit` | Submit legal aid request | `public_case_reference` |

**Submit Payload:**
```json
{
  "case_type": "Land Dispute",
  "description": "Description of legal issue",
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+255712345678",
  "location": "Region/District"
}
```

### LRM (Land Rights Monitors) **[NEW]**
| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| GET | `/api/public/lrm/regions` | LRM active regions | - |
| GET | `/api/public/lrm/stats` | LRM statistics | - |
| GET | `/api/public/lrm/roles` | Available LRM roles | - |
| POST | `/api/public/lrm/apply` | Apply to become LRM | `lrm_application_id` |

**Application Payload:**
```json
{
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+255722334455",
  "region_id": "uuid",
  "district_id": "uuid",
  "village_id": "uuid",
  "motivation": "Why I want to be an LRM",
  "experience": "Relevant experience",
  "education": "Education level"
}
```

### About **[NEW]**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/about/organization` | Organization information |
| GET | `/api/public/about/team` | Team members |
| GET | `/api/public/about/milestones` | Organization milestones |

### Contact **[NEW]**
| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| GET | `/api/public/contact/offices` | Office locations | - |
| POST | `/api/public/contact/submit` | Submit contact form | `contact_ticket_id` |

**Contact Form Payload:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+255712345678",
  "subject": "Inquiry about services",
  "message": "Message content",
  "category": "general"
}
```

### Newsletter **[NEW]**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/public/newsletter/subscribe` | Subscribe to newsletter |

**Subscribe Payload:**
```json
{
  "email": "subscriber@example.com",
  "name": "Subscriber Name",
  "preferences": ["news", "events", "reports"]
}
```

### FAQs **[NEW]**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/faqs` | List FAQs |

**Query Parameters:**
- `category` - Filter by category
- `search` - Search in questions/answers
- `featured` - Show only featured FAQs

### Testimonials **[NEW]**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/testimonials` | List testimonials |

**Query Parameters:**
- `featured` - Show only featured testimonials (limit 3)

### Partners **[NEW]**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/partners` | List organization partners |

### Gallery **[NEW]**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/gallery` | Photo/video gallery |

### Donate **[NEW]**
| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| GET | `/api/public/donate/campaigns` | Active donation campaigns | `campaign_id` |
| GET | `/api/public/donate/options` | Donation options | - |
| GET | `/api/public/donate/impact` | Donation impact stories | - |
| POST | `/api/public/donate/process` | Process donation | - |

**Donation Payload:**
```json
{
  "campaign_id": "uuid",
  "amount": 50000,
  "donor_name": "John Doe",
  "donor_email": "donor@example.com",
  "payment_method": "mobile_money",
  "phone_number": "+255712345678"
}
```

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
| GET | `/api/public/news/:slug` | Get news by slug **[ADDED]** |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/events/upcoming` | Upcoming events |

---

## Admin Endpoints (Authentication Required)

### Authentication
| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| POST | `/api/admin/auth/login` | User login | `access_token`, `user_id` |
| POST | `/api/admin/auth/register` | Register user | `new_user_id` |
| GET | `/api/admin/auth/session` | Get current session | - |
| POST | `/api/admin/auth/signout` | Sign out | - |
| POST | `/api/admin/auth/forget_password` | Password reset | - |

### Users
| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| POST | `/api/admin/users` | Create user | `created_user_id` |
| GET | `/api/admin/users` | List users | `first_user_id` |
| GET | `/api/admin/users/:id` | Get user by ID | - |
| PUT | `/api/admin/users/:id` | Update user | - |
| DELETE | `/api/admin/users/:id` | Delete user | - |

### Roles
| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| POST | `/api/admin/roles` | Create role | `role_id` |
| GET | `/api/admin/roles` | List roles | `first_role_id` |
| GET | `/api/admin/roles/:id` | Get role by ID | - |
| PUT | `/api/admin/roles/:id` | Update role | - |
| DELETE | `/api/admin/roles/:id` | Delete role | - |

### Permissions **[NEW]**
| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| POST | `/api/admin/permissions` | Create permission | `permission_id` |
| GET | `/api/admin/permissions` | List permissions | `first_permission_id` |
| GET | `/api/admin/permissions/:id` | Get permission by ID | - |
| PUT | `/api/admin/permissions/:id` | Update permission | - |
| DELETE | `/api/admin/permissions/:id` | Delete permission | - |

### Categories
| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| POST | `/api/admin/categories` | Create category | `category_id` |
| GET | `/api/admin/categories` | List categories | `first_category_id` |
| GET | `/api/admin/categories/:id` | Get category by ID | - |
| PUT | `/api/admin/categories/:id` | Update category | - |
| DELETE | `/api/admin/categories/:id` | Delete category | - |

### Geography - Regions
| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| POST | `/api/admin/regions` | Create region | `region_id` |
| GET | `/api/admin/regions` | List regions | `first_region_id` |
| GET | `/api/admin/regions/:id` | Get region by ID | - |
| PUT | `/api/admin/regions/:id` | Update region | - |
| DELETE | `/api/admin/regions/:id` | Delete region | - |
| GET | `/api/admin/regions/projects_by_region` | Projects by region | - |

### Geography - Districts
| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| POST | `/api/admin/districts` | Create district | `district_id` |
| GET | `/api/admin/districts` | List districts | `first_district_id` |
| GET | `/api/admin/districts/:id` | Get district by ID | - |
| PUT | `/api/admin/districts/:id` | Update district | - |
| DELETE | `/api/admin/districts/:id` | Delete district | - |

### Geography - Villages
| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| POST | `/api/admin/villages` | Create village | `village_id` |
| GET | `/api/admin/villages` | List villages | `first_village_id` |
| GET | `/api/admin/villages/:id` | Get village by ID | - |
| PUT | `/api/admin/villages/:id` | Update village | - |
| DELETE | `/api/admin/villages/:id` | Delete village | - |

### Cases
| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| POST | `/api/admin/cases` | Create case | `case_id`, `case_reference` |
| GET | `/api/admin/cases` | List cases | `first_case_id` |
| GET | `/api/admin/cases/:id` | Get case by ID | - |
| PUT | `/api/admin/cases/:id` | Update case | - |
| DELETE | `/api/admin/cases/:id` | Delete case | - |
| GET | `/api/admin/cases/stats` | Case statistics | - |

### Case Stages
| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| POST | `/api/admin/cases/:id/stages` | Create stage | `stage_id` |
| GET | `/api/admin/cases/:id/stages` | List stages | - |
| GET | `/api/admin/cases/:id/stages/:stageId` | Get stage by ID | - |
| PUT | `/api/admin/cases/:id/stages/:stageId` | Update stage | - |
| DELETE | `/api/admin/cases/:id/stages/:stageId` | Delete stage | - |

### Case Stage Attachments
| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| GET | `/api/admin/cases/:id/stages/:stageId/attachments` | List attachments | `attachment_id` |
| DELETE | `/api/admin/cases/:id/stages/:stageId/attachments/:attachmentId` | Delete attachment | - |

### Legal Aid
| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| POST | `/api/admin/legal-aid` | Create request | `legal_aid_id` |
| GET | `/api/admin/legal-aid` | List requests | `first_legal_aid_id` |
| GET | `/api/admin/legal-aid/:id` | Get request by ID | - |
| PUT | `/api/admin/legal-aid/:id` | Update request | - |
| DELETE | `/api/admin/legal-aid/:id` | Delete request | - |
| POST | `/api/admin/legal-aid/:id/assign` | Assign lawyer | - |
| POST | `/api/admin/legal-aid/:id/stage` | Update stage | - |
| GET | `/api/admin/legal-aid/statistics` | Statistics | - |
| GET | `/api/admin/legal-aid/queue` | Request queue | - |
| GET | `/api/admin/legal-aid/workload` | Lawyer workload | - |

### Projects
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

### Activities
| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| POST | `/api/admin/activities` | Create activity | `activity_id` |
| GET | `/api/admin/activities` | List activities | `first_activity_id` |
| GET | `/api/admin/activities/:id` | Get activity by ID | - |
| PUT | `/api/admin/activities/:id` | Update activity | - |
| DELETE | `/api/admin/activities/:id` | Delete activity | - |
| GET | `/api/admin/activities/:id/locations` | Activity locations | - |
| GET | `/api/admin/activities/:id/files` | Activity files | - |
| GET | `/api/admin/activities/:id/beneficiaries` | Activity beneficiaries **[NEW]** | - |
| GET | `/api/admin/activities/:id/assignments` | Activity assignments **[NEW]** | - |

### Beneficiaries
| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| POST | `/api/admin/beneficiaries` | Create beneficiary | `beneficiary_id` |
| GET | `/api/admin/beneficiaries` | List beneficiaries | `first_beneficiary_id` |
| GET | `/api/admin/beneficiaries/:id` | Get beneficiary by ID | - |
| PUT | `/api/admin/beneficiaries/:id` | Update beneficiary | - |
| DELETE | `/api/admin/beneficiaries/:id` | Delete beneficiary | - |
| GET | `/api/admin/beneficiaries/:id/activities` | Beneficiary activities | - |
| GET | `/api/admin/beneficiaries/statistics` | Statistics | - |

### Blogs
| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| POST | `/api/admin/blogs` | Create blog | `blog_id` |
| GET | `/api/admin/blogs` | List blogs | `first_blog_id` |
| GET | `/api/admin/blogs/:id` | Get blog by ID | - |
| PUT | `/api/admin/blogs/:id` | Update blog | - |
| DELETE | `/api/admin/blogs/:id` | Delete blog | - |

### Incidents
| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| POST | `/api/admin/incidents` | Create incident | `incident_id` |
| GET | `/api/admin/incidents` | List incidents | `first_incident_id` |
| GET | `/api/admin/incidents/:id` | Get incident by ID **[NEW]** | - |
| PUT | `/api/admin/incidents/:id` | Update incident **[NEW]** | - |
| DELETE | `/api/admin/incidents/:id` | Delete incident **[NEW]** | - |
| GET | `/api/admin/incidents/stats` | Incident statistics | - |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/analytics/overview` | Overview dashboard |

### Campaigns **[NEW]**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/campaigns/send` | Send campaign message |

---

## Chatbot Endpoints

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chatbot/send` | Send message |
| POST | `/api/chatbot/send-interactive` | Send interactive message |
| POST | `/api/chatbot/send-list` | Send list message |
| POST | `/api/chatbot/webhook` | WhatsApp webhook |
| GET | `/api/chatbot/conversations/:phone_number` | Get conversation |
| GET | `/api/chatbot/logs` | Chatbot logs |

### Incident Reports (Chatbot)
| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| POST | `/api/chatbot/incidents/start` | Start incident report | `flow_id` |
| POST | `/api/chatbot/incidents/process-step` | Process step | - |
| POST | `/api/chatbot/incidents/submit` | Submit incident | `report_id` |
| POST | `/api/chatbot/incidents/upload-media` | Upload media | - |
| GET | `/api/chatbot/incidents/status/:report_id` | Get report status | - |
| POST | `/api/chatbot/incidents/notify-reporter` | Notify reporter | - |
| POST | `/api/chatbot/incidents/validate` | Validate incident | - |

### Legal Aid (Chatbot)
| Method | Endpoint | Description | Variables Saved |
|--------|----------|-------------|-----------------|
| POST | `/api/chatbot/legal-aid/start` | Start request | `flow_id` |
| POST | `/api/chatbot/legal-aid/process-step` | Process step | - |
| POST | `/api/chatbot/legal-aid/submit` | Submit request | `request_id` |
| GET | `/api/chatbot/legal-aid/status/:request_id` | Get status | - |
| POST | `/api/chatbot/legal-aid/cancel` | Cancel request | - |

### Credibility System
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chatbot/credibility/register-validator` | Register validator |
| POST | `/api/chatbot/credibility/assign-validators` | Assign validators |
| POST | `/api/chatbot/credibility/tier1-validate` | Tier 1 validation |
| POST | `/api/chatbot/credibility/tier2-validate` | Tier 2 validation |
| POST | `/api/chatbot/credibility/tier3-validate` | Tier 3 validation |
| POST | `/api/chatbot/credibility/validator-response` | Validator response |
| POST | `/api/chatbot/credibility/flag-suspicious` | Flag suspicious |
| POST | `/api/chatbot/credibility/calculate-score` | Calculate score |
| GET | `/api/chatbot/credibility/pending-validations` | Pending validations |
| GET | `/api/chatbot/credibility/validation-history/:report_id` | Validation history |

### GPT Integration
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chatbot/gpt/process` | Process with GPT |
| POST | `/api/chatbot/gpt/classify-intent` | Classify intent |
| POST | `/api/chatbot/gpt/smart-replies` | Generate smart replies |
| POST | `/api/chatbot/gpt/insights` | Generate insights |
| POST | `/api/chatbot/gpt/translate` | Translate text |
| POST | `/api/chatbot/gpt/summarize-case` | Summarize case |

### Background Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/qstash/worker` | QStash worker |
| GET | `/api/jobs/messages` | List message jobs |
| GET | `/api/jobs/uploads` | List upload jobs |
| GET | `/api/jobs/uploads/:jobId` | Get upload job status |

---

## New Variables Added to Environment

### Public Endpoints
- `publication_id` - Last viewed publication
- `public_case_reference` - Public legal aid case reference
- `lrm_application_id` - LRM application ID
- `contact_ticket_id` - Contact form ticket ID
- `campaign_id` - Donation campaign ID
- `news_slug` - News article slug

### Admin Endpoints
- `permission_id` - Last created permission
- `first_permission_id` - First permission from list

---

## Summary of Missing Endpoints Added

### Public Endpoints (30+ new)
✅ Publications (list, get, download) - 3 endpoints
✅ Research (stats, areas, partners) - 3 endpoints
✅ Legal Aid Public (stats, submit) - 2 endpoints
✅ LRM (regions, stats, roles, apply) - 4 endpoints
✅ About (organization, team, milestones) - 3 endpoints
✅ Contact (offices, submit) - 2 endpoints
✅ Newsletter (subscribe) - 1 endpoint
✅ FAQs - 1 endpoint
✅ Testimonials - 1 endpoint
✅ Partners - 1 endpoint
✅ Gallery - 1 endpoint
✅ Donate (campaigns, options, impact, process) - 4 endpoints
✅ News by slug - 1 endpoint

### Admin Endpoints (10+ new)
✅ Permissions (full CRUD) - 5 endpoints
✅ Campaigns (send) - 1 endpoint
✅ Activity beneficiaries - 1 endpoint
✅ Activity assignments - 1 endpoint
✅ Incident by ID (get, update, delete) - 3 endpoints

---

**Total New Endpoints:** 40+
**Updated Collections:** 2 files created
**Updated Environment:** New variables added

---

## How to Use

1. **Import Main Collection** - `Digital_Ecosystem_API.postman_collection.json`
2. **Import Missing Endpoints** - `Digital_Ecosystem_API_MISSING_ENDPOINTS.postman_collection.json`
3. **Import Updated Environment** - `Digital_Ecosystem.postman_environment_UPDATED.json`

All endpoints include test scripts that automatically extract and save IDs!
