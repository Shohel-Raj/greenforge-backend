import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { TUpdateIdea } from "./idea.interface";
import { Idea, IdeaStatus, Prisma, Role } from "../../generated/prisma/client";
import AppError from "../../errors/AppError";
import {
  ideaFilterableFields,
  ideaIncludeConfig,
  ideaSearchableFields,
} from "./idea.constant";
import { IRequestUser } from "../Auth/auth.interface";
import { includes } from "zod";

// ✅ GET ALL IDEAS
const getAllIdeas = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    Idea,
    Prisma.IdeaWhereInput,
    Prisma.IdeaInclude
  >(prisma.idea, query, {
    searchableFields: ideaSearchableFields,
    filterableFields: ideaFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    // .where({
    //   // only approved ideas for public
    //   status: IdeaStatus.APPROVED,
    // })
    .include({
      category: true,
      member: true,
    })
    .dynamicInclude(ideaIncludeConfig)
    .paginate()
    .sort()
    .fields()
    .execute();

  return result;
};

// ✅ GET SINGLE IDEA
const getIdeaById = async (id: string) => {
  const idea = await prisma.idea.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
      member: true,
      votes: true,
      payments: false,
      comments: {
        include: {
          user: true,
          replies: true,
        },
      },
    },
  });

  if (!idea) {
    throw new AppError(status.NOT_FOUND, "Idea not found");
  }

  return idea;
};

// ✅ CREATE IDEA
const createIdea = async (payload: any, userId: string) => {
  const member = await prisma.member.findUnique({
    where: { userId },
  });

  if (!member) {
    throw new AppError(status.NOT_FOUND, "You are not a Member yet!");
  }

  const result = await prisma.idea.create({
    data: {
      ...payload,
      memberId: member.id,
      status: IdeaStatus.UNDER_REVIEW,
    },
  });

  return result;
};

// ✅ UPDATE IDEA
const updateIdea = async (id: string, payload: TUpdateIdea,user:IRequestUser) => {
  const isIdeaExist = await prisma.idea.findUnique({
    where: { id },
  });

  if (!isIdeaExist) {
    throw new AppError(status.NOT_FOUND, "Idea not found");
  }
  const member= await prisma.member.findUnique({
  where:{
    id:isIdeaExist?.memberId
  }
})
  const isOwner = member?.userId === user.userId;
  const isAdmin = user.role === Role.ADMIN;
  if (!isOwner && !isAdmin) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not allowed to delete this idea",
    );
  }

  const result = await prisma.idea.update({
    where: { id },
    data: payload,
  });

  return result;
};

// ✅ DELETE IDEA
const deleteIdea = async (id: string, user: IRequestUser) => {
  const isIdeaExist = await prisma.idea.findUnique({
    where: { id },
    
  });
const member= await prisma.member.findUnique({
  where:{
    id:isIdeaExist?.memberId
  }
})
  if (!isIdeaExist) {
    throw new AppError(status.NOT_FOUND, "Idea not found");
  }
   
  const isOwner = member?.userId === user.userId;
  const isAdmin = user.role === Role.ADMIN;

  if (!isOwner && !isAdmin) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not allowed to delete this idea",
    );
  }

  // use soft delete
  await prisma.idea.update({
    where: { id },
    data: { isDeleted: true },
  });

  return { message: "Idea deleted successfully" };
};

export const IdeaService = {
  getAllIdeas,
  getIdeaById,
  createIdea,
  updateIdea,
  deleteIdea,
};
