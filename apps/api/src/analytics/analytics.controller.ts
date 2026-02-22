import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

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
}
