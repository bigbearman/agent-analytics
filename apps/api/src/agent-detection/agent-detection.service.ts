import { Injectable } from '@nestjs/common';
import {
  KNOWN_AGENTS,
  CONFIDENCE,
  type KnownAgentName,
  type AgentInfo,
} from '@agent-analytics/types';

interface RequestContext {
  userAgent: string;
  referer?: string;
  accept?: string;
  ip?: string;
}

interface DetectionResult {
  isAgent: boolean;
  agentName: string;
  confidence: number;
  layers: number[];
}

@Injectable()
export class AgentDetectionService {
  /**
   * 3-layer agent detection:
   * Layer 1: Server UA match (confidence = 95)
   * Layer 2: Behavioral signals từ client (confidence = 60)
   * Layer 3: Request pattern analysis (confidence = 40)
   * Combined: max + 5 per extra layer
   */
  detect(ctx: RequestContext, clientAgent?: AgentInfo): DetectionResult {
    const layers: number[] = [];
    let agentName = '';

    // Layer 1: Server-side User Agent matching
    const uaMatch = this.matchUserAgent(ctx.userAgent);
    if (uaMatch) {
      layers.push(CONFIDENCE.SERVER_UA);
      agentName = uaMatch;
    }

    // Layer 2: Behavioral signals (từ client-side tracker)
    if (clientAgent?.isAgent && clientAgent.confidence >= CONFIDENCE.PATTERN) {
      layers.push(CONFIDENCE.BEHAVIORAL);
      if (!agentName && clientAgent.agentName) {
        agentName = clientAgent.agentName;
      }
    }

    // Layer 3: Request pattern analysis
    const patternScore = this.analyzeRequestPatterns(ctx);
    if (patternScore >= CONFIDENCE.PATTERN) {
      layers.push(CONFIDENCE.PATTERN);
    }

    if (layers.length === 0) {
      return { isAgent: false, agentName: '', confidence: 0, layers: [] };
    }

    // Combined: max confidence + 5 per extra layer
    const maxConfidence = Math.max(...layers);
    const extraLayers = layers.length - 1;
    const finalConfidence = Math.min(100, maxConfidence + extraLayers * CONFIDENCE.EXTRA_LAYER_BONUS);

    return {
      isAgent: finalConfidence >= CONFIDENCE.AGENT_THRESHOLD,
      agentName: agentName || 'unknown',
      confidence: finalConfidence,
      layers,
    };
  }

  private matchUserAgent(userAgent: string): KnownAgentName | null {
    for (const [name, pattern] of Object.entries(KNOWN_AGENTS)) {
      if (pattern.test(userAgent)) {
        return name as KnownAgentName;
      }
    }
    return null;
  }

  private analyzeRequestPatterns(ctx: RequestContext): number {
    let score = 0;

    // Không có Referer header
    if (!ctx.referer) {
      score += 15;
    }

    // Accept header bất thường (không chứa text/html)
    if (ctx.accept && !ctx.accept.includes('text/html')) {
      score += 15;
    }

    // Accept header trống hoặc wildcard
    if (!ctx.accept || ctx.accept === '*/*') {
      score += 10;
    }

    return score;
  }
}
