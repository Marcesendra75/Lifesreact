import { Router } from 'express';
import { login, register, me, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { authRateLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

router.post('/login',           authRateLimiter, login);
router.post('/register',        authRateLimiter, register);
router.post('/forgot-password', authRateLimiter, forgotPassword);
router.post('/reset-password',  authRateLimiter, resetPassword);
router.get('/me',               authMiddleware, me);

export default router;