import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { HourlyPoint } from '../types/energy';
import { GlassCard } from './GlassCard';

interface HourlyAverageChartProps {
  data: HourlyPoint[];
}

export function HourlyAverageChart({ data }: HourlyAverageChartProps) {
  return (
    <GlassCard title='Saatlik Ortalama Güç'>
      <div className='h-72 w-full'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke='rgba(255,255,255,0.08)' strokeDasharray='3 3' />
            <XAxis dataKey='saat' stroke='#94a3b8' tick={{ fill: '#cbd5e1', fontSize: 12 }} />
            <YAxis stroke='#94a3b8' tick={{ fill: '#cbd5e1', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: '#0b1220',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 12,
              }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value: number) => [`${value.toFixed(0)} W`, 'Ortalama']}
            />
            <Bar dataKey='ortalamaGuc' radius={[8, 8, 0, 0]} fill='#38bdf8' />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
