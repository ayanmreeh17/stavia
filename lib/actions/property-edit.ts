'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

async function requireOwnerOrAdmin(propertyId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('UNAUTHENTICATED');

  const { data: property } = await supabase.from('properties').select('owner_id').eq('id', propertyId).single();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  if (!property || (property.owner_id !== user.id && profile?.role !== 'admin')) {
    throw new Error('FORBIDDEN');
  }
  return { supabase, user };
}

export interface EditPropertyInput {
  propertyId: string;
  name: string;
  description: string;
  address?: string;
  phone?: string;
  whatsappNumber?: string;
  contactEmail?: string;
  maxGuests: number;
  numRooms: number;
  numBeds: number;
  numBathrooms: number;
  weekdayPrice: number;
  weekendPrice: number;
  amenityIds: string[];
}

export async function updatePropertyAction(input: EditPropertyInput) {
  try {
    const { supabase } = await requireOwnerOrAdmin(input.propertyId);

    await supabase
      .from('properties')
      .update({
        name: input.name,
        description: input.description,
        address: input.address,
        phone: input.phone,
        whatsapp_number: input.whatsappNumber,
        contact_email: input.contactEmail,
        max_guests: input.maxGuests,
        num_rooms: input.numRooms,
        num_beds: input.numBeds,
        num_bathrooms: input.numBathrooms,
      })
      .eq('id', input.propertyId);

    await supabase
      .from('prices')
      .upsert({ property_id: input.propertyId, weekday_price: input.weekdayPrice, weekend_price: input.weekendPrice }, { onConflict: 'property_id' });

    await supabase.from('property_amenities').delete().eq('property_id', input.propertyId);
    if (input.amenityIds.length > 0) {
      await supabase.from('property_amenities').insert(
        input.amenityIds.map((amenity_id) => ({ property_id: input.propertyId, amenity_id }))
      );
    }

    revalidatePath(`/dashboard/properties/${input.propertyId}/edit`);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (e: any) {
    if (e.message === 'UNAUTHENTICATED') return { error: 'יש להתחבר' };
    if (e.message === 'FORBIDDEN') return { error: 'אין הרשאה לערוך נכס זה' };
    return { error: 'אירעה שגיאה בשמירה' };
  }
}

/** Resubmits a rejected/needs_changes property for another round of review. */
export async function resubmitPropertyAction(propertyId: string) {
  try {
    const { supabase } = await requireOwnerOrAdmin(propertyId);
    await supabase
      .from('properties')
      .update({ status: 'pending', submitted_at: new Date().toISOString(), rejection_reason: null })
      .eq('id', propertyId);
    revalidatePath(`/dashboard/properties/${propertyId}/edit`);
    revalidatePath('/dashboard');
    return { success: true };
  } catch {
    return { error: 'אין הרשאה' };
  }
}

/** Owner pause/unpublish toggle — approved <-> suspended, entirely owner-controlled (distinct from admin suspend). */
export async function togglePausePropertyAction(propertyId: string, pause: boolean) {
  try {
    const { supabase } = await requireOwnerOrAdmin(propertyId);
    await supabase
      .from('properties')
      .update({ status: pause ? 'suspended' : 'approved' })
      .eq('id', propertyId);
    revalidatePath(`/dashboard/properties/${propertyId}/edit`);
    revalidatePath('/dashboard');
    return { success: true };
  } catch {
    return { error: 'אין הרשאה' };
  }
}
