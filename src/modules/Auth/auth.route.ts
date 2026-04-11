import { Router } from "express";

import { AuthController } from "./auth.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { Authvalidate } from "./auth.validation";

const router = Router()
router.post("/register",validateRequest(Authvalidate.createUser),AuthController.registerMember)
router.post("/login", AuthController.loginUser)
router.post("/verify-email", AuthController.verifyEmail)

export const AuthRoutes = router;