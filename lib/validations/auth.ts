import { z } from 'zod';

// Password policy, shown to the user live as they type (see PasswordField component).
export const passwordRules = [
  { key: 'length', label: 'לפחות 8 תווים', test: (v: string) => v.length >= 8 },
  { key: 'upper', label: 'אות גדולה (A-Z)', test: (v: string) => /[A-Z]/.test(v) },
  { key: 'lower', label: 'אות קטנה (a-z)', test: (v: string) => /[a-z]/.test(v) },
  { key: 'number', label: 'ספרה (0-9)', test: (v: string) => /[0-9]/.test(v) },
  { key: 'special', label: 'תו מיוחד (!@#$...)', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const;

export const passwordSchema = z
  .string()
  .min(8, 'הסיסמה חייבת לכלול לפחות 8 תווים')
  .regex(/[A-Z]/, 'הסיסמה חייבת לכלול אות גדולה')
  .regex(/[a-z]/, 'הסיסמה חייבת לכלול אות קטנה')
  .regex(/[0-9]/, 'הסיסמה חייבת לכלול ספרה')
  .regex(/[^A-Za-z0-9]/, 'הסיסמה חייבת לכלול תו מיוחד');

export const registerSchema = z.object({
  fullName: z.string().min(2, 'נא להזין שם מלא'),
  email: z.string().email('כתובת אימייל לא תקינה'),
  phoneCountryCode: z.string().default('+972'),
  phone: z.string().min(6, 'מספר טלפון לא תקין'),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().email('כתובת אימייל לא תקינה'),
  password: z.string().min(1, 'נא להזין סיסמה'),
});

export const resetPasswordRequestSchema = z.object({
  email: z.string().email('כתובת אימייל לא תקינה'),
});

export const updatePasswordSchema = z.object({
  password: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
