import { Router } from "express";
import { AuthRoutes } from "../modules/Auth/auth.route";
import { CategoryRoutes } from "../modules/Catagory/catagory.route";
import { IdeaRoutes } from "../modules/Idea/idea.route";
import { CommentsRoutes } from "../modules/Comments/comments.route";
import { PaymentRoutes } from "../modules/payment/payment.route";
import { AdminRoutes } from "../modules/Admin/admin.route";
import { VoteRoutes } from "../modules/Vote/vote.route";

const router = Router();



router.use("/auth", AuthRoutes);

router.use("/catagory", CategoryRoutes);

router.use("/idea", IdeaRoutes);


router.use("/comments", CommentsRoutes);

router.use("/vote", VoteRoutes);

router.use("/payment", PaymentRoutes);

router.use("/admin", AdminRoutes);





export const IndexRoutes = router;