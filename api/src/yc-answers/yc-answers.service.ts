import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateYcAnswerDto } from './dto/create-yc-answer.dto';

@Injectable()
export class YcAnswersService {
  constructor(private prisma: PrismaService) {}

  async create(projectId: string, dto: CreateYcAnswerDto) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException(`Project ${projectId} not found`);
    return this.prisma.ycAnswer.create({ data: { projectId, ...dto } });
  }

  async findLatest(projectId: string) {
    return this.prisma.ycAnswer.findFirst({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
