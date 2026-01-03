/**
 * Generic API response wrapper
 */
export interface APIResponse<T = unknown> {
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    total_pages?: number; // Support snake_case from API
  };
  summary?: unknown; // Optional summary data
}

/**
 * Error response structure
 */
export interface APIErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  details?: Record<string, string[]>; // Field-specific validation errors
}

// ============================================
// Projects Module
// ============================================

export interface CreateProjectRequest {
  title: string;
  description?: string;
  start_date: string; // ISO date string
  end_date: string;
  status?: 'Pending' | 'Active' | 'Completed' | 'On Hold';
}

export type UpdateProjectRequest = Partial<CreateProjectRequest>;

export interface ProjectLocation {
  id: string;
  region_id: string;
  district_id: string;
  village_id: string;
  region?: Region;
  district?: District;
  village?: Village;
}

export interface ProjectFile {
  id: string;
  file_url: string;
  name: string;
  file_type: string;
  description: string;
  created_at: string;
}

export interface ProjectResponse {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: 'Pending' | 'Active' | 'Completed' | 'On Hold';
  created_at: string;
  updated_at: string;
  locations?: ProjectLocation[];
  files?: ProjectFile[];
}

// ============================================
// Activities Module
// ============================================

export interface CreateActivityRequest {
  name: string;
  project_id: string;
  category_id?: string;
  start_date: string;
  end_date?: string;
  target_outcome?: number;
  status?: 'Pending' | 'Ongoing' | 'Completed' | 'Rescheduled' | 'Cancelled';
  locations?: Array<{
    region_id: string;
    district_id: string;
    village_id: string;
    start_date: string;
    end_date: string;
  }>;
}

export type UpdateActivityRequest = Partial<CreateActivityRequest>;

