import rateLimit from 'express-rate-limit';

// frena fuerza bruta a nivel de IP en las rutas de auth
// esto se suma al bloqueo por cuenta que hacemos en el controller
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Demasiados intentos, esperá unos minutos e intentá de nuevo' },
  standardHeaders: true,
  legacyHeaders: false,
});