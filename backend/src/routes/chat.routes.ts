import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import * as chatController from '../controllers/chat.controller';

const router = Router();
router.use(authMiddleware);

router.get('/', chatController.list);
router.get('/requests', chatController.listRequests);
router.get('/requests/count', chatController.requestsCount);
router.get('/unread-count', chatController.unreadTotalCount);
router.post('/start', chatController.start);
router.get('/:id/messages', chatController.messages);
router.post('/:id/messages', chatController.send);
router.post('/:id/messages/image', upload.single('file'), chatController.sendAttachment);
router.post('/:id/messages/external', chatController.sendExternalMedia);
router.post('/:id/messages/voice', upload.single('file'), chatController.sendVoice);
router.get('/:id/pinned', chatController.pinned);
router.post('/messages/:messageId/react', chatController.react);
router.patch('/messages/:messageId/pin', chatController.pin);
router.patch('/:id/respond', chatController.respond);
router.patch('/:id/read', chatController.markRead);
router.patch('/:id/typing', chatController.typing);
router.patch('/:id/settings', chatController.settings);

export default router;