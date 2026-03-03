import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import type { PlanType } from '@agent-analytics/types';

@Injectable()
export class BillingService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(BillingService.name);
  private readonly priceToplan: Record<string, PlanType>;
  private readonly planToPrice: Record<string, string>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(
      this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'),
    );

    const starterPrice = this.configService.getOrThrow<string>('STRIPE_PRICE_STARTER');
    const proPrice = this.configService.getOrThrow<string>('STRIPE_PRICE_PRO');
    const businessPrice = this.configService.getOrThrow<string>('STRIPE_PRICE_BUSINESS');

    this.priceToplan = {
      [starterPrice]: 'starter',
      [proPrice]: 'pro',
      [businessPrice]: 'business',
    };

    this.planToPrice = {
      starter: starterPrice,
      pro: proPrice,
      business: businessPrice,
    };
  }

  async createCheckoutSession(
    userId: string,
    plan: Exclude<PlanType, 'free'>,
  ): Promise<string> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        metadata: { userId },
      });
      customerId = customer.id;
      await this.prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    const priceId = this.planToPrice[plan];
    if (!priceId) {
      throw new BadRequestException(`Invalid plan: ${plan}`);
    }

    const appUrl = this.configService.getOrThrow<string>('APP_URL');

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/billing?success=true`,
      cancel_url: `${appUrl}/billing?canceled=true`,
      metadata: { userId, plan },
    });

    return session.url ?? '';
  }

  async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    const webhookSecret = this.configService.getOrThrow<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err) {
      this.logger.error('Webhook signature verification failed', err);
      throw new BadRequestException('Invalid webhook signature');
    }

    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.created':
        await this.handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
        );
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;
      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handleSubscriptionUpdated(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    const customerId = subscription.customer as string;
    const priceId = subscription.items.data[0]?.price.id;

    if (!priceId) {
      this.logger.warn('No price found on subscription');
      return;
    }

    const plan: PlanType = this.priceToplan[priceId] ?? 'free';

    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { stripeCustomerId: customerId },
      });
      if (!user) {
        this.logger.warn(`No user for Stripe customer ${customerId}`);
        return;
      }

      await tx.user.update({
        where: { id: user.id },
        data: {
          stripeSubscriptionId: subscription.id,
          stripePriceId: priceId,
        },
      });

      // Update all user's sites plan (denormalized)
      await tx.site.updateMany({
        where: { userId: user.id },
        data: { plan },
      });
    });
  }

  private async handleSubscriptionDeleted(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    const customerId = subscription.customer as string;

    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { stripeCustomerId: customerId },
      });
      if (!user) return;

      await tx.user.update({
        where: { id: user.id },
        data: {
          stripeSubscriptionId: null,
          stripePriceId: null,
        },
      });

      // Reset all sites to free
      await tx.site.updateMany({
        where: { userId: user.id },
        data: { plan: 'free' },
      });
    });
  }

  async getBillingPortalUrl(userId: string): Promise<string> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    if (!user.stripeCustomerId) {
      throw new BadRequestException('No billing account found');
    }

    const appUrl = this.configService.getOrThrow<string>('APP_URL');

    const session = await this.stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${appUrl}/billing`,
    });

    return session.url;
  }
}
