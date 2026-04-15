import status from "http-status";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";

// CREATE COMMENT / REPLY
const createComment = async (payload: any, userId: string) => {
  const idea = await prisma.idea.findUnique({
    where: { id: payload.ideaId },
  });

  if (!idea) {
    throw new AppError(status.NOT_FOUND, "Idea not found");
  }

  // rating validation
  if (payload.rating && (payload.rating < 1 || payload.rating > 10)) {
    throw new AppError(status.BAD_REQUEST, "Rating must be between 1–10");
  }

  const result = await prisma.comment.create({
    data: {
      content: payload.content,
      ideaId: payload.ideaId,
      parentId: payload.parentId || null,
      rating: payload.rating,
      userId,
    },
  });

  return result;
};

// ✅ GET REPLIES (LOAD ON CLICK)
const getReplies = async (parentId: string) => {
  const replies = await prisma.comment.findMany({
    where: { parentId },
    include: {
      user: true,
      _count: {
        select: {
          replies: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return replies;
};

// ✅ UPDATE COMMENT
const updateComment = async (id: string, payload: any, userId: string) => {
  const comment = await prisma.comment.findUnique({
    where: { id },
  });

  if (!comment) {
    throw new AppError(status.NOT_FOUND, "Comment not found");
  }

  if (comment.userId !== userId) {
    throw new AppError(status.FORBIDDEN, "Not allowed");
  }

  return prisma.comment.update({
    where: { id },
    data: payload,
  });
};

export const CommentService = {
  createComment,
  getReplies,
  updateComment
};