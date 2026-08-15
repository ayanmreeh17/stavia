'use client';

import { useEffect, useState, useTransition } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { cn, formatDateDMY } from '@/lib/utils';

interface Notification {
  id: string; type: string; title: string; body: string | null;
  is_read: boolean; created_at: string; related_property_id: string | null;
}

export function NotificationBell({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from('notifications')
      .select('id, type, title, body, is_read, created_at, related_property_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(15)
      .then(({ data }) => setNotifications(data ?? []));
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  function markAllRead() {
    startTransition(async () => {
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
      setNotifications((ns) => ns.map((n) => ({ ...n, is_read: true })));
    });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 text-forest hover:bg-forest/5 rounded-full"
        aria-label="התראות"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-brass text-cream text-[10px] rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl border border-forest/10 shadow-premium z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b border-charcoal/5">
            <span className="font-medium text-sm">התראות</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} disabled={isPending} className="text-xs text-forest hover:underline">
                סמן הכל כנקרא
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-charcoal/40 p-6 text-center">אין התראות</p>
          ) : (
            notifications.map((n) => (
              <Link
                key={n.id}
                href={n.related_property_id ? `/property/${n.related_property_id}` : '/dashboard'}
                onClick={() => setOpen(false)}
                className={cn('block px-4 py-3 border-b border-charcoal/5 hover:bg-sage-light/50', !n.is_read && 'bg-sage-light/30')}
              >
                <p className="text-sm font-medium text-charcoal">{n.title}</p>
                {n.body && <p className="text-xs text-charcoal/50 mt-0.5">{n.body}</p>}
                <p className="text-[11px] text-charcoal/30 mt-1">{formatDateDMY(n.created_at)}</p>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
