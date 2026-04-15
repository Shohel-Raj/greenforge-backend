export type TCreateComment = {
  content: string;
  ideaId: string;
  parentId?: string;
  rating?: number;
};

export type TUpdateComment = {
  content?: string;
  rating?: number;
};