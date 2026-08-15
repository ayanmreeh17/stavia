'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('UNAUTHENTICATED');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('FORBIDDEN');
  return { supabase };
}

export async function resolveReportAction(reportId: string, status: 'reviewed' | 'dismissed' | 'actioned') {
  try {
    const { supabase } = await requireAdmin();
    await supabase.from('reports').update({ status }).eq('id', reportId);
    revalidatePath('/admin/reports');
    return { success: true };
  } catch {
    return { error: 'אין הרשאה' };
  }
}

export async function unpublishReviewAction(reviewId: string) {
  try {
    const { supabase } = await requireAdmin();
    await supabase.from('reviews').update({ is_published: false }).eq('id', reviewId);
    revalidatePath('/admin/reports');
    return { success: true };
  } catch {
    return { error: 'אין הרשאה' };
  }
}
