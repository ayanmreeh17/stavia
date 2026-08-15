'use server';

import { revalidatePath } from 'next/cache';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { sendEmail, emailTemplates } from '@/lib/email/send';

export type ActionResult<T = undefined> = { error?: string; success?: boolean; data?: T };

async function requireUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('UNAUTHENTICATED');
  return { supabase, user };
}

function slugify(name: string) {
  const base = name
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── PROPERTY: create draft / full wizard submission ─────────────────────

export interface WizardPayload {
  name: string;
  propertyType: string;
  categoryId?: string | null;
  countryCode: string;
  region?: string | null;
  cityId?: string | null;
  address?: string | null;
  addressVisible: boolean;
  lat?: number | null;
  lng?: number | null;
  description: string;
  maxGuests: number;
  numRooms: number;
  numBeds: number;
  numBathrooms: number;
  rooms: Array<{
    name: string;
    roomType: string;
    description?: string;
    numBeds: number;
    bedTypes: string[];
    bathroomInfo?: string;
    sizeSqm?: number;
    amenityIds: string[];
    imagePaths: string[];
  }>;
  amenityIds: string[];
  propertyImagePaths: string[];
  coverImagePath?: string | null;
  weekdayPrice: number;
  weekendPrice: number;
  phoneCountryCode: string;
  phone: string;
  whatsappNumber?: string;
  contactEmail?: string;
}

export async function submitPropertyAction(payload: WizardPayload): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase, user } = await requireUser();

    const { data: property, error: propError } = await supabase
      .from('properties')
      .insert({
        owner_id: user.id,
        name: payload.name,
        slug: slugify(payload.name),
        description: payload.description,
        property_type: payload.propertyType,
        category_id: payload.categoryId,
        country_code: payload.countryCode,
        region: payload.region,
        city_id: payload.cityId,
        address: payload.address,
        address_visible: payload.addressVisible,
        lat: payload.lat,
        lng: payload.lng,
        approx_lat: payload.lat ? Math.round(payload.lat * 100) / 100 : null,
        approx_lng: payload.lng ? Math.round(payload.lng * 100) / 100 : null,
        max_guests: payload.maxGuests,
        num_rooms: payload.numRooms,
        num_beds: payload.numBeds,
        num_bathrooms: payload.numBathrooms,
        cover_image_url: payload.coverImagePath,
        phone: payload.phone,
        phone_country_code: payload.phoneCountryCode,
        whatsapp_number: payload.whatsappNumber,
        contact_email: payload.contactEmail,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (propError || !property) return { error: propError?.message ?? 'שגיאה ביצירת הנכס' };
    const propertyId = property.id as string;

    if (payload.amenityIds.length > 0) {
      await supabase.from('property_amenities').insert(
        payload.amenityIds.map((amenity_id) => ({ property_id: propertyId, amenity_id }))
      );
    }

    if (payload.propertyImagePaths.length > 0) {
      await supabase.from('property_images').insert(
        payload.propertyImagePaths.map((storage_path, i) => ({
          property_id: propertyId,
          storage_path,
          is_cover: storage_path === payload.coverImagePath,
          sort_order: i,
        }))
      );
    }

    for (const room of payload.rooms) {
      const { data: roomRow, error: roomError } = await supabase
        .from('rooms')
        .insert({
          property_id: propertyId,
          name: room.name,
          room_type: room.roomType,
          description: room.description,
          num_beds: room.numBeds,
          bed_types: room.bedTypes,
          bathroom_info: room.bathroomInfo,
          size_sqm: room.sizeSqm,
        })
        .select('id')
        .single();

      if (roomError || !roomRow) continue;
      const roomId = roomRow.id as string;

      if (room.amenityIds.length > 0) {
        await supabase.from('room_amenities').insert(
          room.amenityIds.map((amenity_id) => ({ room_id: roomId, amenity_id }))
        );
      }
      if (room.imagePaths.length > 0) {
        await supabase.from('room_images').insert(
          room.imagePaths.map((storage_path, i) => ({ room_id: roomId, storage_path, sort_order: i }))
        );
      }
    }

    await supabase.from('prices').insert({
      property_id: propertyId,
      weekday_price: payload.weekdayPrice,
      weekend_price: payload.weekendPrice,
    });

    // Notify admins a new property needs review.
    const admin = createAdminClient();
    const { data: admins } = await admin.from('profiles').select('id').eq('role', 'admin');
    if (admins?.length) {
      await admin.from('notifications').insert(
        admins.map((a) => ({
          user_id: a.id,
          type: 'property_submitted' as const,
          title: 'נכס חדש ממתין לאישור',
          body: payload.name,
          related_property_id: propertyId,
        }))
      );
    }

    revalidatePath('/dashboard');
    return { success: true, data: { id: propertyId } };
  } catch (e: any) {
    if (e.message === 'UNAUTHENTICATED') return { error: 'יש להתחבר כדי לפרסם נכס' };
    return { error: 'אירעה שגיאה, נסו שוב' };
  }
}

// ── ADMIN MODERATION ─────────────────────────────────────────────────────

async function requireAdmin() {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('FORBIDDEN');
  return { supabase, user };
}

