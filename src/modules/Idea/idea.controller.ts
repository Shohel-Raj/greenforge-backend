import { Request, Response } from "express";
import { nextRes } from "../../shared/nextRes";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { IdeaService } from "./idea.service";
import { IQueryParams } from "../../interfaces/query.interface";

const createIdea = nextRes(async (req: Request, res: Response) => {
  const user = req.user;
  const payload = { ...req.body, image: req?.file?.path };

  const result = await IdeaService.createIdea(payload, user.userId);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Idea created successfully",
    data: result,
  });
});

const getAllIdeas = nextRes(async (req: Request, res: Response) => {
  const result = await IdeaService.getAllIdeas(req.query as IQueryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Ideas fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleIdea = nextRes(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user;

  const result = await IdeaService.getIdeaById(id as string,user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Idea fetched successfully",
    data: result,
  });
});

const updateIdea = nextRes(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const user = req.user;

  const result = await IdeaService.updateIdea(id as string, payload, user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Idea updated successfully",
    data: result,
  });
});

const deleteIdea = nextRes(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user;

  const result = await IdeaService.deleteIdea(id as string, user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Idea deleted successfully",
    data: result,
  });
});

export const IdeaController = {
  createIdea,
  getAllIdeas,
  getSingleIdea,
  updateIdea,
  deleteIdea,
};
