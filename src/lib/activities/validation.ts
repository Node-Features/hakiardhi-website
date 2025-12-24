import { z } from "zod";

const ACTIVITY_STATUSES = ["Pending", "Ongoing", "Completed", "Rescheduled", "Cancelled"] as const;
const ASSIGNMENT_STATUSES = ["Pending", "In progress", "Completed"] as const;

export const ActivityLocationValidation = z.object({
    region_id: z.string().uuid({ message: "Valid region ID is required." }),
    district_id: z.string().uuid({ message: "Valid district ID is required." }),
    village_id: z.string().uuid({ message: "Valid village ID is required." }),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date must be in YYYY-MM-DD format." }),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date must be in YYYY-MM-DD format." }),
});

export const ActivityValidation = z.object({
    name: z.string().min(5, { message: "Activity name must be at least 5 characters." }).max(200),
    project_id: z.string().uuid({ message: "Valid project ID is required." }),
    category_id: z.string().uuid({ message: "Valid category ID is required." }).optional(),
    status: z.enum(ACTIVITY_STATUSES),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Start date must be in YYYY-MM-DD format." }),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "End date must be in YYYY-MM-DD format." }).optional(),
    locations: z.array(ActivityLocationValidation).min(1, { message: "At least one location is required." }),
});

export const ActivityUpdateValidation = z.object({
    name: z.string().min(5).max(200).optional(),
    category_id: z.string().uuid().optional(),
    status: z.enum(ACTIVITY_STATUSES).optional(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const ActivityBeneficiaryValidation = z.object({
    beneficiary_id: z.string().uuid({ message: "Valid beneficiary ID is required." }),
    role_in_activity: z.string().max(100).optional(),
    attended: z.boolean().default(false),
    feedback: z.string().max(1000).optional()
});

export const ActivityBeneficiaryUpdateValidation = z.object({
    role_in_activity: z.string().max(100).optional(),
    attended: z.boolean().optional(),
    feedback: z.string().max(1000).optional(),
    target_outcome: z.string().max(500).optional(),
    actial_outcome: z.string().max(500).optional()

});

export const ActivityAssignmentValidation = z.object({
    assigned_to: z.string().uuid({ message: "Valid user ID is required." }),
    due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Due date must be in YYYY-MM-DD format." }),
    status: z.enum(ASSIGNMENT_STATUSES).default("Pending"),
    project_location_id: z.string().uuid({ message: "Valid project location ID is required." }).optional(),
});

export const ActivityAssignmentUpdateValidation = z.object({
    status: z.enum(ASSIGNMENT_STATUSES),
});

export const ActivityFileValidation = z.object({
    name: z.string().min(1, { message: "File name is required." }),
    file_data: z.string().min(1, { message: "File data is required. Provide base64-encoded file." }),
    file_type: z.string().min(1, { message: "File type (MIME type) is required. Example: image/png, application/pdf" }),
    description: z.string().optional(),
});

export const ActivityMultipleFilesValidation = z.object({
    files: z.array(ActivityFileValidation).min(1, { message: "At least one file is required." }).max(20, { message: "Maximum 20 files allowed per upload." }),
});
