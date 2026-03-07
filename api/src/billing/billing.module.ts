import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { EntitlementsService } from './entitlements.service';
import { BillingController } from './billing.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BillingController],
  providers: [BillingService, EntitlementsService],
  exports: [BillingService, EntitlementsService],
})
export class BillingModule {}
