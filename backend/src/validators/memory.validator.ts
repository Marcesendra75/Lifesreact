import { z } from 'zod';

// el caption es opcional, pero si viene, no puede ser gigante ni vacío con espacios
export const createMemorySchema = z.object({
  caption: z
    .string()
    .trim()
    .min(1, 'El texto no puede estar vacío')
    .max(2000, 'El texto no puede superar los 2000 caracteres')
    .optional(),
});

export const updateMemorySchema = z.object({
  caption: z
    .string()
    .trim()
    .min(1, 'El texto no puede estar vacío')
    .max(2000, 'El texto no puede superar los 2000 caracteres'),
});