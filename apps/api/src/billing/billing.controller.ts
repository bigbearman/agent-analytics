import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Headers,
  HttpCode,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async createCheckout(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateCheckoutDto,
  ) {
    const checkoutUrl = await this.billingService.createCheckoutSession(
      user.userId,
      dto.plan,
    );
    return { data: { checkoutUrl } };
  }

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Req() req: FastifyRequest,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = (req as FastifyRequest & { rawBody?: Buffer }).rawBody;
    if (!rawBody) {
      throw new Error('Raw body not available');
    }
    await this.billingService.handleWebhook(rawBody, signature);
    return { received: true };
  }

  @Get('portal')
  @UseGuards(JwtAuthGuard)
  async getBillingPortal(@CurrentUser() user: AuthUser) {
    const portalUrl = await this.billingService.getBillingPortalUrl(user.userId);
    return { data: { portalUrl } };
  }
}
