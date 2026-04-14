import express from "express";
import { CategoryController } from "./catagory.controller";
import {
  createCategoryValidation,
  updateCategoryValidation,
} from "./catagory.validation";
import { verifyAuthToken } from "../../middlewares/authVerify";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../../generated/prisma/enums";

const router = express.Router();
router.use(verifyAuthToken(Role.MEMBER));


// Create
router.post(
  "/create",validateRequest(createCategoryValidation),  
  CategoryController.createCategory
);

// Get all
router.get("/", CategoryController.getAllCategories);

// Get single
router.get("/:id", CategoryController.getSingleCategory);

// Update
router.patch(
  "/:id",
  validateRequest(updateCategoryValidation),
  CategoryController.updateCategory
);

// Delete
router.delete("/:id", CategoryController.deleteCategory);

export const CategoryRoutes = router;