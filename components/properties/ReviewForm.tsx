'use client';

import { useState, useTransition } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { submitReviewAction } from '@/lib/actions/reviews';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { key: 'cleanliness', label: 'ניקיון' },
  { key: 'location', label: 'מיקום' },
  { key: 'facilities', label: 'מתקנים' },
  { key: 'service', label: 'שירות' },
  { key: 'value', label: 'תמורה למחיר' },
] as const;

export function ReviewForm({ propertyId }: { propertyId: string }) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  const allRated = CATEGORIES.every((c) => ratings[c.key] > 0);

  function submit() {
    startTransition(async () => {
      const result = await submitReviewAction({
        propertyId,
        cleanliness: ratings.cleanliness,
        location: ratings.location,
        facilities: ratings.facilities,
        service: ratings.service,
        value: ratings.value,
        comment,
      });
      if (result.error) toast.error(result.error);
      else setSubmitted(true);
    });
  }

  if (submitted) {
    return <p className="text-sm text-forest bg-sage-light rounded-xl p-4">תודה! הביקורת שלכם פורסמה.</p>;
  }

  return (
    <div className="bg-white rounded-2xl border border-forest/8 p-5">
      <h3 className="font-medium mb-4">כתבו ביקורת</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        {CATEGORIES.map((c) => (
          <div key={c.key}>
            <p className="text-xs text-charcoal/50 mb-1">{c.label}</p>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRatings((r) => ({ ...r, [c.key]: i + 1 }))}
                  aria-label={`${i + 1} כוכבים`}
                >
                  <Star size={18} className={cn(i < (ratings[c.key] ?? 0) ? 'fill-brass text-brass' : 'text-charcoal/15')} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="ספרו על החוויה שלכם..."
        className="w-full rounded-xl border border-forest/15 px-3 py-2.5 text-sm outline-none focus:border-forest mb-3"
      />
      <Button onClick={submit} disabled={!allRated || isPending}>
        {isPending ? 'שולח...' : 'פרסום ביקורת'}
      </Button>
    </div>
  );
}