export interface ActivityResponse {
  id: string;
  name: string;
  project_id: string;
  category_id: string;
  start_date: string;
  end_date: string;
  status: string;
  target_outcome: number;
  actual_outcome: number;
  success_rate: number | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityAssignment {
  id: string;
  activity_id: string;
  assigned_to: string;
  due_date: string;
  status: string;
  project_location_id?: string;
}

// ============================================
// Legal Aid Module
// ============================================

export type LegalAidStatus = 'Pending' | 'Assigned' | 'In Progress' | 'Completed' | 'Closed';
export type LegalAidPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface CreateLegalAidRequest {
  title: string;
  description: string;
  beneficiary_id: string;
  category_id?: string;
  priority?: LegalAidPriority;
  status?: LegalAidStatus;
}

export type UpdateLegalAidRequest = Partial<CreateLegalAidRequest> & {
  lawyer_id?: string;
};

export interface LegalAidResponse {
  id: string;
  title: string;
  description: string;
  beneficiary_id: string;
  lawyer_id?: string | null;
  category_id?: string | null;
  status: LegalAidStatus;
  priority: LegalAidPriority;
  created_at: string;
  updated_at: string;
}

// ============================================
// Cases Module
// ============================================

export type CaseStatus = 'Open' | 'Ongoing' | 'Referred' | 'Completed' | 'Cancelled' | 'Resolved' | 'Won' | 'Closed' | 'In Progress';

export interface CreateCaseRequest {
  title: string;
  description: string;
  category_id: string;
  submitted_by: string; // Required - UUID of beneficiary
  assigned_to?: string; // Optional - UUID of user
  status?: CaseStatus;
  reference_number?: string; // Auto-generated on backend, don't send on create
}

export type UpdateCaseRequest = Partial<CreateCaseRequest>;

export interface CaseResponse {
  id: string;
  title: string;
  reference_number: string;
  submitted_by: string | null;
  assigned_to: string | null;
  category_id: string;
  description: string;
  status: CaseStatus;
  created_at: string;
  updated_at: string;
  stages?: CaseStage[];
  // Joined data from API (can be array or object from Supabase)
  categories?: {
    id: string;
    name: string;
  } | Array<{
    id: string;
    name: string;
  }>;
  // Beneficiary who submitted the case
  beneficiaries?: {
    id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
  } | Array<{
    id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
  }>;
  assigned_user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | Array<{
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  }>;
  // Additional stats
  stages_count?: number;
  attachments_count?: number;
  case_stages?: CaseStage[];
}

export interface StageAttachment {
  id: string;
  stage_id: string;
  case_id: string;
  file_url: string;
  file_name: string;
  description: string | null;
  file_type: string;
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'processed';
  created_at: string;
  updated_at: string;
}

export interface CaseStage {
  id: string;
  case_id: string;
  name: string;
  description: string;
  status: 'Ongoing' | 'Resolved' | 'Blocked';
  next_stage: string | null;
  created_at: string;
  updated_at: string;
  stage_attachments?: StageAttachment[];
}

// ============================================
// Incidents Module
// ============================================

export interface CreateIncidentRequest {
  name: string;
  description: string;
  region_id: string;
  district_id: string;
  village_id: string;
  category_id: string;
  reported_by?: string;
}

export interface UpdateIncidentRequest extends Partial<CreateIncidentRequest> {
  status?: 'Verification Pending' | 'Verified' | 'Under Investigation' | 'Resolved' | 'Rejected';
}

export interface IncidentResponse {
  id: string;
  name: string;
  description: string;
  region_id: string;
  district_id: string;
  village_id: string;
  category_id: string;
  reported_by: string | null;
  status: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  resolution_details?: string;
  resolution_date?: string;
  resolution_type?: string;
  created_at: string;
  updated_at: string;
  // Joined data from API (can be array or object from Supabase)
  regions?: {
    id: string;
    name: string;
  } | Array<{ id: string; name: string }>;
  districts?: {
    id: string;
    name: string;
  } | Array<{ id: string; name: string }>;
  villages?: {
    id: string;
    name: string;
  } | Array<{ id: string; name: string }>;
  categories?: {
    id: string;
    name: string;
    type?: string;
    description?: string;
  } | Array<{
    id: string;
    name: string;
    type?: string;
    description?: string;
  }>;
  beneficiaries?: {
    id: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
  } | Array<{
    id: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
  }>;
  incident_files?: Array<{
    id: string;
    file_url: string;
    name: string;
    description?: string;
    created_at: string;
  }>;
}

// Incident Progress Steps
export type ProgressStepType = 'investigation' | 'resolution';
export type ProgressStepStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

export interface CreateProgressStepRequest {
  incident_id: string;
  step_type: ProgressStepType;
  name: string;
  description?: string;
  assigned_to?: string;
  due_date?: string;
  status?: ProgressStepStatus;
}

export interface UpdateProgressStepRequest extends Partial<CreateProgressStepRequest> {
  started_at?: string;
  completed_at?: string;
}

export interface IncidentProgressStep {
  id: string;
  incident_id: string;
  step_type: ProgressStepType;
  name: string;
  description: string | null;
  status: ProgressStepStatus;
  assigned_to: string | null;
  assigned_to_name: string | null;
  due_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  evidence_files: string[];
  created_at: string;
  updated_at: string;
}

// Incident Reminders
export type ReminderType = 'site_visit' | 'follow_up' | 'deadline' | 'report' | 'other';
export type ReminderStatus = 'upcoming' | 'overdue' | 'completed' | 'dismissed';
export type NotificationMethod = 'email' | 'sms' | 'in_app' | 'all';

export interface CreateReminderRequest {
  incident_id: string;
  title: string;
  description?: string;
  reminder_type: ReminderType;
  due_date: string;
  notification_method: NotificationMethod;
  days_before_notification?: number;
}

export interface UpdateReminderRequest extends Partial<CreateReminderRequest> {
  status?: ReminderStatus;
}

export interface IncidentReminder {
  id: string;
  incident_id: string;
  title: string;
  description: string | null;
  reminder_type: ReminderType;
  due_date: string;
  notification_method: NotificationMethod;
  days_before_notification: number;
  status: ReminderStatus;
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

// ============================================
// Beneficiaries Module
// ============================================

export interface CreateBeneficiaryRequest {
  first_name: string;
  last_name: string;
  sex?: 'male' | 'female' | 'other';
  role?: string;
  age_group?: string;
  is_pwd?: boolean;
  phone_number?: string;
  image_url?: string;
  photo_consent?: boolean;
}

export interface UpdateBeneficiaryRequest extends Partial<CreateBeneficiaryRequest> {
  status?: 'Active' | 'Inactive' | 'Archived';
}

export interface BeneficiaryResponse {
  id: string;
  first_name: string;
  last_name: string;
  sex?: 'male' | 'female' | 'other';
  role?: string;
  age_group?: string;
  is_pwd: boolean;
  phone_number?: string;
  image_url?: string;
  photo_consent: boolean;
  status: 'Active' | 'Inactive' | 'Archived';
  region_id?: string;
  district_id?: string;
  village_id?: string;
  regions?: { id: string; name: string };
  districts?: { id: string; name: string };
  villages?: { id: string; name: string };
  created_at: string;
  updated_at: string;
  activities_count?: number;
}

// ============================================
// Users & Auth Module
// ============================================

export interface SignInRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface SignUpRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number?: string;
  sex?: 'male' | 'female' | 'other';
  age_group?: string;
  photo_consent: boolean;
  role_id: string;
}

export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number?: string;
  sex?: 'male' | 'female' | 'other';
  age_group?: string;
  photo_consent?: boolean;
  role_id: string;
  status?: 'Active' | 'Inactive' | 'Suspended';
}

