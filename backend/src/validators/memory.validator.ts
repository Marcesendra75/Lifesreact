import { z } from 'zod';

// el caption es opcional, pero si viene, no puede ser gigante ni vacío con espacios
export const createMemorySchema = z.object({
  caption: z
    .string()
    .trim()
    .min(1, 'El texto no puede estar vacío')
    .max(2000, 'El texto no puede superar los 2000 caracteres')
    .optional(),
  chapterId: z.string().uuid('chapterId inválido').optional(),
});

export const updateMemorySchema = z.object({
  caption: z
    .string()
    .trim()
    .min(1, 'El texto no puede estar vacío')
    .max(2000, 'El texto no puede superar los 2000 caracteres'),
});

export const createCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'El comentario no puede estar vacío')
    .max(1000, 'El comentario no puede superar los 1000 caracteres'),
});

export const reactionSchema = z.object({
  type: z.enum(['emocionante', 'inspirador', 'recordare', 'conmueve']),
});