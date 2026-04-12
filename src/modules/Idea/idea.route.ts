import express from "express";
import { IdeaController } from "./idea.controller";
import { createIdeaValidation, updateIdeaValidation } from "./idea.validation";
import { verifyAuthToken } from "../../middlewares/authVerify";
import { Role } from "../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";

const router = express.Router();

router.post(
  "/",
  verifyAuthToken(Role.MEMBER),
  validateRequest(createIdeaValidation),
  IdeaController.createIdea
);

router.get("/", IdeaController.getAllIdeas);

router.get("/:id", IdeaController.getSingleIdea);

router.patch("/:id",
  verifyAuthToken(Role.MEMBER, Role.ADMIN),
  validateRequest(updateIdeaValidation),
  IdeaController.updateIdea
);

router.delete("/:id",
  verifyAuthToken(Role.MEMBER, Role.ADMIN),
  IdeaController.deleteIdea
);

export const IdeaRoutes = router;