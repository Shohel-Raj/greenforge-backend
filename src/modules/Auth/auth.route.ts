import { Router } from "express";

import { AuthController } from "./auth.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { Authvalidate } from "./auth.validation";
import { verifyAuthToken } from "../../middlewares/authVerify";
import { Role } from "../../generated/prisma/enums";

const router = Router()
router.post("/register",validateRequest(Authvalidate.createUser),AuthController.registerMember)
router.post("/login", AuthController.loginUser)
router.post("/verify-email", AuthController.verifyEmail)
router.get("/me", verifyAuthToken(Role.ADMIN,Role.MEMBER), AuthController.getMe)

router.post("/change-password", verifyAuthToken(Role.ADMIN,Role.MEMBER), AuthController.changePassword)
router.post("/logout", verifyAuthToken(Role.ADMIN,Role.MEMBER), AuthController.logoutUser)


export const AuthRoutes = router;