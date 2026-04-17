/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { PaymentStatus } from "../../generated/prisma/enums";

const handlerStripeWebhookEvent = async (event: Stripe.Event) => {
  // 🔒 Idempotency check
  const existingEvent = await prisma.payment.findFirst({
    where: {
      stripeEventId: event.id,
    },
  });

  if (existingEvent) {
    console.log(`Event ${event.id} already processed`);
    return { message: "Event already processed" };
  }

  switch (event.type) {
    /**
     * =========================
     * SUCCESS PAYMENT
     * =========================
     */
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      const paymentId = session.metadata?.paymentId;
      const transactionId = session.metadata?.transactionId;

      if (!paymentId || !transactionId) {
        console.error("Missing paymentId or transactionId");
        return { message: "Missing metadata" };
      }

      await prisma.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          status:
            session.payment_status === "paid"
              ? PaymentStatus.SUCCESS
              : PaymentStatus.PENDING,
          stripeEventId: event.id,
          paymentGatewayData: session as any,
        },
      });

      console.log(`Payment SUCCESS updated: ${paymentId}`);
      break;
    }

    /**
     * =========================
     * PAYMENT FAILED
     * =========================
     */
    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;

      const transactionId = intent.metadata?.transactionId;

      if (!transactionId) {
        console.error("Missing transactionId in intent metadata");
        break;
      }

      await prisma.payment.update({
        where: {
          transactionId,
        },
        data: {
          status: PaymentStatus.FAILED,
          stripeEventId: event.id,
          paymentGatewayData: intent as any,
        },
      });

      console.log(`Payment FAILED: ${transactionId}`);
      break;
    }

    /**
     * =========================
     * SESSION EXPIRED
     * =========================
     */
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;

      const paymentId = session.metadata?.paymentId;

      if (!paymentId) {
        console.error("Missing paymentId in session metadata");
        break;
      }

      await prisma.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          status: PaymentStatus.FAILED,
          stripeEventId: event.id,
        },
      });

      console.log(`Session expired: ${paymentId}`);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
      break;
  }

  return { message: `Processed event ${event.id}` };
};

export const WebhookPaymentService = {
  handlerStripeWebhookEvent,
};