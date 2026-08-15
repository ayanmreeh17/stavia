'use client';

import { useState, useTransition } from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { createInquiryAction } from '@/lib/actions/properties';

export function ContactPanel({ propertyId, phone, whatsapp }: { propertyId: string; phone: string; whatsapp?: string | null }) {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  function handleSubmit(formData: FormData) {
    formData.set('propertyId', propertyId);
    startTransition(async () => {
      const result = await createInquiryAction(formData);
      if (result.error) toast.error(result.error);
      else setSent(true);
    });
  }

  return (
    <div className="space-y-3">
      <a href={`tel:${phone}`} className="block">
        <Button variant="primary" className="w-full"><Phone size={16} /> התקשרו עכשיו</Button>
      </a>
      {whatsapp && (
        <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="block">
          <Button variant="secondary" className="w-full"><MessageCircle size={16} /> WhatsApp</Button>
        </a>
      )}

      <div className="border-t border-charcoal/8 pt-4 mt-4">
        {sent ? (
          <p className="text-sm text-forest bg-sage-light rounded-xl p-3">הפנייה נשלחה! בעל הנכס יחזור אליכם בקרוב.</p>
        ) : (
          <form action={handleSubmit} className="space-y-2">
            <input name="name" required placeholder="שם מלא" className="w-full rounded-xl border border-forest/15 px-3 py-2.5 text-sm outline-none focus:border-forest" />
            <input name="email" type="email" placeholder="אימייל" className="w-full rounded-xl border border-forest/15 px-3 py-2.5 text-sm outline-none focus:border-forest" />
            <textarea name="message" required rows={3} placeholder="הודעה..." className="w-full rounded-xl border border-forest/15 px-3 py-2.5 text-sm outline-none focus:border-forest" />
            <Button type="submit" variant="outline" disabled={isPending} className="w-full">
              {isPending ? 'שולח...' : 'שליחת פנייה'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
