// ============================================
// LIFE'S — Auth Controller
// ============================================
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db';
import type { AuthRequest } from '../middleware/auth.middleware';

const JWT_SECRET  = process.env.JWT_SECRET  || 'lifes_secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

function generateToken(userId: number, email: string) {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

// ── Login ──
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, error: 'Email y contraseña requeridos' });

    const [rows]: any = await pool.query(
      'SELECT * FROM users WHERE email = ? AND is_active = 1 LIMIT 1', [email]
    );
    const user = rows[0];
    if (!user)
      return res.status(401).json({ success: false, error: 'Credenciales incorrectas' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)
      return res.status(401).json({ success: false, error: 'Credenciales incorrectas' });

    const token = generateToken(user.id, user.email);
    const { password_hash, ...userSafe } = user;

    res.json({ success: true, data: { token, user: userSafe } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al iniciar sesión' });
  }
}

// ── Register ──
export async function register(req: Request, res: Response) {
  try {
    const { firstName, lastName, email, password, birthDate } = req.body;
    if (!firstName || !lastName || !email || !password)
      return res.status(400).json({ success: false, error: 'Todos los campos son requeridos' });

    const [existing]: any = await pool.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1', [email]
    );
    if (existing[0])
      return res.status(409).json({ success: false, error: 'El email ya está registrado' });

    const passwordHash = await bcrypt.hash(password, 12);
    const [result]: any = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, birth_date, membership_level)
       VALUES (?, ?, ?, ?, ?, 'bronze')`,
      [firstName, lastName, email, passwordHash, birthDate || null]
    );

    const [newUser]: any = await pool.query(
      'SELECT id, first_name, last_name, email, membership_level, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    const token = generateToken(result.insertId, email);
    res.status(201).json({ success: true, data: { token, user: newUser[0] } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al registrar usuario' });
  }
}

// ── Me ──
export async function me(req: AuthRequest, res: Response) {
  try {
    const [rows]: any = await pool.query(
      `SELECT id, first_name, last_name, email, avatar_url, cover_url, bio,
              birth_date, country, city, membership_level, is_verified, created_at
       FROM users WHERE id = ? LIMIT 1`,
      [req.userId]
    );
    if (!rows[0])
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al obtener usuario' });
  }
}

// ── Forgot Password ──
export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    // TODO: implementar envío de email con nodemailer
    // Por ahora retorna success sin revelar si el email existe
    res.json({ success: true, message: 'Si el email existe, recibirás instrucciones' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al procesar solicitud' });
  }
}
