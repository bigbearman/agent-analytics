import { useState } from 'react';
import { Bot, Users, Activity, Zap } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { AnalyticsRange } from '@agent-analytics/types';
import { useOverview } from '../hooks/use-analytics';
import { useSites } from '../hooks/use-sites';
import { StatCard } from '../components/ui/stat-card';
import { RangeSelector } from '../components/ui/range-selector';

export function OverviewPage() {
  const [range, setRange] = useState<AnalyticsRange>('7d');
  const { data: sitesData } = useSites();
  const activeSiteId = sitesData?.data?.[0]?.id ?? '';
  const { data, isLoading } = useOverview(activeSiteId, range);

  const overview = data?.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Overview</h2>
        <RangeSelector value={range} onChange={setRange} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 animate-pulse h-32"
            />
          ))}
        </div>
      ) : overview ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Requests"
              value={overview.totalRequests}
              icon={<Activity size={20} />}
            />
            <StatCard
              title="Agent Requests"
              value={overview.agentRequests}
              change={overview.agentChange}
              icon={<Bot size={20} />}
            />
            <StatCard
              title="Human Requests"
              value={overview.humanRequests}
              icon={<Users size={20} />}
            />
            <StatCard
              title="Agent Ratio"
              value={`${overview.agentRatio.toFixed(1)}%`}
              icon={<Zap size={20} />}
            />
          </div>

          {/* Top Agents Chart */}
          {overview.topAgents.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Top Agents
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={overview.topAgents}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No data available. Add a site to get started.
        </div>
      )}
    </div>
  );
}
