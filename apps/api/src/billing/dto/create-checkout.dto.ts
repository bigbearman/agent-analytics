import { IsEnum } from 'class-validator';
import type { PlanType } from '@agent-analytics/types';

export class CreateCheckoutDto {
  @IsEnum(['starter', 'pro', 'business'])
  plan!: Exclude<PlanType, 'free'>;
}
