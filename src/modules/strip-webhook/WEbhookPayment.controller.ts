/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import status from "http-status";
import { stripe } from "../../config/stripe.config";
import {  WebhookPaymentService } from "./webhookPayment.service";
import { nextRes } from "../../shared/nextRes";
import { envFile } from "../../config/env";

const handleStripeWebhookEvent = nextRes(
  async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string;
    const webhookSecret = envFile.STRIPE.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      console.error("Missing Stripe signature or webhook secret");
      return res.status(status.BAD_REQUEST).json({
        message: "Missing Stripe signature or webhook secret",
      });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret
      );
    } catch (error: any) {
      console.error("Error processing Stripe webhook:", error.message);
      return res.status(status.BAD_REQUEST).json({
        message: "Invalid Stripe webhook signature",
      });
    }

    try {
      const result = await WebhookPaymentService.handlerStripeWebhookEvent(event);

      return res.status(status.OK).json({
        success: true,
        message: "Stripe webhook event processed successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("Webhook handling error:", error.message);

      return res.status(status.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error handling Stripe webhook event",
      });
    }
  }
);






export const WebhookPaymentController = {
  handleStripeWebhookEvent,
};