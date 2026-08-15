'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { adminCreatePropertyAction } from '@/lib/actions/reference-data';

export function ManualPropertyForm({ cities }: { cities: { id: string; name_he: string }[] }) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [cityId, setCityId] = useState('');
  const [propertyType, setPropertyType] = useState('villa');
  const [maxGuests, setMaxGuests] = useState(4);
  const [weekdayPrice, setWeekdayPrice] = useState(500);
  const [weekendPrice, setWeekendPrice] = useState(750);

  function handleSubmit() {
    startTransition(async () => {
      const result = await adminCreatePropertyAction({
        name, description, ownerEmail, cityId, region: 'center', propertyType, maxGuests, weekdayPrice, weekendPrice,
      });
      if (result.error) toast.error(result.error);
      else {
        toast.success('הנכס נוצר ואושר');
        setName(''); setDescription(''); setOwnerEmail('');
      }
    });
  }

  return (
    <div className="grid md:grid-cols-2 gap-3">
      <input placeholder="שם הנכס" value={name} onChange={(e) => setName(e.target.value)} className="input" />
      <input placeholder="אימייל בעל הנכס (חייב להיות רשום)" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} className="input" />
      <select value={cityId} onChange={(e) => setCityId(e.target.value)} className="input">
        <option value="">בחרו עיר</option>
        {cities.map((c) => <option key={c.id} value={c.id}>{c.name_he}</option>)}
      </select>
      <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="input">
        <option value="villa">וילה</option>
        <option value="cabin">צימר</option>
        <option value="apartment">דירה</option>
      </select>
      <input type="number" placeholder="אורחים מקסימום" value={maxGuests} onChange={(e) => setMaxGuests(Number(e.target.value))} className="input" />
      <div className="flex gap-2">
        <input type="number" placeholder="מחיר חול" value={weekdayPrice} onChange={(e) => setWeekdayPrice(Number(e.target.value))} className="input flex-1" />
        <input type="number" placeholder="מחיר סופ״ש" value={weekendPrice} onChange={(e) => setWeekendPrice(Number(e.target.value))} className="input flex-1" />
      </div>
      <textarea
        placeholder="תיאור" value={description} onChange={(e) => setDescription(e.target.value)}
        className="input md:col-span-2" rows={2}
      />
      <button
        onClick={handleSubmit}
        disabled={!name || !ownerEmail || !cityId || isPending}
        className="md:col-span-2 bg-forest text-cream rounded-xl px-4 py-2.5 text-sm disabled:opacity-40"
      >
        {isPending ? 'יוצר...' : 'יצירת הנכס (מאושר מיידית)'}
      </button>

      <style jsx global>{`
        .input { border-radius: 0.75rem; border: 1px solid rgba(27,67,50,0.15); padding: 0.6rem 0.9rem; outline: none; font-size: 0.875rem; }
        .input:focus { border-color: #1B4332; }
      `}</style>
    </div>
  );
}
