'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface RoomImage { id: string; storage_path: string }
interface Room {
  id: string; name: string; description?: string | null; num_beds: number;
  bed_types?: string[] | null; bathroom_info?: string | null; size_sqm?: number | null;
  room_images: RoomImage[];
  room_amenities?: { amenities: { name_he: string } | null }[];
}

export function RoomsSection({ rooms }: { rooms: Room[] }) {
  const [activeRoom, setActiveRoom] = useState(0);
  if (rooms.length === 0) return null;

  const room = rooms[activeRoom];

  return (
    <div>
      <h2 className="font-display text-xl mb-3">חדרים</h2>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {rooms.map((r, i) => (
          <button
            key={r.id}
            onClick={() => setActiveRoom(i)}
            className={cn(
              'shrink-0 rounded-full px-4 py-2 text-sm font-medium border transition-colors',
              i === activeRoom ? 'bg-forest text-cream border-forest' : 'bg-white text-charcoal/60 border-forest/12'
            )}
          >
            {r.name}
          </button>
        ))}
      </div>

      {room.room_images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {room.room_images.map((img) => (
            <div key={img.id} className="relative shrink-0 w-40 h-28 rounded-xl overflow-hidden">
              <Image src={img.storage_path} alt={room.name} fill className="object-cover" sizes="160px" />
            </div>
          ))}
        </div>
      )}

      {room.description && <p className="text-charcoal/70 text-sm leading-relaxed mb-2">{room.description}</p>}
      <div className="flex gap-4 text-xs text-charcoal/50">
        <span>{room.num_beds} מיטות</span>
        {room.bed_types && room.bed_types.length > 0 && <span>{room.bed_types.join(', ')}</span>}
        {room.bathroom_info && <span>{room.bathroom_info}</span>}
        {room.size_sqm && <span>{room.size_sqm} מ״ר</span>}
      </div>
    </div>
  );
}
