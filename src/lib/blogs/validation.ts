import { z } from "zod";

export const BlogValidation = z.object({
    title: z.string().min(5, { message: "Blog title must be at least 5 characters." }).max(200),
    content: z.string().min(50, { message: "Content must be at least 50 characters." }),
    category_id: z.string().uuid({ message: "Valid category ID is required." }),
    author_id: z.string().uuid({ message: "Valid author ID is required." }),
});

export const BlogUpdateValidation = z.object({
    title: z.string().min(5).max(200).optional(),
    content: z.string().min(50).optional(),
    category_id: z.string().uuid().optional(),
});
