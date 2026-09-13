import { z } from 'zod';

export const sendMessageSchema = z.object({
  content: z.string().trim().min(1, 'El mensaje no puede estar vacío').max(4000),
  replyToId: z.string().uuid('Mensaje inválido').optional(),
});

export const startConversationSchema = z.object({
  userId: z.string().uuid('Usuario inválido'),
  content: z.string().trim().min(1, 'El mensaje no puede estar vacío').max(4000),
});

export const externalMediaSchema = z.object({
  url: z.string().url('URL inválida'),
  type: z.enum(['gif', 'sticker']),
  replyToId: z.string().uuid('Mensaje inválido').optional(),
});