import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as blockController from '../controllers/block.controller';

const router = Router();

router.use(authMiddleware);

router.post('/', blockController.block);
router.delete('/:id', blockController.unblock);
router.get('/', blockController.list);

export default router;