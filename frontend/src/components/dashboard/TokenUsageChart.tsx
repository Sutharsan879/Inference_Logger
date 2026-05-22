'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { ChartContainer } from './ChartContainer';
import { truncate } from '@/lib/utils';

interface Props {
  data: { conversationId: string; title: string; tokens: number }[];
}

export function TokenUsageChart({ data }: Props) {
  const formatted = data.map((d) => ({
    name: truncate(d.title, 20),
    tokens: d.tokens,
  }));

  return (
    <Card title="Tokens per conversation">
      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formatted}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3142" />
            <XAxis
              dataKey="name"
              stroke="#6b7280"
              fontSize={10}
              angle={-20}
              textAnchor="end"
              height={60}
            />
            <YAxis stroke="#6b7280" fontSize={11} />
            <Tooltip contentStyle={{ background: '#161b26', border: '1px solid #2a3142' }} />
            <Bar dataKey="tokens" fill="#818cf8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Card>
  );
}
