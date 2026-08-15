'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, CalendarDays, Users, Search } from 'lucide-react';

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export function SearchBar() {
  const router = useRouter();
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [error, setError] = useState('');

  function handleCheckInChange(value: string) {
    setCheckIn(value);
    // Never allow checkout before the new check-in date.
    if (checkOut && value && checkOut < value) setCheckOut('');
    setError('');
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (checkIn && checkOut && checkOut < checkIn) {
      setError('תאריך היציאה לא יכול להיות לפני תאריך הכניסה');
      return;
    }

    const params = new URLSearchParams();
    if (destination) params.set('q', destination);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    params.set('guests', String(guests));
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl shadow-premium border border-forest/10 p-3 md:p-2 flex flex-col md:flex-row md:items-center gap-2"
    >
      <div className="flex items-center gap-3 px-4 py-3 flex-1 min-w-0">
        <MapPin size={19} className="text-brass shrink-0" />
        <div className="min-w-0">
          <label htmlFor="destination" className="block text-[11px] text-charcoal/50 font-medium">יעד או עיר</label>
          <input
            id="destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="לאן נוסעים? למשל קיסריה"
            className="w-full outline-none text-sm bg-transparent placeholder:text-charcoal/40"
          />
        </div>
      </div>

      <div className="hidden md:block w-px h-10 bg-forest/10" />

      <div className="flex items-center gap-3 px-4 py-3">
        <CalendarDays size={19} className="text-brass shrink-0" />
        <div>
          <label htmlFor="checkIn" className="block text-[11px] text-charcoal/50 font-medium">כניסה</label>
          <input
            id="checkIn"
            type="date"
            min={todayISO()}
            value={checkIn}
            onChange={(e) => handleCheckInChange(e.target.value)}
            className="outline-none text-sm bg-transparent"
          />
        </div>
      </div>

      <div className="hidden md:block w-px h-10 bg-forest/10" />

      <div className="flex items-center gap-3 px-4 py-3">
        <CalendarDays size={19} className="text-brass shrink-0" />
        <div>
          <label htmlFor="checkOut" className="block text-[11px] text-charcoal/50 font-medium">יציאה</label>
          <input
            id="checkOut"
            type="date"
            min={checkIn || todayISO()}
            value={checkOut}
            onChange={(e) => { setCheckOut(e.target.value); setError(''); }}
            className="outline-none text-sm bg-transparent"
          />
        </div>
      </div>

      <div className="hidden md:block w-px h-10 bg-forest/10" />

      <div className="flex items-center gap-3 px-4 py-3">
        <Users size={19} className="text-brass shrink-0" />
        <div>
          <label htmlFor="guests" className="block text-[11px] text-charcoal/50 font-medium">אורחים</label>
          <input
            id="guests"
            type="number"
            min={1}
            max={30}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-14 outline-none text-sm bg-transparent"
          />
        </div>
      </div>

      <button
        type="submit"
        className="flex items-center justify-center gap-2 bg-forest text-cream rounded-2xl px-6 py-4 font-medium hover:bg-forest-700 transition-colors shrink-0"
      >
        <Search size={18} />
        חיפוש
      </button>

      {error && <p className="text-xs text-red-600 px-4 md:absolute md:-bottom-6">{error}</p>}
    </form>
  );
}
