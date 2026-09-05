import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/prisma';
import type { AuthRequest } from '../middleware/auth.middleware';
import { attachSignedUrls } from '../services/user.service';

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
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email y contraseña requeridos' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // mismo error si no existe el usuario o si la contraseña está mal,
    // para no darle pistas a quien intenta adivinar cuentas registradas
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: 'Credenciales incorrectas' });
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
    const { firstName, lastName, email, password, birthDate } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, error: 'Todos los campos son requeridos' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, error: 'El email ya está registrado' });
    }

    // 12 rounds de salt: buen balance entre seguridad y tiempo de cómputo
    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        birthDate: birthDate ? new Date(birthDate) : null,
      },
    });

    const token = generateToken(newUser.id, newUser.email);
    res.status(201).json({ success: true, data: { token, user: await attachSignedUrls(newUser) } });
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

      // acá va el envío del mail con el link (/reset-password?token=resetToken)
      // lo conectamos cuando armemos el módulo de mail
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