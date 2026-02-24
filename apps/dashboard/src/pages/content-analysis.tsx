import { useState } from 'react';
import type { AnalyticsRange, PageAiInterest } from '@agent-analytics/types';
import { usePagesAiInterest } from '../hooks/use-analytics';
import { useSites } from '../hooks/use-sites';
import { RangeSelector } from '../components/ui/range-selector';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, ChevronDown, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

const AGENT_TYPE_COLORS = {
  training: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', bar: '#3b82f6' },
  search: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', bar: '#10b981' },
  on_demand: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', bar: '#f59e0b' },
};

export function ContentAnalysisPage() {
  const [range, setRange] = useState<AnalyticsRange>('7d');
  const [expandedUrl, setExpandedUrl] = useState<string | null>(null);
  const { data: sitesData } = useSites();
  const activeSiteId = sitesData?.data?.[0]?.id ?? '';
  const { data, isLoading } = usePagesAiInterest(activeSiteId, range);
  const pages = data?.data;
  const meta = data?.meta;

  const chartData = pages?.slice(0, 10).map((p) => ({
    url: p.url.replace(/^https?:\/\/[^/]+/, ''),
    Training: p.agentTypes.training,
    Search: p.agentTypes.search,
    'On-demand': p.agentTypes.on_demand,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Content Analysis</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Which pages AI bots find most valuable
          </p>
        </div>
        <RangeSelector value={range} onChange={setRange} />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border p-6 animate-pulse h-20" />
          ))}
        </div>
      ) : pages && pages.length > 0 ? (
        <>
          {/* Agent Type Breakdown Chart */}
          {chartData && chartData.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                AI Crawl Activity by Agent Type
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="url" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Training" stackId="a" fill={AGENT_TYPE_COLORS.training.bar} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Search" stackId="a" fill={AGENT_TYPE_COLORS.search.bar} />
                  <Bar dataKey="On-demand" stackId="a" fill={AGENT_TYPE_COLORS.on_demand.bar} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Pages Table */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pages by AI Interest</h3>
              {meta && (
                <span className="text-sm text-gray-500">
                  Showing {pages.length} of {meta.total} pages
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">AI Visits</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Agents</th>
                    <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Agent Types</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {pages.map((page) => (
                    <PageRow
                      key={page.url}
                      page={page}
                      isExpanded={expandedUrl === page.url}
                      onToggle={() => setExpandedUrl(expandedUrl === page.url ? null : page.url)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No AI crawl data available yet. AI bots need to visit your site first.
        </div>
      )}
    </div>
  );
}

function PageRow({
  page,
  isExpanded,
  onToggle,
}: {
  page: PageAiInterest;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const path = page.url.replace(/^https?:\/\/[^/]+/, '') || '/';

  return (
    <>
      <tr
        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
        onClick={onToggle}
      >
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            {isExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
            <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-md" title={page.url}>
              {path}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
          {page.aiVisits.toLocaleString()}
        </td>
        <td className="px-6 py-4 text-right text-sm text-gray-600 dark:text-gray-400">
          {page.uniqueAgents}
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center justify-center gap-1.5">
            {page.agentTypes.training > 0 && (
              <AgentTypeBadge type="training" count={page.agentTypes.training} />
            )}
            {page.agentTypes.search > 0 && (
              <AgentTypeBadge type="search" count={page.agentTypes.search} />
            )}
            {page.agentTypes.on_demand > 0 && (
              <AgentTypeBadge type="on_demand" count={page.agentTypes.on_demand} />
            )}
          </div>
        </td>
        <td className="px-6 py-4 text-right">
          <TrendBadge value={page.trend} />
        </td>
      </tr>
      {isExpanded && page.topAgents.length > 0 && (
        <tr className="bg-gray-50 dark:bg-gray-800/30">
          <td colSpan={5} className="px-6 py-3">
            <div className="pl-6 space-y-1.5">
              <p className="text-xs font-medium text-gray-500 uppercase mb-2">Agent Breakdown</p>
              {page.topAgents.map((agent) => (
                <div key={agent.name} className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 dark:text-gray-300 w-40">{agent.name}</span>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full"
                      style={{ width: `${Math.min(agent.ratio, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-16 text-right">{agent.count} ({agent.ratio.toFixed(0)}%)</span>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function AgentTypeBadge({ type, count }: { type: keyof typeof AGENT_TYPE_COLORS; count: number }) {
  const colors = AGENT_TYPE_COLORS[type];
  const labels = { training: 'Train', search: 'Search', on_demand: 'Live' };

  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', colors.bg, colors.text)}>
      {labels[type]} {count}
    </span>
  );
}

function TrendBadge({ value }: { value: number }) {
  if (value === 0) {
    return <span className="text-sm text-gray-400">--</span>;
  }

  return (
    <div className="inline-flex items-center gap-1">
      {value > 0 ? (
        <TrendingUp size={14} className="text-green-500" />
      ) : (
        <TrendingDown size={14} className="text-red-500" />
      )}
      <span className={clsx('text-sm font-medium', value > 0 ? 'text-green-600' : 'text-red-600')}>
        {value > 0 ? '+' : ''}{value.toFixed(1)}%
      </span>
    </div>
  );
}
