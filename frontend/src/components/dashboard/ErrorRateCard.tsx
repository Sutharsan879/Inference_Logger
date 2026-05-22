import { Card } from '@/components/ui/Card';

interface Props {
  errorRate: number;
  totalRequests: number;
}

export function ErrorRateCard({ errorRate, totalRequests }: Props) {
  return (
    <Card title="Error rate">
      <p className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">{errorRate.toFixed(1)}%</p>
      <p className="mt-2 text-sm text-gray-500">
        Based on {totalRequests} requests (last 24h)
      </p>
    </Card>
  );
}
