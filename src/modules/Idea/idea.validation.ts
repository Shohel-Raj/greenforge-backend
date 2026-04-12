import { z } from "zod";
import { IdeaStatus } from "../../generated/prisma/enums";

export const createIdeaValidation = z.object({
    title: z.string("Title must be provided"),
    problemStatement: z.string("problemStatement must be provided"),
    solution: z.string("solution must be provided"),
    description: z.string("description must be provided"),
    image: z.string().optional(),
    isPaid: z.boolean().optional(),
    price: z.number().optional(),
    categoryId: z.string("category must be provided"),
    status:z.enum([IdeaStatus.UNDER_REVIEW,IdeaStatus.DRAFT])
});

export const updateIdeaValidation = z.object({
    title: z.string().optional(),
    problemStatement: z.string().optional(),
    solution: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    isPaid: z.boolean().optional(),
    price: z.number().optional(),
    status:z.enum([IdeaStatus.UNDER_REVIEW,IdeaStatus.DRAFT]).optional(),
    feedback: z.string().optional(),
});