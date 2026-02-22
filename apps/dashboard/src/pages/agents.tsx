import { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { AnalyticsRange } from '@agent-analytics/types';
import { useAgents } from '../hooks/use-analytics';
import { useSites } from '../hooks/use-sites';
import { RangeSelector } from '../components/ui/range-selector';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export function AgentsPage() {
  const [range, setRange] = useState<AnalyticsRange>('7d');
  const { data: sitesData } = useSites();
  const activeSiteId = sitesData?.data?.[0]?.id ?? '';
  const { data, isLoading } = useAgents(activeSiteId, range);

  const agents = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Agent Breakdown</h2>
        <RangeSelector value={range} onChange={setRange} />
      </div>

      {isLoading ? (
        <div className="animate-pulse bg-white dark:bg-gray-900 rounded-xl h-96" />
      ) : agents.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={agents}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name }) => name}
                >
                  {agents.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Agent Table */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Details
            </h3>
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-2">Agent</th>
                  <th className="pb-2 text-right">Requests</th>
                  <th className="pb-2 text-right">Share</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <tr
                    key={agent.name}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td className="py-3 font-medium text-gray-900 dark:text-white">
                      {agent.name}
                    </td>
                    <td className="py-3 text-right text-gray-600 dark:text-gray-400">
                      {agent.count.toLocaleString()}
                    </td>
                    <td className="py-3 text-right text-gray-600 dark:text-gray-400">
                      {agent.ratio.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">No agent data available.</div>
      )}
    </div>
  );
}
