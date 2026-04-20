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


export const NewsletterController = {
  subscribe,

};