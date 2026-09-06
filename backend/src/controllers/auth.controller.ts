import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/prisma';
import type { AuthRequest } from '../middleware/auth.middleware';
import { attachSignedUrls } from '../services/user.service';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.service';

const JWT_SECRET  = process.env.JWT_SECRET  || 'lifes_secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

// intentos fallidos permitidos antes de bloquear la cuenta, y cuánto dura el bloqueo
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000;

function generateToken(userId: string, email: string) {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES as jwt.SignOptions['expiresIn'] }
  );
}

// ── Login ──
export async function login(req: Request, res: Response) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });

    // mismo error si no existe el usuario o si la contraseña está mal,
    // para no darle pistas a quien intenta adivinar cuentas registradas
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: 'Credenciales incorrectas' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        error: 'Tenés que confirmar tu email antes de ingresar. Revisá tu bandeja de entrada.',
      });
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutosRestantes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        error: `Cuenta bloqueada temporalmente. Probá de nuevo en ${minutosRestantes} minutos`,
      });
    }

    const match = await bcrypt.compare(password, user.passwordHash);

    if (!match) {
      const intentos = user.failedLoginAttempts + 1;
      const bloquear = intentos >= MAX_FAILED_ATTEMPTS;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: bloquear ? 0 : intentos,
          lockedUntil: bloquear ? new Date(Date.now() + LOCK_TIME_MS) : null,
        },
      });

      return res.status(401).json({ success: false, error: 'Credenciales incorrectas' });
    }

    // login correcto: si venía con intentos fallidos previos, los reseteamos
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
    }

    const token = generateToken(user.id, user.email);
    res.json({ success: true, data: { token, user: await attachSignedUrls(user) } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al iniciar sesión' });
  }
}

// ── Register ──
export async function register(req: Request, res: Response) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    }
      const { firstName, lastName, email, password, birthDate } = parsed.data;

       const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      if (existing.isVerified) {
        return res.status(409).json({ success: false, error: 'El email ya está registrado' });
      }

      // existe pero nunca confirmó: le reenviamos un token nuevo en vez de bloquearlo
      const newToken = crypto.randomBytes(32).toString('hex');
      const newTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.user.update({
        where: { id: existing.id },
        data: { verificationToken: newToken, verificationTokenExp: newTokenExp },
      });

      await sendVerificationEmail(existing.email, existing.firstName, newToken);

      return res.status(201).json({
        success: true,
        message: 'Ya tenías una cuenta pendiente de confirmar. Te reenviamos el email de activación.',
      });
    }

    // 12 rounds de salt: buen balance entre seguridad y tiempo de cómputo
      const passwordHash = await bcrypt.hash(password, 12);

    // token de verificación de email, válido por 24 horas
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        birthDate: birthDate ? new Date(birthDate) : null,
        termsAcceptedAt: new Date(),
        verificationToken,
        verificationTokenExp,
      },
    });

    await sendVerificationEmail(newUser.email, newUser.firstName, verificationToken);

    // ojo: no devolvemos token acá — la cuenta queda pendiente hasta que confirme el email
    res.status(201).json({
      success: true,
      message: 'Cuenta creada. Revisá tu email para activarla antes de poder ingresar.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al registrar usuario' });
  }
}

// ── Me ──
export async function me(req: AuthRequest, res: Response) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }
    res.json({ success: true, data: await attachSignedUrls(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al obtener usuario' });
  }
}

// ── Forgot Password ──
export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email requerido' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // siempre devolvemos el mismo mensaje exista o no el email,
    // para no revelar qué emails están registrados en el sistema
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExp = new Date(Date.now() + 30 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExp },
      });

      await sendPasswordResetEmail(user.email, user.firstName, resetToken);
    }

    res.json({
      success: true,
      message: 'Si el email existe, vas a recibir instrucciones para recuperar tu contraseña',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al procesar la solicitud' });
  }
}

// ── Reset Password ──
export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, error: 'Token y nueva contraseña requeridos' });
    }

    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExp: { gt: new Date() } },
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Token inválido o vencido' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExp: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    res.json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al restablecer la contraseña' });
  }
}

// ── Verificar email ──
export async function verifyEmail(req: Request, res: Response) {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, error: 'Token requerido' });
    }

    const user = await prisma.user.findFirst({
      where: { verificationToken: token, verificationTokenExp: { gt: new Date() } },
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Token inválido o vencido' });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verificationToken: null, verificationTokenExp: null },
    });

    // al confirmar, lo dejamos logueado directo — mejor experiencia que pedirle loguearse de nuevo
    const token2 = generateToken(updated.id, updated.email);
    res.json({ success: true, data: { token: token2, user: await attachSignedUrls(updated) } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al verificar el email' });
  }
}

// ── Reenviar verificación ──
export async function resendVerification(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email requerido' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // mismo mensaje siempre, exista o no la cuenta, y si ya está verificada, por privacidad
    if (user && !user.isVerified) {
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: { verificationToken, verificationTokenExp },
      });

      await sendVerificationEmail(user.email, user.firstName, verificationToken);
    }

    res.json({
      success: true,
      message: 'Si la cuenta existe y todavía no está verificada, te reenviamos el email',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al reenviar la verificación' });
  }
}