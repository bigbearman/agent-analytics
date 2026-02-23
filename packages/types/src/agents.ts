export const KNOWN_AGENTS = {
  GPTBot: /GPTBot/i,
  'ChatGPT-User': /ChatGPT-User/i,
  ClaudeBot: /ClaudeBot|Claude-Web/i,
  'Google-Extended': /Google-Extended/i,
  PerplexityBot: /PerplexityBot/i,
  ByteSpider: /Bytespider/i,
  FacebookBot: /FacebookBot/i,
  Applebot: /Applebot/i,
  Amazonbot: /Amazonbot/i,
  YouBot: /YouBot/i,
  DuckAssistant: /DuckAssistant/i,
} as const;

export type KnownAgentName = keyof typeof KNOWN_AGENTS;

export const AGENT_NAMES = Object.keys(KNOWN_AGENTS) as KnownAgentName[];

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
