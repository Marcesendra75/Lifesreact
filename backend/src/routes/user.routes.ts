import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import * as userController from '../controllers/user.controller';

const router = Router();

router.use(authMiddleware);

router.patch('/me', upload.none(), userController.updateProfile);
router.post('/me/avatar', upload.single('file'), userController.uploadAvatar);
router.post('/me/cover', upload.single('file'), userController.uploadCover);

export default router;