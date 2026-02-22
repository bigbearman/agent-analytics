import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { IngestController } from './ingest.controller';
import { IngestService } from './ingest.service';
import { EventProcessor } from './event.processor';
import { AgentDetectionModule } from '../agent-detection/agent-detection.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'events' }),
    AgentDetectionModule,
  ],
  controllers: [IngestController],
  providers: [IngestService, EventProcessor],
})
export class IngestModule {}
