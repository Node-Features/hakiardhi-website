import { z } from "zod";

export const UserSchema = z.object({
  first_name: z
    .string()
    .min(1, { message: "First name is required" })
    .max(50, { message: "First name cannot exceed 50 characters" }),

  last_name: z
    .string()
    .min(1, { message: "Last name is required" })
    .max(50, { message: "Last name cannot exceed 50 characters" }),

  email: z
    .string()
    .email({ message: "Invalid email address" }),

  phone_number: z
    .string()
    .min(9, { message: "Phone number must be at least 9 digits" })
    .max(12, { message: "Phone number cannot exceed 12 digits" })
    .optional(),

  sex: z
    .enum(["Male", "Female"], { description: "Sex must be either 'Male' or 'Female'" })
    .optional(),

  age_group: z
    .string()
    .min(1, { message: "Age group is required" })
    .optional(),

  photo_consent: z
    .boolean()
    .optional(),

  status: z
    .enum(["Active", "Inactive"], { description: "Status must be either 'Active' or 'Inactive'" })
    .default("Inactive"),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(128, { message: "Password cannot exceed 128 characters" }),
  role_id: z
    .string()
    .min(6, { message: "Role is required" })
    .max(128, { message: "Valid role ID is required" }),
});

export const UserUpdateSchema = z.object({
  first_name: z
    .string()
    .min(1, { message: "First name is required" })
    .max(50, { message: "First name cannot exceed 50 characters" })
    .optional(),

  last_name: z
    .string()
    .min(1, { message: "Last name is required" })
    .max(50, { message: "Last name cannot exceed 50 characters" })
    .optional(),

  email: z
    .string()
    .email({ message: "Invalid email address" })
    .optional(),

  phone_number: z
    .string()
    .min(9, { message: "Phone number must be at least 9 digits" })
    .max(12, { message: "Phone number cannot exceed 12 digits" })
    .optional(),

  sex: z
    .enum(["Male", "Female"], { description: "Sex must be either 'Male' or 'Female'" })
    .optional(),

  age_group: z
    .string()
    .min(1, { message: "Age group is required" })
    .optional(),

  photo_consent: z
    .boolean()
    .optional(),

  status: z
    .enum(["Active", "Inactive"], { description: "Status must be either 'Active' or 'Inactive'" })
    .optional(),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(128, { message: "Password cannot exceed 128 characters" })
    .optional(),

  role_id: z
    .string()
    .min(6, { message: "Role is required" })
    .max(128, { message: "Valid role ID is required" })
    .optional(),

  image_url: z
    .string()
    .url({ message: "Image URL must be a valid URL" })
    .optional()
    .nullable(),

  // Team member fields
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
    .enum(["leadership", "board", "staff", "advisor"], { description: "Member type for team display" })
    .optional()
    .nullable(),

  display_order: z
    .number()
    .int()
    .min(0)
    .optional()
    .nullable(),

  show_in_team: z
    .boolean()
    .optional(),
});
