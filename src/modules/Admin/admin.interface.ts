import { IdeaStatus, Role, UserStatus } from "../../generated/prisma/enums";

export type TUpdateUser = {
  role?: Role;
  status?: UserStatus;
};

export type TUpdateIdeaStatus = {
  status: IdeaStatus;
  feedback?: string;
};

export type TFeatureIdea = {
  isfeatures: boolean;
};