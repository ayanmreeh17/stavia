'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Check, X, MessageSquareWarning, Ban, Trash2, Star } from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import {
  approvePropertyAction, rejectPropertyAction, requestChangesAction,
  suspendPropertyAction, deletePropertyAction, setFeaturedAction,
} from '@/lib/actions/properties';

interface Props {
  property: {
    id: string; name: string; status: string; is_featured: boolean; created_at: string;
    cities?: { name_he: string } | null;
    profiles?: { email: string; full_name: string | null } | null;
  };
}

export function AdminPropertyRow({ property }: Props) {
  const [isPending, startTransition] = useTransition();
  const [showReasonFor, setShowReasonFor] = useState<'reject' | 'changes' | null>(null);
  const [reason, setReason] = useState('');

  function run(action: () => Promise<{ error?: string; success?: boolean }>) {
    startTransition(async () => {
      const result = await action();
      if (result.error) toast.error(result.error);
      else toast.success('בוצע בהצלחה');
    });
  }

  function submitReason() {
    if (!reason.trim()) return;
    if (showReasonFor === 'reject') run(() => rejectPropertyAction(property.id, reason));
    if (showReasonFor === 'changes') run(() => requestChangesAction(property.id, reason));
    setShowReasonFor(null);
    setReason('');
  }

  return (
    <div className="bg-white rounded-2xl border border-forest/8 p-4">
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/property/${property.id}`} target="_blank" className="font-medium text-charcoal hover:underline">
              {property.name}
            </Link>
            <StatusBadge status={property.status} />
            {property.is_featured && <Star size={14} className="fill-brass text-brass" />}
          </div>
          <p className="text-xs text-charcoal/50 mt-1">
            {property.cities?.name_he} · {property.profiles?.full_name ?? property.profiles?.email}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {property.status === 'pending' && (
            <>
              <IconBtn title="אישור" onClick={() => run(() => approvePropertyAction(property.id))} disabled={isPending}>
                <Check size={16} />
              </IconBtn>
              <IconBtn title="דחייה" onClick={() => setShowReasonFor('reject')} disabled={isPending} variant="danger">
                <X size={16} />
              </IconBtn>
              <IconBtn title="דרוש שינויים" onClick={() => setShowReasonFor('changes')} disabled={isPending} variant="warn">
                <MessageSquareWarning size={16} />
              </IconBtn>
            </>
          )}
          {property.status === 'approved' && (
            <>
              <IconBtn
                title={property.is_featured ? 'הסר מומלץ' : 'סמן כמומלץ'}
                onClick={() => run(() => setFeaturedAction(property.id, !property.is_featured))}
                disabled={isPending}
              >
                <Star size={16} className={property.is_featured ? 'fill-brass text-brass' : ''} />
              </IconBtn>
              <IconBtn title="השהה" onClick={() => run(() => suspendPropertyAction(property.id))} disabled={isPending} variant="warn">
                <Ban size={16} />
              </IconBtn>
            </>
          )}
          <IconBtn
            title="מחיקה"
            onClick={() => confirm('למחוק את הנכס לצמיתות?') && run(() => deletePropertyAction(property.id))}
            disabled={isPending}
            variant="danger"
          >
            <Trash2 size={16} />
          </IconBtn>
        </div>
      </div>

      {showReasonFor && (
        <div className="mt-3 flex gap-2">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="נמקו את הסיבה עבור בעל הנכס..."
            className="flex-1 rounded-xl border border-forest/15 px-3 py-2 text-sm outline-none focus:border-forest"
          />
          <button onClick={submitReason} className="bg-forest text-cream rounded-xl px-4 text-sm">שליחה</button>
          <button onClick={() => setShowReasonFor(null)} className="text-charcoal/50 text-sm px-2">ביטול</button>
        </div>
      )}
    </div>
  );
}

function IconBtn({
  children, onClick, disabled, title, variant = 'default',
}: {
  children: React.ReactNode; onClick: () => void; disabled?: boolean; title: string; variant?: 'default' | 'danger' | 'warn';
}) {
  const colors = {
    default: 'text-forest hover:bg-forest/10',
    danger: 'text-red-600 hover:bg-red-50',
    warn: 'text-amber-600 hover:bg-amber-50',
  }[variant];
  return (
    <button onClick={onClick} disabled={disabled} title={title} className={`p-2 rounded-lg transition-colors disabled:opacity-40 ${colors}`}>
      {children}
    </button>
  );
}
