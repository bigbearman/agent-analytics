import { IsString, IsEnum, IsBoolean, IsNumber, IsOptional, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class AgentDto {
  @IsBoolean()
  isAgent!: boolean;

  @IsString()
  agentName!: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  confidence!: number;
}

export class CollectEventDto {
  @IsString()
  siteId!: string;

  @IsString()
  url!: string;

  @IsEnum(['pageview', 'click', 'fetch', 'error'])
  action!: 'pageview' | 'click' | 'fetch' | 'error';

  @ValidateNested()
  @Type(() => AgentDto)
  agent!: AgentDto;

  @IsNumber()
  timestamp!: number;

  @IsOptional()
  meta?: Record<string, unknown>;
}
