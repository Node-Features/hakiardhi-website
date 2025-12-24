import { z } from "zod";

export const registerUserSchema = z.object({
  first_name: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name too long"),

  last_name: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name too long"),

  email: z
    .string()
    .email("Invalid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password too long"),

  phone_number: z
    .string()
    .regex(/^\+?[0-9]{7,15}$/, "Invalid phone number")
    .nullable(),

  sex: z
    .enum(["male", "female", "other"])
    .nullable(),

  age_group: z
    .string()
    .min(1, "Age group is required")
    .nullable(),

  photo_consent: z.boolean().default(false),
  role_id: z
    .string()
    .min(6, { message: "Role is required" })
    .max(128, { message: "Valid role ID is required" })
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
