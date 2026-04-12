import { Router } from "express";
import { AuthRoutes } from "../modules/Auth/auth.route";
import { CategoryRoutes } from "../modules/Catagory/catagory.route";
import { IdeaRoutes } from "../modules/Idea/idea.route";

const router = Router();



router.use("/auth", AuthRoutes);

router.use("/catagory", CategoryRoutes);

router.use("/idea", IdeaRoutes);




export const IndexRoutes = router;