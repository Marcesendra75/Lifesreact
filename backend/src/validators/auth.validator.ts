import { z } from 'zod';

// Política de contraseña: nunca confiamos en que el frontend la filtró bien,
// esto es lo que realmente decide si una contraseña entra o no.
const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'La contraseña debe tener al menos una mayúscula')
  .regex(/[0-9]/, 'La contraseña debe tener al menos un número')
  .regex(/[^A-Za-z0-9]/, 'La contraseña debe tener al menos un símbolo (ej: !@#$%)');

export const registerSchema = z.object({
  firstName: z.string().trim().min(1, 'El nombre es obligatorio').max(100),
  lastName: z.string().trim().min(1, 'El apellido es obligatorio').max(100),
  email: z.string().trim().toLowerCase().email('Email inválido'),
  password: passwordSchema,
  birthDate: z.string().optional(),
  acceptedTerms: z.boolean().refine((v) => v === true, {
    message: 'Tenés que aceptar los Términos y la Política de Privacidad',
  }),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});