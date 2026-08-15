'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ImageUploader, type UploadedImage } from './ImageUploader';
import { LocationPicker } from './LocationPicker';
import { submitPropertyAction, type WizardPayload } from '@/lib/actions/properties';
import { cn, formatPriceILS } from '@/lib/utils';

interface RefItem { id: string; name_he: string; key?: string; group?: string; region?: string | null }

interface WizardRoom {
  id: string;
  name: string;
  roomType: string;
  description: string;
  numBeds: number;
  bedTypes: string[];
  bathroomInfo: string;
  sizeSqm: string;
  amenityIds: string[];
  images: UploadedImage[];
}

const STEP_TITLES = [
  'פרטי הנכס', 'קיבולת וחדרים', 'ניהול חדרים', 'שירותים ומתקנים',
  'תמונות', 'תמחור', 'פרטי קשר', 'סיכום ואישור',
];

const ROOM_TYPES = [
  { value: 'bedroom', label: 'חדר שינה' },
  { value: 'living_room', label: 'סלון' },
  { value: 'kitchen', label: 'מטבח' },
  { value: 'bathroom', label: 'חדר רחצה' },
  { value: 'other', label: 'אחר' },
];

const PROPERTY_TYPES = [
  { value: 'villa', label: 'וילה' }, { value: 'cabin', label: 'צימר' },
  { value: 'apartment', label: 'דירה' }, { value: 'cottage', label: 'קוטג׳' },
  { value: 'farmhouse', label: 'חוות נופש' }, { value: 'boutique_hotel', label: 'מלון בוטיק' },
  { value: 'guesthouse', label: 'בית הארחה' }, { value: 'zimmer', label: 'זימר' },
  { value: 'unique_stay', label: 'לינה ייחודית' }, { value: 'other', label: 'אחר' },
];

