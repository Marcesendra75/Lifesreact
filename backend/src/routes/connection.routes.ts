import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as connectionController from '../controllers/connection.controller';

const router = Router();

router.use(authMiddleware);

router.post('/', connectionController.sendRequest);
router.get('/', connectionController.list);
router.patch('/:id/accept', connectionController.accept);
router.patch('/:id/reject', connectionController.reject);
router.delete('/:id', connectionController.remove);

export default router;