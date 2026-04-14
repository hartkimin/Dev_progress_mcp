import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { ActivityLogService } from './activity-log.service';

const WRITE_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordHash',
  'token',
  'accessToken',
  'refreshToken',
  'keyValue',
  'apiKey',
  'secret',
  'authorization',
]);

const MAX_STRING = 500;

@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ActivityLogInterceptor.name);

  constructor(private readonly service: ActivityLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest();
    const method: string = req?.method ?? '';

    if (!WRITE_METHODS.has(method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: (result) => this.safeRecord(req, http.getResponse(), result).catch(() => undefined),
      }),
    );
  }

  private async safeRecord(req: any, res: any, result: unknown): Promise<void> {
    try {
      const route = this.extractRoute(req);
      const method: string = req?.method ?? '';
      const params = req?.params ?? {};
      const projectId = params.projectId ?? (route.includes('/projects/:id') ? params.id : null);
      const taskId = params.taskId ?? (route.startsWith('tasks/') || route.includes('/tasks/:id') ? params.id : null);

      const actorId = req?.user?.id ?? null;
      const actorType = this.detectActorType(req);

      const argsSummary = this.summarizeArgs(req?.body);
      const resultSummary = this.summarizeResult(result);

      await this.service.record({
        actor: actorId,
        actorType,
        method,
        route,
        tool: `${method} ${route}`,
        projectId,
        taskId,
        argsSummary,
        resultSummary,
        statusCode: res?.statusCode ?? null,
      });
    } catch (err) {
      this.logger.warn(`activity-log record failed: ${(err as Error).message}`);
    }
  }

  private extractRoute(req: any): string {
    const route = req?.route?.path;
    if (typeof route === 'string') return route.replace(/^\//, '');
    const url: string = req?.originalUrl ?? req?.url ?? '';
    return url.split('?')[0].replace(/^\//, '');
  }

  private detectActorType(req: any): string | null {
    const auth: string = req?.headers?.authorization ?? '';
    if (/^Bearer vp_/.test(auth)) return 'api_key';
    if (/^Bearer /.test(auth)) return 'user';
    return null;
  }

  private summarizeArgs(body: unknown): unknown {
    if (body == null || typeof body !== 'object') return null;
    return this.sanitize(body, 0);
  }

  private summarizeResult(result: unknown): unknown {
    if (result == null) return null;
    if (Array.isArray(result)) {
      return { count: result.length, sample: this.sanitize(result.slice(0, 3), 0) };
    }
    if (typeof result === 'object') {
      const obj: Record<string, unknown> = {};
      const src = result as Record<string, unknown>;
      for (const key of ['id', 'status', 'kind', 'decision', 'score', 'docType', 'name', 'title']) {
        if (src[key] !== undefined) obj[key] = src[key];
      }
      return Object.keys(obj).length ? obj : { type: typeof result };
    }
    return { value: String(result).slice(0, MAX_STRING) };
  }

  private sanitize(value: unknown, depth: number): unknown {
    if (depth > 3) return '[depth-limit]';
    if (value == null) return value;
    if (typeof value === 'string') return value.length > MAX_STRING ? value.slice(0, MAX_STRING) + '…' : value;
    if (typeof value !== 'object') return value;
    if (Array.isArray(value)) return value.slice(0, 20).map((v) => this.sanitize(v, depth + 1));

    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.has(k)) {
        out[k] = '[redacted]';
        continue;
      }
      out[k] = this.sanitize(v, depth + 1);
    }
    return out;
  }
}
