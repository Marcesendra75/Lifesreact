import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const createChapterSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(100),
  desde: z.number().int().min(1900, 'Año inválido').max(currentYear + 1, 'Año inválido'),
  hasta: z.number().int().min(1900, 'Año inválido').max(currentYear + 1, 'Año inválido'),
  color: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido, usá formato hex (#RRGGBB)'),
  emoji: z.string().trim().min(1).max(4).optional(),
}).refine((data) => data.hasta >= data.desde, {
  message: 'El año "hasta" no puede ser anterior al año "desde"',
  path: ['hasta'],
});

export const updateChapterSchema = z.object({
  nombre: z.string().trim().min(1).max(100).optional(),
  desde: z.number().int().min(1900).max(currentYear + 1).optional(),
  hasta: z.number().int().min(1900).max(currentYear + 1).optional(),
  color: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido').optional(),
  emoji: z.string().trim().min(1).max(4).optional(),
});