import { VoteType } from "../../generated/prisma/enums";

export type TVotePayload = {
  ideaId: string;
  type: VoteType
};