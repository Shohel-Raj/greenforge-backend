import { Request, Response } from "express";
import { nextRes } from "../../shared/nextRes";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { MemberService } from "./member.service";

// ================= DASHBOARD =================

const getDashboardOverview = nextRes(async (req: Request, res: Response) => {
  const user = req.user;

  const result = await MemberService.getDashboardOverview(user.userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Member dashboard overview fetched",
    data: result,
  });
});

// ================= CHARTS =================

const getIdeaChart = nextRes(async (req: Request, res: Response) => {
  const user = req.user;

  const result = await MemberService.getIdeaChart(user.userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Idea chart fetched",
    data: result,
  });
});

const getVoteChart = nextRes(async (req: Request, res: Response) => {
  const user = req.user;

  const result = await MemberService.getVoteChart(user.userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Vote chart fetched",
    data: result,
  });
});

// ================= RECENT =================

const getRecentIdeas = nextRes(async (req: Request, res: Response) => {
  const user = req.user;

  const result = await MemberService.getRecentIdeas(user.userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Recent ideas fetched",
    data: result,
  });
});

export const MemberController = {
  getDashboardOverview,
  getIdeaChart,
  getVoteChart,
  getRecentIdeas,
};