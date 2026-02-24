export const KNOWN_AGENTS = {
  GPTBot: /GPTBot/i,
  'ChatGPT-User': /ChatGPT-User/i,
  'OAI-SearchBot': /OAI-SearchBot/i,
  ClaudeBot: /ClaudeBot|Claude-Web/i,
  'Claude-User': /Claude-User/i,
  'Google-Extended': /Google-Extended/i,
  'Gemini-Deep-Research': /Gemini-Deep-Research/i,
  GoogleVertexBot: /Google-CloudVertexBot/i,
  GeminiBot: /GeminiiOS|Gemini\//i,
  PerplexityBot: /PerplexityBot/i,
  'Perplexity-User': /Perplexity-User/i,
  ByteSpider: /Bytespider/i,
  FacebookBot: /FacebookBot/i,
  'Meta-ExternalAgent': /Meta-ExternalAgent/i,
  Applebot: /Applebot/i,
  Amazonbot: /Amazonbot/i,
  YouBot: /YouBot/i,
  DuckAssistant: /DuckAssistant|DuckAssistBot/i,
} as const;

export type KnownAgentName = keyof typeof KNOWN_AGENTS;

export const AGENT_NAMES = Object.keys(KNOWN_AGENTS) as KnownAgentName[];

/** Agent type classification */
export type AgentType = 'training' | 'search' | 'on_demand' | 'unknown';

export const AGENT_TYPE_MAP: Record<string, AgentType> = {
  GPTBot: 'training',
  ClaudeBot: 'training',
  'Google-Extended': 'training',
  ByteSpider: 'training',
  'Meta-ExternalAgent': 'training',
  FacebookBot: 'training',
  Amazonbot: 'training',
  Applebot: 'training',
  'OAI-SearchBot': 'search',
  PerplexityBot: 'search',
  YouBot: 'search',
  DuckAssistant: 'search',
  GoogleVertexBot: 'search',
  GeminiBot: 'search',
  'Gemini-Deep-Research': 'search',
  'ChatGPT-User': 'on_demand',
  'Claude-User': 'on_demand',
  'Perplexity-User': 'on_demand',
};

export function getAgentType(agentName: string): AgentType {
  return AGENT_TYPE_MAP[agentName] ?? 'unknown';
}

/** AI referral domains — traffic arriving FROM AI platforms */
export const AI_REFERRAL_DOMAINS: Record<string, string> = {
  'chatgpt.com': 'ChatGPT',
  'chat.openai.com': 'ChatGPT',
  'perplexity.ai': 'Perplexity',
  'you.com': 'You.com',
  'copilot.microsoft.com': 'Microsoft Copilot',
  'gemini.google.com': 'Gemini',
  'claude.ai': 'Claude',
  'phind.com': 'Phind',
  'kagi.com': 'Kagi',
};

/** Confidence score thresholds */
export const CONFIDENCE = {
  /** Layer 1: Server UA match — most reliable */
  SERVER_UA: 95,
  /** Layer 2: Behavioral signals */
  BEHAVIORAL: 60,
  /** Layer 3: Request pattern */
  PATTERN: 40,
  /** Bonus per extra layer match */
  EXTRA_LAYER_BONUS: 5,
  /** Threshold to mark is_agent = true */
  AGENT_THRESHOLD: 50,
} as const;
