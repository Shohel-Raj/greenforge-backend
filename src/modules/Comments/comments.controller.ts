import { Request, Response } from "express";
import { nextRes } from "../../shared/nextRes";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { CommentService } from "./comments.service";

const createComment = nextRes(async (req: Request, res: Response) => {
  const user = req.user;

  const result = await CommentService.createComment(
    req.body,
    user.userId
  );

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Comment created successfully",
    data: result,
  });
});

const getReplies = nextRes(async (req: Request, res: Response) => {
  const { parentId } = req.params;

  const result = await CommentService.getReplies(parentId as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Replies fetched successfully",
    data: result,
  });
});


export const CommentController = {
  createComment,
  getReplies
};