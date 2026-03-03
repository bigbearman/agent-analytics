import { IsString, IsEnum, IsOptional } from 'class-validator';
import type { AnalyticsRange, AgentType } from '@agent-analytics/types';

export class AnalyticsQueryDto {
  @IsString()
  siteId!: string;

  @IsEnum(['1d', '7d', '30d'])
  range!: AnalyticsRange;

  @IsOptional()
  @IsEnum(['training', 'search', 'on_demand', 'unknown'])
  agentType?: AgentType;
}
