import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { PLAN_LIMITS, type PlanType } from '@agent-analytics/types';

interface ProcessEventPayload {
  siteId: string;
  url: string;
  action: string;
  timestamp: number;
  source?: 'tracker' | 'server';
  meta?: Record<string, unknown>;
  serverAgent: {
    isAgent: boolean;
    agentName: string;
    confidence: number;
  };
  requestContext: {
    ip?: string;
    userAgent: string;
  };
}

@Processor('events')
export class EventProcessor extends WorkerHost {
  private readonly logger = new Logger(EventProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {
    super();
  }

  async process(job: Job<ProcessEventPayload>): Promise<void> {
    const data = job.data;

    // 1. Validate site exists & check plan limits (siteId from client = apiKey)
    const site = await this.prisma.site.findUnique({
      where: { apiKey: data.siteId },
      select: { id: true, plan: true },
    });

    if (!site) {
      this.logger.warn(`Site not found for apiKey: ${data.siteId}`);
      return;
    }

    // 2. Check monthly usage limit
    const withinLimit = await this.checkMonthlyLimit(site.id, site.plan as PlanType);
    if (!withinLimit) {
      this.logger.warn(`Site ${site.id} exceeded monthly event limit`);
      return;
    }

    // 3. Deduplicate (Redis SET with TTL 1s)
    const dedupeKey = `dedup:${site.id}:${data.url}:${data.timestamp}`;
    const isNew = await this.redis.set(dedupeKey, '1', 'EX', 1, 'NX');
    if (!isNew) {
      return;
    }

    // 4. Insert event into PostgreSQL
    await this.prisma.event.create({
      data: {
        siteId: site.id,
        url: data.url,
        action: data.action,
        isAgent: data.serverAgent.isAgent,
        agentName: data.serverAgent.isAgent ? data.serverAgent.agentName : null,
        confidence: data.serverAgent.confidence,
        source: data.source ?? null,
        timestamp: new Date(data.timestamp),
        meta: (data.meta as Prisma.InputJsonValue) ?? undefined,
      },
    });

    // 5. Increment monthly usage
    await this.incrementMonthlyUsage(site.id);

    // 6. Invalidate analytics cache for this site
    await this.invalidateCache(site.id);

    this.logger.debug(`Event processed for site ${site.id}`);
  }

  private async checkMonthlyLimit(siteId: string, plan: PlanType): Promise<boolean> {
    const limit = PLAN_LIMITS[plan].eventsPerMonth;
    if (limit === Infinity) return true;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const usage = await this.prisma.monthlyUsage.findUnique({
      where: { siteId_month: { siteId, month: monthStart } },
    });

    return !usage || usage.eventCount < limit;
  }

  private async incrementMonthlyUsage(siteId: string): Promise<void> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    await this.prisma.monthlyUsage.upsert({
      where: { siteId_month: { siteId, month: monthStart } },
      update: { eventCount: { increment: 1 } },
      create: { siteId, month: monthStart, eventCount: 1 },
    });
  }

  private async invalidateCache(siteId: string): Promise<void> {
    const keys = await this.redis.keys(`overview:${siteId}:*`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
