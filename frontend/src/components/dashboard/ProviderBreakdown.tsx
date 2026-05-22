'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '@/components/ui/Card';
import { ChartContainer } from './ChartContainer';

const COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981'];

interface Props {
  data: { provider: string; count: number }[];
}

export function ProviderBreakdown({ data }: Props) {
  return (
    <Card title="Provider distribution">
      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="provider"
              cx="50%"
              cy="50%"
              outerRadius="70%"
              label={({ provider, percent }) =>
                `${provider} ${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: '#161b26', border: '1px solid #2a3142' }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Card>
  );
}
