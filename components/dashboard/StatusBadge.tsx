import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft: { label: 'טיוטה', className: 'bg-charcoal/10 text-charcoal/60' },
  pending: { label: 'ממתין לאישור', className: 'bg-brass/15 text-brass' },
  approved: { label: 'מאושר', className: 'bg-forest/12 text-forest' },
  rejected: { label: 'נדחה', className: 'bg-red-100 text-red-600' },
  needs_changes: { label: 'נדרשים שינויים', className: 'bg-amber-100 text-amber-700' },
  suspended: { label: 'מושהה', className: 'bg-charcoal/10 text-charcoal/60' },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full shrink-0', config.className)}>
      {config.label}
    </span>
  );
}
