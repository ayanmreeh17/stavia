'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PropertyCard, type PropertyCardData } from './PropertyCard';
import { getRecentlyViewedIds } from './RecentlyViewedTracker';

export function RecentlyViewedSection({ excludePropertyId }: { excludePropertyId?: string }) {
  const [properties, setProperties] = useState<PropertyCardData[] | null>(null);

  useEffect(() => {
    const ids = getRecentlyViewedIds().filter((id) => id !== excludePropertyId);
    if (ids.length === 0) {
      setProperties([]);
      return;
    }
    const supabase = createClient();
    supabase
      .from('properties')
      .select('id, slug, name, cover_image_url, max_guests, num_beds, cities(name_he), prices(weekday_price)')
      .in('id', ids.slice(0, 6))
      .eq('status', 'approved')
      .then(({ data }) => {
        const rows = (data ?? []) as any[];
        // Preserve most-recent-first order from localStorage rather than DB order.
        const ordered = ids.map((id) => rows.find((r) => r.id === id)).filter(Boolean);
        setProperties(
          ordered.map((p: any) => ({
            id: p.id, slug: p.slug, name: p.name, cityName: p.cities?.name_he,
            coverImageUrl: p.cover_image_url, maxGuests: p.max_guests, numBeds: p.num_beds,
            weekdayPrice: p.prices?.[0]?.weekday_price ?? null,
          }))
        );
      });
  }, [excludePropertyId]);

  if (!properties || properties.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 md:px-8 py-10">
      <h2 className="font-display text-xl mb-4">נצפו לאחרונה</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
      </div>
    </section>
  );
}
