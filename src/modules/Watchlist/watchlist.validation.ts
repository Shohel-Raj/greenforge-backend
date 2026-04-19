import { z } from "zod";

export const addToWatchlistValidation = z.object({
    ideaId: z.string("Idea ID is required"),
});