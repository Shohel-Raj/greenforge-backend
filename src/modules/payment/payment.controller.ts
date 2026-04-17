/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import status from "http-status";
import { PaymentService } from "./payment.service";
import { nextRes } from "../../shared/nextRes";
import { sendResponse } from "../../shared/sendResponse";



// my own api
const createCheckoutSession = nextRes(async (req:Request, res:Response) => {
  const userId = req.user.id;
  const { ideaId } = req.body;

  const result = await PaymentService.createCheckoutSession(
    userId,
    ideaId
  );

   sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Payment done successfully",
      data: result,
    });
});
const getMyPayments = nextRes(async (req:Request, res:Response) => {
  const userId = req.user.id;

  const result = await PaymentService.getMyPayments(
    userId,
  );

   sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Payment done successfully",
      data: result,
    });
});




export const PaymentController = {
  createCheckoutSession,
  getMyPayments
};