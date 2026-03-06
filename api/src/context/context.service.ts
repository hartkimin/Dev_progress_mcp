import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContextService {
    constructor(private prisma: PrismaService) { }

    async getCompressedContext(projectId: string) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                projectDocuments: {
                    select: { docType: true, content: true }
                },
                tasks: {
                    where: { status: { in: ['IN_PROGRESS', 'TODO'] } },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                    select: { title: true, status: true, phase: true }
                }
            }
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        // 압축 로직 (불필요한 공백 제거, 핵심만 추출 등)
        let contextStr = `Project: ${project.name}\n`;
        if (project.description) contextStr += `Desc: ${project.description}\n`;

        contextStr += `\n[Active Tasks]\n`;
        project.tasks.forEach(t => {
            contextStr += `- [${t.status}] ${t.title} (Phase: ${t.phase || 'N/A'})\n`;
        });

        contextStr += `\n[Core Architectures]\n`;
        project.projectDocuments.forEach(d => {
            // 너무 길어지지 않게 1000자로 제한하거나 헤딩만 남기는 최적화를 할 수 있음
            const shortContent = d.content ? d.content.substring(0, 500) + '...' : 'Empty';
            contextStr += `=== ${d.docType} ===\n${shortContent}\n`;
        });

        return {
            optimization_level: 'high',
            context: contextStr,
            tokens_estimated: Math.round(contextStr.length / 4)
        };
    }
}
