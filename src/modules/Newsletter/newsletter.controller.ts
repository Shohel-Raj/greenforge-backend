import { Request, Response } from "express";
import { nextRes } from "../../shared/nextRes";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { NewsletterService } from "./newsletter.service";
import { NewsletterMessage } from "./newsletter.constant";

//  SUBSCRIBE
const subscribe = nextRes(async (req: Request, res: Response) => {
  const { email } = req.body;

  const result = await NewsletterService.subscribe(email);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: NewsletterMessage.SUBSCRIBED,
    data: result,
  });
});

//  GET ALL
const getAll = nextRes(async (_req: Request, res: Response) => {
  const result = await NewsletterService.getAll();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: NewsletterMessage.FETCHED,
    data: result,
  });
});

//  DELETE
const remove = nextRes(async (req: Request, res: Response) => {
  const { id } = req.params;

  await NewsletterService.remove(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: NewsletterMessage.DELETED,
  });
});

export const NewsletterController = {
  subscribe,
  getAll,
  remove,
};