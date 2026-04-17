import { z } from "zod";
import { IdeaStatus, UserStatus } from "../../generated/prisma/enums";

export const updateUserValidation = z.object({
    role: z.enum(["ADMIN", "MEMBER"]).optional(),
    status: z.enum([UserStatus.ACTIVE,UserStatus.BLOCKED,UserStatus.DELETED]).optional(),
});

export const updateIdeaStatusValidation = z.object({
    status: z.enum([IdeaStatus.APPROVED,IdeaStatus.DRAFT,IdeaStatus.REJECTED,IdeaStatus.UNDER_REVIEW]),
    feedback: z.string().optional(),
});

export const featureIdeaValidation = z.object({
    isfeatures: z.boolean(),
});