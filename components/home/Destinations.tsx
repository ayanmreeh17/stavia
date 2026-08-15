import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export async function Destinations() {
  const supabase = createClient();
  const { data } = await supabase
    .from('cities')
    .select('id, name_he, region')
    .eq('is_active', true)
    .limit(8);

  const cities = data ?? [];
  if (cities.length === 0) return null;

  const regionLabel: Record<string, string> = { north: 'צפון', center: 'מרכז', south: 'דרום', other: '' };

  return (
    <section className="bg-sage-light py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <span className="eyebrow">לאן נוסעים הפעם</span>
        <h2 className="mt-2 text-2xl md:text-3xl mb-8">יעדים פופולריים</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cities.map((city) => (
            <Link
              key={city.id}
              href={`/search?city=${city.id}`}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-forest-500 to-forest-700 flex items-end p-4"
            >
              <div className="relative z-10">
                <p className="text-cream font-display text-lg">{city.name_he}</p>
                {city.region && <p className="text-cream/60 text-xs mt-0.5">{regionLabel[city.region]}</p>}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent group-hover:from-black/55 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
