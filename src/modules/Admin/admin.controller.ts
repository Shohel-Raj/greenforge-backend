import { Request, Response } from "express";
import { nextRes } from "../../shared/nextRes";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { AdminService } from "./admin.service";
import { IQueryParams } from "../../interfaces/query.interface";

// USERS
const getAllUsers = nextRes(async (req: Request, res: Response) => {
  const result = await AdminService.getAllUsers(req.query as IQueryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Users fetched successfully",
    data: result,
  });
});

const updateUser = nextRes(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await AdminService.updateUser(id as string, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User updated successfully",
    data: result,
  });
});

// IDEAS
const getAllIdeasAdmin = nextRes(async (req: Request, res: Response) => {
  const result = await AdminService.getAllIdeasAdmin(req.query as IQueryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Ideas fetched successfully",
    data: result,
  });
});

const updateIdeaStatus = nextRes(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await AdminService.updateIdeaStatus(id as string, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Idea status updated",
    data: result,
  });
});

const featureIdea = nextRes(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await AdminService.featureIdea(id as string, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Idea feature updated",
    data: result,
  });
});

const deleteIdea = nextRes(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await AdminService.deleteIdea(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: result.message,
  });
});

// COMMENTS
const deleteComment = nextRes(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await AdminService.deleteComment(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: result.message,
  });
});

export const AdminController = {
  getAllUsers,
  updateUser,
  getAllIdeasAdmin,
  updateIdeaStatus,
  featureIdea,
  deleteIdea,
  deleteComment,
};