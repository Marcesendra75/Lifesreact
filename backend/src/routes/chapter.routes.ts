import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as chapterController from '../controllers/chapter.controller';

const router = Router();
router.use(authMiddleware);

router.post('/', chapterController.create);
router.get('/', chapterController.list);
router.patch('/:id', chapterController.update);
router.delete('/:id', chapterController.remove);

export default router;