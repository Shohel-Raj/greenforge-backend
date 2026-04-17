/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../config/stripe.config";
import { PaymentStatus } from "../../generated/prisma/enums";
import { v7 as uuidv7 } from "uuid";
import AppError from "../../errors/AppError";
import status from "http-status";

const createCheckoutSession = async (userId: string, ideaId: string) => {
  const idea = await prisma.idea.findUnique({
    where: { id: ideaId },
  });

  if (!idea || !idea.isPaid || !idea.price) {
    throw new AppError(status.NOT_FOUND, "Paid idea not found or invalid");
  }

  // 🔒 prevent duplicate purchase (SUCCESS only)
  const existing = await prisma.payment.findFirst({
    where: {
      userId,
      ideaId,
      status: PaymentStatus.SUCCESS,
    },
  });

  if (existing) {
    throw new AppError(status.BAD_REQUEST, "Already purchased");
  }

  const transactionId = String(uuidv7());

  /**
   * 🔥 USE TRANSACTION
   */
  const session = await prisma.$transaction(async (tx) => {
    // 1️⃣ Create pending payment
    const payment = await tx.payment.create({
      data: {
        userId,
        ideaId,
        amount: idea.price!,
        transactionId,
        status: PaymentStatus.PENDING,
      },
    });

    // 2️⃣ Create Stripe session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(idea.price! * 120),
            product_data: {
              name: idea.title,
            },
          },
          quantity: 1,
        },
      ],

      success_url: `${process.env.CLIENT_URL}/payment-success`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,

      /**
       * 🔗 VERY IMPORTANT
       */
      metadata: {
        userId,
        ideaId,
        paymentId: payment.id,
        transactionId,
      },

      payment_intent_data: {
        metadata: {
          userId,
          ideaId,
          paymentId: payment.id,
          transactionId,
        },
      },
    });

    return stripeSession;
  });

  return session;
};

const getMyPayments = async (userId: string) => {
  const payments = await prisma.payment.findMany({
    where: {
      userId,
      status: "SUCCESS", // only successful purchases (you can remove if you want all)
    },
    include: {
      idea: {
        select: {
          id: true,
          title: true,
          image: true,
          price: true,
          isPaid: true,

          category: {
            select: {
              name: true,
            },
          },
          member: {
            select: {
              id: true,
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return payments;
};

export const PaymentService = {
  createCheckoutSession,
  getMyPayments,
};
