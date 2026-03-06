import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    async getGlobalAnalytics(projectId?: string) {
        const projectFilter = projectId ? { id: projectId } : {};
        const taskFilter = projectId ? { projectId } : {};

        const totalProjects = await this.prisma.project.count({ where: projectFilter });
        const totalUsers = await this.prisma.user.count();
        const totalTasks = await this.prisma.task.count({ where: taskFilter });

        const statusCounts = await this.prisma.task.groupBy({
            by: ['status'],
            where: taskFilter,
            _count: true,
        });

        const tasksByStatus = { TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0 };
        statusCounts.forEach(s => {
            if (tasksByStatus.hasOwnProperty(s.status)) {
                tasksByStatus[s.status as keyof typeof tasksByStatus] = s._count;
            }
        });

        return { totalProjects, totalTasks, tasksByStatus, totalUsers };
    }

    async getRecentTasks(limit: number = 50) {
        return this.prisma.task.findMany({
            take: limit,
            orderBy: { updatedAt: 'desc' },
            include: {
                project: { select: { name: true } }
            }
        });
    }
}
