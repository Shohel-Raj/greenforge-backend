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


export const AdminController = {
  getAllUsers,

};