import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";

// ✅ CREATE / TOGGLE / SWITCH VOTE
const voteIdea = async (payload: any, userId: string) => {
  const { ideaId, type } = payload;

  // check idea exists
  const idea = await prisma.idea.findUnique({
    where: { id: ideaId },
  });

  if (!idea) {
    throw new AppError(status.NOT_FOUND, "Idea not found");
  }

  // check existing vote
  const existingVote = await prisma.vote.findUnique({
    where: {
      userId_ideaId: {
        userId,
        ideaId,
      },
    },
  });

  // 🔁 SAME TYPE → REMOVE VOTE (toggle off)
  if (existingVote && existingVote.type === type) {
    await prisma.vote.delete({
      where: {
        userId_ideaId: {
          userId,
          ideaId,
        },
      },
    });

    return { message: "Vote removed" };
  }

  // 🔄 SWITCH VOTE
  if (existingVote) {
    const updated = await prisma.vote.update({
      where: {
        userId_ideaId: {
          userId,
          ideaId,
        },
      },
      data: { type },
    });

    return { message: "Vote updated", data: updated };
  }

  // 🆕 CREATE VOTE
  const created = await prisma.vote.create({
    data: {
      userId,
      ideaId,
      type,
    },
  });

  return { message: "Vote added", data: created };
};

// ✅ GET USER VOTE (UI highlight)
const getUserVote = async (ideaId: string, userId: string) => {
  const vote = await prisma.vote.findUnique({
    where: {
      userId_ideaId: {
        userId,
        ideaId,
      },
    },
  });

  return vote;
};

export const VoteService = {
  voteIdea,
  getUserVote,
};