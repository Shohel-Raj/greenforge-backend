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


export const NewsletterService = {
  subscribe,
 
};