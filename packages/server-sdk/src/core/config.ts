import { DEFAULT_CONFIG, type AgentPulseConfig, type AgentPulseUserConfig } from './types';

export function resolveConfig(userConfig: AgentPulseUserConfig): AgentPulseConfig {
  if (!userConfig.siteId) {
    throw new Error('[AgentPulse] siteId is required');
  }

  return {
    ...DEFAULT_CONFIG,
    ...userConfig,
  };
}
