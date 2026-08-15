import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

export const metadata = { title: 'יעדים פופולריים' };

export default async function DestinationsPage() {
  const supabase = createClient();
  const { data: cities } = await supabase.from('cities').select('id, name_he, region').eq('is_active', true).order('name_he');

  const grouped: Record<string, typeof cities> = {};
  for (const c of cities ?? []) {
    const key = c.region ?? 'other';
    grouped[key] = grouped[key] ?? [];
    grouped[key]!.push(c);
  }
  const regionLabel: Record<string, string> = { north: 'צפון', center: 'מרכז', south: 'דרום', other: 'אחר' };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-5">
          <h1 className="text-2xl md:text-3xl mb-10">יעדים פופולריים</h1>
          {Object.entries(grouped).map(([region, cityList]) => (
            <div key={region} className="mb-10">
              <h2 className="font-display text-xl mb-4">{regionLabel[region] ?? region}</h2>
              <div className="flex flex-wrap gap-2">
                {cityList!.map((c) => (
                  <Link
                    key={c.id}
                    href={`/search?city=${c.id}`}
                    className="rounded-full border border-forest/12 bg-white px-4 py-2 text-sm hover:border-forest hover:text-forest transition-colors"
                  >
                    {c.name_he}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
