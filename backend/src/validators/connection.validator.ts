import { z } from 'zod';

export const sendConnectionRequestSchema = z.object({
  addresseeEmail: z.string().trim().toLowerCase().email('Email inválido'),
});