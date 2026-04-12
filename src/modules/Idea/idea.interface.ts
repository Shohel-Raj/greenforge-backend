import { IdeaStatus } from "../../generated/prisma/enums";

export type TCreateIdea = {
  title: string;
  problemStatement: string;
  solution: string;
  description: string;
  image?: string;
  isPaid?: boolean;
  price?: number;
  categoryId: string;
};

export type TUpdateIdea = Partial<TCreateIdea> & {
  status?: IdeaStatus;
  feedback?: string;
};