export function PropertyWizard({ categories, cities, amenities }: { categories: RefItem[]; cities: RefItem[]; amenities: RefItem[] }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Step 1
  const [name, setName] = useState('');
  const [propertyType, setPropertyType] = useState('villa');
  const [countryCode, setCountryCode] = useState('IL');
  const [region, setRegion] = useState('center');
  const [cityId, setCityId] = useState('');
  const [address, setAddress] = useState('');
  const [addressVisible, setAddressVisible] = useState(true);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [description, setDescription] = useState('');

  // Step 2
  const [maxGuests, setMaxGuests] = useState(2);
  const [numRooms, setNumRooms] = useState(1);
  const [numBeds, setNumBeds] = useState(1);
  const [numBathrooms, setNumBathrooms] = useState(1);

  // Step 3
  const [rooms, setRooms] = useState<WizardRoom[]>([]);

  // Step 4
  const [propertyAmenityIds, setPropertyAmenityIds] = useState<string[]>([]);

  // Step 5
  const [propertyImages, setPropertyImages] = useState<UploadedImage[]>([]);
  const [coverPath, setCoverPath] = useState<string | null>(null);

  // Step 6
  const [weekdayPrice, setWeekdayPrice] = useState(500);
  const [weekendPrice, setWeekendPrice] = useState(750);

  // Step 7
  const [phoneCountryCode, setPhoneCountryCode] = useState('+972');
  const [phone, setPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  function addRoom() {
    setRooms((r) => [...r, {
      id: crypto.randomUUID(), name: `חדר ${r.length + 1}`, roomType: 'bedroom',
      description: '', numBeds: 1, bedTypes: [], bathroomInfo: '', sizeSqm: '',
      amenityIds: [], images: [],
    }]);
  }
  function updateRoom(id: string, patch: Partial<WizardRoom>) {
    setRooms((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  function removeRoom(id: string) {
    setRooms((rs) => rs.filter((r) => r.id !== id));
  }

  function canProceed(): boolean {
    switch (step) {
      case 0: return name.trim().length > 1 && description.trim().length > 10 && !!cityId;
      case 1: return maxGuests > 0 && numRooms > 0 && numBeds > 0;
      case 6: return phone.trim().length > 4;
      default: return true;
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    const payload: WizardPayload = {
      name, propertyType, categoryId: null, countryCode, region, cityId,
      address, addressVisible, lat, lng, description,
      maxGuests, numRooms, numBeds, numBathrooms,
      rooms: rooms.map((r) => ({
        name: r.name, roomType: r.roomType, description: r.description,
        numBeds: r.numBeds, bedTypes: r.bedTypes, bathroomInfo: r.bathroomInfo,
        sizeSqm: r.sizeSqm ? Number(r.sizeSqm) : undefined,
        amenityIds: r.amenityIds, imagePaths: r.images.map((i) => i.path),
      })),
      amenityIds: propertyAmenityIds,
      propertyImagePaths: propertyImages.map((i) => i.path),
      coverImagePath: coverPath,
      weekdayPrice, weekendPrice,
      phoneCountryCode, phone, whatsappNumber, contactEmail,
    };

    const result = await submitPropertyAction(payload);
    setSubmitting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success('הנכס נשלח לאישור! נעדכן אתכם ברגע שיאושר.');
    router.push('/dashboard');
  }

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center gap-1.5 mb-8 overflow-x-auto pb-1">
        {STEP_TITLES.map((title, i) => (
          <div key={title} className="flex items-center gap-1.5 shrink-0">
            <div
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0',
                i < step ? 'bg-forest text-cream' : i === step ? 'bg-brass text-cream' : 'bg-white text-charcoal/40 border border-forest/15'
              )}
            >
              {i < step ? <Check size={13} /> : i + 1}
            </div>
            {i < STEP_TITLES.length - 1 && <div className={cn('w-4 h-px', i < step ? 'bg-forest' : 'bg-forest/15')} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-forest/8 shadow-card p-6 md:p-8">
        <h2 className="font-display text-xl mb-6">{STEP_TITLES[step]}</h2>

        {step === 0 && (
          <div className="space-y-4">
            <Field label="שם הנכס">
              <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="וילה בוטיק על החוף" />
            </Field>
            <Field label="סוג נכס">
              <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="input">
                {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="מדינה">
                <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="input">
                  <option value="IL">ישראל</option>
                  <option value="US">ארה״ב</option>
                  <option value="FR">צרפת</option>
                  <option value="GR">יוון</option>
                  <option value="IT">איטליה</option>
                  <option value="ES">ספרד</option>
                  <option value="DE">גרמניה</option>
                  <option value="GB">בריטניה</option>
                  <option value="other">אחר</option>
                </select>
              </Field>
              {countryCode === 'IL' && (
                <Field label="אזור">
                  <select value={region} onChange={(e) => setRegion(e.target.value)} className="input">
                    <option value="north">צפון</option>
                    <option value="center">מרכז</option>
                    <option value="south">דרום</option>
                  </select>
                </Field>
              )}
            </div>
            {countryCode === 'IL' ? (
              <Field label="עיר">
                <select value={cityId} onChange={(e) => setCityId(e.target.value)} className="input">
                  <option value="">בחרו עיר</option>
                  {cities.filter((c) => !region || c.region === region).map((c) => (
                    <option key={c.id} value={c.id}>{c.name_he}</option>
                  ))}
                </select>
              </Field>
            ) : (
              <Field label="עיר / אזור">
                <input value={address} onChange={(e) => setAddress(e.target.value)} className="input" placeholder="שם העיר" />
              </Field>
            )}
            <Field label="כתובת מלאה">
              <input value={address} onChange={(e) => setAddress(e.target.value)} className="input" placeholder="רחוב ומספר" />
            </Field>
            <label className="flex items-center gap-2 text-sm text-charcoal/70">
              <input type="checkbox" checked={addressVisible} onChange={(e) => setAddressVisible(e.target.checked)} />
              הצג את הכתובת המדויקת לציבור (אחרת יוצג מיקום משוער בלבד)
            </label>
            <Field label="מיקום על המפה">
              <LocationPicker lat={lat} lng={lng} onChange={(la, ln) => { setLat(la); setLng(ln); }} />
            </Field>
            <Field label="תיאור הנכס">
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className="input" placeholder="ספרו לנו על הנכס..." />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="מקסימום אורחים" value={maxGuests} onChange={setMaxGuests} min={1} />
            <NumberField label="מספר חדרים" value={numRooms} onChange={setNumRooms} min={1} />
            <NumberField label="מספר מיטות" value={numBeds} onChange={setNumBeds} min={1} />
            <NumberField label="מספר חדרי רחצה" value={numBathrooms} onChange={setNumBathrooms} min={1} step={0.5} />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <p className="text-sm text-charcoal/60">
              הוסיפו כל חדר בנפרד (חדר שינה, סלון, מטבח...) עם תמונות משלו — לא גלריה כללית אחת.
            </p>
            {rooms.map((room) => (
              <div key={room.id} className="border border-forest/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <input
                    value={room.name}
                    onChange={(e) => updateRoom(room.id, { name: e.target.value })}
                    className="input font-medium max-w-xs"
                  />
                  <button onClick={() => removeRoom(room.id)} className="text-red-500 p-1.5" aria-label="הסר חדר">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select value={room.roomType} onChange={(e) => updateRoom(room.id, { roomType: e.target.value })} className="input">
                    {ROOM_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <NumberField label="" value={room.numBeds} onChange={(v) => updateRoom(room.id, { numBeds: v })} min={0} placeholder="מס׳ מיטות" />
                </div>
                <textarea
                  value={room.description}
                  onChange={(e) => updateRoom(room.id, { description: e.target.value })}
                  className="input" rows={2} placeholder="תיאור החדר"
                />
                <ImageUploader
                  bucket="room-images"
                  images={room.images}
                  onChange={(imgs) => updateRoom(room.id, { images: imgs })}
                  label="תמונות החדר"
                />
              </div>
            ))}
            <button onClick={addRoom} className="flex items-center gap-2 text-forest font-medium text-sm">
              <Plus size={16} /> הוספת חדר
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {amenities.map((a) => {
              const checked = propertyAmenityIds.includes(a.id);
              return (
                <label
                  key={a.id}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm cursor-pointer transition-colors',
                    checked ? 'border-forest bg-forest/5 text-forest' : 'border-forest/12 text-charcoal/70'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      setPropertyAmenityIds((ids) => (checked ? ids.filter((x) => x !== a.id) : [...ids, a.id]))
                    }
                    className="hidden"
                  />
                  {a.name_he}
                </label>
              );
            })}
          </div>
        )}

        {step === 4 && (
          <ImageUploader
            bucket="property-images"
            images={propertyImages}
            onChange={setPropertyImages}
            coverPath={coverPath}
            onSetCover={setCoverPath}
            label="תמונות כלליות של הנכס — לחצו על הכוכב לבחירת תמונת השער"
          />
        )}

        {step === 5 && (
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="מחיר לילה - חול (₪)" value={weekdayPrice} onChange={setWeekdayPrice} min={0} step={10} />
            <NumberField label="מחיר לילה - סופ״ש (₪)" value={weekendPrice} onChange={setWeekendPrice} min={0} step={10} />
            <p className="col-span-2 text-xs text-charcoal/50">
              ניתן להוסיף בהמשך תמחור עונתי, מחירי חג ומינימום לילות דרך אזור הניהול.
            </p>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <select value={phoneCountryCode} onChange={(e) => setPhoneCountryCode(e.target.value)} className="input w-28">
                <option value="+972">🇮🇱 +972</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
              </select>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input flex-1" placeholder="מספר טלפון" />
            </div>
            <Field label="מספר WhatsApp">
              <input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} className="input" placeholder="לרוב זהה למספר הטלפון" />
            </Field>
            <Field label="אימייל ליצירת קשר">
              <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="input" />
            </Field>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-3 text-sm">
            <SummaryRow label="שם הנכס" value={name} />
            <SummaryRow label="סוג" value={PROPERTY_TYPES.find((t) => t.value === propertyType)?.label ?? ''} />
            <SummaryRow label="אורחים / חדרים / מיטות" value={`${maxGuests} / ${numRooms} / ${numBeds}`} />
            <SummaryRow label="חדרים מפורטים" value={`${rooms.length} חדרים עם תמונות`} />
            <SummaryRow label="שירותים" value={`${propertyAmenityIds.length} נבחרו`} />
            <SummaryRow label="תמונות" value={`${propertyImages.length} תמונות כלליות`} />
            <SummaryRow label="מחיר" value={`${formatPriceILS(weekdayPrice)} / ${formatPriceILS(weekendPrice)}`} />
            <SummaryRow label="טלפון" value={`${phoneCountryCode} ${phone}`} />
            <div className="bg-sage-light rounded-xl p-4 text-charcoal/70 mt-4">
              לאחר השליחה, הנכס ייכנס לתור בדיקה ולא יהיה גלוי לציבור עד לאישור הצוות שלנו.
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-8">
          <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            הקודם
          </Button>
          {step < STEP_TITLES.length - 1 ? (
            <Button onClick={() => canProceed() && setStep((s) => s + 1)} disabled={!canProceed()}>
              הבא
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'שולח...' : 'שליחה לאישור'}
            </Button>
          )}
        </div>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(27, 67, 50, 0.15);
          padding: 0.7rem 1rem;
          outline: none;
          background: white;
        }
        .input:focus { border-color: #1B4332; }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-charcoal mb-1.5">{label}</label>}
      {children}
    </div>
  );
}

function NumberField({ label, value, onChange, min, step = 1, placeholder }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; step?: number; placeholder?: string;
}) {
  return (
    <Field label={label}>
      <input
        type="number" value={value} min={min} step={step} placeholder={placeholder}
        onChange={(e) => onChange(Number(e.target.value))} className="input"
      />
    </Field>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-charcoal/5 pb-2">
      <span className="text-charcoal/50">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
