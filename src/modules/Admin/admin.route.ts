import express from "express";
import { AdminController } from "./admin.controller";

import {
  updateUserValidation,
  updateIdeaStatusValidation,
  featureIdeaValidation,
} from "./admin.validation";
import { verifyAuthToken } from "../../middlewares/authVerify";
import { Role } from "../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";

const router = express.Router();

// 🔒 all routes admin only
router.use(verifyAuthToken(Role.ADMIN));

// USERS
router.get("/users", AdminController.getAllUsers);

router.patch(
  "/users/:id",
  validateRequest(updateUserValidation),
  AdminController.updateUser
);

// IDEAS
router.get("/ideas", AdminController.getAllIdeasAdmin);

router.patch(
  "/ideas/:id/status",
  validateRequest(updateIdeaStatusValidation),
  AdminController.updateIdeaStatus
);

router.patch(
  "/ideas/:id/feature",
  validateRequest(featureIdeaValidation),
  AdminController.featureIdea
);

router.delete("/ideas/:id", AdminController.deleteIdea);

// COMMENTS
router.delete("/comments/:id", AdminController.deleteComment);



router.get("/overview", AdminController.getDashboardOverview);

router.get("/chart/ideas", AdminController.getIdeaChart);

router.get("/chart/payments", AdminController.getPaymentChart);

export const AdminRoutes = router;