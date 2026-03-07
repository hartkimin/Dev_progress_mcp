import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck, PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../auth/public.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: PrismaHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'API Health Check' })
  check() {
    return this.health.check([
      () => this.db.pingCheck('database', this.prisma),
    ]);
  }
}
