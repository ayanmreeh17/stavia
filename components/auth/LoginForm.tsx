'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginAction } from '@/lib/actions/auth';
import { Button } from '@/components/ui/Button';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await loginAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push(searchParams.get('redirectTo') || '/');
      router.refresh();
    });
  }

  return (
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
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-charcoal mb-1.5">סיסמה</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full rounded-xl border border-forest/15 px-4 py-3 outline-none focus:border-forest"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={isPending} className="w-full mt-2">
        {isPending ? 'מתחבר...' : 'התחברות'}
      </Button>
    </form>
  );
}
