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
