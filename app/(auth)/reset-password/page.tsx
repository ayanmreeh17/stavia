'use client';

import { useState, useTransition } from 'react';
import { AuthCard } from '@/components/auth/AuthCard';
import { requestPasswordResetAction } from '@/lib/actions/auth';
import { Button } from '@/components/ui/Button';

export default function ResetPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await requestPasswordResetAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSent(true);
    });
  }

  return (
    <AuthCard title="איפוס סיסמה" subtitle="נשלח לכם קישור לאיפוס הסיסמה במייל">
      {sent ? (
        <p className="text-center text-forest bg-sage-light rounded-xl p-4 text-sm">
          אם הכתובת קיימת במערכת, נשלח אליה קישור לאיפוס הסיסמה.
        </p>
      ) : (
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-1.5">אימייל</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-xl border border-forest/15 px-4 py-3 outline-none focus:border-forest"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'שולח...' : 'שליחת קישור איפוס'}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
