'use client';

import { PageLayout } from '@/components/layout/PageLayout';
import { useMetrics } from '@/hooks/useMetrics';
import { Spinner } from '@/components/ui/Spinner';
import { Card } from '@/components/ui/Card';
import { LatencyChart } from '@/components/dashboard/LatencyChart';
import { TokenUsageChart } from '@/components/dashboard/TokenUsageChart';
import { ErrorRateCard } from '@/components/dashboard/ErrorRateCard';
import { ThroughputChart } from '@/components/dashboard/ThroughputChart';
import { ProviderBreakdown } from '@/components/dashboard/ProviderBreakdown';

export default function DashboardPage() {
  const { metrics, loading, error } = useMetrics();

  return (
    <PageLayout mobileTitle="Dashboard" scrollable>
      <div className="p-4 sm:p-6">
        <h2 className="mb-4 text-xl font-bold text-white sm:mb-6 sm:text-2xl">Metrics Dashboard</h2>

        {error && <p className="mb-4 text-sm text-red-400 sm:text-base">{error}</p>}

        {loading || !metrics ? (
          <div className="flex justify-center py-16 sm:py-20">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
              <Card title="Total requests (24h)">
                <p className="text-2xl font-bold sm:text-3xl">{metrics.totalRequests}</p>
              </Card>
              <ErrorRateCard
                errorRate={metrics.errorRate}
                totalRequests={metrics.totalRequests}
              />
              <Card title="Avg latency">
                <p className="text-2xl font-bold sm:text-3xl">{metrics.avgLatencyMs} ms</p>
              </Card>
              <Card title="Total tokens">
                <p className="text-2xl font-bold sm:text-3xl">
                  {metrics.totalTokens.toLocaleString()}
                </p>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
              <LatencyChart data={metrics.latencyOverTime} />
              <ThroughputChart data={metrics.requestsPerMinute} />
              <TokenUsageChart data={metrics.tokensPerConversation} />
              <ProviderBreakdown data={metrics.providerBreakdown} />
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}
