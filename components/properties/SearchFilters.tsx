'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface City { id: string; name_he: string }

export function SearchFilters({ cities, resultCount }: { cities: City[]; resultCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="bg-white rounded-2xl border border-forest/8 p-4 flex flex-wrap items-center gap-3">
      <select
        defaultValue={searchParams.get('region') ?? ''}
        onChange={(e) => updateParam('region', e.target.value)}
        className="rounded-xl border border-forest/15 px-3 py-2 text-sm bg-white"
      >
        <option value="">כל האזורים</option>
        <option value="north">צפון</option>
        <option value="center">מרכז</option>
        <option value="south">דרום</option>
      </select>

      <select
        defaultValue={searchParams.get('city') ?? ''}
        onChange={(e) => updateParam('city', e.target.value)}
        className="rounded-xl border border-forest/15 px-3 py-2 text-sm bg-white"
      >
        <option value="">כל הערים</option>
        {cities.map((c) => <option key={c.id} value={c.id}>{c.name_he}</option>)}
      </select>

      <select
        defaultValue={searchParams.get('type') ?? ''}
        onChange={(e) => updateParam('type', e.target.value)}
        className="rounded-xl border border-forest/15 px-3 py-2 text-sm bg-white"
      >
        <option value="">כל סוגי הנכסים</option>
        <option value="villa">וילה</option>
        <option value="cabin">צימר</option>
        <option value="apartment">דירה</option>
        <option value="boutique_hotel">מלון בוטיק</option>
      </select>

      <input
        type="number"
        placeholder="מחיר מינ׳"
        defaultValue={searchParams.get('minPrice') ?? ''}
        onBlur={(e) => updateParam('minPrice', e.target.value)}
        className="w-24 rounded-xl border border-forest/15 px-3 py-2 text-sm"
      />
      <input
        type="number"
        placeholder="מחיר מקס׳"
        defaultValue={searchParams.get('maxPrice') ?? ''}
        onBlur={(e) => updateParam('maxPrice', e.target.value)}
        className="w-24 rounded-xl border border-forest/15 px-3 py-2 text-sm"
      />

      <select
        defaultValue={searchParams.get('sort') ?? 'recommended'}
        onChange={(e) => updateParam('sort', e.target.value)}
        className="rounded-xl border border-forest/15 px-3 py-2 text-sm bg-white"
      >
        <option value="recommended">מומלצים</option>
        <option value="price_low">מחיר: מהנמוך לגבוה</option>
        <option value="price_high">מחיר: מהגבוה לנמוך</option>
        <option value="newest">חדשים ביותר</option>
        <option value="rating">הכי פופולריים</option>
      </select>

      <span className="text-sm text-charcoal/50 mr-auto">{resultCount} נכסים</span>
    </div>
  );
}
