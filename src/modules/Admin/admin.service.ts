import status from "http-status";

import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";
import {
  adminUserFilterableFields,
  adminUserSearchableFields,
  adminIdeaFilterableFields,
  adminIdeaSearchableFields,
} from "./admin.constant";
import { Idea, Prisma, User } from "../../generated/prisma/client";
import AppError from "../../errors/AppError";

// ================= USERS =================

// ✅ GET ALL USERS (WITH QUERY BUILDER)
const getAllUsers = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    User,
    Prisma.UserWhereInput,
    Prisma.UserInclude
  >(prisma.user, query, {
    searchableFields: adminUserSearchableFields,
    filterableFields: adminUserFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .include({
      member: true,
      admin: true,
    })
    .paginate()
    .sort()
    .fields()
    .execute();

  return result;
};

// ✅ UPDATE USER
const updateUser = async (id: string, payload: any) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const result = await prisma.user.update({
    where: { id },
    data: payload,
  });

  return result;
};

// ================= IDEAS =================

// ✅ GET ALL IDEAS (ADMIN VIEW WITH QUERY BUILDER)
const getAllIdeasAdmin = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    Idea,
    Prisma.IdeaWhereInput,
    Prisma.IdeaInclude
  >(prisma.idea, query, {
    searchableFields: adminIdeaSearchableFields,
    filterableFields: adminIdeaFilterableFields,
  });

  const ideas = await queryBuilder
    .search()
    .filter()
    .include({
      category: true,
      member: true,
      votes: {
        select: {
          type: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    })
    .paginate()
    .sort()
    .fields()
    .execute();

  // 🔥 add vote summary
  const result = ideas.data.map((idea: any) => {
    let upvotes = 0;
    let downvotes = 0;

    idea.votes.forEach((v: any) => {
      if (v.type === "UP") upvotes++;
      if (v.type === "DOWN") downvotes++;
    });

    return {
      ...idea,
      voteSummary: {
        upvotes,
        downvotes,
        score: upvotes - downvotes,
      },
      votes: undefined,
    };
  });

  return {
    ...ideas,
    data: result,
  };
};


export const AdminService = {
  getAllUsers,
  updateUser,
  getAllIdeasAdmin,

};