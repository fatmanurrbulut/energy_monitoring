import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';
import { GlassCard } from './GlassCard';

interface KpiCardProps {
  title: string;
  icon: LucideIcon;
  value: ReactNode;
  unit?: string;
  alert?: boolean;
}

export function KpiCard({ title, icon: Icon, value, unit, alert = false }: KpiCardProps) {
  return (
    <GlassCard title={title} alert={alert} className='min-h-[138px]'>
      <div className='flex items-center justify-between'>
        <div className='rounded-xl bg-white/10 p-3 text-sky-200'>
          <Icon size={22} />
        </div>
        <div className='text-right'>
          <div className='text-3xl font-extrabold text-white'>{value}</div>
          {unit ? <div className='mt-1 text-sm text-slate-300'>{unit}</div> : null}
        </div>
      </div>
    </GlassCard>
  );
}
