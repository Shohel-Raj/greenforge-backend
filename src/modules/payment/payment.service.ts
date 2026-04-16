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

      const ideaId = session.metadata?.ideaId;
      const userId = session.metadata?.userId;
      const transactionId = session.payment_intent as string;

      if (!ideaId || !userId || !transactionId) {
        console.error("Missing metadata in Stripe session");
        return { message: "Missing metadata" };
      }

      // 🔒 Prevent duplicate purchase (your schema rule)
      const existingPayment = await prisma.payment.findFirst({
        where: {
          userId,
          ideaId,
        },
      });

      if (existingPayment?.status === PaymentStatus.SUCCESS) {
        console.log("User already purchased this idea");
        return { message: "Already purchased" };
      }

      await prisma.$transaction(async (tx) => {
        await tx.payment.upsert({
          where: {
            transactionId,
          },
          update: {
            status:
              session.payment_status === "paid"
                ? PaymentStatus.SUCCESS
                : PaymentStatus.PENDING,
            stripeEventId: event.id,
            paymentGatewayData: session as any,
          },
          create: {
            amount: (session.amount_total ?? 0) / 100,
            status:
              session.payment_status === "paid"
                ? PaymentStatus.SUCCESS
                : PaymentStatus.PENDING,
            transactionId,
            stripeEventId: event.id,
            paymentGatewayData: session as any,
            userId,
            ideaId,
          },
        });
      });

      console.log(`Payment success for idea ${ideaId}`);
      break;
    }

    /**
     * =========================
     * PAYMENT FAILED
     * =========================
     */
    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;

      const transactionId = intent.id;

      await prisma.payment.updateMany({
        where: {
          transactionId,
        },
        data: {
          status: PaymentStatus.FAILED,
          stripeEventId: event.id,
          paymentGatewayData: intent as any,
        },
      });

      console.log(`Payment failed: ${transactionId}`);
      break;
    }

    /**
     * =========================
     * EXPIRED SESSION
     * =========================
     */
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;

      const transactionId = session.payment_intent as string;

      await prisma.payment.updateMany({
        where: {
          transactionId,
        },
        data: {
          status: PaymentStatus.FAILED,
          stripeEventId: event.id,
        },
      });

      console.log(`Session expired: ${session.id}`);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
      break;
  }

  return { message: `Processed event ${event.id}` };
};

export const PaymentService = {
  handlerStripeWebhookEvent,
};