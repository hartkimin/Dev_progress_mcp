import { Injectable, NotFoundException } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanReviewDto } from './dto/create-plan-review.dto';

@Injectable()
export class PlanReviewsService {
  private readonly baseDir =
    process.env.PLAN_REVIEW_DIR ?? path.join(process.cwd(), 'data', 'plan-reviews', 'results');

  constructor(private prisma: PrismaService) {}

  async create(projectId: string, dto: CreatePlanReviewDto) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException(`Project ${projectId} not found`);

    const date = new Date().toISOString().slice(0, 10);
    const slug = this.slugify(dto.specPath ?? dto.kind);
    const mdPath = path.join(this.baseDir, projectId, `${date}-${dto.kind}-${slug}.md`);

    await this.writeMarkdown(mdPath, projectId, dto);

    return this.prisma.planReview.create({
      data: {
        projectId,
        kind: dto.kind,
        specPath: dto.specPath,
        mdPath,
        score: dto.score,
        decision: dto.decision,
        payload: dto.payload as any,
        reviewer: dto.reviewer ?? 'solo',
      },
    });
  }

  async findAll(projectId: string, kind?: string) {
    return this.prisma.planReview.findMany({
      where: { projectId, ...(kind ? { kind } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const r = await this.prisma.planReview.findUnique({ where: { id } });
    if (!r) throw new NotFoundException(`PlanReview ${id} not found`);
    return r;
  }

  private slugify(input: string): string {
    const base = path.basename(input, path.extname(input));
    return base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'review';
  }

  private async writeMarkdown(filePath: string, projectId: string, dto: CreatePlanReviewDto) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const fm = [
      '---',
      `kind: ${dto.kind}`,
      `project_id: ${projectId}`,
      `spec: ${dto.specPath ?? ''}`,
      `reviewer: ${dto.reviewer ?? 'solo'}`,
      `date: ${new Date().toISOString().slice(0, 10)}`,
      `score: ${dto.score ?? ''}`,
      `decision: ${dto.decision ?? ''}`,
      '---',
      '',
      '## Payload',
      '```json',
      JSON.stringify(dto.payload, null, 2),
      '```',
      '',
    ].join('\n');
    await fs.writeFile(filePath, fm, 'utf8');
  }
}
