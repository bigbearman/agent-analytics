export const AGENT_TYPE_STYLES = {
  training: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', color: '#3b82f6' },
  search: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', color: '#10b981' },
  on_demand: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', color: '#f59e0b' },
  unknown: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', color: '#6b7280' },
} as const;

export const AGENT_TYPE_LABELS: Record<string, string> = {
  training: 'Training',
  search: 'Search',
  on_demand: 'On-demand',
  unknown: 'Unknown',
};

export type AgentTypeKey = keyof typeof AGENT_TYPE_STYLES;

const AGENT_TYPE_MAP: Record<string, AgentTypeKey> = {
  GPTBot: 'training', ClaudeBot: 'training', 'Google-Extended': 'training',
  ByteSpider: 'training', 'Meta-ExternalAgent': 'training', FacebookBot: 'training',
  Amazonbot: 'training', Applebot: 'training',
  'OAI-SearchBot': 'search', PerplexityBot: 'search', YouBot: 'search',
  DuckAssistant: 'search', GoogleVertexBot: 'search', GeminiBot: 'search',
  'Gemini-Deep-Research': 'search',
  'ChatGPT-User': 'on_demand', 'Claude-User': 'on_demand', 'Perplexity-User': 'on_demand',
};

export function getAgentType(agentName: string): AgentTypeKey {
  return AGENT_TYPE_MAP[agentName] ?? 'unknown';
}

export function getBarColor(agentName: string): string {
  return AGENT_TYPE_STYLES[getAgentType(agentName)].color;
}
