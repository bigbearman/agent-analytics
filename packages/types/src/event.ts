export type EventAction = 'pageview' | 'click' | 'fetch' | 'error';

export interface AgentInfo {
  isAgent: boolean;
  agentName: string;
  confidence: number;
}

/** Payload gửi từ tracker → POST /collect */
export interface AgentEvent {
  siteId: string;
  url: string;
  action: EventAction;
  agent: AgentInfo;
  timestamp: number;
  meta?: Record<string, unknown>;
}

/** Event đã enrich bởi server trước khi lưu DB */
export interface EnrichedEvent extends AgentEvent {
  sessionId: string;
  country: string;
  serverAgent: AgentInfo;
}
