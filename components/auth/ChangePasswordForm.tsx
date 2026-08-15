'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PasswordField } from '@/components/ui/PasswordField';
import { Button } from '@/components/ui/Button';
import { updatePasswordAction } from '@/lib/actions/auth';

export function ChangePasswordForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updatePasswordAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success('הסיסמה עודכנה בהצלחה');
      router.push('/dashboard');
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <PasswordField name="password" label="סיסמה חדשה" required />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'מעדכן...' : 'עדכון סיסמה'}
      </Button>
    </form>
  );
}
