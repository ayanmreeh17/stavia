import { createClient } from '@/lib/supabase/server';
import { PropertyCard, type PropertyCardData } from '@/components/properties/PropertyCard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export async function FeaturedProperties() {
  const supabase = createClient();

  const { data } = await supabase
    .from('properties')
    .select('id, slug, name, cover_image_url, max_guests, num_beds, cities(name_he), prices(weekday_price)')
    .eq('status', 'approved')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(6);

  const properties: PropertyCardData[] = (data ?? []).map((p: any) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    cityName: p.cities?.name_he,
    coverImageUrl: p.cover_image_url,
    maxGuests: p.max_guests,
    numBeds: p.num_beds,
    weekdayPrice: p.prices?.[0]?.weekday_price ?? null,
  }));

  return (
    <section className="mx-auto max-w-7xl px-5 md:px-8 py-16 md:py-24">
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="eyebrow">נבחרים על ידינו</span>
          <h2 className="mt-2 text-2xl md:text-3xl">נכסים מומלצים</h2>
        </div>
        <Link href="/search" className="hidden md:flex items-center gap-1 text-sm text-forest font-medium hover:gap-2 transition-all">
          לכל הנכסים <ArrowLeft size={16} />
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-forest/20 bg-sage-light py-16 px-8 text-center">
          <p className="text-charcoal/60">
            עדיין אין נכסים מומלצים באתר. ברגע שנכסים יאושרו על ידי הצוות, הם יופיעו כאן.
          </p>
          <Link href="/list-your-property" className="inline-block mt-4 text-forest font-medium underline underline-offset-4">
            פרסמו את הנכס הראשון שלכם
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </section>
  );
}
