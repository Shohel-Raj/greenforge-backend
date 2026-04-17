import express from "express";
import { VoteController } from "./vote.controller";
import { voteValidation } from "./vote.validation";
import { verifyAuthToken } from "../../middlewares/authVerify";
import { Role } from "../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";

const router = express.Router();

// ✅ create / toggle vote
router.post(
  "/",
  verifyAuthToken(Role.MEMBER),
  validateRequest(voteValidation),
  VoteController.voteIdea
);

// ✅ get user vote (for UI state)
router.get(
  "/:ideaId",
  verifyAuthToken(Role.MEMBER),
  VoteController.getUserVote
);

export const VoteRoutes = router;