import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as interactionController from '../controllers/interaction.controller';


const router = Router();

router.use(authMiddleware);

router.post('/hide/:memoryId', interactionController.hide);
router.delete('/hide/:memoryId', interactionController.unhide);

router.post('/mute', interactionController.mute);
router.delete('/mute/:id', interactionController.unmute);
router.get('/mute', interactionController.listMuted);

router.get('/save', interactionController.listSavedIds);
router.post('/save/:memoryId', interactionController.save);
router.delete('/save/:memoryId', interactionController.unsave);

router.post('/hide-comment/:commentId', interactionController.hideComment);

router.delete('/hide-comment/:commentId', interactionController.unhideComment);

export default router;