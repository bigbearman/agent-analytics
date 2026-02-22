import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { IngestModule } from './ingest/ingest.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SitesModule } from './sites/sites.module';
import { AuthModule } from './auth/auth.module';
import { AgentDetectionModule } from './agent-detection/agent-detection.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.getOrThrow<string>('REDIS_URL'),
        },
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    PrismaModule,
    RedisModule,
    AgentDetectionModule,
    IngestModule,
    AnalyticsModule,
    SitesModule,
    AuthModule,
    HealthModule,
  ],
})
export class AppModule {}
