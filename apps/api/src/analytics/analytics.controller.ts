import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { PrismaService } from '../prisma/prisma.service';

/** Plan-based page limits for ai-interest endpoint */
const PAGE_LIMITS: Record<string, number> = {
  free: 10,
  starter: 50,
  pro: 500,
  business: 500,
};

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('overview')
  async getOverview(@Query() query: AnalyticsQueryDto) {
    const data = await this.analyticsService.getOverview(query.siteId, query.range);
    return { data };
  }

  @Get('agents')
  async getAgents(@Query() query: AnalyticsQueryDto) {
    const data = await this.analyticsService.getAgents(query.siteId, query.range);
    return { data };
  }

  @Get('pages')
  async getPages(@Query() query: AnalyticsQueryDto) {
    const data = await this.analyticsService.getPages(query.siteId, query.range);
    return { data };
  }

  @Get('timeline')
  async getTimeline(@Query() query: AnalyticsQueryDto) {
    const data = await this.analyticsService.getTimeline(query.siteId, query.range);
    return { data };
  }

  @Get('pages/ai-interest')
  async getPagesAiInterest(@Query() query: AnalyticsQueryDto) {
    const site = await this.prisma.site.findUnique({
      where: { id: query.siteId },
      select: { plan: true },
    });
    const plan = (site?.plan ?? 'free') as string;
    const limit = PAGE_LIMITS[plan] ?? 10;

    const result = await this.analyticsService.getPagesAiInterest(
      query.siteId,
      query.range,
      limit,
    );
    return { data: result.pages, meta: { total: result.total, limit } };
  }

  @Get('referrals')
  async getReferrals(@Query() query: AnalyticsQueryDto) {
    const data = await this.analyticsService.getReferrals(query.siteId, query.range);
    return { data };
  }
}
