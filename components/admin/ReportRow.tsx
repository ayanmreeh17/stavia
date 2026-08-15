'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { Check, X, EyeOff } from 'lucide-react';
import { resolveReportAction, unpublishReviewAction } from '@/lib/actions/reports';
import { formatDateDMY } from '@/lib/utils';

interface Props {
  report: {
    id: string; reason: string; details: string | null; created_at: string;
    property_id: string | null; review_id: string | null;
    properties?: { name: string } | null; reviews?: { comment: string | null } | null;
  };
}

export function ReportRow({ report }: Props) {
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<{ error?: string; success?: boolean }>) {
    startTransition(async () => {
      const result = await action();
      if (result.error) toast.error(result.error);
      else toast.success('בוצע');
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-forest/8 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">
            {report.properties?.name ?? (report.reviews ? 'ביקורת מדווחת' : 'תוכן מדווח')}
          </p>
          <p className="text-xs text-charcoal/50 mt-0.5">סיבה: {report.reason}</p>
          {report.reviews?.comment && <p className="text-xs text-charcoal/60 mt-1 italic">"{report.reviews.comment}"</p>}
          <p className="text-[11px] text-charcoal/30 mt-1">{formatDateDMY(report.created_at)}</p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          {report.review_id && (
            <button
              title="הסתר ביקורת"
              disabled={isPending}
              onClick={() => run(async () => {
                await unpublishReviewAction(report.review_id!);
                return resolveReportAction(report.id, 'actioned');
              })}
              className="p-2 rounded-lg text-red-600 hover:bg-red-50"
            >
              <EyeOff size={15} />
            </button>
          )}
          <button
            title="סמן כטופל"
            disabled={isPending}
            onClick={() => run(() => resolveReportAction(report.id, 'reviewed'))}
            className="p-2 rounded-lg text-forest hover:bg-forest/10"
          >
            <Check size={15} />
          </button>
          <button
            title="דחיית הדיווח"
            disabled={isPending}
            onClick={() => run(() => resolveReportAction(report.id, 'dismissed'))}
            className="p-2 rounded-lg text-charcoal/40 hover:bg-charcoal/5"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
