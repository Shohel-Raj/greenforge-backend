import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import status from "http-status";
import { WatchlistMessage } from "./watchlist.constant";

//  ADD
const addToWatchlist = async (userId: string, ideaId: string) => {
  const idea = await prisma.idea.findUnique({
    where: { id: ideaId },
  });

  if (!idea) {
    throw new AppError(status.NOT_FOUND, "Idea not found");
  }

  try {
    const result = await prisma.watchlist.create({
      data: { userId, ideaId },
    });

    return result;
  } catch (error) {
    throw new AppError(status.BAD_REQUEST, WatchlistMessage.ALREADY_EXISTS);
  }
};

// REMOVE
const removeFromWatchlist = async (userId: string, ideaId: string) => {
  const existing = await prisma.watchlist.findUnique({
    where: {
      userId_ideaId: {
        userId,
        ideaId,
      },
    },
  });

  if (!existing) {
    throw new AppError(status.NOT_FOUND, WatchlistMessage.NOT_FOUND);
  }

  await prisma.watchlist.delete({
    where: {
      userId_ideaId: {
        userId,
        ideaId,
      },
    },
  });

  return null;
};

export const WatchlistService = {
  addToWatchlist,
  removeFromWatchlist,

};