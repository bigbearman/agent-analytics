import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { SitesService } from './sites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';
import { CreateSiteDto } from './dto/create-site.dto';

@Controller('sites')
@UseGuards(JwtAuthGuard)
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Get()
  async findAll(@CurrentUser() user: AuthUser) {
    const sites = await this.sitesService.findAllByUser(user.userId);
    return { data: sites };
  }

  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreateSiteDto) {
    const site = await this.sitesService.create(user.userId, dto);
    return { data: site };
  }

  @Get(':id/snippet')
  async getSnippet(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const snippet = await this.sitesService.getSnippet(id, user.userId);
    return { data: { snippet } };
  }

  @Post(':id/rotate-key')
  async rotateKey(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const site = await this.sitesService.rotateApiKey(id, user.userId);
    return { data: site };
  }
}
