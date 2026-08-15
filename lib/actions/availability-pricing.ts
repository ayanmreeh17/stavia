'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

async function requireOwnerOrAdmin(propertyId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('UNAUTHENTICATED');
  const { data: property } = await supabase.from('properties').select('owner_id').eq('id', propertyId).single();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!property || (property.owner_id !== user.id && profile?.role !== 'admin')) throw new Error('FORBIDDEN');
  return { supabase };
}

// ── Availability blocks (owner marks dates as unavailable) ──────────────

export async function addAvailabilityBlockAction(propertyId: string, startDate: string, endDate: string, note?: string) {
  try {
    const { supabase } = await requireOwnerOrAdmin(propertyId);
    const { error } = await supabase.from('availability_blocks').insert({
      property_id: propertyId, start_date: startDate, end_date: endDate, source: 'manual', note,
    });
    if (error) return { error: 'אירעה שגיאה' };
    revalidatePath(`/dashboard/properties/${propertyId}/edit`);
    return { success: true };
  } catch {
    return { error: 'אין הרשאה' };
  }
}

export async function removeAvailabilityBlockAction(propertyId: string, blockId: string) {
  try {
    const { supabase } = await requireOwnerOrAdmin(propertyId);
    await supabase.from('availability_blocks').delete().eq('id', blockId);
    revalidatePath(`/dashboard/properties/${propertyId}/edit`);
    return { success: true };
  } catch {
    return { error: 'אין הרשאה' };
  }
}

// ── Seasonal / holiday pricing ────────────────────────────────────────

export async function addSeasonalPriceAction(propertyId: string, input: {
  label: string; startDate: string; endDate: string; weekdayPrice?: number; weekendPrice?: number; minStayNights?: number;
}) {
  try {
    const { supabase } = await requireOwnerOrAdmin(propertyId);
    const { error } = await supabase.from('seasonal_prices').insert({
      property_id: propertyId, label: input.label, start_date: input.startDate, end_date: input.endDate,
      weekday_price: input.weekdayPrice, weekend_price: input.weekendPrice, min_stay_nights: input.minStayNights,
    });
    if (error) return { error: 'אירעה שגיאה' };
    revalidatePath(`/dashboard/properties/${propertyId}/edit`);
    return { success: true };
  } catch {
    return { error: 'אין הרשאה' };
  }
}

export async function removeSeasonalPriceAction(propertyId: string, id: string) {
  try {
    const { supabase } = await requireOwnerOrAdmin(propertyId);
    await supabase.from('seasonal_prices').delete().eq('id', id);
    revalidatePath(`/dashboard/properties/${propertyId}/edit`);
    return { success: true };
  } catch {
    return { error: 'אין הרשאה' };
  }
}

// ── Special offers ────────────────────────────────────────────────────

export async function addSpecialOfferAction(propertyId: string, input: {
  title: string; description?: string; discountPercent: number; startDate?: string; endDate?: string;
}) {
  try {
    const { supabase } = await requireOwnerOrAdmin(propertyId);
    const { error } = await supabase.from('special_offers').insert({
      property_id: propertyId, title: input.title, description: input.description,
      discount_percent: input.discountPercent, start_date: input.startDate, end_date: input.endDate,
    });
    if (error) return { error: 'אירעה שגיאה' };
    revalidatePath(`/dashboard/properties/${propertyId}/edit`);
    return { success: true };
  } catch {
    return { error: 'אין הרשאה' };
  }
}

export async function removeSpecialOfferAction(propertyId: string, id: string) {
  try {
    const { supabase } = await requireOwnerOrAdmin(propertyId);
    await supabase.from('special_offers').delete().eq('id', id);
    revalidatePath(`/dashboard/properties/${propertyId}/edit`);
    return { success: true };
  } catch {
    return { error: 'אין הרשאה' };
  }
}
