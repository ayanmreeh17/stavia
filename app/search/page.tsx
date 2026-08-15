import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PropertyCard, type PropertyCardData } from '@/components/properties/PropertyCard';
import { SearchFilters } from '@/components/properties/SearchFilters';
import { PropertyMap, type MapProperty } from '@/components/properties/PropertyMap';

export const metadata = { title: 'חיפוש נכסים' };

interface SearchPageProps {
  searchParams: {
    q?: string; region?: string; city?: string; category?: string;
    minPrice?: string; maxPrice?: string; guests?: string; type?: string;
    sort?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const supabase = createClient();

  let query = supabase
    .from('properties')
    .select('id, slug, name, cover_image_url, max_guests, num_beds, region, property_type, lat, lng, address_visible, approx_lat, approx_lng, cities(id, name_he), prices(weekday_price)')
    .eq('status', 'approved');

  if (searchParams.q) query = query.ilike('name', `%${searchParams.q}%`);
  if (searchParams.region) query = query.eq('region', searchParams.region);
  if (searchParams.city) query = query.eq('city_id', searchParams.city);
  if (searchParams.type) query = query.eq('property_type', searchParams.type);
  if (searchParams.guests) query = query.gte('max_guests', Number(searchParams.guests));

  switch (searchParams.sort) {
    case 'newest': query = query.order('created_at', { ascending: false }); break;
    case 'rating': query = query.order('view_count', { ascending: false }); break; // rating aggregate arrives with reviews UI
    default: query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
  }

  const { data } = await query.limit(60);

  let properties: PropertyCardData[] = (data ?? []).map((p: any) => ({
    id: p.id, slug: p.slug, name: p.name, cityName: p.cities?.name_he,
    coverImageUrl: p.cover_image_url, maxGuests: p.max_guests, numBeds: p.num_beds,
    weekdayPrice: p.prices?.[0]?.weekday_price ?? null,
  }));

  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : undefined;
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined;
  if (minPrice !== undefined) properties = properties.filter((p) => (p.weekdayPrice ?? 0) >= minPrice);
  if (maxPrice !== undefined) properties = properties.filter((p) => (p.weekdayPrice ?? 0) <= maxPrice);
  if (searchParams.sort === 'price_low') properties.sort((a, b) => (a.weekdayPrice ?? 0) - (b.weekdayPrice ?? 0));
  if (searchParams.sort === 'price_high') properties.sort((a, b) => (b.weekdayPrice ?? 0) - (a.weekdayPrice ?? 0));

  const { data: cities } = await supabase.from('cities').select('id, name_he').eq('is_active', true).order('name_he');

  const mapProperties: MapProperty[] = (data ?? [])
    .filter((p: any) => p.lat && p.lng)
    .map((p: any) => ({
      id: p.id, slug: p.slug, name: p.name,
      lat: p.address_visible ? p.lat : (p.approx_lat ?? p.lat),
      lng: p.address_visible ? p.lng : (p.approx_lng ?? p.lng),
      coverImageUrl: p.cover_image_url,
      weekdayPrice: p.prices?.[0]?.weekday_price ?? null,
    }));

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <h1 className="text-2xl md:text-3xl mb-6">חיפוש נכסים</h1>
          <SearchFilters cities={cities ?? []} resultCount={properties.length} />

          <div className="grid lg:grid-cols-5 gap-6 mt-8">
            <div className="lg:col-span-3">
              {properties.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-forest/20 py-16 text-center text-charcoal/50">
                  לא נמצאו נכסים התואמים את החיפוש
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
                </div>
              )}
            </div>
            <div className="lg:col-span-2">
              <div className="sticky top-28">
                <PropertyMap properties={mapProperties} height="calc(100vh - 180px)" />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
