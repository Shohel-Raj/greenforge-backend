import { z } from "zod";

export const subscribeNewsletterValidation = z.object({
    email: z.string().trim().toLowerCase().email(),
});