import { useState } from 'react';
import type { AnalyticsRange } from '@agent-analytics/types';
import { useReferrals, useReferralPages } from '../hooks/use-analytics';
import { useSites } from '../hooks/use-sites';
import { StatCard } from '../components/ui/stat-card';
import { RangeSelector } from '../components/ui/range-selector';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ExternalLink, TrendingUp, TrendingDown, Share2, BarChart3, Percent } from 'lucide-react';
import clsx from 'clsx';

const SOURCE_COLORS: Record<string, string> = {
  ChatGPT: '#10a37f',
  Perplexity: '#1a73e8',
  Claude: '#d97706',
  Gemini: '#4285f4',
  'You.com': '#7c3aed',
  'Microsoft Copilot': '#0078d4',
  Phind: '#6366f1',
  Kagi: '#f59e0b',
};

type TabId = 'sources' | 'pages';

export function ReferralsPage() {
  const [range, setRange] = useState<AnalyticsRange>('7d');
  const [activeTab, setActiveTab] = useState<TabId>('sources');
  const { data: sitesData } = useSites();
  const activeSiteId = sitesData?.data?.[0]?.id ?? '';
  const { data, isLoading } = useReferrals(activeSiteId, range);
  const { data: pagesData, isLoading: pagesLoading } = useReferralPages(activeSiteId, range);
  const referrals = data?.data;
  const referralPages = pagesData?.data ?? [];

  const chartData = referrals?.sources.map((s) => ({
    source: s.source,
    visits: s.visits,
    fill: SOURCE_COLORS[s.source] ?? '#6b7280',
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Referrals</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Traffic arriving from AI platforms like ChatGPT, Perplexity, Claude
          </p>
        </div>
        <RangeSelector value={range} onChange={setRange} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border p-6 animate-pulse h-32" />
          ))}
        </div>
      ) : referrals ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Total AI Referrals"
              value={referrals.totalReferrals}
              icon={<Share2 size={20} />}
            />
            <StatCard
              title="AI Referral Share"
              value={`${referrals.referralShare.toFixed(2)}%`}
              icon={<Percent size={20} />}
            />
            <StatCard
              title="AI Sources"
              value={referrals.sources.length}
              icon={<BarChart3 size={20} />}
            />
          </div>

          {/* Tab Bar */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
            <button
              onClick={() => setActiveTab('sources')}
              className={clsx(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                activeTab === 'sources'
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
              )}
            >
              Sources
            </button>
            <button
              onClick={() => setActiveTab('pages')}
              className={clsx(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                activeTab === 'pages'
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
              )}
            >
              Landing Pages
            </button>
          </div>

          {activeTab === 'sources' ? (
            referrals.sources.length > 0 ? (
              <>
                {/* Chart */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Referrals by AI Source
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="source" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="visits" radius={[4, 4, 0, 0]}>
                        {chartData?.map((entry, index) => (
                          <rect key={index} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Sources Table */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Referral Sources</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-800">
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                          <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Visits</th>
                          <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Pages</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Top Landing Page</th>
                          <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {referrals.sources.map((source) => (
                          <tr key={source.referrerDomain} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: SOURCE_COLORS[source.source] ?? '#6b7280' }}
                                />
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">{source.source}</p>
                                  <p className="text-xs text-gray-500">{source.referrerDomain}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                              {source.visits.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-right text-sm text-gray-600 dark:text-gray-400">
                              {source.uniquePages}
                            </td>
                            <td className="px-6 py-4">
                              {source.topLandingPage && (
                                <div className="flex items-center gap-1.5">
                                  <ExternalLink size={12} className="text-gray-400 flex-shrink-0" />
                                  <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs" title={source.topLandingPage}>
                                    {source.topLandingPage.replace(/^https?:\/\/[^/]+/, '') || '/'}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <TrendBadge value={source.trend} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
                <Share2 size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No AI referral traffic detected yet. When users visit your site from ChatGPT, Perplexity, or other AI platforms, it will appear here.
                </p>
              </div>
            )
          ) : (
            /* Landing Pages Tab */
            pagesLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border p-6 animate-pulse h-16" />
                ))}
              </div>
            ) : referralPages.length > 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Landing Pages from AI Referrals</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
                        <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Visits</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Top Source</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Sources</th>
                        <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {referralPages.map((page) => {
                        const path = page.url.replace(/^https?:\/\/[^/]+/, '') || '/';
                        return (
                          <tr key={page.url} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-md block" title={page.url}>
                                {path}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                              {page.totalVisits.toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              {page.topSource && (
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: SOURCE_COLORS[page.topSource] ?? '#6b7280' }}
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">{page.topSource}</span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {page.sources.map((s) => (
                                  <span
                                    key={s.referrerDomain}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                  >
                                    <span
                                      className="w-1.5 h-1.5 rounded-full"
                                      style={{ backgroundColor: SOURCE_COLORS[s.source] ?? '#6b7280' }}
                                    />
                                    {s.source} ({s.visits})
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <TrendBadge value={page.trend} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
                <ExternalLink size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No landing pages from AI referrals yet. Pages that receive traffic from AI platforms will appear here.
                </p>
              </div>
            )
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
