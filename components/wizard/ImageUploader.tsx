'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, Upload, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UploadedImage {
  path: string;
  previewUrl: string;
}

interface ImageUploaderProps {
  bucket: 'property-images' | 'room-images';
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  coverPath?: string | null;
  onSetCover?: (path: string) => void;
  label?: string;
}

/**
 * Uploads land under a random folder id — application code (server actions
 * in lib/actions/properties.ts) is what actually associates a storage_path
 * with a specific property/room row the user owns, so an uploaded-but-never-
 * attached file has no effect on any real listing.
 */
export function ImageUploader({ bucket, images, onChange, coverPath, onSetCover, label }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setError(null);
      setUploading(true);
      const supabase = createClient();
      const next: UploadedImage[] = [...images];

      for (const file of Array.from(files)) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          setError('ניתן להעלות קבצי JPG, PNG או WEBP בלבד');
          continue;
        }
        if (file.size > 8 * 1024 * 1024) {
          setError('גודל קובץ מקסימלי הוא 8MB');
          continue;
        }

        const path = `${crypto.randomUUID()}/${file.name}`;
        const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file);
        if (uploadError) {
          setError('העלאת התמונה נכשלה, נסו שוב');
          continue;
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        next.push({ path, previewUrl: data.publicUrl });
      }

      onChange(next);
      setUploading(false);
    },
    [bucket, images, onChange]
  );

  function removeImage(path: string) {
    onChange(images.filter((img) => img.path !== path));
  }

  return (
    <div>
      {label && <p className="text-sm font-medium text-charcoal mb-2">{label}</p>}

      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img) => (
          <div key={img.path} className="relative aspect-square rounded-xl overflow-hidden border border-forest/10 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.previewUrl} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(img.path)}
              className="absolute top-1.5 left-1.5 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="הסר תמונה"
            >
              <X size={13} />
            </button>
            {onSetCover && (
              <button
                type="button"
                onClick={() => onSetCover(img.path)}
                className={cn(
                  'absolute bottom-1.5 right-1.5 rounded-full p-1.5 transition-colors',
                  coverPath === img.path ? 'bg-brass text-white' : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'
                )}
                aria-label="קבע כתמונה ראשית"
                title="קבע כתמונה ראשית"
              >
                <Star size={13} className={coverPath === img.path ? 'fill-current' : ''} />
              </button>
            )}
          </div>
        ))}

        <label className="aspect-square rounded-xl border-2 border-dashed border-forest/25 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-forest/50 transition-colors text-charcoal/50">
          <Upload size={20} />
          <span className="text-xs">{uploading ? 'מעלה...' : 'הוספת תמונה'}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}
