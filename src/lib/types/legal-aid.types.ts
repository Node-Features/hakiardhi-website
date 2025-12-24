// Legal Aid specific types

export type LegalAidStage =
  | 'Intake - Pending Review'
  | 'Intake - Under Review'
  | 'Queued for Assignment'
  | 'Assigned to Legal Advisor'
  | 'Document Assessment'
  | 'Document Preparation'
  | 'Document Collection'
  | 'Legal Advice Provided'
  | 'Mediation Support'
  | 'Court Document Submission'
  | 'Follow-up Support'
  | 'Completed - Documents Provided'
  | 'Completed - Case Resolved'
  | 'Completed - Referred to Litigation'
  | 'Completed - Withdrawn'
  | 'Closed - Unable to Assist';

export type LegalAidPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type CaseType =
  | 'Land Dispute'
  | 'Boundary Conflict'
  | 'Inheritance Dispute'
  | 'Eviction'
  | 'Documentation'
  | 'Other';

export type Gender = 'Male' | 'Female' | 'Other';

export type MaritalStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Other';

export type EducationLevel =
  | 'None'
  | 'Primary'
  | 'Secondary'
  | 'Vocational'
  | 'Tertiary'
  | 'University';

export type IncomeLevel = 'Low' | 'Medium' | 'High';

export type DisabilityStatus = 'None' | 'Physical' | 'Visual' | 'Hearing' | 'Mental' | 'Multiple';

export type ResidentialStatus = 'Owner' | 'Tenant' | 'Family Land' | 'Other';

export type IdType = 'National ID' | 'Voter ID' | 'Passport' | 'Birth Certificate' | 'Other';

export interface BeneficiaryDetails {
  age: number;
  gender: Gender;
  occupation: string;
  education_level: EducationLevel;
  income_level: IncomeLevel;
  disability_status: DisabilityStatus;
  marital_status: MaritalStatus;
  number_of_dependents: number;
  id_number?: string;
  id_type?: IdType;
}

export interface DemographicDetails {
  region_id: string;
  district_id: string;
  ward: string;
  village: string;
  street?: string;
  residential_status: ResidentialStatus;
  years_in_residence?: number;
  tribe?: string;
  religion?: string;
  language_preference: 'Swahili' | 'English';
}

export interface CaseDetails {
  case_type: CaseType;
  case_category: string;
  case_description: string;
  land_size?: string;
  land_location?: string;
  land_use?: string;
  title_deed_available: boolean;
  title_deed_number?: string;
  dispute_duration?: string;
  previous_attempts_at_resolution?: string;
  opposing_party?: string;
  witnesses_available: boolean;
  evidence_documents?: string[];
  court_documents_needed?: string[];
  has_active_court_case: boolean;
  court_case_number?: string;
  court_name?: string;
  next_court_date?: string;
  urgency_level: 'Low' | 'Medium' | 'High' | 'Urgent';
  estimated_loss_value?: string;
}

export interface LegalAidRequest {
  id: string;
  case_number: string; // HAK-YYYY-NNNN
  name: string;
  phone_number: string;
  email?: string;
  beneficiary_details: BeneficiaryDetails;
  demographic_details: DemographicDetails;
  case_details: CaseDetails;
  current_stage: LegalAidStage;
  priority: LegalAidPriority;
  assigned_lawyer_id?: string;
  queue_position?: number;
  preferred_contact_method: 'Phone' | 'Email' | 'WhatsApp' | 'SMS';
  preferred_language: 'Swahili' | 'English';
  consent_to_data_processing: boolean;
  how_did_you_hear_about_us?: string;
  created_at: Date;
  updated_at: Date;
  assigned_at?: Date;
}

export interface StageHistory {
  stage: LegalAidStage;
  entered_at: Date;
  exited_at?: Date;
  duration_hours?: number;
  notes?: string;
  current: boolean;
}

export interface DocumentProgress {
  document_type: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Unable to Obtain';
  assigned_to?: string;
  started_at?: Date;
  completed_at?: Date;
  notes?: string;
}

export interface LawyerWorkload {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  active_cases: number;
  capacity: number;
  utilization_rate: number;
  availability: 'Available' | 'At Capacity' | 'Unavailable';
  specializations: string[];
  average_case_duration_days: number;
  cases_by_stage: Record<string, number>;
}

export interface QueueItem {
  id: string;
  case_number: string;
  name: string;
  case_type: CaseType;
  priority: LegalAidPriority;
  position: number;
  wait_time_hours: number;
  region: string;
  has_active_court_case: boolean;
  next_court_date?: string;
  created_at: Date;
}

export interface AssignmentCriteria {
  specialization_match: boolean;
  workload_score: number;
  availability: string;
}

export interface LegalAidStatistics {
  total_requests: number;
  by_stage: Record<LegalAidStage, number>;
  by_case_type: Record<CaseType, number>;
  by_priority: Record<LegalAidPriority, number>;
  by_region: Record<string, number>;
  success_metrics: {
    documents_provided_count: number;
    cases_resolved_through_mediation: number;
    referred_to_litigation: number;
    average_days_to_completion: number;
    beneficiary_satisfaction_rate?: number;
  };
  document_metrics: {
    total_documents_prepared: number;
    most_requested_documents: Record<string, number>;
    average_documents_per_case: number;
  };
  court_case_metrics: {
    requests_with_active_court_cases: number;
    court_case_percentage: number;
    average_court_support_duration_days: number;
  };
  demographics: {
    by_gender: Record<Gender, number>;
    by_age_group: Record<string, number>;
    by_income_level: Record<IncomeLevel, number>;
    persons_with_disabilities: number;
  };
}

export interface LegalAidFilters {
  page?: number;
  limit?: number;
  status?: LegalAidStage;
  region_id?: string;
  district_id?: string;
  ward_id?: string;
  village_id?: string;
  assigned_lawyer_id?: string;
  priority?: LegalAidPriority;
  case_type?: CaseType;
  has_active_court_case?: boolean;
  search?: string;
  date_from?: string;
  date_to?: string;
}
