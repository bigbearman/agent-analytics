import { IsString, IsEnum } from 'class-validator';
import type { AnalyticsRange } from '@agent-analytics/types';

export class AnalyticsQueryDto {
  @IsString()
  siteId!: string;

  @IsEnum(['1d', '7d', '30d'])
  range!: AnalyticsRange;
}
