'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { ChartContainer } from './ChartContainer';

interface Props {
  data: { timestamp: string; latencyMs: number }[];
}

export function LatencyChart({ data }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }));

  return (
    <Card title="Latency over time (ms)">
      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formatted}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3142" />
            <XAxis dataKey="time" stroke="#6b7280" fontSize={11} />
            <YAxis stroke="#6b7280" fontSize={11} />
            <Tooltip
              contentStyle={{ background: '#161b26', border: '1px solid #2a3142' }}
              labelStyle={{ color: '#9ca3af' }}
            />
            <Line type="monotone" dataKey="latencyMs" stroke="#6366f1" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Card>
  );
}
