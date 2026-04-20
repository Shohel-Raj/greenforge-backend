import express from "express";
import { NewsletterController } from "./newsletter.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { subscribeNewsletterValidation } from "./newsletter.validation";
import { verifyAuthToken } from "../../middlewares/authVerify";
import { Role } from "../../generated/prisma/enums";

const router = express.Router();

//  PUBLIC SUBSCRIBE
router.post(
  "/subscribe",
  validateRequest(subscribeNewsletterValidation),
  NewsletterController.subscribe
);

//  ADMIN: GET ALL SUBSCRIBERS
router.get(
  "/",
  verifyAuthToken(Role.ADMIN),
  NewsletterController.getAll
);

//  ADMIN: DELETE / UNSUBSCRIBE
router.delete(
  "/:id",
  verifyAuthToken(Role.ADMIN),
  NewsletterController.remove
);

export const NewsletterRoutes = router;