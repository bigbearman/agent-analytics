import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import type {
  AnalyticsOverview,
  AnalyticsRange,
  AgentBreakdown,
  PageStats,
  TimelinePoint,
  PageAiInterest,
  AiReferralOverview,
  AiReferralStats,
} from '@agent-analytics/types';
import { AI_REFERRAL_DOMAINS } from '@agent-analytics/types';

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

  async getPagesAiInterest(
    siteId: string,
    range: AnalyticsRange,
    limit: number,
  ): Promise<{ pages: PageAiInterest[]; total: number }> {
    const cacheKey = `pages-ai:${siteId}:${range}:${limit}`;

    return this.redis.wrap(cacheKey, CACHE_TTL, async () => {
      const interval = RANGE_TO_INTERVAL[range];

      // Page-level AI visits with agent type breakdown
      const rows = await this.prisma.$queryRaw<
        Array<{
          url: string;
          ai_visits: bigint;
          unique_agents: bigint;
          training: bigint;
          search: bigint;
          on_demand: bigint;
        }>
      >`
        SELECT
          url,
          COUNT(*) as ai_visits,
          COUNT(DISTINCT agent_name) as unique_agents,
          COUNT(*) FILTER (WHERE agent_type = 'training') as training,
          COUNT(*) FILTER (WHERE agent_type = 'search') as search,
          COUNT(*) FILTER (WHERE agent_type = 'on_demand') as on_demand
        FROM events
        WHERE site_id = ${siteId}
          AND is_agent = true
          AND timestamp > NOW() - ${interval}::INTERVAL
        GROUP BY url
        ORDER BY ai_visits DESC
        LIMIT ${limit}
      `;

      // Previous period for trend calculation
      const prevRows = await this.prisma.$queryRaw<
        Array<{ url: string; ai_visits: bigint }>
      >`
        SELECT url, COUNT(*) as ai_visits
        FROM events
        WHERE site_id = ${siteId}
          AND is_agent = true
          AND timestamp > NOW() - (${interval}::INTERVAL * 2)
          AND timestamp <= NOW() - ${interval}::INTERVAL
        GROUP BY url
      `;

      const prevMap = new Map(
        prevRows.map((r) => [r.url, Number(r.ai_visits)]),
      );

      // Top agents per page (batch query)
      const urls = rows.map((r) => r.url);
      const topAgentsRows = urls.length > 0
        ? await this.prisma.$queryRaw<
            Array<{ url: string; agent_name: string; count: bigint }>
          >`
            SELECT url, agent_name, COUNT(*) as count
            FROM events
            WHERE site_id = ${siteId}
              AND is_agent = true
              AND timestamp > NOW() - ${interval}::INTERVAL
              AND url = ANY(${urls})
            GROUP BY url, agent_name
            ORDER BY url, count DESC
          `
        : [];

      // Group top agents by URL (keep top 5 per page)
      const agentsByUrl = new Map<string, AgentBreakdown[]>();
      for (const row of topAgentsRows) {
        const list = agentsByUrl.get(row.url) ?? [];
        if (list.length < 5) {
          list.push({
            name: row.agent_name,
            count: Number(row.count),
            ratio: 0, // calculated below
          });
          agentsByUrl.set(row.url, list);
        }
      }

      // Total count for pagination meta
      const [countResult] = await this.prisma.$queryRaw<Array<{ total: bigint }>>`
        SELECT COUNT(DISTINCT url) as total
        FROM events
        WHERE site_id = ${siteId}
          AND is_agent = true
          AND timestamp > NOW() - ${interval}::INTERVAL
      `;

      const pages: PageAiInterest[] = rows.map((row) => {
        const aiVisits = Number(row.ai_visits);
        const prev = prevMap.get(row.url) ?? 0;
        const trend = prev > 0 ? ((aiVisits - prev) / prev) * 100 : (aiVisits > 0 ? 100 : 0);

        const pageAgents = agentsByUrl.get(row.url) ?? [];
        for (const agent of pageAgents) {
          agent.ratio = aiVisits > 0 ? (agent.count / aiVisits) * 100 : 0;
        }

        return {
          url: row.url,
          aiVisits,
          uniqueAgents: Number(row.unique_agents),
          topAgents: pageAgents,
          trend: Math.round(trend * 100) / 100,
          agentTypes: {
            training: Number(row.training),
            search: Number(row.search),
            on_demand: Number(row.on_demand),
          },
        };
      });

      return { pages, total: Number(countResult?.total ?? 0) };
    });
  }

  async getReferrals(
    siteId: string,
    range: AnalyticsRange,
  ): Promise<AiReferralOverview> {
    const cacheKey = `referrals:${siteId}:${range}`;

    return this.redis.wrap(cacheKey, CACHE_TTL, async () => {
      const interval = RANGE_TO_INTERVAL[range];

      // Total traffic for share calculation
      const [totalResult] = await this.prisma.$queryRaw<Array<{ total: bigint }>>`
        SELECT COUNT(*) as total
        FROM events
        WHERE site_id = ${siteId}
          AND timestamp > NOW() - ${interval}::INTERVAL
      `;
      const totalTraffic = Number(totalResult?.total ?? 0);

      // AI referral sources
      const rows = await this.prisma.$queryRaw<
        Array<{
          referrer_domain: string;
          visits: bigint;
          unique_pages: bigint;
          top_landing: string;
        }>
      >`
        SELECT
          referrer_domain,
          COUNT(*) as visits,
          COUNT(DISTINCT url) as unique_pages,
          (
            SELECT url FROM events e2
            WHERE e2.site_id = ${siteId}
              AND e2.referrer_domain = e.referrer_domain
              AND e2.referrer_type = 'ai_referral'
              AND e2.timestamp > NOW() - ${interval}::INTERVAL
            GROUP BY url
            ORDER BY COUNT(*) DESC
            LIMIT 1
          ) as top_landing
        FROM events e
        WHERE site_id = ${siteId}
          AND referrer_type = 'ai_referral'
          AND referrer_domain IS NOT NULL
          AND timestamp > NOW() - ${interval}::INTERVAL
        GROUP BY referrer_domain
        ORDER BY visits DESC
      `;

      // Previous period for trends
      const prevRows = await this.prisma.$queryRaw<
        Array<{ referrer_domain: string; visits: bigint }>
      >`
        SELECT referrer_domain, COUNT(*) as visits
        FROM events
        WHERE site_id = ${siteId}
          AND referrer_type = 'ai_referral'
          AND referrer_domain IS NOT NULL
          AND timestamp > NOW() - (${interval}::INTERVAL * 2)
          AND timestamp <= NOW() - ${interval}::INTERVAL
        GROUP BY referrer_domain
      `;

      const prevMap = new Map(
        prevRows.map((r) => [r.referrer_domain, Number(r.visits)]),
      );

      const sources: AiReferralStats[] = rows.map((row) => {
        const visits = Number(row.visits);
        const prev = prevMap.get(row.referrer_domain) ?? 0;
        const trend = prev > 0 ? ((visits - prev) / prev) * 100 : (visits > 0 ? 100 : 0);

        return {
          source: AI_REFERRAL_DOMAINS[row.referrer_domain] ?? row.referrer_domain,
          referrerDomain: row.referrer_domain,
          visits,
          uniquePages: Number(row.unique_pages),
          topLandingPage: row.top_landing ?? '',
          trend: Math.round(trend * 100) / 100,
        };
      });

      const totalReferrals = sources.reduce((sum, s) => sum + s.visits, 0);

      return {
        sources,
        totalReferrals,
        referralShare: totalTraffic > 0
          ? Math.round((totalReferrals / totalTraffic) * 10000) / 100
          : 0,
      };
    });
  }
}
