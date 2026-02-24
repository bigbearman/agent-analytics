export type EventAction = 'pageview' | 'click' | 'fetch' | 'error';

export type EventSource = 'tracker' | 'server';

export interface AgentInfo {
  isAgent: boolean;
  agentName: string;
  confidence: number;
}

/** Payload sent from tracker or server SDK → POST /collect */
export interface AgentEvent {
  siteId: string;
  url: string;
  action: EventAction;
  agent: AgentInfo;
  timestamp: number;
  source?: EventSource;
  meta?: Record<string, unknown>;
}

/** Event enriched by server before storing to DB */
export interface EnrichedEvent extends AgentEvent {
  sessionId: string;
  country: string;
  serverAgent: AgentInfo;
}
