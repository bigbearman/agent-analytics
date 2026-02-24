// Express middleware (default export)
export { agentPulse } from './adapters/express';

// Core modules
export { detectAgent } from './core/detector';
export { shouldSkipRequest } from './core/filter';
export { EventBuffer } from './core/buffer';
export { resolveConfig } from './core/config';
export { sendBatch } from './core/transport';

// Types
export type {
  AgentPulseConfig,
  AgentPulseUserConfig,
  RequestInfo,
  ServerEvent,
} from './core/types';
