import { DurumTipi } from '../types/energy';

interface StatusBadgeProps {
  status: DurumTipi;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const isAlert = status === 'YUKSEK_AKIM';

  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide',
        isAlert ? 'bg-red-500/20 text-red-200 ring-1 ring-red-400/50' : 'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/40',
      ].join(' ')}
    >
      {isAlert ? 'YÜKSEK AKIM' : 'NORMAL'}
    </span>
  );
}
