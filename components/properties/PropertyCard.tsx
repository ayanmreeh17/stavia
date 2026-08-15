import Link from 'next/link';
import Image from 'next/image';
import { Star, BedDouble, Users, ShieldCheck } from 'lucide-react';
import { formatPriceILS } from '@/lib/utils';

export interface PropertyCardData {
  id: string;
  slug: string | null;
  name: string;
  cityName?: string | null;
  coverImageUrl: string | null;
  maxGuests: number;
  numBeds: number;
  weekdayPrice?: number | null;
  avgRating?: number | null;
  isVerified?: boolean;
}

export function PropertyCard({ property }: { property: PropertyCardData }) {
  const href = `/property/${property.slug ?? property.id}`;

  return (
    <Link
      href={href}
      className="group block rounded-3xl overflow-hidden bg-white border border-forest/8 shadow-card hover:shadow-premium transition-shadow duration-300"
    >
      <div className="relative aspect-[4/3] bg-sage overflow-hidden">
        {property.coverImageUrl ? (
          <Image
            src={property.coverImageUrl}
            alt={property.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-forest/30 font-display text-sm">
            אין תמונה עדיין
          </div>
        )}
        {property.avgRating != null && (
          <div className="absolute top-3 left-3 bg-white/95 rounded-full px-2.5 py-1 flex items-center gap-1 text-xs font-semibold">
            <Star size={12} className="fill-brass text-brass" />
            {property.avgRating.toFixed(1)}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-display text-lg text-charcoal truncate">{property.name}</h3>
        <div className="flex items-center gap-1.5 mt-0.5">
          {property.cityName && <p className="text-sm text-charcoal/50">{property.cityName}</p>}
          {property.isVerified && (
            <span className="flex items-center gap-0.5 text-[11px] text-forest bg-forest/8 rounded-full px-1.5 py-0.5">
              <ShieldCheck size={11} /> מאומת
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mt-2.5 text-xs text-charcoal/50">
          <span className="flex items-center gap-1"><Users size={13} />{property.maxGuests} אורחים</span>
          <span className="flex items-center gap-1"><BedDouble size={13} />{property.numBeds} מיטות</span>
        </div>

        {property.weekdayPrice != null && (
          <p className="mt-3 text-forest font-semibold">
            {formatPriceILS(property.weekdayPrice)} <span className="text-charcoal/40 font-normal text-sm">/ לילה</span>
          </p>
        )}
      </div>
    </Link>
  );
}
