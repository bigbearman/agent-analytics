import { Controller, Post, Body, Req, HttpCode } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { IngestService } from './ingest.service';
import { CollectEventDto } from './dto/collect-event.dto';

@Controller('collect')
export class IngestController {
  constructor(private readonly ingestService: IngestService) {}

  /**
   * POST /collect — public endpoint, rate-limited
   * Luôn trả 202, không leak errors ra ngoài
   */
  @Post()
  @HttpCode(202)
  async collect(
    @Body() dto: CollectEventDto,
    @Req() req: FastifyRequest,
  ): Promise<{ ok: true }> {
    await this.ingestService.enqueue(dto, {
      userAgent: req.headers['user-agent'] ?? '',
      referer: req.headers['referer'] as string | undefined,
      accept: req.headers['accept'] as string | undefined,
      ip: req.ip,
    });

    return { ok: true };
  }
}
