import { prisma } from "../../lib/prisma";


const createCategory = async (payload: any, userId: string) => {
  const isExist = await prisma.category.findUnique({
    where: { name: payload.name },
  });
console.log(payload,userId)
  if (isExist) {
    throw new Error("Category already exists");
  }

  const result = await prisma.category.create({
    data: {
      name: payload.name,
      userId,
    },
  });

  return result;
};

const getAllCategories = async () => {
  return prisma.category.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getSingleCategory = async (id: string) => {
  const result = await prisma.category.findUnique({
    where: { id },
    include: {
      ideas: true,
    },
  });

  if (!result) {
    throw new Error("Category not found");
  }

  return result;
};

const updateCategory = async (id: string, payload: any) => {
  const isExist = await prisma.category.findUnique({
    where: { id },
  });

  if (!isExist) {
    throw new Error("Category not found");
  }

  return prisma.category.update({
    where: { id },
    data: payload,
  });
};

const deleteCategory = async (id: string) => {
  const isExist = await prisma.category.findUnique({
    where: { id },
  });

  if (!isExist) {
    throw new Error("Category not found");
  }

  return prisma.category.delete({
    where: { id },
  });
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};