import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import * as userController from '../controllers/user.controller';

const router = Router();

router.use(authMiddleware);

router.get('/search', userController.search);
router.get('/suggestions', userController.suggestions);
router.patch('/me', upload.none(), userController.updateProfile);
router.patch('/me/privacy', userController.updatePrivacy);
router.patch('/me/comment-privacy', userController.updateCommentPrivacy);
router.patch('/me/chat-privacy', userController.updateChatPrivacy);
router.patch('/chat-privacy', userController.updateChatPrivacy);
router.post('/me/avatar', upload.single('file'), userController.uploadAvatar);
router.post('/me/cover', upload.single('file'), userController.uploadCover);
router.get('/:id/mutuals', userController.mutuals);
router.get('/:id', userController.getById);

export default router;