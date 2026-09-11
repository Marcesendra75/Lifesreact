import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as reportController from '../controllers/report.controller';

const router = Router();

router.use(authMiddleware);

router.post('/', reportController.create);
router.get('/', reportController.list); // TODO: restringir a rol admin cuando exista

export default router;