import { Controller, Get, Post, Body, Request, Headers, BadRequestException } from '@nestjs/common';
import { BillingService } from './billing.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @ApiBearerAuth()
  @Get('subscription')
  @ApiOperation({ summary: 'Get current subscription' })
  getSubscription(@Request() req) {
    return this.billingService.getSubscription(req.user.id);
  }

  @ApiBearerAuth()
  @Post('checkout')
  @ApiOperation({ summary: 'Create a Stripe checkout session' })
  createCheckout(@Request() req, @Body('priceId') priceId: string) {
    return this.billingService.createCheckoutSession(req.user.id, priceId);
  }

  @Public()
  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  async webhook(@Headers('stripe-signature') sig: string, @Request() req) {
    if (!sig) throw new BadRequestException('Missing signature');
    return this.billingService.handleWebhook(sig, req.rawBody);
  }
}
