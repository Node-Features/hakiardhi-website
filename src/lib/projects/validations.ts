import { z } from "zod";

// Enum for project_statuses
export const PROJECT_STATUS = [
    "Pending",
    "Active",
    "Completed",
    "On Hold",
] as const;

export const ProjectLocationValidation = z.object({
    region_id: z.string().uuid({ message: "Valid region ID is required." }),
    district_id: z.string().uuid({ message: "Valid district ID is required." }),
    village_id: z.string().uuid({ message: "Valid village ID is required." }),
});

export const ProjectValidation = z.object({
    title: z.string().min(5, { message: "Project title must be at least 5 characters." }).max(200),
    description: z.string().max(2000).optional(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Start date must be in YYYY-MM-DD format." }),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "End date must be in YYYY-MM-DD format." }).optional(),
    status: z.enum(PROJECT_STATUS),
    locations: z.array(ProjectLocationValidation).min(1, { message: "At least one location is required." }),
});

export const ProjectUpdateValidation = z.object({
    title: z.string().min(5).max(200).optional(),
    description: z.string().max(2000).optional(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    status: z.enum(PROJECT_STATUS).optional(),
});

export const ProjectFileValidation = z.object({
    name: z.string().min(1, { message: "File name is required." }),
    file_data: z.string().min(1, { message: "File data is required. Provide base64-encoded file." }),
    file_type: z.string().min(1, { message: "File type (MIME type) is required. Example: image/png, application/pdf" }),
    description: z.string().optional(),
});