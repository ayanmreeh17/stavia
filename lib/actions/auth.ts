'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { loginSchema, registerSchema, resetPasswordRequestSchema, updatePasswordSchema } from '@/lib/validations/auth';

export type ActionResult = { error?: string; success?: boolean };

export async function registerAction(formData: FormData): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    phoneCountryCode: formData.get('phoneCountryCode') || '+972',
    phone: formData.get('phone'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'נתונים לא תקינים' };
  }

  const { fullName, email, phoneCountryCode, phone, password } = parsed.data;
  const supabase = createClient();

  // Supabase Auth hashes and stores the password securely server-side —
  // it never touches our database or source code in plain text.
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone: `${phoneCountryCode}${phone}` },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) return { error: translateAuthError(error.message) };

  // The public.handle_new_user() trigger creates the matching profiles row.
  // If this email matches ADMIN_EMAIL, promote to admin — see helper below.
  await maybePromoteToAdmin(email);

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'נתונים לא תקינים' };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) return { error: translateAuthError(error.message) };

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function logoutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function requestPasswordResetAction(formData: FormData): Promise<ActionResult> {
  const parsed = resetPasswordRequestSchema.safeParse({ email: formData.get('email') });
  if (!parsed.success) return { error: 'כתובת אימייל לא תקינה' };

  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/account/change-password`,
  });

  // Always return success even if the email doesn't exist — avoids leaking
  // which emails are registered.
  if (error) return { error: 'אירעה שגיאה, נסו שוב מאוחר יותר' };
  return { success: true };
}

export async function updatePasswordAction(formData: FormData): Promise<ActionResult> {
  const parsed = updatePasswordSchema.safeParse({ password: formData.get('password') });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: translateAuthError(error.message) };
  return { success: true };
}

/**
 * Promotes a freshly-created profile to role='admin' if its email matches
 * the ADMIN_EMAIL environment variable. Uses the service_role client so it
 * bypasses RLS (a normal user can never set their own role — see
 * 002_rls_policies.sql). This is what lets you become admin without ever
 * putting a password or hardcoded secret in the source code.
 */
async function maybePromoteToAdmin(email: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || email.toLowerCase() !== adminEmail.toLowerCase()) return;

  const { createAdminClient } = await import('@/lib/supabase/server');
  const admin = createAdminClient();
  await admin.from('profiles').update({ role: 'admin' }).eq('email', email);
}

function translateAuthError(message: string): string {
  const map: Record<string, string> = {
    'Invalid login credentials': 'אימייל או סיסמה שגויים',
    'User already registered': 'כבר קיים חשבון עם כתובת אימייל זו',
    'Email not confirmed': 'יש לאמת את כתובת האימייל לפני ההתחברות',
  };
  return map[message] ?? message;
}
