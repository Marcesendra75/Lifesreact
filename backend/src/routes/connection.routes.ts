import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as connectionController from '../controllers/connection.controller';

const router = Router();

router.use(authMiddleware);

router.post('/', connectionController.sendRequest);
router.post('/by-id', connectionController.sendRequestById);
router.get('/', connectionController.list);
router.patch('/:id/accept', connectionController.accept);
router.patch('/:id/reject', connectionController.reject);
router.patch('/:id/propose-type', connectionController.proposeType);
router.patch('/:id/accept-type', connectionController.acceptType);
router.patch('/:id/reject-type', connectionController.rejectType);
router.patch('/:id/cancel-type', connectionController.cancelType);
router.delete('/:id', connectionController.remove);

export default router;