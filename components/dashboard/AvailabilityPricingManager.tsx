'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Trash2, Plus } from 'lucide-react';
import { formatDateDMY } from '@/lib/utils';
import {
  addAvailabilityBlockAction, removeAvailabilityBlockAction,
  addSeasonalPriceAction, removeSeasonalPriceAction,
  addSpecialOfferAction, removeSpecialOfferAction,
} from '@/lib/actions/availability-pricing';

interface Props {
  propertyId: string;
  availabilityBlocks: { id: string; start_date: string; end_date: string; note: string | null }[];
  seasonalPrices: { id: string; label: string; start_date: string; end_date: string; weekday_price: number | null; weekend_price: number | null }[];
  specialOffers: { id: string; title: string; discount_percent: number | null; start_date: string | null; end_date: string | null }[];
}

export function AvailabilityPricingManager({ propertyId, availabilityBlocks, seasonalPrices, specialOffers }: Props) {
  const [isPending, startTransition] = useTransition();
  const [blockStart, setBlockStart] = useState('');
  const [blockEnd, setBlockEnd] = useState('');
  const [seasonLabel, setSeasonLabel] = useState('');
  const [seasonStart, setSeasonStart] = useState('');
  const [seasonEnd, setSeasonEnd] = useState('');
  const [seasonWeekday, setSeasonWeekday] = useState('');
  const [seasonWeekend, setSeasonWeekend] = useState('');
  const [offerTitle, setOfferTitle] = useState('');
  const [offerDiscount, setOfferDiscount] = useState('');

  function run(action: () => Promise<{ error?: string; success?: boolean }>) {
    startTransition(async () => {
      const result = await action();
      if (result.error) toast.error(result.error);
      else toast.success('בוצע בהצלחה');
    });
  }

  return (
    <div className="space-y-8">
      {/* Availability calendar / blocked dates */}
      <div className="bg-white rounded-3xl border border-forest/8 p-6">
        <h3 className="font-medium mb-3">חסימת תאריכים (זמינות)</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          <input type="date" value={blockStart} onChange={(e) => setBlockStart(e.target.value)} className="input w-40" />
          <input type="date" value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)} className="input w-40" />
          <button
            disabled={!blockStart || !blockEnd || isPending}
            onClick={() => run(() => addAvailabilityBlockAction(propertyId, blockStart, blockEnd))}
            className="flex items-center gap-1 bg-forest text-cream rounded-xl px-4 text-sm disabled:opacity-40"
          >
            <Plus size={14} /> חסימה
          </button>
        </div>
        <ul className="space-y-1.5">
          {availabilityBlocks.map((b) => (
            <li key={b.id} className="flex items-center justify-between text-sm bg-sage-light rounded-lg px-3 py-2">
              <span>{formatDateDMY(b.start_date)} – {formatDateDMY(b.end_date)}</span>
              <button onClick={() => run(() => removeAvailabilityBlockAction(propertyId, b.id))} className="text-red-500">
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Seasonal / holiday pricing */}
      <div className="bg-white rounded-3xl border border-forest/8 p-6">
        <h3 className="font-medium mb-3">תמחור עונתי / חגים</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          <input placeholder="שם התקופה (למשל פסח)" value={seasonLabel} onChange={(e) => setSeasonLabel(e.target.value)} className="input col-span-2 md:col-span-1" />
          <input type="date" value={seasonStart} onChange={(e) => setSeasonStart(e.target.value)} className="input" />
          <input type="date" value={seasonEnd} onChange={(e) => setSeasonEnd(e.target.value)} className="input" />
          <input type="number" placeholder="מחיר חול" value={seasonWeekday} onChange={(e) => setSeasonWeekday(e.target.value)} className="input" />
          <input type="number" placeholder="מחיר סופ״ש" value={seasonWeekend} onChange={(e) => setSeasonWeekend(e.target.value)} className="input" />
        </div>
        <button
          disabled={!seasonLabel || !seasonStart || !seasonEnd || isPending}
          onClick={() =>
            run(() =>
              addSeasonalPriceAction(propertyId, {
                label: seasonLabel, startDate: seasonStart, endDate: seasonEnd,
                weekdayPrice: seasonWeekday ? Number(seasonWeekday) : undefined,
                weekendPrice: seasonWeekend ? Number(seasonWeekend) : undefined,
              })
            )
          }
          className="flex items-center gap-1 bg-forest text-cream rounded-xl px-4 py-2 text-sm disabled:opacity-40 mb-3"
        >
          <Plus size={14} /> הוספת תקופה
        </button>
        <ul className="space-y-1.5">
          {seasonalPrices.map((s) => (
            <li key={s.id} className="flex items-center justify-between text-sm bg-sage-light rounded-lg px-3 py-2">
              <span>{s.label}: {formatDateDMY(s.start_date)}–{formatDateDMY(s.end_date)} {s.weekday_price ? `· ₪${s.weekday_price}/₪${s.weekend_price}` : ''}</span>
              <button onClick={() => run(() => removeSeasonalPriceAction(propertyId, s.id))} className="text-red-500">
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Special offers */}
      <div className="bg-white rounded-3xl border border-forest/8 p-6">
        <h3 className="font-medium mb-3">מבצעים מיוחדים</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          <input placeholder="כותרת המבצע" value={offerTitle} onChange={(e) => setOfferTitle(e.target.value)} className="input flex-1 min-w-[160px]" />
          <input type="number" placeholder="% הנחה" value={offerDiscount} onChange={(e) => setOfferDiscount(e.target.value)} className="input w-28" />
          <button
            disabled={!offerTitle || !offerDiscount || isPending}
            onClick={() => run(() => addSpecialOfferAction(propertyId, { title: offerTitle, discountPercent: Number(offerDiscount) }))}
            className="flex items-center gap-1 bg-forest text-cream rounded-xl px-4 text-sm disabled:opacity-40"
          >
            <Plus size={14} /> הוספה
          </button>
        </div>
        <ul className="space-y-1.5">
          {specialOffers.map((o) => (
            <li key={o.id} className="flex items-center justify-between text-sm bg-sage-light rounded-lg px-3 py-2">
              <span>{o.title} · {o.discount_percent}% הנחה</span>
              <button onClick={() => run(() => removeSpecialOfferAction(propertyId, o.id))} className="text-red-500">
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <style jsx global>{`
        .input { border-radius: 0.75rem; border: 1px solid rgba(27,67,50,0.15); padding: 0.5rem 0.85rem; outline: none; font-size: 0.875rem; }
        .input:focus { border-color: #1B4332; }
      `}</style>
    </div>
  );
}
