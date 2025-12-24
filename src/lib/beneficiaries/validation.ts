import { z } from "zod";

const USER_STATUSES = ["Active", "Inactive", "Archived"] as const;

export const BeneficiaryValidation = z.object({
    first_name: z.string().min(2, { message: "First name must be at least 2 characters." }).max(100),
    last_name: z.string().min(2, { message: "Last name must be at least 2 characters." }).max(100),
    sex: z.enum(["male", "female", "other"]).optional(),
    role: z.string().max(100).optional(),
    age_group: z.string().optional(),
    is_pwd: z.boolean().default(false),
    phone_number: z.string().optional(),
    image_url: z.string().url().optional(),
    photo_consent: z.boolean(),
    status: z.enum(USER_STATUSES).default("Active"),
    region_id: z.string().uuid().optional(),
    district_id: z.string().uuid().optional(),
    village_id: z.string().uuid().optional(),
});

export const BeneficiaryUpdateValidation = z.object({
    first_name: z.string().min(2).max(100).optional(),
    last_name: z.string().min(2).max(100).optional(),
    sex: z.enum(["male", "female", "other"]).optional(),
    role: z.string().max(100).optional(),
    age_group: z.string().optional(),
    is_pwd: z.boolean().optional(),
    phone_number: z.string().optional(),
    image_url: z.string().url().optional(),
    photo_consent: z.boolean().optional(),
    status: z.enum(USER_STATUSES).optional(),
    region_id: z.string().uuid().optional(),
    district_id: z.string().uuid().optional(),
    village_id: z.string().uuid().optional(),
});
