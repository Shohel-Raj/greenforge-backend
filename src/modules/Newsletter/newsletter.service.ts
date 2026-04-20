import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import status from "http-status";
import { NewsletterMessage } from "./newsletter.constant";

// SUBSCRIBE
const subscribe = async (email: string) => {
  try {
    const result = await prisma.newsletter.create({
      data: { email },
    });

    return result;
  } catch (error) {
    throw new AppError(
      status.BAD_REQUEST,
      NewsletterMessage.ALREADY_SUBSCRIBED
    );
  }
};

//  GET ALL (Admin use)
const getAll = async () => {
  return prisma.newsletter.findMany({
    orderBy: { createdAt: "desc" },
  });
};

// DELETE / UNSUBSCRIBE
const remove = async (id: string) => {
  const existing = await prisma.newsletter.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Subscription not found");
  }

  await prisma.newsletter.delete({
    where: { id },
  });

  return null;
};

export const NewsletterService = {
  subscribe,
  getAll,
  remove,
};