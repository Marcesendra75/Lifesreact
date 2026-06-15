// ============================================
// LIFE'S — Rutas Auth
// ============================================
import { Router } from 'express';
import { login, register, me, forgotPassword } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/login',           login);
router.post('/register',        register);
router.post('/forgot-password', forgotPassword);
router.get('/me',               authMiddleware, me);

export default router;
