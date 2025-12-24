import { z } from "zod";

export const CategoryValidation = z.object({
    name: z.string().min(2, { message: "Category name must be at least 2 characters." }),
    type: z.string().min(2, { message: "Category type is required." }).optional(),
    description: z.string().min(5, { message: "Description must be at least 5 characters." }).optional(),
});

export const CategoryUpdateValidation = z.object({
    name: z.string().min(2, { message: "Category name must be at least 2 characters." }).optional(),
    type: z.string().min(2, { message: "Category type must be at least 2 characters." }).optional(),
    description: z.string().min(5, { message: "Description must be at least 5 characters." }).optional(),
});
