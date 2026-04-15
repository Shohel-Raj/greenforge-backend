import express from 'express';
import { verifyAuthToken } from '../../middlewares/authVerify';
import { validateRequest } from '../../middlewares/validateRequest';
import { Role } from '../../generated/prisma/enums';
import { createCommentValidation } from './comments.validation';
import { CommentController } from './comments.controller';

const router = express.Router();

// create comment or reply
router.post(
  "/",
  verifyAuthToken(Role.MEMBER),
  validateRequest(createCommentValidation),
  CommentController.createComment
);
// load replies (on click)
router.get("/replies/:parentId", CommentController.getReplies);


export const CommentsRoutes = router;