export interface UpdateUserRequest {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  sex?: 'male' | 'female' | 'other';
  age_group?: string;
  role_id?: string;
  is_active?: boolean;
  status?: 'Active' | 'Inactive' | 'Suspended';
}

export interface UserResponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  sex: string | null;
  age_group: string | null;
  photo_consent: boolean;
  image_url?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  role?: string; // Role name as string (from session/me endpoints)
  roles?: string[]; // All user roles (array of role names)
  role_id?: string; // Role ID if included
  permissions?: string[]; // User permissions (array of permission names)
}

export interface AuthResponse {
  user: UserResponse;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: string;
  };
}

// ============================================
// Location Hierarchy
// ============================================

export interface Region {
  id: string;
  name: string;
}

export interface District {
  id: string;
  name: string;
  region_id: string;
}

export interface Village {
  id: string;
  name: string;
  district_id: string;
}

// ============================================
// Categories
// ============================================

export interface Category {
  id: string;
  name: string;
  type: string;
  description: string | null;
}

// ============================================
// Upload Jobs
// ============================================

export interface UploadJobResponse {
  id: string;
  job_type: string;
  total_files: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  success_count: number;
  failed_count: number;
  created_at: string;
  completed_at: string | null;
}

// ============================================
// Roles Module
// ============================================

export interface RoleResponse {
  id: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  permissions?: PermissionResponse[];
  users_count?: number;
  permissions_count?: number;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permission_ids?: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
}

export interface RoleWithPermissions extends RoleResponse {
  permissions: PermissionResponse[];
}

export interface RoleWithUsers extends RoleResponse {
  users: UserResponse[];
}

// ============================================
// Permissions Module
// ============================================

export interface PermissionResponse {
  id: string;
  name: string;
  description: string | null;
  created_at?: string;
  updated_at?: string;
  roles_count?: number;
}

export interface CreatePermissionRequest {
  name: string;
  description?: string;
}

export interface UpdatePermissionRequest {
  name?: string;
  description?: string;
}

export interface PermissionWithRoles extends PermissionResponse {
  roles: RoleResponse[];
}

// ============================================
// User Administration
// ============================================

export interface UserWithRole extends UserResponse {
  // Note: roles is already defined in UserResponse as string[]
  // This interface is for backward compatibility only
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  byRole: Record<string, number>;
  recentlyAdded: number;
}

export interface AssignRoleRequest {
  user_id: string;
  role_id: string;
}

export interface AssignPermissionsRequest {
  role_id: string;
  permission_ids: string[];
}

export interface ChangePasswordRequest {
  user_id: string;
  new_password: string;
  confirm_password: string;
}

// ============================================
// Content Management Module
// ============================================

export type ContentType = 'blog' | 'publication' | 'faq' | 'page';

export interface ContentResponse {
  id: string;
  content_type: ContentType;
  slug?: string;
  title: string;
  content: string;
  meta_description?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  // Additional fields for specific content types
  type?: string; // for blogs and publications
  cover_image?: string;
  is_featured?: boolean;
  authors?: any[];
  publication_date?: string;
  download_url?: string;
  category?: string;
  page_type?: string;
  icon_name?: string;
  [key: string]: any; // Allow other fields
}

export interface CreateContentRequest {
  content_type: ContentType;
  // Common fields
  title?: string;
  content?: string;
  meta_description?: string;
  published?: boolean;
  // Blog specific
  slug?: string;
  excerpt?: string;
  type?: string;
  cover_image?: string;
  is_featured?: boolean;
  // Publication specific
  abstract?: string;
  authors?: any[];
  publication_date?: string;
  download_url?: string;
  topics?: string[];
  keywords?: string[];
  language?: string;
  pages?: number;
  doi?: string;
  isbn?: string;
  // FAQ specific
  question?: string;
  response?: string;
  category?: string;
  // Page specific
  page_type?: string;
  icon_name?: string;
  display_order?: number;
}

export interface UpdateContentRequest extends Partial<CreateContentRequest> {
  content_type: ContentType;
}
