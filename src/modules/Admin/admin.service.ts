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

// ✅ UPDATE IDEA STATUS
const updateIdeaStatus = async (id: string, payload: any) => {
  const idea = await prisma.idea.findUnique({
    where: { id },
  });

  if (!idea) {
    throw new AppError(status.NOT_FOUND, "Idea not found");
  }

  return prisma.idea.update({
    where: { id },
    data: {
      status: payload.status,
      feedback: payload.feedback,
    },
  });
};

// ✅ FEATURE IDEA
const featureIdea = async (id: string, payload: any) => {
  const idea = await prisma.idea.findUnique({
    where: { id },
  });

  if (!idea) {
    throw new AppError(status.NOT_FOUND, "Idea not found");
  }

  return prisma.idea.update({
    where: { id },
    data: {
      isfeatures: payload.isfeatures,
    },
  });
};

// ✅ DELETE IDEA
const deleteIdea = async (id: string) => {
  const idea = await prisma.idea.findUnique({
    where: { id },
  });

  if (!idea) {
    throw new AppError(status.NOT_FOUND, "Idea not found");
  }

  await prisma.idea.delete({
    where: { id },
  });

  return { message: "Idea deleted successfully" };
};

// ================= COMMENTS =================

// ✅ DELETE COMMENT
const deleteComment = async (id: string) => {
  const comment = await prisma.comment.findUnique({
    where: { id },
  });

  if (!comment) {
    throw new AppError(status.NOT_FOUND, "Comment not found");
  }

  await prisma.comment.delete({
    where: { id },
  });

  return { message: "Comment deleted successfully" };
};


const getDashboardOverview = async () => {
  const totalUsers = await prisma.user.count();

  const totalIdeas = await prisma.idea.count();

  const approvedIdeas = await prisma.idea.count({
    where: { status: "APPROVED" },
  });

  const pendingIdeas = await prisma.idea.count({
    where: { status: "UNDER_REVIEW" },
  });

  const rejectedIdeas = await prisma.idea.count({
    where: { status: "REJECTED" },
  });

  const totalComments = await prisma.comment.count();

  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
  });

  return {
    totalUsers,
    totalIdeas,
    approvedIdeas,
    pendingIdeas,
    rejectedIdeas,
    totalComments,
    totalRevenue: totalRevenue._sum.amount || 0,
  };
};

const getIdeaChart = async () => {
  const ideas = await prisma.idea.findMany({
    select: {
      createdAt: true,
    },
  });

  const monthlyData: any = {};

  ideas.forEach((idea) => {
    const month = new Date(idea.createdAt).toLocaleString("default", {
      month: "short",
    });

    monthlyData[month] = (monthlyData[month] || 0) + 1;
  });

  return Object.keys(monthlyData).map((month) => ({
    month,
    ideas: monthlyData[month],
  }));
};
const getPaymentChart = async () => {
  const payments = await prisma.payment.findMany({
    select: {
      createdAt: true,
      amount: true,
    },
  });

  const monthlyRevenue: any = {};

  payments.forEach((p) => {
    const month = new Date(p.createdAt).toLocaleString("default", {
      month: "short",
    });

    monthlyRevenue[month] =
      (monthlyRevenue[month] || 0) + p.amount;
  });

  return Object.keys(monthlyRevenue).map((month) => ({
    month,
    revenue: monthlyRevenue[month],
  }));
};

const getVoteComparison = async () => {
  const upvotes = await prisma.vote.count({
    where: { type: "UP" },
  });

  const downvotes = await prisma.vote.count({
    where: { type: "DOWN" },
  });

  return [
    { name: "Upvotes", value: upvotes },
    { name: "Downvotes", value: downvotes },
  ];
};


const getLatestIdeas = async (limit: number) => {
  const ideas = await prisma.idea.findMany({
    where: {
      status: "APPROVED",
    },
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
    include: {
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
    },
  });

  // 🔥 vote summary
  const result = ideas.map((idea) => {
    let upvotes = 0;
    let downvotes = 0;

    idea.votes.forEach((v) => {
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

  return result;
};


export const AdminService = {
  getAllUsers,
  updateUser,
  getAllIdeasAdmin,
  updateIdeaStatus,
  featureIdea,
  deleteIdea,
  deleteComment,


  getDashboardOverview,
  getIdeaChart,
  getPaymentChart,
  getVoteComparison,
  getLatestIdeas

};