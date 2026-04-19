import express from "express";
import { WatchlistController } from "./watchlist.controller";
import { verifyAuthToken } from "../../middlewares/authVerify";
import { Role } from "../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { addToWatchlistValidation } from "./watchlist.validation";

const router = express.Router();

// ADD
router.post(
  "/",
  verifyAuthToken(Role.MEMBER),
  validateRequest(addToWatchlistValidation),
  WatchlistController.addToWatchlist
);


export const WatchlistRoutes = router;