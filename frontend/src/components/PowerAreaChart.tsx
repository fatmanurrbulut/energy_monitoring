import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { EnergyReading } from '../types/energy';
import { zaman } from '../lib/format';
import { GlassCard } from './GlassCard';

interface PowerAreaChartProps {
  data: EnergyReading[];
}

export function PowerAreaChart({ data }: PowerAreaChartProps) {
  return (
    <GlassCard title='Anlık Güç Tüketimi'>
      <div className='h-72 w-full'>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id='gucGradient' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor='#22d3ee' stopOpacity={0.65} />
                <stop offset='100%' stopColor='#22d3ee' stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke='rgba(255,255,255,0.08)' strokeDasharray='3 3' />
            <XAxis
              dataKey='timestamp'
              tickFormatter={(v) => zaman(v).slice(0, 5)}
              stroke='#94a3b8'
              tick={{ fill: '#cbd5e1', fontSize: 12 }}
            />
            <YAxis stroke='#94a3b8' tick={{ fill: '#cbd5e1', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: '#0b1220',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 12,
              }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value: number) => [`${value.toFixed(1)} W`, 'Güç']}
              labelFormatter={(label) => `Saat: ${zaman(label as number)}`}
            />
            <Area
              type='monotone'
              dataKey='power'
              stroke='#22d3ee'
              strokeWidth={2.5}
              fill='url(#gucGradient)'
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
