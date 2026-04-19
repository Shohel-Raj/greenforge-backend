import { Request, Response } from "express";
import { nextRes } from "../../shared/nextRes";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { WatchlistService } from "./watchlist.service";
import { WatchlistMessage } from "./watchlist.constant";

//  ADD
const addToWatchlist = nextRes(async (req: Request, res: Response) => {
  const user = req.user;
  const { ideaId } = req.body;

  const result = await WatchlistService.addToWatchlist(
    user.userId,
    ideaId
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: WatchlistMessage.ADDED,
    data: result,
  });
});

export const WatchlistController = {
  addToWatchlist,

};