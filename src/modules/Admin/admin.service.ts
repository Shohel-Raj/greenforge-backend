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


export const AdminService = {
  getAllUsers,
  updateUser,

};