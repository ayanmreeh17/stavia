'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface Img { id: string; storage_path: string; alt_text?: string | null }

export function PropertyGallery({ images, coverImageUrl }: { images: Img[]; coverImageUrl?: string | null }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const urls = images.map((i) => i.storage_path);

  if (urls.length === 0) {
    return (
      <div className="rounded-3xl bg-sage aspect-[16/7] flex items-center justify-center text-forest/30 font-display">
        עדיין אין תמונות לנכס זה
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-3xl overflow-hidden aspect-[16/7]">
        <button onClick={() => setLightboxIndex(0)} className="relative col-span-2 row-span-2">
          <Image src={urls[0]} alt="" fill className="object-cover" sizes="50vw" />
        </button>
        {urls.slice(1, 5).map((url, i) => (
          <button key={url} onClick={() => setLightboxIndex(i + 1)} className="relative">
            <Image src={url} alt="" fill className="object-cover" sizes="25vw" />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <button onClick={() => setLightboxIndex(null)} className="absolute top-5 left-5 text-white p-2" aria-label="סגור">
            <X size={26} />
          </button>
          <button
            onClick={() => setLightboxIndex((i) => (i! + 1) % urls.length)}
            className="absolute right-5 text-white p-3"
            aria-label="הבא"
          >
            <ChevronRight size={30} />
          </button>
          <button
            onClick={() => setLightboxIndex((i) => (i! - 1 + urls.length) % urls.length)}
            className="absolute left-5 text-white p-3"
            aria-label="הקודם"
          >
            <ChevronLeft size={30} />
          </button>
          <div className="relative w-full max-w-4xl aspect-[4/3] mx-8">
            <Image src={urls[lightboxIndex]} alt="" fill className="object-contain" sizes="90vw" />
          </div>
        </div>
      )}
    </>
  );
}
