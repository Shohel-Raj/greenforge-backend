import { Watchlist } from "../../generated/prisma/client";

export type IWatchlist = Watchlist;

export interface IWatchlistCheckResponse {
  isSaved: boolean;
}