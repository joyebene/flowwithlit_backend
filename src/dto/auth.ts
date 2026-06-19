import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  deviceFingerprint: z.string().optional(),
});

export const emailSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, 'OTP must be 6 digits'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, 'OTP must be 6 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type EmailDto = z.infer<typeof emailSchema>;
export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;