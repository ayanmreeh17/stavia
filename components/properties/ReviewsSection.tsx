import { createClient } from '@/lib/supabase/server';
import { ReviewForm } from './ReviewForm';
import { ReviewCard } from './ReviewCard';

export async function ReviewsSection({ propertyId }: { propertyId: string }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, cleanliness_rating, location_rating, facilities_rating, service_rating, value_rating, comment, is_verified, created_at, profiles(full_name)')
    .eq('property_id', propertyId)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  const existingReview = user
    ? (await supabase.from('reviews').select('id').eq('property_id', propertyId).eq('user_id', user.id).maybeSingle()).data
    : null;

  const avg = (reviews ?? []).length
    ? (reviews ?? []).reduce((sum, r: any) => {
        const ratings = [r.cleanliness_rating, r.location_rating, r.facilities_rating, r.service_rating, r.value_rating].filter(Boolean);
        return sum + ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length;
      }, 0) / (reviews ?? []).length
    : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl">
          ביקורות {avg != null && <span className="text-brass font-body text-base">· {avg.toFixed(1)} ★</span>}
        </h2>
      </div>

      {(!reviews || reviews.length === 0) && (
        <p className="text-charcoal/50 text-sm mb-6">אין עדיין ביקורות לנכס זה. היו הראשונים לכתוב אחת!</p>
      )}

      <div className="space-y-4 mb-8">
        {(reviews ?? []).map((r: any) => <ReviewCard key={r.id} review={r} />)}
      </div>

      {user && !existingReview && <ReviewForm propertyId={propertyId} />}
      {!user && (
        <p className="text-sm text-charcoal/50 bg-sage-light rounded-xl p-4">
          יש להתחבר כדי לכתוב ביקורת.
        </p>
      )}
    </div>
  );
}
