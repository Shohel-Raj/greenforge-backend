import { Router } from "express";
import { PaymentController } from "./payment.controller";
import { verifyAuthToken } from "../../middlewares/authVerify";
import { Role } from "../../generated/prisma/enums";

const router = Router();

// 🔥 Create checkout session
router.post(
  "/checkout",
  verifyAuthToken(Role.MEMBER),
  PaymentController.createCheckoutSession
);

// 🔥 Optional: get my payments
router.get(
  "/my-payments",
  verifyAuthToken(Role.MEMBER),
  PaymentController.getMyPayments
);

export const PaymentRoutes = router;