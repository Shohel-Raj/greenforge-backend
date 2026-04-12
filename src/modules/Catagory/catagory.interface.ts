import { Category } from "../../generated/prisma/client";

export type ICategory = Category;

export type ICategoryFilters = {
  searchTerm?: string;
  name?: string;
};