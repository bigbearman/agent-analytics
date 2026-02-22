import { Module } from '@nestjs/common';
import { AgentDetectionService } from './agent-detection.service';

@Module({
  providers: [AgentDetectionService],
  exports: [AgentDetectionService],
})
export class AgentDetectionModule {}
