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



export const NewsletterRoutes = router;