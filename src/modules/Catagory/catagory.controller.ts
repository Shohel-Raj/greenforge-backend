import { Request, Response } from "express";
import { nextRes } from "../../shared/nextRes";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { CategoryService } from "./catagory.service";


const createCategory = nextRes(
  async (req: Request, res: Response) => {
    const user = req.user;
    const payload = req.body;

    const result = await CategoryService.createCategory(
      payload,
      user.userId
    );

    sendResponse(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Category created successfully",
      data: result,
    });
  }
);

const getAllCategories = nextRes(
  async (req: Request, res: Response) => {
    const result = await CategoryService.getAllCategories();

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Categories fetched successfully",
      data: result,
    });
  }
);

const getSingleCategory = nextRes(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await CategoryService.getSingleCategory(id as string);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Category fetched successfully",
      data: result,
    });
  }
);

const updateCategory = nextRes(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;

    const result = await CategoryService.updateCategory(
      id as string,
      payload
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Category updated successfully",
      data: result,
    });
  }
);

const deleteCategory = nextRes(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await CategoryService.deleteCategory(id as string);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Category deleted successfully",
      data: result,
    });
  }
);

export const CategoryController = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};