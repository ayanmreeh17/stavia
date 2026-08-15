import Link from 'next/link';
import { Map as MapIcon } from 'lucide-react';

/**
 * Full interactive map (with real property markers + clustering) lives at
 * components/properties/PropertyMap.tsx — a client component using MapLibre
 * + free OpenStreetMap tiles, so it works with zero configuration. This
 * homepage section is a lightweight teaser/CTA linking to it.
 */
export function MapPreviewSection() {
  return (
    <section className="mx-auto max-w-7xl px-5 md:px-8 py-16">
      <div className="rounded-3xl bg-forest-800 text-cream p-10 md:p-16 flex flex-col md:flex-row items-center gap-8 justify-between overflow-hidden relative">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, #B8935F 0, transparent 45%)' }}
        />
        <div className="relative z-10 max-w-md">
          <MapIcon size={28} className="text-brass mb-4" />
          <h2 className="text-2xl md:text-3xl font-display">גלו נכסים על גבי מפה</h2>
          <p className="mt-3 text-cream/70">
            כל הנכסים המאושרים באתר מסומנים על מפה אינטראקטיבית, כדי שתוכלו לראות בדיוק היכן הם ממוקמים ביחס ליעד שלכם.
          </p>
        </div>
        <Link
          href="/search"
          className="relative z-10 shrink-0 bg-brass text-cream rounded-full px-7 py-3.5 font-medium hover:bg-brass-light transition-colors"
        >
          פתחו את המפה
        </Link>
      </div>
    </section>
  );
}

