import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { EntitlementsService } from '../billing/entitlements.service';
import { WorkspaceRole } from '@prisma/client';

@Injectable()
export class ProjectsService {
    constructor(
        private prisma: PrismaService,
        private entitlementsService: EntitlementsService
    ) { }

    async create(userId: string, createProjectDto: CreateProjectDto) {
        const { name, description, mode } = createProjectDto;

        // Step 2: Check project limits based on subscription
        await this.entitlementsService.checkProjectLimit(userId);

        // Find user's default workspace (or the first one they belong to)
        let workspace = await this.prisma.workspace.findFirst({
            where: {
                members: {
                    some: { userId, role: WorkspaceRole.OWNER }
                }
            }
        });

        // If no workspace owned, find any workspace they are in
        if (!workspace) {
            workspace = await this.prisma.workspace.findFirst({
                where: {
                    members: {
                        some: { userId }
                    }
                }
            });
        }

        // If still no workspace, create one for the user
        if (!workspace) {
            workspace = await this.prisma.workspace.create({
                data: {
                    name: `${name} Workspace`,
                    members: {
                        create: {
                            userId,
                            role: WorkspaceRole.OWNER,
                        },
                    },
                },
            });
        }

        const project = await this.prisma.project.create({
            data: {
                name,
                description,
                workspaceId: workspace.id,
            },
        });

        if (mode === 'newbie') {
            const templateTasks = [
                { title: "Define Project Scope & Core Features", category: "Planning", phase: "Ideation & Requirements", taskType: "Prompting", scale: "Epic", description: "AI와 브레인스토밍하여 프로젝트의 핵심 목표와 주요 기능을 정의하세요." },
                { title: "Extract User Stories & Requirements", category: "Planning", phase: "Ideation & Requirements", taskType: "Docs", scale: "Story", description: "정의된 기능들을 바탕으로 구체적인 유저 스토리와 요구사항 문서를 작성하세요." },
                { title: "Design Database Schema & Tech Stack", category: "Architecture", phase: "Architecture & Design", taskType: "Prompting", scale: "Epic", description: "어떤 기술 스택을 사용할지 결정하고, 데이터베이스 스키마(ERD)를 설계하세요." },
                { title: "Create UI Wireframes & Layout Plan", category: "Architecture", phase: "Architecture & Design", taskType: "Docs", scale: "Story", description: "사용자 인터페이스의 전체적인 레이아웃과 와이어프레임을 기획하세요." },
                { title: "Setup Project Boilerplate & Routing", category: "Infrastructure", phase: "Implementation", taskType: "Coding", scale: "Task", description: "프로젝트 초기 세팅(Next.js 등)을 진행하고 기본 라우팅 구조를 잡으세요." },
                { title: "Implement Core DB Models & APIs", category: "Backend", phase: "Implementation", taskType: "Coding", scale: "Task", description: "설계한 스키마를 바탕으로 데이터베이스 모델과 핵심 API를 구현하세요." },
                { title: "Develop Main UI Components", category: "Frontend", phase: "Implementation", taskType: "Coding", scale: "Task", description: "와이어프레임을 바탕으로 실제 화면 컴포넌트들을 개발하세요." },
                { title: "Write Unit Tests for Core Logic", category: "Testing", phase: "Testing & QA", taskType: "Coding", scale: "Task", description: "핵심 비즈니스 로직에 대한 유닛 테스트를 작성하여 안정성을 확보하세요." },
                { title: "Perform Manual QA & Fix Bugs", category: "Testing", phase: "Testing & QA", taskType: "Review", scale: "Task", description: "엣지 케이스를 포함한 수동 테스트를 진행하고 발견된 버그를 수정하세요." },
                { title: "Write README & Deployment Guide", category: "Documentation", phase: "Deployment & Review", taskType: "Docs", scale: "Task", description: "프로젝트 설명서(README)를 작성하고 배포를 진행하세요." }
            ];

            for (const t of templateTasks) {
                await this.prisma.task.create({
                    data: {
                        projectId: project.id,
                        title: t.title,
                        category: t.category,
                        phase: t.phase,
                        taskType: t.taskType,
                        scale: t.scale,
                        description: t.description,
                        status: 'TODO'
                    }
                });
            }
        }

        return project;
    }

    async findAll(userId: string) {
        return this.prisma.project.findMany({
            where: {
                workspace: {
                    members: {
                        some: { userId }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(id: string, userId: string) {
        const project = await this.prisma.project.findFirst({
            where: {
                id,
                workspace: {
                    members: {
                        some: { userId }
                    }
                }
            }
        });
        if (!project) throw new NotFoundException('Project not found or unauthorized');
        return project;
    }

    async update(id: string, userId: string, updateProjectDto: UpdateProjectDto) {
        // First check ownership/access
        await this.findOne(id, userId);

        try {
            return await this.prisma.project.update({
                where: { id },
                data: updateProjectDto
            });
        } catch (e) {
            throw new NotFoundException('Update failed');
        }
    }

    async remove(id: string, userId: string) {
        // First check ownership/access
        await this.findOne(id, userId);

        try {
            return await this.prisma.project.delete({
                where: { id }
            });
        } catch (e) {
            throw new NotFoundException('Delete failed');
        }
    }
}
