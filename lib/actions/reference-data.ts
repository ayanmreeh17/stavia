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

export async function addCityAction(nameHe: string, region: string) {
  try {
    const { supabase } = await requireAdmin();
    await supabase.from('cities').insert({ name_he: nameHe, region, country_code: 'IL' });
    revalidatePath('/admin/cities');
    return { success: true };
  } catch {
    return { error: 'אין הרשאה' };
  }
}

export async function toggleCityActiveAction(id: string, isActive: boolean) {
  try {
    const { supabase } = await requireAdmin();
    await supabase.from('cities').update({ is_active: isActive }).eq('id', id);
    revalidatePath('/admin/cities');
    return { success: true };
  } catch {
    return { error: 'אין הרשאה' };
  }
}

export async function addAmenityAction(key: string, nameHe: string, group: string) {
  try {
    const { supabase } = await requireAdmin();
    await supabase.from('amenities').insert({ key, name_he: nameHe, group });
    revalidatePath('/admin/cities');
    return { success: true };
  } catch {
    return { error: 'אין הרשאה' };
  }
}

export async function toggleAmenityActiveAction(id: string, isActive: boolean) {
  try {
    const { supabase } = await requireAdmin();
    await supabase.from('amenities').update({ is_active: isActive }).eq('id', id);
    revalidatePath('/admin/cities');
    return { success: true };
  } catch {
    return { error: 'אין הרשאה' };
  }
}

export async function addCategoryAction(key: string, nameHe: string) {
  try {
    const { supabase } = await requireAdmin();
    await supabase.from('categories').insert({ key, name_he: nameHe });
    revalidatePath('/admin/cities');
    return { success: true };
  } catch {
    return { error: 'אין הרשאה' };
  }
}

/** Admin can manually add a fully-approved property (e.g. curated/partner listings). */
export async function adminCreatePropertyAction(input: {
  name: string; description: string; ownerEmail: string; cityId: string;
  region: string; propertyType: string; maxGuests: number; weekdayPrice: number; weekendPrice: number;
}) {
  try {
    const { supabase } = await requireAdmin();

    const { data: ownerProfile } = await supabase.from('profiles').select('id').eq('email', input.ownerEmail).maybeSingle();
    if (!ownerProfile) return { error: 'לא נמצא משתמש עם כתובת אימייל זו — על בעל הנכס להירשם קודם' };

    const { data: property, error } = await supabase.from('properties').insert({
      owner_id: ownerProfile.id, name: input.name, description: input.description,
      city_id: input.cityId, region: input.region, property_type: input.propertyType,
      max_guests: input.maxGuests, country_code: 'IL',
      status: 'approved', submitted_at: new Date().toISOString(), approved_at: new Date().toISOString(),
    }).select('id').single();

    if (error || !property) return { error: 'אירעה שגיאה ביצירת הנכס' };

    await supabase.from('prices').insert({ property_id: property.id, weekday_price: input.weekdayPrice, weekend_price: input.weekendPrice });

    revalidatePath('/admin/properties');
    return { success: true };
  } catch {
    return { error: 'אין הרשאה' };
  }
}
