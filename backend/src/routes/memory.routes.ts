import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import * as memoryController from '../controllers/memory.controller';

const router = Router();

// todas las rutas de memories requieren estar logueado
router.use(authMiddleware);

router.post('/', upload.single('file'), memoryController.create);
router.get('/', memoryController.list);
router.get('/feed', memoryController.getFeed);
router.get('/saved', memoryController.getSaved);
router.get('/user/:userId', memoryController.getByUser);
router.get('/:id', memoryController.getOne);
router.patch('/:id', memoryController.update);
router.delete('/:id', memoryController.remove);

router.post('/:id/reaction', memoryController.setReaction);
router.post('/:id/share', memoryController.share);
router.get('/:id/reactions', memoryController.listReactions);
router.get('/:id/comments', memoryController.listComments);
router.post('/:id/comments', memoryController.addComment);
router.delete('/:id/comments/:commentId', memoryController.removeComment);
router.patch('/comments/:commentId', memoryController.editComment);
router.get('/comments/:commentId/replies', memoryController.listReplies);
router.post('/comments/:commentId/reaction', memoryController.setCommentReaction);
router.get('/comments/:commentId/reactions', memoryController.listCommentReactions);

export default router;