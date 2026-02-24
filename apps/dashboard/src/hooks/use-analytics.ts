import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type {
  AnalyticsOverview,
  AnalyticsRange,
  AgentBreakdown,
  PageStats,
  TimelinePoint,
  PageAiInterest,
  AiReferralOverview,
  ApiResponse,
} from '@agent-analytics/types';

export function useOverview(siteId: string, range: AnalyticsRange) {
  return useQuery({
    queryKey: ['overview', siteId, range],
    queryFn: () =>
      api.get<ApiResponse<AnalyticsOverview>>(
        `/analytics/overview?siteId=${siteId}&range=${range}`,
      ),
    enabled: !!siteId,
  });
}

export function useAgents(siteId: string, range: AnalyticsRange) {
  return useQuery({
    queryKey: ['agents', siteId, range],
    queryFn: () =>
      api.get<ApiResponse<AgentBreakdown[]>>(
        `/analytics/agents?siteId=${siteId}&range=${range}`,
      ),
    enabled: !!siteId,
  });
}

export function usePages(siteId: string, range: AnalyticsRange) {
  return useQuery({
    queryKey: ['pages', siteId, range],
    queryFn: () =>
      api.get<ApiResponse<PageStats[]>>(
        `/analytics/pages?siteId=${siteId}&range=${range}`,
      ),
    enabled: !!siteId,
  });
}

export function useTimeline(siteId: string, range: AnalyticsRange) {
  return useQuery({
    queryKey: ['timeline', siteId, range],
    queryFn: () =>
      api.get<ApiResponse<TimelinePoint[]>>(
        `/analytics/timeline?siteId=${siteId}&range=${range}`,
      ),
    enabled: !!siteId,
  });
}

export function usePagesAiInterest(siteId: string, range: AnalyticsRange) {
  return useQuery({
    queryKey: ['pages-ai-interest', siteId, range],
    queryFn: () =>
      api.get<{ data: PageAiInterest[]; meta: { total: number; limit: number } }>(
        `/analytics/pages/ai-interest?siteId=${siteId}&range=${range}`,
      ),
    enabled: !!siteId,
  });
}

export function useReferrals(siteId: string, range: AnalyticsRange) {
  return useQuery({
    queryKey: ['referrals', siteId, range],
    queryFn: () =>
      api.get<ApiResponse<AiReferralOverview>>(
        `/analytics/referrals?siteId=${siteId}&range=${range}`,
      ),
    enabled: !!siteId,
  });
}
