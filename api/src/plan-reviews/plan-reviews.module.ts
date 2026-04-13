import { Module } from '@nestjs/common';
import { PlanReviewsService } from './plan-reviews.service';
import { PlanReviewsController } from './plan-reviews.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PlanReviewsController],
  providers: [PlanReviewsService],
})
export class PlanReviewsModule {}
