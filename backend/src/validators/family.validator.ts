import { z } from 'zod';

const genderEnum = z.enum(['male', 'female', 'other']);

export const createFamilyMemberSchema = z.object({
  firstName: z.string().trim().min(1, 'El nombre es obligatorio').max(100),
  lastName: z.string().trim().max(100).optional(),
  gender: genderEnum.optional(),
  birthDate: z.string().optional(),
  deathDate: z.string().optional(),
  bio: z.string().trim().max(2000).optional(),
  relacionManual: z.union([z.string().trim().max(60), z.literal('')]).optional(),
  motherId: z.union([z.string().uuid('motherId inválido'), z.literal('')]).optional(),
  fatherId: z.union([z.string().uuid('fatherId inválido'), z.literal('')]).optional(),
});

export const updateFamilyMemberSchema = createFamilyMemberSchema.partial();

export const createPartnerSchema = z.object({
  memberAId: z.string().uuid('memberAId inválido'),
  memberBId: z.string().uuid('memberBId inválido'),
});

export const linkMemberSchema = z.object({
  userId: z.string().uuid('userId inválido'),
});

export const positionSchema = z.object({
  posX: z.number(),
  posY: z.number(),
});