export async function approvePropertyAction(propertyId: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const admin = createAdminClient();

    const { data: prop } = await supabase
      .from('properties')
      .update({ status: 'approved', approved_at: new Date().toISOString(), rejection_reason: null })
      .eq('id', propertyId)
      .select('owner_id, name, profiles!properties_owner_id_fkey(email)')
      .single();

    if (prop) {
      await admin.from('notifications').insert({
        user_id: prop.owner_id,
        type: 'property_approved',
        title: 'הנכס שלכם אושר!',
        body: `${prop.name} כעת גלוי לציבור באתר.`,
        related_property_id: propertyId,
      });
      const ownerEmail = (prop as any).profiles?.email;
      if (ownerEmail) {
        const tpl = emailTemplates.propertyApproved(prop.name);
        await sendEmail({ to: ownerEmail, ...tpl });
      }
    }

    revalidatePath('/admin/properties');
    return { success: true };
  } catch {
    return { error: 'אין הרשאה' };
  }
}

export async function rejectPropertyAction(propertyId: string, reason: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const admin = createAdminClient();

    const { data: prop } = await supabase
      .from('properties')
      .update({ status: 'rejected', rejection_reason: reason })
      .eq('id', propertyId)
      .select('owner_id, name, profiles!properties_owner_id_fkey(email)')
      .single();

    if (prop) {
      await admin.from('notifications').insert({
        user_id: prop.owner_id,
        type: 'property_rejected',
        title: 'הנכס שלכם נדחה',
        body: reason,
        related_property_id: propertyId,
      });
      const ownerEmail = (prop as any).profiles?.email;
      if (ownerEmail) {
        const tpl = emailTemplates.propertyRejected(prop.name, reason);
        await sendEmail({ to: ownerEmail, ...tpl });
      }
    }

    revalidatePath('/admin/properties');
    return { success: true };
  } catch {
    return { error: 'אין הרשאה' };
  }
}

export async function requestChangesAction(propertyId: string, reason: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const admin = createAdminClient();

    const { data: prop } = await supabase
      .from('properties')
      .update({ status: 'needs_changes', rejection_reason: reason })
      .eq('id', propertyId)
      .select('owner_id, name, profiles!properties_owner_id_fkey(email)')
      .single();

    if (prop) {
      await admin.from('notifications').insert({
        user_id: prop.owner_id,
        type: 'changes_requested',
        title: 'נדרשים שינויים בנכס שלכם',
        body: reason,
        related_property_id: propertyId,
      });
      const ownerEmail = (prop as any).profiles?.email;
      if (ownerEmail) {
        const tpl = emailTemplates.changesRequested(prop.name, reason);
        await sendEmail({ to: ownerEmail, ...tpl });
      }
    }

    revalidatePath('/admin/properties');
    return { success: true };
  } catch {
    return { error: 'אין הרשאה' };
  }
}

export async function suspendPropertyAction(propertyId: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    await supabase.from('properties').update({ status: 'suspended' }).eq('id', propertyId);
    revalidatePath('/admin/properties');
    return { success: true };
  } catch {
    return { error: 'אין הרשאה' };
  }
}

export async function deletePropertyAction(propertyId: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    await supabase.from('properties').delete().eq('id', propertyId);
    revalidatePath('/admin/properties');
    return { success: true };
  } catch {
    return { error: 'אין הרשאה' };
  }
}

export async function setFeaturedAction(propertyId: string, featured: boolean): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    await supabase.from('properties').update({ is_featured: featured }).eq('id', propertyId);
    revalidatePath('/admin/properties');
    revalidatePath('/');
    return { success: true };
  } catch {
    return { error: 'אין הרשאה' };
  }
}

// ── FAVORITES ─────────────────────────────────────────────────────────────

export async function toggleFavoriteAction(propertyId: string): Promise<ActionResult<{ favorited: boolean }>> {
  try {
    const { supabase, user } = await requireUser();

    const { data: existing } = await supabase
      .from('favorites')
      .select('property_id')
      .eq('user_id', user.id)
      .eq('property_id', propertyId)
      .maybeSingle();

    if (existing) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('property_id', propertyId);
      revalidatePath('/account/favorites');
      return { success: true, data: { favorited: false } };
    }

    await supabase.from('favorites').insert({ user_id: user.id, property_id: propertyId });
    revalidatePath('/account/favorites');
    return { success: true, data: { favorited: true } };
  } catch (e: any) {
    if (e.message === 'UNAUTHENTICATED') return { error: 'יש להתחבר כדי לשמור מועדפים' };
    return { error: 'אירעה שגיאה' };
  }
}

// ── INQUIRIES (contact form on property page) ────────────────────────────

export async function createInquiryAction(formData: FormData): Promise<ActionResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const propertyId = formData.get('propertyId') as string;
  const name = formData.get('name') as string;
  const message = formData.get('message') as string;

  if (!propertyId || !name || !message) return { error: 'נא למלא את כל השדות' };

  const { error } = await supabase.from('inquiries').insert({
    property_id: propertyId,
    user_id: user?.id ?? null,
    name,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    message,
  });

  if (error) return { error: 'אירעה שגיאה בשליחת הפנייה' };

  // Notify the owner — both in-app and by email if configured.
  const admin = createAdminClient();
  const { data: property } = await admin
    .from('properties')
    .select('name, owner_id, profiles!properties_owner_id_fkey(email)')
    .eq('id', propertyId)
    .single();

  if (property) {
    await admin.from('notifications').insert({
      user_id: property.owner_id,
      type: 'new_inquiry',
      title: 'פנייה חדשה התקבלה',
      body: `${name} שלחו לכם פנייה על ${property.name}`,
      related_property_id: propertyId,
    });
    const ownerEmail = (property as any).profiles?.email;
    if (ownerEmail) {
      const tpl = emailTemplates.newInquiry(property.name, name);
      await sendEmail({ to: ownerEmail, ...tpl });
    }
  }

  return { success: true };
}
