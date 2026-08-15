'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface ReviewInput {
  propertyId: string;
  cleanliness: number;
  location: number;
  facilities: number;
  service: number;
  value: number;
  comment: string;
}

export async function submitReviewAction(input: ReviewInput) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'יש להתחבר כדי לכתוב ביקורת' };

  // Eligibility: has the user actually shown interest in this property
  // (submitted an inquiry) or, in the future, completed a stay? For now we
  // require at least one inquiry on this property tied to their account —
  // this keeps reviews tied to genuine interactions until a booking system
  // exists. Admins can still manually verify/promote reviews afterward.
  const { count } = await supabase
    .from('inquiries')
    .select('id', { count: 'exact', head: true })
    .eq('property_id', input.propertyId)
    .eq('user_id', user.id);

  const isVerified = (count ?? 0) > 0;

  const { error } = await supabase.from('reviews').upsert(
    {
      property_id: input.propertyId,
      user_id: user.id,
      cleanliness_rating: input.cleanliness,
      location_rating: input.location,
      facilities_rating: input.facilities,
      service_rating: input.service,
      value_rating: input.value,
      comment: input.comment,
      is_verified: isVerified,
    },
    { onConflict: 'property_id,user_id' }
  );

  if (error) return { error: 'אירעה שגיאה בשליחת הביקורת' };
  revalidatePath(`/property`);
  return { success: true };
}

export async function reportReviewAction(reviewId: string, reason: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'יש להתחבר כדי לדווח' };

  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    review_id: reviewId,
    reason,
  });

  if (error) return { error: 'אירעה שגיאה' };
  return { success: true };
}
