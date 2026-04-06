import { useEffect } from 'react';
import {
  Activity,
  Gauge,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { KpiCard } from './components/KpiCard';
import { PowerAreaChart } from './components/PowerAreaChart';
import { HourlyAverageChart } from './components/HourlyAverageChart';
import { StatusBadge } from './components/StatusBadge';
import { sayi, zaman } from './lib/format';
import { useEnergyStream } from './hooks/useEnergyStream';

function App() {
  const {
    sonVeri,
    liveSeries,
    saatlikOrtalama,
    currentAlertLimit,
    usingMock,
    veriYenile,
  } =
    useEnergyStream();

  useEffect(() => {
    if (!usingMock) {
      return;
    }
    const timer = setInterval(veriYenile, 2000);
    return () => clearInterval(timer);
  }, [usingMock, veriYenile]);

  if (!sonVeri) {
    return null;
  }

  const alertAktif = sonVeri.current > currentAlertLimit;

  return (
    <main className='min-h-screen bg-panel text-slate-100'>
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <header className='mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h1 className='text-3xl font-black tracking-tight text-white'>
              Enerji İzleme Paneli
            </h1>
            <p className='mt-1 text-sm text-slate-300'>
              Son güncelleme: {zaman(sonVeri.timestamp)}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <span
              className={[
                'inline-flex items-center rounded-xl border px-3 py-2 text-xs font-bold tracking-wide',
                usingMock
                  ? 'border-amber-300/40 bg-amber-500/15 text-amber-200'
                  : 'border-emerald-300/40 bg-emerald-500/15 text-emerald-200',
              ].join(' ')}
            >
              {usingMock ? 'Simülasyon Modu (Mock Veri)' : 'Canlı Veri Bağlı'}
            </span>
            <button
              onClick={veriYenile}
              className='inline-flex w-fit items-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:bg-white/20'
            >
              Veriyi Yenile
            </button>
          </div>
        </header>

        <section className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
          <KpiCard title='Akım' icon={Activity} value={sayi(sonVeri.current)} unit='Amper (A)' alert={alertAktif} />
          <KpiCard title='Gerilim' icon={Gauge} value={sayi(sonVeri.voltage)} unit='Volt (V)' />
          <KpiCard title='Güç' icon={Zap} value={sayi(sonVeri.power, 1)} unit='Watt (W)' />
          <KpiCard
            title='Durum'
            icon={ShieldAlert}
            value={<StatusBadge status={sonVeri.status} />}
            alert={alertAktif}
          />
        </section>

        {alertAktif ? (
          <div className='mt-4 rounded-xl border border-red-300/40 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200'>
            YÜKSEK AKIM UYARISI: Akım değeri eşik değerini geçti ({currentAlertLimit} A)
          </div>
        ) : null}

        <section className='mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2'>
          <PowerAreaChart data={liveSeries} />
          <HourlyAverageChart data={saatlikOrtalama} />
        </section>
      </div>
    </main>
  );
}

export default App;
