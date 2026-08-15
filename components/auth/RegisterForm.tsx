'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { registerAction } from '@/lib/actions/auth';
import { PasswordField } from '@/components/ui/PasswordField';
import { Button } from '@/components/ui/Button';

export function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await registerAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success('נרשמתם בהצלחה! בדקו את תיבת המייל לאימות החשבון.');
      router.push('/login');
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-charcoal mb-1.5">שם מלא</label>
        <input
          id="fullName"
          name="fullName"
          required
          className="w-full rounded-xl border border-forest/15 px-4 py-3 outline-none focus:border-forest"
          placeholder="ישראל ישראלי"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-1.5">אימייל</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-xl border border-forest/15 px-4 py-3 outline-none focus:border-forest"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-charcoal mb-1.5">טלפון</label>
        <div className="flex gap-2">
          <select
            name="phoneCountryCode"
            defaultValue="+972"
            className="rounded-xl border border-forest/15 px-2 py-3 outline-none focus:border-forest bg-white text-sm"
          >
            <option value="+972">🇮🇱 +972</option>
            <option value="+1">🇺🇸 +1</option>
            <option value="+44">🇬🇧 +44</option>
            <option value="+33">🇫🇷 +33</option>
            <option value="+49">🇩🇪 +49</option>
          </select>
          <input
            id="phone"
            name="phone"
            required
            className="flex-1 rounded-xl border border-forest/15 px-4 py-3 outline-none focus:border-forest"
            placeholder="50-1234567"
          />
        </div>
      </div>

      <PasswordField name="password" required />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={isPending} className="w-full mt-2">
        {isPending ? 'יוצר חשבון...' : 'הרשמה'}
      </Button>
    </form>
  );
}
