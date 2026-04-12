import { Router } from "express";
import { AuthRoutes } from "../modules/Auth/auth.route";
import { CategoryRoutes } from "../modules/Catagory/catagory.route";

const router = Router();



router.use("/auth", AuthRoutes);

router.use("/catagory", CategoryRoutes);




export const IndexRoutes = router;