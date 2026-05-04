import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['artist', 'fan']),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
