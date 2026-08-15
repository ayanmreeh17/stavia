import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import * as Icons from 'lucide-react';

export async function Categories() {
  const supabase = createClient();
  const { data } = await supabase
    .from('categories')
    .select('id, key, name_he, icon')
    .eq('is_active', true)
    .order('sort_order');

  const categories = data ?? [];
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 md:px-8 py-4">
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 md:mx-0 md:px-0 md:flex-wrap scrollbar-none">
        {categories.map((cat) => {
          const Icon = (Icons as any)[toPascalCase(cat.icon ?? 'Home')] ?? Icons.Home;
          return (
            <Link
              key={cat.id}
              href={`/search?category=${cat.key}`}
              className="flex items-center gap-2 shrink-0 rounded-full border border-forest/12 bg-white px-4 py-2.5 text-sm font-medium text-charcoal hover:border-forest hover:text-forest transition-colors"
            >
              <Icon size={16} className="text-brass" />
              {cat.name_he}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function toPascalCase(kebab: string) {
  return kebab.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}
