import { z } from "zod";
import { voteTypes } from "./vote.constant";

export const voteValidation = z.object({
    ideaId: z.string(),
    type: z.enum(voteTypes),
});