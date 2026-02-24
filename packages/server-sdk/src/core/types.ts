import type { EventAction, EventSource } from '@agent-analytics/types';

export interface AgentPulseConfig {
  /** Site API key (required) */
  siteId: string;
  /** API endpoint URL */
  endpoint: string;
  /** Max events to buffer before flushing */
  flushSize: number;
  /** Flush interval in milliseconds */
  flushInterval: number;
  /** Enable debug logging */
  debug: boolean;
  /** Custom filter function — return true to skip tracking */
  skip?: (req: RequestInfo) => boolean;
}

export interface AgentPulseUserConfig {
  siteId: string;
  endpoint?: string;
  flushSize?: number;
  flushInterval?: number;
  debug?: boolean;
  skip?: (req: RequestInfo) => boolean;
}

export const DEFAULT_CONFIG: Omit<AgentPulseConfig, 'siteId'> = {
  endpoint: 'https://api.agentanalytics.io',
  flushSize: 10,
  flushInterval: 5000,
  debug: false,
};

export interface RequestInfo {
  method: string;
  url: string;
  path: string;
  userAgent: string;
  referer?: string;
  accept?: string;
  ip?: string;
  statusCode?: number;
}

export interface ServerEvent {
  siteId: string;
  url: string;
  action: EventAction;
  agent: {
    isAgent: boolean;
    agentName: string;
    confidence: number;
  };
  timestamp: number;
  source: EventSource;
  meta?: Record<string, unknown>;
}

/** File extensions to skip (static assets) */
export const STATIC_EXTENSIONS = new Set([
  '.css',
  '.js',
  '.mjs',
  '.cjs',
  '.ts',
  '.map',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.ico',
  '.webp',
  '.avif',
  '.bmp',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.otf',
  '.mp4',
  '.webm',
  '.ogg',
  '.mp3',
  '.wav',
  '.pdf',
  '.zip',
  '.gz',
  '.br',
  '.tar',
  '.json',
  '.xml',
  '.txt',
  '.csv',
]);
