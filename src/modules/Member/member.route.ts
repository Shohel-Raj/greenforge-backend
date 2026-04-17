import express from "express";
import { MemberController } from "./member.controller";
import { verifyAuthToken } from "../../middlewares/authVerify";
import { Role } from "../../generated/prisma/enums";

const router = express.Router();

// 🔥 MEMBER DASHBOARD OVERVIEW
router.get(
  "/dashboard/overview",
  verifyAuthToken(Role.MEMBER),
  MemberController.getDashboardOverview
);

// 📊 MEMBER IDEA CHART
router.get(
  "/dashboard/chart/ideas",
  verifyAuthToken(Role.MEMBER),
  MemberController.getIdeaChart
);

// 📊 MEMBER VOTE PERFORMANCE CHART
router.get(
  "/dashboard/chart/votes",
  verifyAuthToken(Role.MEMBER),
  MemberController.getVoteChart
);

// 🧾 RECENT IDEAS
router.get(
  "/dashboard/recent/ideas",
  verifyAuthToken(Role.MEMBER),
  MemberController.getRecentIdeas
);

export const MemberRoutes = router;