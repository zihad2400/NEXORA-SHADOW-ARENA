import { z } from 'zod';

export const usernameSchema = z
  .string()
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be at most 20 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, and underscores only');

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Invalid email address')
  .max(254);

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters');

export const registerSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password required').max(128),
});

export const profileUpdateSchema = z.object({
  username: usernameSchema.optional(),
  // Avatar now accepts any string up to 32 characters (including emojis)
  avatar: z
    .string()
    .min(1, 'Avatar cannot be empty')
    .max(32, 'Avatar too long')
    .optional(),
  settings: z
    .object({
      soundEnabled: z.boolean().optional(),
      reducedMotion: z.boolean().optional(),
      profilePublic: z.boolean().optional(),
    })
    .optional(),
});

export function parseOrError(schema, payload) {
  const result = schema.safeParse(payload);
  if (result.success) return { success: true, data: result.data };
  const first = result.error.issues[0];
  return {
    success: false,
    error: { field: first.path.join('.') || 'form', message: first.message },
  };
}
