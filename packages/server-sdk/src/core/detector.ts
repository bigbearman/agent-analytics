import {
  KNOWN_AGENTS,
  CONFIDENCE,
  type KnownAgentName,
} from '@agent-analytics/types';
import type { RequestInfo } from './types';

interface DetectionResult {
  isAgent: boolean;
  agentName: string;
  confidence: number;
}

/**
 * Server-side agent detection using Layer 1 (UA match) + Layer 3 (pattern analysis).
 * Layer 2 (behavioral) is not available server-side.
 */
export function detectAgent(req: RequestInfo): DetectionResult {
  const layers: number[] = [];
  let agentName = '';

  // Layer 1: User Agent string matching
  const uaMatch = matchUserAgent(req.userAgent);
  if (uaMatch) {
    layers.push(CONFIDENCE.SERVER_UA);
    agentName = uaMatch;
  }

  // Layer 3: Request pattern analysis
  const patternScore = analyzeRequestPatterns(req);
  if (patternScore >= CONFIDENCE.PATTERN) {
    layers.push(CONFIDENCE.PATTERN);
  }

  if (layers.length === 0) {
    return { isAgent: false, agentName: '', confidence: 0 };
  }

  // Combined: max confidence + 5 per extra layer
  const maxConfidence = Math.max(...layers);
  const extraLayers = layers.length - 1;
  const finalConfidence = Math.min(
    100,
    maxConfidence + extraLayers * CONFIDENCE.EXTRA_LAYER_BONUS,
  );

  return {
    isAgent: finalConfidence >= CONFIDENCE.AGENT_THRESHOLD,
    agentName: agentName || 'unknown',
    confidence: finalConfidence,
  };
}

function matchUserAgent(userAgent: string): KnownAgentName | null {
  for (const [name, pattern] of Object.entries(KNOWN_AGENTS)) {
    if (pattern.test(userAgent)) {
      return name as KnownAgentName;
    }
  }
  return null;
}

function analyzeRequestPatterns(req: RequestInfo): number {
  let score = 0;

  // Missing Referer header
  if (!req.referer) {
    score += 15;
  }

  // Unusual Accept header (does not contain text/html)
  if (req.accept && !req.accept.includes('text/html')) {
    score += 15;
  }

  // Empty or wildcard Accept header
  if (!req.accept || req.accept === '*/*') {
    score += 10;
  }

  return score;
}
