import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AgentDetectionService } from '../agent-detection/agent-detection.service';
import { CollectEventDto } from './dto/collect-event.dto';

interface RequestContext {
  userAgent: string;
  referer?: string;
  accept?: string;
  ip?: string;
}

@Injectable()
export class IngestService {
  private readonly logger = new Logger(IngestService.name);

  constructor(
    @InjectQueue('events') private readonly eventsQueue: Queue,
    private readonly agentDetection: AgentDetectionService,
  ) {}

  async enqueue(dto: CollectEventDto, ctx: RequestContext): Promise<void> {
    // Enrich với server-side agent detection
    const serverDetection = this.agentDetection.detect(ctx, dto.agent);

    const enrichedEvent = {
      ...dto,
      serverAgent: {
        isAgent: serverDetection.isAgent,
        agentName: serverDetection.agentName,
        confidence: serverDetection.confidence,
      },
      requestContext: {
        ip: ctx.ip,
        userAgent: ctx.userAgent,
      },
    };

    await this.eventsQueue.add('process', enrichedEvent, {
      removeOnComplete: true,
      removeOnFail: false,
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });

    this.logger.debug(`Event enqueued for site ${dto.siteId}`);
  }
}
