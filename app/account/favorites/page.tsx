import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PropertyCard, type PropertyCardData } from '@/components/properties/PropertyCard';
import Link from 'next/link';

export const metadata = { title: 'המועדפים שלי' };

export default async function FavoritesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/account/favorites');

  const { data } = await supabase
    .from('favorites')
    .select('properties(id, slug, name, cover_image_url, max_guests, num_beds, cities(name_he), prices(weekday_price))')
    .eq('user_id', user.id);

  const properties: PropertyCardData[] = (data ?? [])
    .map((f: any) => f.properties)
    .filter(Boolean)
    .map((p: any) => ({
      id: p.id, slug: p.slug, name: p.name, cityName: p.cities?.name_he,
      coverImageUrl: p.cover_image_url, maxGuests: p.max_guests, numBeds: p.num_beds,
      weekdayPrice: p.prices?.[0]?.weekday_price ?? null,
    }));

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream py-10 md:py-16">
        <div className="mx-auto max-w-6xl px-5">
          <h1 className="text-2xl md:text-3xl mb-8">המועדפים שלי</h1>
          {properties.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-forest/20 py-16 text-center text-charcoal/50">
              עדיין לא שמרתם נכסים.{' '}
              <Link href="/search" className="text-forest underline underline-offset-4">התחילו לחפש</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
