'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { addCityAction, toggleCityActiveAction, addAmenityAction, toggleAmenityActiveAction, addCategoryAction } from '@/lib/actions/reference-data';
import { cn } from '@/lib/utils';

interface City { id: string; name_he: string; region: string | null; is_active: boolean }
interface Amenity { id: string; key: string; name_he: string; group: string; is_active: boolean }
interface Category { id: string; key: string; name_he: string; is_active: boolean }

export function ReferenceDataManager({ cities, amenities, categories }: { cities: City[]; amenities: Amenity[]; categories: Category[] }) {
  const [isPending, startTransition] = useTransition();
  const [newCity, setNewCity] = useState('');
  const [newCityRegion, setNewCityRegion] = useState('center');
  const [newAmenity, setNewAmenity] = useState('');
  const [newCategory, setNewCategory] = useState('');

  function run(action: () => Promise<{ error?: string; success?: boolean }>) {
    startTransition(async () => {
      const result = await action();
      if (result.error) toast.error(result.error);
    });
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border border-forest/8 p-6">
        <h3 className="font-medium mb-3">ערים</h3>
        <div className="flex gap-2 mb-4">
          <input value={newCity} onChange={(e) => setNewCity(e.target.value)} placeholder="שם עיר" className="input flex-1" />
          <select value={newCityRegion} onChange={(e) => setNewCityRegion(e.target.value)} className="input w-24">
            <option value="north">צפון</option>
            <option value="center">מרכז</option>
            <option value="south">דרום</option>
          </select>
          <button
            onClick={() => { run(() => addCityAction(newCity, newCityRegion)); setNewCity(''); }}
            disabled={!newCity || isPending}
            className="bg-forest text-cream rounded-xl px-3 text-sm disabled:opacity-40"
          >
            הוספה
          </button>
        </div>
        <ul className="space-y-1 max-h-64 overflow-y-auto">
          {cities.map((c) => (
            <li key={c.id} className="flex items-center justify-between text-sm px-2 py-1.5 rounded-lg hover:bg-sage-light/50">
              <span className={cn(!c.is_active && 'text-charcoal/30 line-through')}>{c.name_he}</span>
              <button onClick={() => run(() => toggleCityActiveAction(c.id, !c.is_active))} className="text-xs text-forest">
                {c.is_active ? 'השבתה' : 'הפעלה'}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-2xl border border-forest/8 p-6">
        <h3 className="font-medium mb-3">שירותים ומתקנים</h3>
        <div className="flex gap-2 mb-4">
          <input value={newAmenity} onChange={(e) => setNewAmenity(e.target.value)} placeholder="שם השירות" className="input flex-1" />
          <button
            onClick={() => {
              const key = newAmenity.trim().toLowerCase().replace(/\s+/g, '_');
              run(() => addAmenityAction(key, newAmenity, 'general'));
              setNewAmenity('');
            }}
            disabled={!newAmenity || isPending}
            className="bg-forest text-cream rounded-xl px-3 text-sm disabled:opacity-40"
          >
            הוספה
          </button>
        </div>
        <ul className="space-y-1 max-h-64 overflow-y-auto">
          {amenities.map((a) => (
            <li key={a.id} className="flex items-center justify-between text-sm px-2 py-1.5 rounded-lg hover:bg-sage-light/50">
              <span className={cn(!a.is_active && 'text-charcoal/30 line-through')}>{a.name_he}</span>
              <button onClick={() => run(() => toggleAmenityActiveAction(a.id, !a.is_active))} className="text-xs text-forest">
                {a.is_active ? 'השבתה' : 'הפעלה'}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-2xl border border-forest/8 p-6 md:col-span-2">
        <h3 className="font-medium mb-3">קטגוריות</h3>
        <div className="flex gap-2 mb-4 max-w-md">
          <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="שם הקטגוריה" className="input flex-1" />
          <button
            onClick={() => {
              const key = newCategory.trim().toLowerCase().replace(/\s+/g, '_');
              run(() => addCategoryAction(key, newCategory));
              setNewCategory('');
            }}
            disabled={!newCategory || isPending}
            className="bg-forest text-cream rounded-xl px-3 text-sm disabled:opacity-40"
          >
            הוספה
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <span key={c.id} className={cn('text-xs rounded-full px-3 py-1.5 border', c.is_active ? 'border-forest/15 text-charcoal/70' : 'border-charcoal/10 text-charcoal/30 line-through')}>
              {c.name_he}
            </span>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .input { border-radius: 0.75rem; border: 1px solid rgba(27,67,50,0.15); padding: 0.5rem 0.85rem; outline: none; font-size: 0.875rem; }
        .input:focus { border-color: #1B4332; }
      `}</style>
    </div>
  );
}
