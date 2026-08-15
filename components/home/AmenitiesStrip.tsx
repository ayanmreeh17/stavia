import { createClient } from '@/lib/supabase/server';
import * as Icons from 'lucide-react';

export async function AmenitiesStrip() {
  const supabase = createClient();
  const { data } = await supabase
    .from('amenities')
    .select('id, name_he, icon')
    .eq('is_active', true)
    .order('sort_order')
    .limit(12);

  const amenities = data ?? [];
  if (amenities.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 md:px-8 py-16">
      <span className="eyebrow">מה תמצאו בנכסים שלנו</span>
      <h2 className="mt-2 text-2xl md:text-3xl mb-8">מתקנים פופולריים</h2>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {amenities.map((a) => {
          const Icon = (Icons as any)[toPascalCase(a.icon ?? 'wifi')] ?? Icons.Sparkles;
          return (
            <div key={a.id} className="flex flex-col items-center gap-2 text-center rounded-2xl bg-white border border-forest/8 py-6 px-2">
              <Icon size={22} className="text-forest" />
              <span className="text-xs text-charcoal/70">{a.name_he}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function toPascalCase(kebab: string) {
  return kebab.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}
