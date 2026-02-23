import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import type {
  AnalyticsOverview,
  AnalyticsRange,
  AgentBreakdown,
  PageStats,
  TimelinePoint,
} from '@agent-analytics/types';

const RANGE_TO_INTERVAL: Record<AnalyticsRange, string> = {
  '1d': '1 day',
  '7d': '7 days',
  '30d': '30 days',
};

const CACHE_TTL = 300; // 5 minutes

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getOverview(siteId: string, range: AnalyticsRange): Promise<AnalyticsOverview> {
    const cacheKey = `overview:${siteId}:${range}`;

    return this.redis.wrap(cacheKey, CACHE_TTL, async () => {
      const interval = RANGE_TO_INTERVAL[range];

      // Total, agent, human counts
      const [stats] = await this.prisma.$queryRaw<
        Array<{
          total: bigint;
          agents: bigint;
          humans: bigint;
          unique_agents: bigint;
        }>
      >`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE is_agent = true) as agents,
          COUNT(*) FILTER (WHERE is_agent = false) as humans,
          COUNT(DISTINCT agent_name) FILTER (WHERE is_agent = true) as unique_agents
        FROM events
        WHERE site_id = ${siteId}
          AND timestamp > NOW() - ${interval}::INTERVAL
      `;

      const total = Number(stats?.total ?? 0);
      const agents = Number(stats?.agents ?? 0);
      const humans = Number(stats?.humans ?? 0);
      const uniqueAgents = Number(stats?.unique_agents ?? 0);

      // Previous period cho change calculation
      const [prevStats] = await this.prisma.$queryRaw<Array<{ agents: bigint }>>`
        SELECT COUNT(*) FILTER (WHERE is_agent = true) as agents
        FROM events
        WHERE site_id = ${siteId}
          AND timestamp > NOW() - (${interval}::INTERVAL * 2)
          AND timestamp <= NOW() - ${interval}::INTERVAL
      `;

      const prevAgents = Number(prevStats?.agents ?? 0);
      const agentChange = prevAgents > 0 ? ((agents - prevAgents) / prevAgents) * 100 : 0;

      // Top agents
      const topAgentsRaw = await this.prisma.$queryRaw<
        Array<{ agent_name: string; count: bigint }>
      >`
        SELECT agent_name, COUNT(*) as count
        FROM events
        WHERE site_id = ${siteId}
          AND is_agent = true
          AND timestamp > NOW() - ${interval}::INTERVAL
        GROUP BY agent_name
        ORDER BY count DESC
        LIMIT 10
      `;

      const topAgents: AgentBreakdown[] = topAgentsRaw.map((row) => ({
        name: row.agent_name,
        count: Number(row.count),
        ratio: total > 0 ? (Number(row.count) / total) * 100 : 0,
      }));

      return {
        totalRequests: total,
        agentRequests: agents,
        humanRequests: humans,
        agentRatio: total > 0 ? (agents / total) * 100 : 0,
        uniqueAgents,
        agentChange: Math.round(agentChange * 100) / 100,
        topAgents,
      };
    });
  }

  async getAgents(siteId: string, range: AnalyticsRange): Promise<AgentBreakdown[]> {
    const cacheKey = `agents:${siteId}:${range}`;

    return this.redis.wrap(cacheKey, CACHE_TTL, async () => {
      const interval = RANGE_TO_INTERVAL[range];

      const rows = await this.prisma.$queryRaw<
        Array<{ agent_name: string; count: bigint; total: bigint }>
      >`
        SELECT
          agent_name,
          COUNT(*) as count,
          (SELECT COUNT(*) FROM events WHERE site_id = ${siteId} AND timestamp > NOW() - ${interval}::INTERVAL) as total
        FROM events
        WHERE site_id = ${siteId}
          AND is_agent = true
          AND timestamp > NOW() - ${interval}::INTERVAL
        GROUP BY agent_name
        ORDER BY count DESC
      `;

      return rows.map((row) => ({
        name: row.agent_name,
        count: Number(row.count),
        ratio: Number(row.total) > 0 ? (Number(row.count) / Number(row.total)) * 100 : 0,
      }));
    });
  }

  async getPages(siteId: string, range: AnalyticsRange): Promise<PageStats[]> {
    const cacheKey = `pages:${siteId}:${range}`;

    return this.redis.wrap(cacheKey, CACHE_TTL, async () => {
      const interval = RANGE_TO_INTERVAL[range];

      const rows = await this.prisma.$queryRaw<
        Array<{ url: string; total: bigint; agents: bigint }>
      >`
        SELECT
          url,
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE is_agent = true) as agents
        FROM events
        WHERE site_id = ${siteId}
          AND timestamp > NOW() - ${interval}::INTERVAL
        GROUP BY url
        ORDER BY agents DESC
        LIMIT 50
      `;

      return rows.map((row) => ({
        url: row.url,
        totalRequests: Number(row.total),
        agentRequests: Number(row.agents),
        agentRatio: Number(row.total) > 0 ? (Number(row.agents) / Number(row.total)) * 100 : 0,
      }));
    });
  }

  async getTimeline(siteId: string, range: AnalyticsRange): Promise<TimelinePoint[]> {
    const cacheKey = `timeline:${siteId}:${range}`;

    return this.redis.wrap(cacheKey, CACHE_TTL, async () => {
      const interval = RANGE_TO_INTERVAL[range];
      // Group by hour for 1d, by day for 7d/30d
      const bucket = range === '1d' ? 'hour' : 'day';

      const rows = await this.prisma.$queryRaw<
        Array<{ bucket: Date; total: bigint; agents: bigint; humans: bigint }>
      >`
        SELECT
          date_trunc(${bucket}, timestamp) as bucket,
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE is_agent = true) as agents,
          COUNT(*) FILTER (WHERE is_agent = false) as humans
        FROM events
        WHERE site_id = ${siteId}
          AND timestamp > NOW() - ${interval}::INTERVAL
        GROUP BY bucket
        ORDER BY bucket ASC
      `;

      return rows.map((row) => ({
        timestamp: row.bucket.toISOString(),
        total: Number(row.total),
        agents: Number(row.agents),
        humans: Number(row.humans),
      }));
    });
  }
}
