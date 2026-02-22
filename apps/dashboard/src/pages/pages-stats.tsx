import { useState } from 'react';
import type { AnalyticsRange } from '@agent-analytics/types';
import { usePages } from '../hooks/use-analytics';
import { useSites } from '../hooks/use-sites';
import { RangeSelector } from '../components/ui/range-selector';

export function PagesPage() {
  const [range, setRange] = useState<AnalyticsRange>('7d');
  const { data: sitesData } = useSites();
  const activeSiteId = sitesData?.data?.[0]?.id ?? '';
  const { data, isLoading } = usePages(activeSiteId, range);

  const pages = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Pages by Agent Traffic
        </h2>
        <RangeSelector value={range} onChange={setRange} />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        {isLoading ? (
          <div className="animate-pulse h-96" />
        ) : pages.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-3">URL</th>
                <th className="px-6 py-3 text-right">Total</th>
                <th className="px-6 py-3 text-right">Agents</th>
                <th className="px-6 py-3 text-right">Agent %</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr
                  key={page.url}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="px-6 py-3 text-sm text-gray-900 dark:text-white truncate max-w-md">
                    {page.url}
                  </td>
                  <td className="px-6 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                    {page.totalRequests.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                    {page.agentRequests.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-sm text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-400">
                      {page.agentRatio.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-gray-500">No page data available.</div>
        )}
      </div>
    </div>
  );
}
