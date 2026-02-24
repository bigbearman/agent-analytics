export interface AgentBreakdown {
  name: string;
  count: number;
  ratio: number;
}

export interface AnalyticsOverview {
  totalRequests: number;
  agentRequests: number;
  humanRequests: number;
  agentRatio: number;
  uniqueAgents: number;
  agentChange: number;
  topAgents: AgentBreakdown[];
}

export interface PageStats {
  url: string;
  totalRequests: number;
  agentRequests: number;
  agentRatio: number;
}

export interface TimelinePoint {
  timestamp: string;
  total: number;
  agents: number;
  humans: number;
}

export type AnalyticsRange = '1d' | '7d' | '30d';

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

/** Page-level AI interest — GET /analytics/pages/ai-interest */
export interface PageAiInterest {
  url: string;
  aiVisits: number;
  uniqueAgents: number;
  topAgents: AgentBreakdown[];
  trend: number;
  agentTypes: {
    training: number;
    search: number;
    on_demand: number;
  };
}

/** AI referral source — GET /analytics/referrals */
export interface AiReferralStats {
  source: string;
  referrerDomain: string;
  visits: number;
  uniquePages: number;
  topLandingPage: string;
  trend: number;
}

export interface AiReferralOverview {
  sources: AiReferralStats[];
  totalReferrals: number;
  referralShare: number;
}
