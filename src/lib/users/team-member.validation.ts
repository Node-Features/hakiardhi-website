import { z } from "zod";

export const TeamMemberCreateSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Full name is required" })
    .max(100, { message: "Name cannot exceed 100 characters" }),

  role: z
    .string()
    .min(1, { message: "Position/role is required" })
    .max(100, { message: "Role cannot exceed 100 characters" }),

  department: z
    .string()
    .max(100, { message: "Department cannot exceed 100 characters" })
    .optional()
    .nullable(),

  bio: z
    .string()
    .max(2000, { message: "Bio cannot exceed 2000 characters" })
    .optional()
    .nullable(),

  image_url: z
    .string()
    .url({ message: "Image URL must be a valid URL" })
    .optional()
    .nullable(),

  email: z
    .string()
    .email({ message: "Invalid email address" })
    .optional()
    .nullable(),

  phone: z
    .string()
    .max(20, { message: "Phone cannot exceed 20 characters" })
    .optional()
    .nullable(),

  linkedin_url: z
    .string()
    .url({ message: "LinkedIn URL must be a valid URL" })
    .optional()
    .nullable(),

  twitter_url: z
    .string()
    .url({ message: "Twitter URL must be a valid URL" })
    .optional()
    .nullable(),

  member_type: z
    .enum(["leadership", "board", "staff", "advisor"], {
      description: "Member type for team display",
    }),

  display_order: z
    .number()
    .int()
    .min(0)
    .optional()
    .nullable(),

  is_active: z
    .boolean()
    .default(true),
});

export const TeamMemberUpdateSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Full name is required" })
    .max(100, { message: "Name cannot exceed 100 characters" })
    .optional(),

  role: z
    .string()
    .min(1, { message: "Position/role is required" })
    .max(100, { message: "Role cannot exceed 100 characters" })
    .optional(),

  department: z
    .string()
    .max(100, { message: "Department cannot exceed 100 characters" })
    .optional()
    .nullable(),

  bio: z
    .string()
    .max(2000, { message: "Bio cannot exceed 2000 characters" })
    .optional()
    .nullable(),

  image_url: z
    .string()
    .url({ message: "Image URL must be a valid URL" })
    .optional()
    .nullable(),

  email: z
    .string()
    .email({ message: "Invalid email address" })
    .optional()
    .nullable(),

  phone: z
    .string()
    .max(20, { message: "Phone cannot exceed 20 characters" })
    .optional()
    .nullable(),

  linkedin_url: z
    .string()
    .url({ message: "LinkedIn URL must be a valid URL" })
    .optional()
    .nullable(),

  twitter_url: z
    .string()
    .url({ message: "Twitter URL must be a valid URL" })
    .optional()
    .nullable(),

  member_type: z
    .enum(["leadership", "board", "staff", "advisor"], {
      description: "Member type for team display",
    })
    .optional(),

  display_order: z
    .number()
    .int()
    .min(0)
    .optional()
    .nullable(),

  is_active: z
    .boolean()
    .optional(),
});
