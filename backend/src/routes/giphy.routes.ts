import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as giphyController from '../controllers/giphy.controller';

const router = Router();
router.use(authMiddleware);
router.get('/gifs', giphyController.gifs);
router.get('/stickers', giphyController.stickers);

export default router;