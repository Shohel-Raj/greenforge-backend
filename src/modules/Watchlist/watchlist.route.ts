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

//  REMOVE
router.delete(
  "/:ideaId",
  verifyAuthToken(Role.MEMBER),
  WatchlistController.removeFromWatchlist
);

// GET MY LIST
router.get(
  "/my",
  verifyAuthToken(Role.MEMBER),
  WatchlistController.getMyWatchlist
);


export const WatchlistRoutes = router;