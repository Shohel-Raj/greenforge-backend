import { Request, Response } from "express";
import { nextRes } from "../../shared/nextRes";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { VoteService } from "./vote.service";

// ✅ VOTE (UP / DOWN / TOGGLE)
const voteIdea = nextRes(async (req: Request, res: Response) => {
  const user = req.user;

  const result = await VoteService.voteIdea(
    req.body,
    user.userId
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: result.message,
    data: result.data || null,
  });
});

// ✅ GET USER VOTE
const getUserVote = nextRes(async (req: Request, res: Response) => {
  const user = req.user;
  const { ideaId } = req.params;

  const result = await VoteService.getUserVote(
    ideaId as string,
    user.userId
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User vote fetched successfully",
    data: result,
  });
});

export const VoteController = {
  voteIdea,
  getUserVote,
};