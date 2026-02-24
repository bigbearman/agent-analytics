import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AgentDetectionService } from '../agent-detection/agent-detection.service';
import { CollectEventDto } from './dto/collect-event.dto';
import {
  getAgentType,
  AI_REFERRAL_DOMAINS,
  type AgentType,
} from '@agent-analytics/types';

interface RequestContext {
  userAgent: string;
  referer?: string;
  accept?: string;
  ip?: string;
}

type ReferrerType = 'ai_referral' | 'organic' | 'direct' | 'other';

interface ReferrerInfo {
  referrerDomain: string | null;
  referrerType: ReferrerType;
  aiReferralSource: string | null;
}

@Injectable()
export class IngestService {
  private readonly logger = new Logger(IngestService.name);

  constructor(
    @InjectQueue('events') private readonly eventsQueue: Queue,
    private readonly agentDetection: AgentDetectionService,
  ) {}

  async enqueue(dto: CollectEventDto, ctx: RequestContext): Promise<void> {
    // Enrich with server-side agent detection
    const serverDetection = this.agentDetection.detect(ctx, dto.agent);

    // Classify agent type
    const agentType: AgentType | null = serverDetection.isAgent
      ? getAgentType(serverDetection.agentName)
      : null;

    // Parse referrer info from request context + client meta
    const referrerInfo = this.parseReferrer(ctx.referer, dto.meta);

    const enrichedEvent = {
      ...dto,
      serverAgent: {
        isAgent: serverDetection.isAgent,
        agentName: serverDetection.agentName,
        confidence: serverDetection.confidence,
      },
      agentType,
      referrerDomain: referrerInfo.referrerDomain,
      referrerType: referrerInfo.referrerType,
      requestContext: {
        ip: ctx.ip,
        userAgent: ctx.userAgent,
      },
    };

    // Merge AI referral source into meta if detected
    if (referrerInfo.aiReferralSource) {
      enrichedEvent.meta = {
        ...enrichedEvent.meta,
        aiReferral: true,
        aiReferralSource: referrerInfo.aiReferralSource,
      };
    }

    await this.eventsQueue.add('process', enrichedEvent, {
      removeOnComplete: true,
      removeOnFail: false,
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });

    this.logger.debug(`Event enqueued for site ${dto.siteId}`);
  }

  private parseReferrer(
    serverReferer: string | undefined,
    clientMeta: Record<string, unknown> | undefined,
  ): ReferrerInfo {
    // Client-side tracker may send AI referral info in meta
    const clientAiReferral = clientMeta?.aiReferral === true;
    const clientAiSource = clientMeta?.aiReferralSource as string | undefined;

    if (clientAiReferral && clientAiSource) {
      const domain = this.findAiDomainBySource(clientAiSource);
      return {
        referrerDomain: domain,
        referrerType: 'ai_referral',
        aiReferralSource: clientAiSource,
      };
    }

    // Server-side: parse Referer header
    if (!serverReferer) {
      return { referrerDomain: null, referrerType: 'direct', aiReferralSource: null };
    }

    try {
      const url = new URL(serverReferer);
      const domain = url.hostname.replace(/^www\./, '');
      const aiSource = AI_REFERRAL_DOMAINS[domain];

      if (aiSource) {
        return {
          referrerDomain: domain,
          referrerType: 'ai_referral',
          aiReferralSource: aiSource,
        };
      }

      // Check if referrer contains a search engine
      const searchDomains = ['google.', 'bing.', 'yahoo.', 'duckduckgo.', 'baidu.'];
      const isOrganic = searchDomains.some((d) => domain.includes(d));

      return {
        referrerDomain: domain,
        referrerType: isOrganic ? 'organic' : 'other',
        aiReferralSource: null,
      };
    } catch {
      return { referrerDomain: null, referrerType: 'direct', aiReferralSource: null };
    }
  }

  private findAiDomainBySource(source: string): string | null {
    for (const [domain, name] of Object.entries(AI_REFERRAL_DOMAINS)) {
      if (name === source) return domain;
    }
    return null;
  }
}
