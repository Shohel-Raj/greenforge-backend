import { z } from "zod";

export const createCategoryValidation = z.object({
  name: z
      .string("Category name is required")
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters"),

});

export const updateCategoryValidation = z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters")
      .optional(),
});