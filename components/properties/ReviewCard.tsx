'use client';

import { useState } from 'react';
import { Star, ShieldCheck, Flag } from 'lucide-react';
import { formatDateDMY } from '@/lib/utils';
import { reportReviewAction } from '@/lib/actions/reviews';
import { toast } from 'sonner';

interface Review {
  id: string;
  cleanliness_rating: number | null;
  location_rating: number | null;
  facilities_rating: number | null;
  service_rating: number | null;
  value_rating: number | null;
  comment: string | null;
  is_verified: boolean;
  created_at: string;
  profiles?: { full_name: string | null } | null;
}

export function ReviewCard({ review }: { review: Review }) {
  const [reported, setReported] = useState(false);
  const ratings = [review.cleanliness_rating, review.location_rating, review.facilities_rating, review.service_rating, review.value_rating].filter(
    (r): r is number => r != null
  );
  const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

  async function handleReport() {
    const result = await reportReviewAction(review.id, 'inappropriate_content');
    if (result.error) toast.error(result.error);
    else setReported(true);
  }

  return (
    <div className="border-b border-charcoal/8 pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{review.profiles?.full_name ?? 'אורח'}</span>
          {review.is_verified && (
            <span className="flex items-center gap-1 text-[11px] text-forest bg-forest/8 rounded-full px-2 py-0.5">
              <ShieldCheck size={11} /> מאומת
            </span>
          )}
        </div>
        <span className="text-xs text-charcoal/40">{formatDateDMY(review.created_at)}</span>
      </div>
      {avg != null && (
        <div className="flex items-center gap-1 mt-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={13} className={i < Math.round(avg) ? 'fill-brass text-brass' : 'text-charcoal/15'} />
          ))}
        </div>
      )}
      {review.comment && <p className="text-sm text-charcoal/70 mt-2 leading-relaxed">{review.comment}</p>}
      {!reported ? (
        <button onClick={handleReport} className="flex items-center gap-1 text-xs text-charcoal/30 hover:text-red-500 mt-2">
          <Flag size={11} /> דיווח
        </button>
      ) : (
        <p className="text-xs text-charcoal/30 mt-2">הדיווח נשלח</p>
      )}
    </div>
  );
}
