import { z } from "zod";

const CASE_STATUSES = ["Open", "Ongoing", "Referred", "Completed", "Cancelled", "Resolved", "Won", "Closed", "In Progress"] as const;

export const CaseValidation = z.object({
    title: z.string().min(10, { message: "Title must be at least 10 characters." }).max(200),
    reference_number: z.string().optional(), // Auto-generated if not provided
    description: z.string().min(50, { message: "Description must be at least 50 characters." }).max(5000),
    category_id: z.string().uuid({ message: "Valid category ID is required." }),
    submitted_by: z.string().uuid({ message: "Valid beneficiary ID is required." }),
    assigned_to: z.string().uuid({ message: "Valid user ID is required." }).optional(),
    status: z.enum(CASE_STATUSES).default("Open"),
});

export const CaseUpdateValidation = z.object({
    title: z.string().min(10).max(200).optional(),
    description: z.string().min(50).max(5000).optional(),
    category_id: z.string().uuid().optional(),
    assigned_to: z.string().uuid().optional(),
    status: z.enum(CASE_STATUSES).optional(),
});

// Case Stage Validations
const STAGE_STATUSES = ["Ongoing", "Resolved", "Blocked"] as const;

export const CaseStageValidation = z.object({
    case_id: z.string().uuid({ message: "Valid case ID is required." }),
    name: z.string().min(3, { message: "Stage name must be at least 3 characters." }).max(100),
    description: z.string().min(10, { message: "Description must be at least 10 characters." }).max(1000),
    status: z.enum(STAGE_STATUSES).default("Ongoing"),
    next_stage: z.string().max(100).optional(),
});

export const CaseStageUpdateValidation = z.object({
    name: z.string().min(3).max(100).optional(),
    description: z.string().min(10).max(1000).optional(),
    status: z.enum(STAGE_STATUSES).optional(),
    next_stage: z.string().max(100).optional(),
});

// Stage Attachment Validations
export const StageAttachmentValidation = z.object({
    stage_id: z.string().uuid({ message: "Valid stage ID is required." }),
    case_id: z.string().uuid({ message: "Valid case ID is required." }),
    file_data: z.string().min(1, { message: "File data is required." }),
    file_type: z.string().min(1, { message: "File type is required." }),
    file_name: z.string().min(1, { message: "File name is required." }).max(255),
    description: z.string().max(500).optional(),
});

export const StageAttachmentUpdateValidation = z.object({
    file_name: z.string().min(1).max(255).optional(),
    description: z.string().max(500).optional(),
});
