import { Injectable, RawBodyRequest } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class BillingService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
      apiVersion: '2025-01-27' as any,
    });
  }

  async createCheckoutSession(userId: string, priceId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    let customerId = user.subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId },
      });
      customerId = customer.id;
      
      await this.prisma.subscription.upsert({
        where: { userId },
        create: { userId, stripeCustomerId: customerId },
        update: { stripeCustomerId: customerId },
      });
    }

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/billing?success=true`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/billing?canceled=true`,
    });

    return { url: session.url };
  }

  async handleWebhook(sig: string, rawBody: Buffer) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || '',
      );
    } catch (err) {
      throw new Error(`Webhook Error: ${err.message}`);
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === 'checkout.session.completed' || event.type === 'customer.subscription.updated') {
      const subscriptionId = session.subscription as string;
      const stripeSubscription = await this.stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription;
      
      const customerId = session.customer as string;
      const userSub = await this.prisma.subscription.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (userSub) {
        await this.prisma.subscription.update({
          where: { id: userSub.id },
          data: {
            stripePriceId: stripeSubscription.items.data[0].price.id,
            status: stripeSubscription.status === 'active' ? 'PRO' : 'FREE',
            currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
          },
        });
      }
    }

    return { received: true };
  }

  async getSubscription(userId: string) {
    return this.prisma.subscription.findUnique({
      where: { userId },
    });
  }
}
