import { Module } from '@nestjs/common';
import { YcAnswersService } from './yc-answers.service';
import { YcAnswersController } from './yc-answers.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [YcAnswersController],
  providers: [YcAnswersService],
})
export class YcAnswersModule {}
