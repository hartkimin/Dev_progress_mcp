import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommentsService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService,
    ) { }

    async findAll(taskId: string) {
        const task = await this.prisma.task.findUnique({ where: { id: taskId } });
        if (!task) throw new NotFoundException('Task not found');

        return this.prisma.comment.findMany({
            where: { taskId },
            orderBy: { createdAt: 'asc' }
        });
    }

    async create(taskId: string, dto: { author: string; content: string; userId?: string }) {
        const task = await this.prisma.task.findUnique({ 
            where: { id: taskId },
            include: { project: true }
        });
        if (!task) throw new NotFoundException('Task not found');

        const comment = await this.prisma.comment.create({
            data: {
                taskId,
                author: dto.author,
                content: dto.content,
                authorId: dto.userId,
            }
        });

        // Notify the task assignee if they are not the one commenting
        if (task.assigneeId && task.assigneeId !== dto.userId) {
            await this.notificationsService.create(task.assigneeId, {
                type: 'COMMENT_ADDED',
                title: 'New comment on your task',
                message: `${dto.author} commented on "${task.title}": ${dto.content.substring(0, 30)}...`,
                link: `/project/${task.projectId}?task=${taskId}`,
            });
        }

        return comment;
    }
}
