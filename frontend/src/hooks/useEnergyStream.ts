import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertEvent, DurumTipi, EnergyReading, HourlyPoint } from '../types/energy';

const CURRENT_ALERT_LIMIT = 15;

const generateReading = (): EnergyReading => {
  const current = Number((Math.random() * 18 + 1).toFixed(2));
  const voltage = Number((210 + Math.random() * 25).toFixed(2));
  const power = Number((current * voltage).toFixed(1));

  return {
    timestamp: Date.now(),
    current,
    voltage,
    power,
    status: current > CURRENT_ALERT_LIMIT ? 'YUKSEK_AKIM' : 'NORMAL',
  };
};

const toHourlyAverage = (rows: EnergyReading[]): HourlyPoint[] => {
  const buckets = new Map<string, { sum: number; count: number }>();

  rows.forEach((row) => {
    const date = new Date(row.timestamp);
    const hour = date.getHours().toString().padStart(2, '0');
    const key = hour + ':00';
    const bucket = buckets.get(key);

    if (bucket) {
      bucket.sum += row.power;
      bucket.count += 1;
    } else {
      buckets.set(key, { sum: row.power, count: 1 });
    }
  });

  return Array.from(buckets.entries())
    .map(([saat, value]) => ({
      saat,
      ortalamaGuc: Number((value.sum / value.count).toFixed(0)),
    }))
    .slice(-12);
};

export function useEnergyStream() {
  const initialSeries = useMemo(() => Array.from({ length: 20 }, generateReading), []);
  const [liveSeries, setLiveSeries] = useState<EnergyReading[]>(initialSeries);
  const [alarmHistory, setAlarmHistory] = useState<AlertEvent[]>([]);
  const wsUrl = import.meta.env.VITE_WS_URL as string | undefined;
  const lastStatusRef = useRef<DurumTipi>(
    initialSeries[initialSeries.length - 1]?.status ?? 'NORMAL'
  );

  const sonVeri = liveSeries[liveSeries.length - 1];

  const saatlikOrtalama = useMemo(
    () => toHourlyAverage(liveSeries),
    [liveSeries]
  );

  const pushReading = useCallback((reading: EnergyReading) => {
    const isRisingAlert =
      reading.status === 'YUKSEK_AKIM' && lastStatusRef.current !== 'YUKSEK_AKIM';

    if (isRisingAlert) {
      setAlarmHistory((prev) =>
        [
          {
            id: `${reading.timestamp}-${reading.current}`,
            timestamp: reading.timestamp,
            current: reading.current,
            voltage: reading.voltage,
            power: reading.power,
          },
          ...prev,
        ].slice(0, 200)
      );
    }

    lastStatusRef.current = reading.status;
    setLiveSeries((prev) => [...prev.slice(-119), reading]);
  }, []);

  const veriYenile = useCallback(() => {
    pushReading(generateReading());
  }, [pushReading]);

  useEffect(() => {
    if (!wsUrl) {
      return;
    }

    const ws = new WebSocket(wsUrl);
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (typeof payload.current !== 'number' || typeof payload.voltage !== 'number') {
          return;
        }

        const reading: EnergyReading = {
          timestamp: payload.timestamp ?? Date.now(),
          current: payload.current,
          voltage: payload.voltage,
          power: payload.power ?? Number((payload.current * payload.voltage).toFixed(1)),
          status:
            payload.current > CURRENT_ALERT_LIMIT ? 'YUKSEK_AKIM' : 'NORMAL',
        };

        pushReading(reading);
      } catch {
        // Ignore malformed websocket payloads.
      }
    };

    return () => ws.close();
  }, [pushReading, wsUrl]);

  return {
    sonVeri,
    liveSeries,
    saatlikOrtalama,
    alarmHistory,
    currentAlertLimit: CURRENT_ALERT_LIMIT,
    usingMock: !wsUrl,
    veriYenile,
  };
}
