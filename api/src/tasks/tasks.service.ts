import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto, UpdateTaskDetailsDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateTaskDto) {
        // Validate project existence
        const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
        if (!project) throw new NotFoundException('Project not found');

        return this.prisma.task.create({
            data: {
                projectId: dto.projectId,
                title: dto.title,
                category: dto.category,
                phase: dto.phase,
                taskType: dto.taskType,
                scale: dto.scale,
                description: dto.description,
                status: dto.status || 'TODO',
                startDate: dto.startDate ? new Date(dto.startDate) : null,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
            }
        });
    }

    async findAllByProject(projectId: string) {
        return this.prisma.task.findMany({
            where: { projectId },
            orderBy: { createdAt: 'asc' },
            include: {
                _count: {
                    select: { comments: true }
                }
            }
        });
    }

    async findOne(id: string) {
        const task = await this.prisma.task.findUnique({
            where: { id },
            include: { comments: true }
        });
        if (!task) throw new NotFoundException('Task not found');
        return task;
    }

    async updateStatus(id: string, dto: UpdateTaskStatusDto) {
        const task = await this.prisma.task.findUnique({ where: { id } });
        if (!task) throw new NotFoundException('Task not found');

        // === 상태 전이 규칙 (Validation) ===
        if (dto.status === 'REVIEW') {
            // REVIEW로 넘길 때는 반드시 afterWork(작업 결과물)이 존재해야 함
            if (!task.afterWork || task.afterWork.trim() === '') {
                throw new BadRequestException('상태를 REVIEW로 변경하려면 먼저 작업 결과(afterWork)를 작성해야 합니다.');
            }
        }

        if (dto.status === 'DONE') {
            // DONE으로 넘길 때는 추가 확인이 필요할 수 있음 (예: 특정 타입의 태스크인 경우 리뷰 승인 상태 확인 등)
            // 현재는 간단한 예시로 통과
        }

        const dataToUpdate: any = {
            status: dto.status,
            updatedBy: 'API User'
        };

        if (dto.status === 'IN_PROGRESS' && task.status !== 'IN_PROGRESS') {
            dataToUpdate.startedAt = task.startedAt || new Date();
        } else if (dto.status === 'DONE') {
            dataToUpdate.completedAt = new Date();
        }

        return this.prisma.task.update({
            where: { id },
            data: dataToUpdate
        });
    }

    async updateDetails(id: string, dto: UpdateTaskDetailsDto) {
        // Validate task
        const task = await this.prisma.task.findUnique({ where: { id } });
        if (!task) throw new NotFoundException('Task not found');

        return this.prisma.task.update({
            where: { id },
            data: {
                description: dto.description,
                beforeWork: dto.beforeWork,
                afterWork: dto.afterWork,
                phase: dto.phase,
                taskType: dto.taskType,
                scale: dto.scale,
                startDate: dto.startDate ? new Date(dto.startDate) : undefined,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
                updatedBy: 'API User'
            }
        });
    }

    async remove(id: string) {
        try {
            return await this.prisma.task.delete({
                where: { id }
            });
        } catch (e) {
            throw new NotFoundException('Task not found or delete failed');
        }
    }
}
