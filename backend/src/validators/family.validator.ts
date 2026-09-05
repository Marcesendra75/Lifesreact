import { z } from 'zod';

const genderEnum = z.enum(['male', 'female', 'other']);

export const createFamilyMemberSchema = z.object({
  firstName: z.string().trim().min(1, 'El nombre es obligatorio').max(100),
  lastName: z.string().trim().max(100).optional(),
  gender: genderEnum.optional(),
  birthDate: z.string().optional(),
  deathDate: z.string().optional(),
  bio: z.string().trim().max(2000).optional(),
  motherId: z.string().uuid('motherId inválido').optional(),
  fatherId: z.string().uuid('fatherId inválido').optional(),
});

export const updateFamilyMemberSchema = createFamilyMemberSchema.partial();

export const createPartnerSchema = z.object({
  memberAId: z.string().uuid('memberAId inválido'),
  memberBId: z.string().uuid('memberBId inválido'),
});

export const linkMemberSchema = z.object({
  userId: z.string().uuid('userId inválido'),
});