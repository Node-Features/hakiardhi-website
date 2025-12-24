import { z } from 'zod';

// Beneficiary Details Schema
const BeneficiaryDetailsSchema = z.object({
  age: z.number().int().min(1).max(150),
  gender: z.enum(['Male', 'Female', 'Other']),
  occupation: z.string().min(2).max(200),
  education_level: z.enum(['None', 'Primary', 'Secondary', 'Vocational', 'Tertiary', 'University']),
  income_level: z.enum(['Low', 'Medium', 'High']),
  disability_status: z.enum(['None', 'Physical', 'Visual', 'Hearing', 'Mental', 'Multiple']),
  marital_status: z.enum(['Single', 'Married', 'Divorced', 'Widowed', 'Other']),
  number_of_dependents: z.number().int().min(0),
  id_number: z.string().optional(),
  id_type: z.enum(['National ID', 'Voter ID', 'Passport', 'Birth Certificate', 'Other']).optional(),
});

// Demographic Details Schema
const DemographicDetailsSchema = z.object({
  region_id: z.string().uuid(),
  district_id: z.string().uuid(),
  ward: z.string().min(2).max(200),
  village: z.string().min(2).max(200),
  street: z.string().min(2).max(200).optional(),
  residential_status: z.enum(['Owner', 'Tenant', 'Family Land', 'Other']),
  years_in_residence: z.number().int().min(0).optional(),
  tribe: z.string().max(100).optional(),
  religion: z.string().max(100).optional(),
  language_preference: z.enum(['Swahili', 'English']),
});

// Case Details Schema
const CaseDetailsSchema = z.object({
  case_type: z.enum(['Land Dispute', 'Boundary Conflict', 'Inheritance Dispute', 'Eviction', 'Documentation', 'Other']),
  case_category: z.string().min(2).max(200),
  case_description: z.string().min(50).max(5000),
  land_size: z.string().max(100).optional(),
  land_location: z.string().max(500).optional(),
  land_use: z.string().max(200).optional(),
  title_deed_available: z.boolean(),
  title_deed_number: z.string().max(100).optional(),
  dispute_duration: z.string().max(200).optional(),
  previous_attempts_at_resolution: z.string().max(2000).optional(),
  opposing_party: z.string().max(500).optional(),
  witnesses_available: z.boolean(),
  evidence_documents: z.array(z.string()).optional(),
  court_documents_needed: z.array(z.string()).optional(),
  has_active_court_case: z.boolean(),
  court_case_number: z.string().max(100).optional(),
  court_name: z.string().max(200).optional(),
  next_court_date: z.string().optional(),
  urgency_level: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  estimated_loss_value: z.string().max(100).optional(),
});

// Main Legal Aid Request Schema
export const LegalAidRequestValidation = z.object({
  name: z.string().min(3).max(200),
  phone_number: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  email: z.string().email().optional(),
  beneficiary_details: BeneficiaryDetailsSchema,
  demographic_details: DemographicDetailsSchema,
  case_details: CaseDetailsSchema,
  preferred_contact_method: z.enum(['Phone', 'Email', 'WhatsApp', 'SMS']),
  preferred_language: z.enum(['Swahili', 'English']),
  consent_to_data_processing: z.boolean().refine(val => val === true, {
    message: 'Consent to data processing is required'
  }),
  how_did_you_hear_about_us: z.string().max(500).optional(),
});

// Update Legal Aid Request Schema (partial)
export const LegalAidRequestUpdateValidation = z.object({
  name: z.string().min(3).max(200).optional(),
  phone_number: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
  email: z.string().email().optional(),
  beneficiary_details: BeneficiaryDetailsSchema.partial().optional(),
  demographic_details: DemographicDetailsSchema.partial().optional(),
  case_details: CaseDetailsSchema.partial().optional(),
  preferred_contact_method: z.enum(['Phone', 'Email', 'WhatsApp', 'SMS']).optional(),
  preferred_language: z.enum(['Swahili', 'English']).optional(),
});

// Stage Update Schema
export const StageUpdateValidation = z.object({
  new_stage: z.enum([
    'Intake - Pending Review',
    'Intake - Under Review',
    'Queued for Assignment',
    'Assigned to Legal Advisor',
    'Document Assessment',
    'Document Preparation',
    'Document Collection',
    'Legal Advice Provided',
    'Mediation Support',
    'Court Document Submission',
    'Follow-up Support',
    'Completed - Documents Provided',
    'Completed - Case Resolved',
    'Completed - Referred to Litigation',
    'Completed - Withdrawn',
    'Closed - Unable to Assist'
  ]),
  notes: z.string().max(2000).optional(),
});

// Assignment Schema
export const AssignmentValidation = z.object({
  assigned_lawyer_id: z.string().uuid(),
  notes: z.string().max(2000).optional(),
});

// Document Progress Update Schema
export const DocumentProgressValidation = z.object({
  document_type: z.string().min(2).max(200),
  status: z.enum(['Pending', 'In Progress', 'Completed', 'Unable to Obtain']),
  assigned_to: z.string().uuid().optional(),
  notes: z.string().max(2000).optional(),
});

export type LegalAidRequestInput = z.infer<typeof LegalAidRequestValidation>;
export type LegalAidRequestUpdateInput = z.infer<typeof LegalAidRequestUpdateValidation>;
export type StageUpdateInput = z.infer<typeof StageUpdateValidation>;
export type AssignmentInput = z.infer<typeof AssignmentValidation>;
export type DocumentProgressInput = z.infer<typeof DocumentProgressValidation>;
