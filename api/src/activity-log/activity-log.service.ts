import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ActivityLogEntry {
  actor?: string | null;
  actorType?: string | null;
  method: string;
  route: string;
  tool: string;
  projectId?: string | null;
  taskId?: string | null;
  argsSummary?: unknown;
  resultSummary?: unknown;
  statusCode?: number | null;
}

@Injectable()
export class ActivityLogService {
  private readonly logger = new Logger(ActivityLogService.name);

  constructor(private prisma: PrismaService) {}

  async record(entry: ActivityLogEntry): Promise<void> {
    try {
      await this.prisma.activityLog.create({
        data: {
          actor: entry.actor ?? null,
          actorType: entry.actorType ?? null,
          method: entry.method,
          route: entry.route,
          tool: entry.tool,
          projectId: entry.projectId ?? null,
          taskId: entry.taskId ?? null,
          argsSummary: (entry.argsSummary ?? null) as any,
          resultSummary: (entry.resultSummary ?? null) as any,
          statusCode: entry.statusCode ?? null,
        },
      });
    } catch (err) {
      this.logger.warn(`activity log insert failed: ${(err as Error).message}`);
    }
  }
}
