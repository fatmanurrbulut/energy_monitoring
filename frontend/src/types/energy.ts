export type DurumTipi = 'NORMAL' | 'YUKSEK_AKIM';

export interface EnergyReading {
  timestamp: number;
  current: number;
  voltage: number;
  power: number;
  status: DurumTipi;
}

export interface HourlyPoint {
  saat: string;
  ortalamaGuc: number;
}

export interface AlertEvent {
  id: string;
  timestamp: number;
  current: number;
  voltage: number;
  power: number;
}
