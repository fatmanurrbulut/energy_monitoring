import { ReactNode } from 'react';

interface GlassCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  alert?: boolean;
}

export function GlassCard({ title, children, className = '', alert = false }: GlassCardProps) {
  return (
    <section
      className={[
        'rounded-2xl border border-white/20 bg-white/10 p-5 shadow-glass backdrop-blur-xl',
        alert ? 'animate-pulseRed border-red-300/70' : '',
        className,
      ].join(' ')}
    >
      <h2 className='mb-4 text-sm font-semibold uppercase tracking-wider text-sky-200'>{title}</h2>
      {children}
    </section>
  );
}
