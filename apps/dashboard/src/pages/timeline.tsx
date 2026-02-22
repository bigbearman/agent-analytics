import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { AnalyticsRange } from '@agent-analytics/types';
import { useTimeline } from '../hooks/use-analytics';
import { useSites } from '../hooks/use-sites';
import { RangeSelector } from '../components/ui/range-selector';

export function TimelinePage() {
  const [range, setRange] = useState<AnalyticsRange>('7d');
  const { data: sitesData } = useSites();
  const activeSiteId = sitesData?.data?.[0]?.id ?? '';
  const { data, isLoading } = useTimeline(activeSiteId, range);

  const timeline = data?.data ?? [];

  const formattedData = timeline.map((point) => ({
    ...point,
    time: new Date(point.timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      ...(range === '1d' ? { hour: '2-digit', minute: '2-digit' } : {}),
    }),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Timeline</h2>
        <RangeSelector value={range} onChange={setRange} />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        {isLoading ? (
          <div className="animate-pulse h-96" />
        ) : formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="agents"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
                name="Agents"
              />
              <Area
                type="monotone"
                dataKey="humans"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
                name="Humans"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-500">No timeline data available.</div>
        )}
      </div>
    </div>
  );
}
