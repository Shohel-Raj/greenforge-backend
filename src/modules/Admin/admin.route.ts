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


export const AdminRoutes = router;