import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentsService {
    constructor(private prisma: PrismaService) { }

    async findAll(taskId: string) {
        const task = await this.prisma.task.findUnique({ where: { id: taskId } });
        if (!task) throw new NotFoundException('Task not found');

        return this.prisma.comment.findMany({
            where: { taskId },
            orderBy: { createdAt: 'asc' }
        });
    }

    async create(taskId: string, dto: { author: string; content: string }) {
        const task = await this.prisma.task.findUnique({ where: { id: taskId } });
        if (!task) throw new NotFoundException('Task not found');

        return this.prisma.comment.create({
            data: {
                taskId,
                author: dto.author,
                content: dto.content
            }
        });
    }
}
