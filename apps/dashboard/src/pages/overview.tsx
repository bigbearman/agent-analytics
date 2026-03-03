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
  Cell,
} from 'recharts';
import type { AnalyticsRange } from '@agent-analytics/types';
import { useOverview } from '../hooks/use-analytics';
import { useSites } from '../hooks/use-sites';
import { StatCard } from '../components/ui/stat-card';
import { RangeSelector } from '../components/ui/range-selector';
import clsx from 'clsx';
import {
  AGENT_TYPE_STYLES,
  AGENT_TYPE_LABELS,
  getAgentType,
  getBarColor,
  type AgentTypeKey,
} from '../lib/agent-type-styles';

export function OverviewPage() {
  const [range, setRange] = useState<AnalyticsRange>('7d');
  const { data: sitesData } = useSites();
  const activeSiteId = sitesData?.data?.[0]?.id ?? '';
  const { data, isLoading } = useOverview(activeSiteId, range);

  const overview = data?.data;

  // Calculate agent type breakdown from topAgents
  const agentTypeBreakdown = overview?.topAgents.reduce(
    (acc, agent) => {
      const type = getAgentType(agent.name);
      acc[type] = (acc[type] ?? 0) + agent.count;
      return acc;
    },
    {} as Record<AgentTypeKey, number>,
  );

  const totalAgentTyped = agentTypeBreakdown
    ? Object.values(agentTypeBreakdown).reduce((a, b) => a + b, 0)
    : 0;

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
              title="AI Ratio"
              value={`${overview.agentRatio.toFixed(1)}%`}
              icon={<Zap size={20} />}
            />
          </div>

          {/* Agent Type Breakdown */}
          {agentTypeBreakdown && totalAgentTyped > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Agent Types
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(['training', 'search', 'on_demand'] as const).map((type) => {
                  const count = agentTypeBreakdown[type] ?? 0;
                  const pct = totalAgentTyped > 0 ? (count / totalAgentTyped) * 100 : 0;
                  const style = AGENT_TYPE_STYLES[type];

                  return (
                    <div key={type} className="flex items-center gap-4">
                      <div className={clsx('w-12 h-12 rounded-lg flex items-center justify-center', style.bg)}>
                        <span className={clsx('text-lg font-bold', style.text)}>
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {AGENT_TYPE_LABELS[type]}
                        </p>
                        <p className="text-xs text-gray-500">
                          {count.toLocaleString()} visits
                        </p>
                      </div>
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: style.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {overview.topAgents.map((agent, index) => (
                      <Cell key={index} fill={getBarColor(agent.name)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-4">
                {(['training', 'search', 'on_demand'] as const).map((type) => (
                  <div key={type} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: AGENT_TYPE_STYLES[type].color }} />
                    <span className="text-xs text-gray-500">{AGENT_TYPE_LABELS[type]}</span>
                  </div>
                ))}
              </div>
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
