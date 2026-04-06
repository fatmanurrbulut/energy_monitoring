import { AlertTriangle, Download } from 'lucide-react';
import { AlertEvent } from '../types/energy';
import { sayi, tarihSaat } from '../lib/format';
import { GlassCard } from './GlassCard';

interface AlarmHistoryCardProps {
  alerts: AlertEvent[];
  onExportCsv: () => void;
}

export function AlarmHistoryCard({ alerts, onExportCsv }: AlarmHistoryCardProps) {
  return (
    <GlassCard title='Alarm Geçmişi'>
      <div className='mb-3 flex items-center justify-between gap-2'>
        <div className='inline-flex items-center gap-2 text-sm font-semibold text-amber-200'>
          <AlertTriangle size={16} />
          Toplam Alarm: {alerts.length}
        </div>
        <button
          onClick={onExportCsv}
          disabled={alerts.length === 0}
          className='inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-sky-100 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40'
        >
          <Download size={14} />
          CSV Dışa Aktar
        </button>
      </div>

      {alerts.length === 0 ? (
        <div className='rounded-lg border border-white/10 bg-black/10 px-3 py-4 text-sm text-slate-300'>
          Henüz alarm oluşmadı.
        </div>
      ) : (
        <div className='max-h-72 overflow-auto rounded-lg border border-white/10 bg-black/10'>
          <table className='w-full text-left text-xs sm:text-sm'>
            <thead className='sticky top-0 bg-slate-900/95 text-slate-300'>
              <tr>
                <th className='px-3 py-2'>Zaman</th>
                <th className='px-3 py-2'>Akım (A)</th>
                <th className='px-3 py-2'>Gerilim (V)</th>
                <th className='px-3 py-2'>Güç (W)</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((item) => (
                <tr key={item.id} className='border-t border-white/10 text-slate-100'>
                  <td className='px-3 py-2 whitespace-nowrap'>{tarihSaat(item.timestamp)}</td>
                  <td className='px-3 py-2'>{sayi(item.current)}</td>
                  <td className='px-3 py-2'>{sayi(item.voltage)}</td>
                  <td className='px-3 py-2'>{sayi(item.power, 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  );
}

