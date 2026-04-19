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

export const WatchlistService = {
  addToWatchlist,

};