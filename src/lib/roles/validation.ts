import { z } from "zod";

export const RoleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters"),
});

export const PermissionSchema = z.object({
  name: z.string().min(2, "Permision name must be at least 2 characters"),
});

export type PermissionInput = z.infer<typeof PermissionSchema>;
export type RoleInput = z.infer<typeof RoleSchema>;
