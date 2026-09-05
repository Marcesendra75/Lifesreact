import { z } from 'zod';

export const updateProfileSchema = z.object({
  bio: z.string().trim().max(500, 'La bio no puede superar los 500 caracteres').optional(),
  country: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
  birthDate: z.string().optional(),
});