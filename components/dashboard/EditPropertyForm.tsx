'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { updatePropertyAction, resubmitPropertyAction, togglePausePropertyAction } from '@/lib/actions/property-edit';

interface Props {
  property: any;
  amenities: { id: string; name_he: string }[];
}

export function EditPropertyForm({ property, amenities }: Props) {
  const [name, setName] = useState(property.name);
  const [description, setDescription] = useState(property.description ?? '');
  const [address, setAddress] = useState(property.address ?? '');
  const [phone, setPhone] = useState(property.phone ?? '');
  const [whatsappNumber, setWhatsappNumber] = useState(property.whatsapp_number ?? '');
  const [contactEmail, setContactEmail] = useState(property.contact_email ?? '');
  const [maxGuests, setMaxGuests] = useState(property.max_guests);
  const [numRooms, setNumRooms] = useState(property.num_rooms);
  const [numBeds, setNumBeds] = useState(property.num_beds);
  const [numBathrooms, setNumBathrooms] = useState(property.num_bathrooms);
  const [weekdayPrice, setWeekdayPrice] = useState(property.prices?.[0]?.weekday_price ?? 0);
  const [weekendPrice, setWeekendPrice] = useState(property.prices?.[0]?.weekend_price ?? 0);
  const [amenityIds, setAmenityIds] = useState<string[]>(property.property_amenities?.map((a: any) => a.amenity_id) ?? []);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await updatePropertyAction({
        propertyId: property.id, name, description, address, phone, whatsappNumber, contactEmail,
        maxGuests, numRooms, numBeds, numBathrooms, weekdayPrice, weekendPrice, amenityIds,
      });
      if (result.error) toast.error(result.error);
      else toast.success('הפרטים נשמרו');
    });
  }

  function handleResubmit() {
    startTransition(async () => {
      const result = await resubmitPropertyAction(property.id);
      if (result.error) toast.error(result.error);
      else toast.success('הנכס נשלח לבדיקה מחדש');
    });
  }

  function handleTogglePause() {
    const pause = property.status === 'approved';
    startTransition(async () => {
      const result = await togglePausePropertyAction(property.id, pause);
      if (result.error) toast.error(result.error);
      else toast.success(pause ? 'הנכס הושהה' : 'הנכס פעיל שוב');
    });
  }

  return (
    <div className="bg-white rounded-3xl border border-forest/8 shadow-card p-6 md:p-8 space-y-5">
      <Field label="שם הנכס"><input value={name} onChange={(e) => setName(e.target.value)} className="input" /></Field>
      <Field label="תיאור"><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="input" /></Field>
      <Field label="כתובת"><input value={address} onChange={(e) => setAddress(e.target.value)} className="input" /></Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="אורחים מקסימום"><input type="number" value={maxGuests} onChange={(e) => setMaxGuests(Number(e.target.value))} className="input" /></Field>
        <Field label="חדרים"><input type="number" value={numRooms} onChange={(e) => setNumRooms(Number(e.target.value))} className="input" /></Field>
        <Field label="מיטות"><input type="number" value={numBeds} onChange={(e) => setNumBeds(Number(e.target.value))} className="input" /></Field>
        <Field label="חדרי רחצה"><input type="number" step={0.5} value={numBathrooms} onChange={(e) => setNumBathrooms(Number(e.target.value))} className="input" /></Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="מחיר חול (₪)"><input type="number" value={weekdayPrice} onChange={(e) => setWeekdayPrice(Number(e.target.value))} className="input" /></Field>
        <Field label="מחיר סופ״ש (₪)"><input type="number" value={weekendPrice} onChange={(e) => setWeekendPrice(Number(e.target.value))} className="input" /></Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="טלפון"><input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" /></Field>
        <Field label="WhatsApp"><input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} className="input" /></Field>
      </div>
      <Field label="אימייל ליצירת קשר"><input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="input" /></Field>

      <div>
        <p className="text-sm font-medium text-charcoal mb-2">שירותים ומתקנים</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {amenities.map((a) => {
            const checked = amenityIds.includes(a.id);
            return (
              <label
                key={a.id}
                className={cn(
                  'flex items-center gap-2 rounded-xl border px-3 py-2 text-sm cursor-pointer',
                  checked ? 'border-forest bg-forest/5 text-forest' : 'border-forest/12 text-charcoal/70'
                )}
              >
                <input
                  type="checkbox" checked={checked} className="hidden"
                  onChange={() => setAmenityIds((ids) => (checked ? ids.filter((x) => x !== a.id) : [...ids, a.id]))}
                />
                {a.name_he}
              </label>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-4 border-t border-charcoal/8">
        <Button onClick={handleSave} disabled={isPending}>{isPending ? 'שומר...' : 'שמירת שינויים'}</Button>

        {(property.status === 'rejected' || property.status === 'needs_changes') && (
          <Button variant="secondary" onClick={handleResubmit} disabled={isPending}>שליחה מחדש לבדיקה</Button>
        )}

        {(property.status === 'approved' || property.status === 'suspended') && (
          <Button variant="outline" onClick={handleTogglePause} disabled={isPending}>
            {property.status === 'approved' ? 'השהיית הנכס' : 'הפעלת הנכס מחדש'}
          </Button>
        )}
      </div>

      <style jsx global>{`
        .input { width: 100%; border-radius: 0.75rem; border: 1px solid rgba(27,67,50,0.15); padding: 0.7rem 1rem; outline: none; }
        .input:focus { border-color: #1B4332; }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-charcoal mb-1.5">{label}</label>
      {children}
    </div>
  );
}
