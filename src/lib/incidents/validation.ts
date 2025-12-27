import { z } from "zod";

export const IncidentValidation = z.object({
    name: z.string().min(5, { message: "Incident name must be at least 5 characters." }),
    region_id: z.string().uuid({ message: "Valid region ID is required." }),
    district_id: z.string().uuid({ message: "Valid district ID is required." }),
    village_id: z.string().uuid({ message: "Valid village ID is required." }),
    description: z.string().min(20, { message: "Description must be at least 20 characters." }),
    reported_by: z.string().uuid({ message: "Valid user ID is required." }),
    category_id: z.string().uuid({ message: "Valid category ID is required." }),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
    status: z.string().optional().default('Verification Pending'),
});

export const IncidentUpdateValidation = z.object({
    name: z.string().min(5).optional(),
    region_id: z.string().uuid().optional(),
    district_id: z.string().uuid().optional(),
    village_id: z.string().uuid().optional(),
    description: z.string().min(20).optional(),
    category_id: z.string().uuid().optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    status: z.string().optional(),
});

export const IncidentFileValidation = z.object({
    name: z.string().min(1, { message: "File name is required." }),
    file_data: z.string().min(1, { message: "File data is required." }),
    file_type: z.string().min(1, { message: "File type is required." }),
    description: z.string().optional(),
});
