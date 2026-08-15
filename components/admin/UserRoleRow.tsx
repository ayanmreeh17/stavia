'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { updateUserRoleAction } from '@/lib/actions/admin';
import { formatDateDMY } from '@/lib/utils';

interface Props {
  user: { id: string; email: string; full_name: string | null; role: string; created_at: string };
  currentUserId: string;
}

export function UserRoleRow({ user, currentUserId }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleChange(role: string) {
    startTransition(async () => {
      const result = await updateUserRoleAction(user.id, role as 'user' | 'owner' | 'admin');
      if (result.error) toast.error(result.error);
      else toast.success('התפקיד עודכן');
    });
  }

  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div>
        <p className="font-medium text-charcoal">{user.full_name ?? '—'}</p>
        <p className="text-sm text-charcoal/50">{user.email}</p>
        <p className="text-xs text-charcoal/35 mt-0.5">הצטרפו ב-{formatDateDMY(user.created_at)}</p>
      </div>
      <select
        value={user.role}
        disabled={isPending || user.id === currentUserId}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-xl border border-forest/15 px-3 py-2 text-sm bg-white disabled:opacity-50"
      >
        <option value="user">משתמש</option>
        <option value="owner">בעל נכס</option>
        <option value="admin">מנהל</option>
      </select>
    </div>
  );
}
