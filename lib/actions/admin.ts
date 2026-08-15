'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function updateUserRoleAction(userId: string, role: 'user' | 'owner' | 'admin') {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'יש להתחבר' };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { error: 'אין הרשאה' };

  if (userId === user.id) return { error: 'לא ניתן לשנות את התפקיד של עצמך' };

  const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
  if (error) return { error: 'אירעה שגיאה' };

  revalidatePath('/admin/users');
  return { success: true };
}
