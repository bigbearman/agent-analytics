import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { PLAN_LIMITS, type PlanType } from '@agent-analytics/types';
import { CreateSiteDto } from './dto/create-site.dto';

@Injectable()
export class SitesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async findAllByUser(userId: string) {
    return this.prisma.site.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateSiteDto) {
    // Check plan limit cho số sites
    const currentSites = await this.prisma.site.count({ where: { userId } });
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    // Lấy plan từ site đầu tiên (simplified — production sẽ có user plan)
    const firstSite = await this.prisma.site.findFirst({ where: { userId } });
    const plan = (firstSite?.plan ?? 'free') as PlanType;
    const maxSites = PLAN_LIMITS[plan].sites;

    if (currentSites >= maxSites) {
      throw new ForbiddenException(`Plan ${plan} allows max ${maxSites} sites`);
    }

    const apiKey = this.generateApiKey();

    return this.prisma.site.create({
      data: {
        userId,
        domain: dto.domain,
        apiKey,
      },
    });
  }

  async getSnippet(siteId: string, userId: string): Promise<string> {
    const site = await this.findOneOrFail(siteId, userId);
    const trackerUrl = this.configService.get<string>(
      'TRACKER_CDN_URL',
      'https://cdn.agentanalytics.io/tracker.js',
    );

    return `<script async src="${trackerUrl}" data-site="${site.apiKey}"></script>`;
  }

  async rotateApiKey(siteId: string, userId: string) {
    await this.findOneOrFail(siteId, userId);

    const newApiKey = this.generateApiKey();
    return this.prisma.site.update({
      where: { id: siteId },
      data: { apiKey: newApiKey },
    });
  }

  private async findOneOrFail(siteId: string, userId: string) {
    const site = await this.prisma.site.findUnique({ where: { id: siteId } });
    if (!site) {
      throw new NotFoundException('Site not found');
    }
    if (site.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return site;
  }

  private generateApiKey(): string {
    return `aa_${randomBytes(24).toString('hex')}`;
  }
}
