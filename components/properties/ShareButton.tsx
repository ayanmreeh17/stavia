'use client';

import { Share2 } from 'lucide-react';
import { toast } from 'sonner';

export function ShareButton({ title }: { title: string }) {
  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled — no-op
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    toast.success('הקישור הועתק');
  }

  return (
    <button onClick={handleShare} aria-label="שיתוף" className="p-3 rounded-full bg-white border border-forest/10 hover:border-brass transition-colors">
      <Share2 size={19} className="text-charcoal/50" />
    </button>
  );
}
