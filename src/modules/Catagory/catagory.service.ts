import status from "http-status";

import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";

import AppError from "../../errors/AppError";
import { Category, Prisma } from "../../generated/prisma/client";
import { categoryFilterableFields, categorySearchableFields } from "./category.constant";

// ✅ CREATE CATEGORY
const createCategory = async (payload: any, userId: string) => {
  const isExist = await prisma.category.findUnique({
    where: { name: payload.name },
  });

  if (isExist) {
    throw new AppError(
      status.UNPROCESSABLE_ENTITY,
      "Category already exists"
    );
  }

  const result = await prisma.category.create({
    data: {
      name: payload.name,
      userId,
    },
  });

  return result;
};

// ✅ GET ALL CATEGORIES (WITH QUERY BUILDER)
const getAllCategories = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    Category,
    Prisma.CategoryWhereInput,
    Prisma.CategoryInclude
  >(prisma.category, query, {
    searchableFields: categorySearchableFields,
    filterableFields: categoryFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .include({
      ideas: true,
    })
    .paginate()
    .sort()
    .fields()
    .execute();

  return result;
};

// ✅ GET SINGLE CATEGORY
const getSingleCategory = async (id: string) => {
  const result = await prisma.category.findUnique({
    where: { id },
    include: {
      ideas: true,
    },
  });

  if (!result) {
    throw new AppError(status.NOT_FOUND, "Category not found");
  }

  return result;
};

// ✅ UPDATE CATEGORY
const updateCategory = async (id: string, payload: any) => {
  const isExist = await prisma.category.findUnique({
    where: { id },
  });

  if (!isExist) {
    throw new AppError(status.NOT_FOUND, "Category not found");
  }

  // 🔥 prevent duplicate name
  if (payload.name) {
    const duplicate = await prisma.category.findFirst({
      where: {
        name: payload.name,
        NOT: { id },
      },
    });

    if (duplicate) {
      throw new AppError(
        status.UNPROCESSABLE_ENTITY,
        "Category name already exists"
      );
    }
  }

  const result = await prisma.category.update({
    where: { id },
    data: payload,
  });

  return result;
};

// ✅ DELETE CATEGORY
const deleteCategory = async (id: string) => {
  const isExist = await prisma.category.findUnique({
    where: { id },
  });

  if (!isExist) {
    throw new AppError(status.NOT_FOUND, "Category not found");
  }

  // ❗ Prevent delete if ideas exist (very important for viva)
  const hasIdeas = await prisma.idea.findFirst({
    where: { categoryId: id },
  });

  if (hasIdeas) {
    throw new AppError(
      status.BAD_REQUEST,
      "Cannot delete category with existing ideas"
    );
  }

  await prisma.category.delete({
    where: { id },
  });

  return { message: "Category deleted successfully" };
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};