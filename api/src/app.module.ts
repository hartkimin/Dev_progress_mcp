import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { DocumentsModule } from './documents/documents.module';
import { ContextModule } from './context/context.module';
import { CommentsModule } from './comments/comments.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { IS_PUBLIC_KEY } from './auth/public.decorator';
import { PrismaService } from './prisma/prisma.service';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { BillingModule } from './billing/billing.module';
import { NotificationsModule } from './notifications/notifications.module';
import { HealthModule } from './health/health.module';
import { KeysModule } from './keys/keys.module';
import { YcAnswersModule } from './yc-answers/yc-answers.module';
import { PlanReviewsModule } from './plan-reviews/plan-reviews.module';

@Injectable()
export class GlobalJwtAuthGuard extends JwtAuthGuard {
  constructor(private reflector: Reflector, private prisma: PrismaService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // Accept API keys (generated from /admin/api-keys, prefixed with "vp_")
    // sent as "Authorization: Bearer vp_...". Lookup → resolve to owning user.
    const req = context.switchToHttp().getRequest();
    const auth: string = req?.headers?.authorization ?? '';
    const match = auth.match(/^Bearer (vp_\S+)$/);
    if (match) {
      const keyValue = match[1];
      const apiKey = await this.prisma.apiKey.findUnique({
        where: { keyValue },
        include: { user: true },
      });
      if (apiKey?.user) {
        req.user = apiKey.user;
        // fire-and-forget last-used stamp
        this.prisma.apiKey
          .update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } })
          .catch(() => {});
        return true;
      }
    }

    return (await super.canActivate(context)) as boolean;
  }
}

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60,
      limit: 100,
    }]),
    PrismaModule,
    ProjectsModule,
    TasksModule,
    DocumentsModule,
    ContextModule,
    CommentsModule,
    AnalyticsModule,
    AuthModule,
    UsersModule,
    EventsModule,
    WorkspacesModule,
    BillingModule,
    NotificationsModule,
    HealthModule,
    KeysModule,
    YcAnswersModule,
    PlanReviewsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: GlobalJwtAuthGuard,
    },
  ],
})
export class AppModule { }
