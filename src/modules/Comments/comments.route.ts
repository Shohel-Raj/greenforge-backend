import express from 'express';
import { verifyAuthToken } from '../../middlewares/authVerify';
import { validateRequest } from '../../middlewares/validateRequest';
import { Role } from '../../generated/prisma/enums';
import { createCommentValidation, updateCommentValidation } from './comments.validation';
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
router.patch(
  "/:id",
  verifyAuthToken(Role.MEMBER),
  validateRequest(updateCommentValidation),
  CommentController.updateComment
);


export const CommentsRoutes = router;
