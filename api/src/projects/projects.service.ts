import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
    constructor(private prisma: PrismaService) { }

    async create(createProjectDto: CreateProjectDto) {
        const { name, description, mode } = createProjectDto;
        const project = await this.prisma.project.create({
            data: {
                name,
                description,
            },
        });

        if (mode === 'newbie') {
            // Add default Vibe Coding Planner template tasks
            const templateTasks = [
                { title: "Define Project Scope & Core Features", category: "Planning", phase: "1. Ideation", taskType: "Prompting", scale: "Epic", description: "AI와 브레인스토밍하여 프로젝트의 핵심 목표와 주요 기능을 정의하세요." },
                { title: "Extract User Stories & Requirements", category: "Planning", phase: "1. Ideation", taskType: "Docs", scale: "Story", description: "정의된 기능들을 바탕으로 구체적인 유저 스토리와 요구사항 문서를 작성하세요." },
                { title: "Design Database Schema & Tech Stack", category: "Architecture", phase: "2. Architecture", taskType: "Prompting", scale: "Epic", description: "어떤 기술 스택을 사용할지 결정하고, 데이터베이스 스키마(ERD)를 설계하세요." },
                { title: "Create UI Wireframes & Layout Plan", category: "Architecture", phase: "2. Architecture", taskType: "Docs", scale: "Story", description: "사용자 인터페이스의 전체적인 레이아웃과 와이어프레임을 기획하세요." },
                { title: "Setup Project Boilerplate & Routing", category: "Infrastructure", phase: "3. Implementation", taskType: "Coding", scale: "Task", description: "프로젝트 초기 세팅(Next.js 등)을 진행하고 기본 라우팅 구조를 잡으세요." },
                { title: "Implement Core DB Models & APIs", category: "Backend", phase: "3. Implementation", taskType: "Coding", scale: "Task", description: "설계한 스키마를 바탕으로 데이터베이스 모델과 핵심 API를 구현하세요." },
                { title: "Develop Main UI Components", category: "Frontend", phase: "3. Implementation", taskType: "Coding", scale: "Task", description: "와이어프레임을 바탕으로 실제 화면 컴포넌트들을 개발하세요." },
                { title: "Write Unit Tests for Core Logic", category: "Testing", phase: "4. Testing", taskType: "Coding", scale: "Task", description: "핵심 비즈니스 로직에 대한 유닛 테스트를 작성하여 안정성을 확보하세요." },
                { title: "Perform Manual QA & Fix Bugs", category: "Testing", phase: "4. Testing", taskType: "Review", scale: "Task", description: "엣지 케이스를 포함한 수동 테스트를 진행하고 발견된 버그를 수정하세요." },
                { title: "Write README & Deployment Guide", category: "Documentation", phase: "5. Deployment", taskType: "Docs", scale: "Task", description: "프로젝트 설명서(README)를 작성하고 배포를 진행하세요." }
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

    async findAll() {
        return this.prisma.project.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(id: string) {
        const project = await this.prisma.project.findUnique({
            where: { id }
        });
        if (!project) throw new NotFoundException('Project not found');
        return project;
    }

    async update(id: string, updateProjectDto: UpdateProjectDto) {
        try {
            return await this.prisma.project.update({
                where: { id },
                data: updateProjectDto
            });
        } catch (e) {
            throw new NotFoundException('Project not found or update failed');
        }
    }

    async remove(id: string) {
        try {
            return await this.prisma.project.delete({
                where: { id }
            });
        } catch (e) {
            throw new NotFoundException('Project not found or delete failed');
        }
    }
}
