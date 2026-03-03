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
import type { AnalyticsRange, AgentType } from '@agent-analytics/types';
import { useTimeline } from '../hooks/use-analytics';
import { useSites } from '../hooks/use-sites';
import { RangeSelector } from '../components/ui/range-selector';
import { AGENT_TYPE_STYLES, AGENT_TYPE_LABELS } from '../lib/agent-type-styles';
import clsx from 'clsx';

type FilterOption = AgentType | 'all';

const FILTER_OPTIONS: Array<{ value: FilterOption; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'training', label: 'Training' },
  { value: 'search', label: 'Search' },
  { value: 'on_demand', label: 'On-demand' },
];

export function TimelinePage() {
  const [range, setRange] = useState<AnalyticsRange>('7d');
  const [filter, setFilter] = useState<FilterOption>('all');
  const { data: sitesData } = useSites();
  const activeSiteId = sitesData?.data?.[0]?.id ?? '';
  const agentType = filter === 'all' ? undefined : filter;
  const { data, isLoading } = useTimeline(activeSiteId, range, agentType);

  const timeline = data?.data ?? [];

  const formattedData = timeline.map((point) => ({
    ...point,
    time: new Date(point.timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      ...(range === '1d' ? { hour: '2-digit', minute: '2-digit' } : {}),
    }),
    training: point.byType?.training ?? 0,
    search: point.byType?.search ?? 0,
    on_demand: point.byType?.on_demand ?? 0,
  }));

  const showByType = filter === 'all' && timeline.some((p) => p.byType);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Timeline</h2>
        <RangeSelector value={range} onChange={setRange} />
      </div>

      {/* Agent Type Filter */}
      <div className="flex items-center gap-2">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              filter === opt.value
                ? opt.value === 'all'
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700',
            )}
            style={
              filter === opt.value && opt.value !== 'all'
                ? { backgroundColor: AGENT_TYPE_STYLES[opt.value as AgentType].color }
                : undefined
            }
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        {isLoading ? (
          <div className="animate-pulse h-96" />
        ) : formattedData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                {showByType ? (
                  <>
                    <Area
                      type="monotone"
                      dataKey="training"
                      stackId="1"
                      stroke={AGENT_TYPE_STYLES.training.color}
                      fill={AGENT_TYPE_STYLES.training.color}
                      fillOpacity={0.6}
                      name="Training"
                    />
                    <Area
                      type="monotone"
                      dataKey="search"
                      stackId="1"
                      stroke={AGENT_TYPE_STYLES.search.color}
                      fill={AGENT_TYPE_STYLES.search.color}
                      fillOpacity={0.6}
                      name="Search"
                    />
                    <Area
                      type="monotone"
                      dataKey="on_demand"
                      stackId="1"
                      stroke={AGENT_TYPE_STYLES.on_demand.color}
                      fill={AGENT_TYPE_STYLES.on_demand.color}
                      fillOpacity={0.6}
                      name="On-demand"
                    />
                    <Area
                      type="monotone"
                      dataKey="humans"
                      stackId="1"
                      stroke="#9ca3af"
                      fill="#9ca3af"
                      fillOpacity={0.3}
                      name="Humans"
                    />
                  </>
                ) : (
                  <>
                    <Area
                      type="monotone"
                      dataKey="agents"
                      stackId="1"
                      stroke={filter !== 'all' ? AGENT_TYPE_STYLES[filter].color : '#3b82f6'}
                      fill={filter !== 'all' ? AGENT_TYPE_STYLES[filter].color : '#3b82f6'}
                      fillOpacity={0.6}
                      name={filter !== 'all' ? AGENT_TYPE_LABELS[filter] : 'Agents'}
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
                  </>
                )}
              </AreaChart>
            </ResponsiveContainer>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">No timeline data available.</div>
        )}
      </div>
    </div>
  );
}
