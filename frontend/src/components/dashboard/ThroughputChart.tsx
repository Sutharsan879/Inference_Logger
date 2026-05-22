'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { ChartContainer } from './ChartContainer';

interface Props {
  data: { timestamp: string; count: number }[];
}

export function ThroughputChart({ data }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }));

  return (
    <Card title="Requests per 5-min bucket">
      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formatted}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3142" />
            <XAxis dataKey="time" stroke="#6b7280" fontSize={11} />
            <YAxis stroke="#6b7280" fontSize={11} />
            <Tooltip contentStyle={{ background: '#161b26', border: '1px solid #2a3142' }} />
            <Area type="monotone" dataKey="count" stroke="#22d3ee" fill="#22d3ee33" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Card>
  );
}
