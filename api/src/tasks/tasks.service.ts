import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto, UpdateTaskDetailsDto } from './dto/update-task.dto';
import { EventsGateway } from '../events/events.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { WORK_TEMPLATES, isTemplateEmpty } from './task-templates';

@Injectable()
export class TasksService {
    constructor(
        private prisma: PrismaService,
        private eventsGateway: EventsGateway,
        private notificationsService: NotificationsService,
    ) { }

    async create(dto: CreateTaskDto) {
        // Validate project existence
        const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
        if (!project) throw new NotFoundException('Project not found');

        const task = await this.prisma.task.create({
            data: {
                projectId: dto.projectId,
                title: dto.title,
                category: dto.category,
                phase: dto.phase,
                taskType: dto.taskType,
                scale: dto.scale,
                description: dto.description,
                workTodo: isTemplateEmpty(dto.workTodo) ? WORK_TEMPLATES.workTodo : dto.workTodo,
                workInProgress: isTemplateEmpty(dto.workInProgress) ? WORK_TEMPLATES.workInProgress : dto.workInProgress,
                workReview: isTemplateEmpty(dto.workReview) ? WORK_TEMPLATES.workReview : dto.workReview,
                workDone: isTemplateEmpty(dto.workDone) ? WORK_TEMPLATES.workDone : dto.workDone,
                status: dto.status || 'TODO',
                startDate: dto.startDate ? new Date(dto.startDate) : null,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
                assigneeId: dto['assigneeId'],
            }
        });

        if (task.assigneeId) {
            await this.notificationsService.create(task.assigneeId, {
                type: 'TASK_ASSIGNED',
                title: 'New task assigned',
                message: `You have been assigned to: ${task.title}`,
                link: `/project/${task.projectId}?task=${task.id}`,
            });
        }

        this.eventsGateway.broadcastTaskCreated(task.projectId, task);
        return task;
    }

    async findAllByProject(projectId: string) {
        return this.prisma.task.findMany({
            where: { projectId },
            orderBy: { createdAt: 'asc' },
            include: {
                assignee: {
                    select: { id: true, name: true, email: true }
                },
                _count: {
                    select: { comments: true }
                }
            }
        });
    }

    async findOne(id: string) {
        const task = await this.prisma.task.findUnique({
            where: { id },
            include: { 
                comments: {
                    include: { authorDb: { select: { id: true, name: true } } }
                },
                assignee: { select: { id: true, name: true, email: true } }
            }
        });
        if (!task) throw new NotFoundException('Task not found');
        return task;
    }

    async updateStatus(id: string, dto: UpdateTaskStatusDto) {
        const task = await this.prisma.task.findUnique({ where: { id } });
        if (!task) throw new NotFoundException('Task not found');

        // 상태 이동은 자유. 작업 내용 가이드는 UI에서 경고로 안내.

        const dataToUpdate: any = {
            status: dto.status,
            updatedBy: 'API User'
        };

        if (dto.status === 'IN_PROGRESS' && task.status !== 'IN_PROGRESS') {
            dataToUpdate.startedAt = task.startedAt || new Date();
        } else if (dto.status === 'REVIEW' && task.status !== 'REVIEW') {
            dataToUpdate.reviewAt = new Date();
        } else if (dto.status === 'DONE') {
            dataToUpdate.completedAt = new Date();
        }

        const snapshot = {
            workTodo: task.workTodo ?? null,
            workInProgress: task.workInProgress ?? null,
            workReview: task.workReview ?? null,
            workDone: task.workDone ?? null,
        };

        const [updatedTask] = await this.prisma.$transaction([
            this.prisma.task.update({ where: { id }, data: dataToUpdate }),
            this.prisma.taskStatusHistory.create({
                data: {
                    taskId: id,
                    fromStatus: task.status,
                    toStatus: dto.status,
                    changedBy: 'API User',
                    snapshot: snapshot as any,
                },
            }),
        ]);
        this.eventsGateway.broadcastTaskUpdate(updatedTask.projectId, updatedTask);
        return updatedTask;
    }

    async getStatusHistory(id: string) {
        const task = await this.prisma.task.findUnique({ where: { id }, select: { id: true } });
        if (!task) throw new NotFoundException('Task not found');
        return this.prisma.taskStatusHistory.findMany({
            where: { taskId: id },
            orderBy: { changedAt: 'asc' },
        });
    }

    async updateDetails(id: string, dto: UpdateTaskDetailsDto) {
        // Validate task
        const task = await this.prisma.task.findUnique({ where: { id } });
        if (!task) throw new NotFoundException('Task not found');

        const oldAssigneeId = task.assigneeId;
        const newAssigneeId = dto['assigneeId'];

        const updatedTask = await this.prisma.task.update({
            where: { id },
            data: {
                description: dto.description,
                beforeWork: dto.beforeWork,
                afterWork: dto.afterWork,
                workTodo: dto.workTodo,
                workInProgress: dto.workInProgress,
                workReview: dto.workReview,
                workDone: dto.workDone,
                phase: dto.phase,
                taskType: dto.taskType,
                scale: dto.scale,
                startDate: dto.startDate ? new Date(dto.startDate) : undefined,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
                updatedBy: 'API User',
                assigneeId: newAssigneeId,
                ...(dto['title'] ? { title: dto['title'] } : {})
            }
        });

        if (newAssigneeId && newAssigneeId !== oldAssigneeId) {
            await this.notificationsService.create(newAssigneeId, {
                type: 'TASK_ASSIGNED',
                title: 'Task assigned to you',
                message: `You have been assigned to: ${updatedTask.title}`,
                link: `/project/${updatedTask.projectId}?task=${updatedTask.id}`,
            });
        }

        this.eventsGateway.broadcastTaskUpdate(updatedTask.projectId, updatedTask);
        return updatedTask;
    }

    async remove(id: string) {
        try {
            const task = await this.prisma.task.delete({
                where: { id }
            });
            this.eventsGateway.broadcastTaskDeleted(task.projectId, { id });
            return task;
        } catch (e) {
            throw new NotFoundException('Task not found or delete failed');
        }
    }
}
