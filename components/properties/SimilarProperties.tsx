import { createClient } from '@/lib/supabase/server';
import { PropertyCard, type PropertyCardData } from './PropertyCard';

export async function SimilarProperties({
  propertyId, cityId, propertyType,
}: { propertyId: string; cityId: string | null; propertyType: string }) {
  const supabase = createClient();
  const selectFields = 'id, slug, name, cover_image_url, max_guests, num_beds, cities(name_he), prices(weekday_price)';

  // Prefer same city; fall back to same property type if the city has too few results.
  let rows: any[] = [];

  if (cityId) {
    const byCity = await supabase
      .from('properties')
      .select(selectFields)
      .eq('status', 'approved')
      .neq('id', propertyId)
      .eq('city_id', cityId)
      .limit(6);
    rows = byCity.data ?? [];
  }

  if (rows.length < 3) {
    const byType = await supabase
      .from('properties')
      .select(selectFields)
      .eq('status', 'approved')
      .eq('property_type', propertyType)
      .neq('id', propertyId)
      .limit(6);
    rows = [...rows, ...(byType.data ?? [])].filter((r, i, arr) => arr.findIndex((x) => x.id === r.id) === i);
  }

  if (rows.length === 0) return null;

  const properties: PropertyCardData[] = rows.slice(0, 6).map((p: any) => ({
    id: p.id, slug: p.slug, name: p.name, cityName: p.cities?.name_he,
    coverImageUrl: p.cover_image_url, maxGuests: p.max_guests, numBeds: p.num_beds,
    weekdayPrice: p.prices?.[0]?.weekday_price ?? null,
  }));

  return (
    <div>
      <h2 className="font-display text-xl mb-4">נכסים דומים</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
      </div>
    </div>
  );
}
