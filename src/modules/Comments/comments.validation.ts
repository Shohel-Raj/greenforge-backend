import { z } from "zod";

export const createCommentValidation = z.object({
    content: z.string().min(1),
    ideaId: z.string(),
    parentId: z.string().optional(),
    rating: z.number().min(1).max(10).optional(),
});

export const updateCommentValidation = z.object({
    content: z.string().optional(),
    rating: z.number().min(1).max(10).optional(),
});