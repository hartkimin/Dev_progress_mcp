import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentsService {
    constructor(private prisma: PrismaService) { }

    async findOne(projectId: string, docType: string) {
        const doc = await this.prisma.projectDocument.findUnique({
            where: {
                projectId_docType: { projectId, docType }
            }
        });
        if (!doc) {
            return { content: `해당 ${docType} 문서 생성이 필요합니다.` };
        }
        return doc;
    }

    async update(projectId: string, docType: string, dto: UpdateDocumentDto) {
        const content = dto.content;

        // === 1. Validation Logic ===
        // DATABASE 문서일 경우 Mermaid ERD 문법 포함 여부 확인
        if (docType === 'DATABASE') {
            if (!content.includes('\`\`\`mermaid') || !content.includes('erDiagram')) {
                throw new BadRequestException('DATABASE 문서는 반드시 Mermaid의 erDiagram 문법을 포함해야 합니다. AI에게 스키마를 다시 작성하라고 지시하세요.');
            }
        }

        // ISSUE_TRACKER / CODE_REVIEW 등 JSON 기반 문자열일 경우 스키마 파싱 검증
        if (['ISSUE_TRACKER', 'CODE_REVIEW', 'TEST', 'DEPLOY', 'AI_CONTEXT'].includes(docType)) {
            try {
                const parsed = JSON.parse(content);
                if (!Array.isArray(parsed) && typeof parsed !== 'object') {
                    throw new BadRequestException('해당 문서 타입은 반드시 Object 속성의 유효한 JSON 형식이어야 합니다.');
                }
            } catch (e) {
                throw new BadRequestException(`올바른 JSON 형식이 아닙니다: ${e.message}`);
            }
        }

        // === 2. Update and Versioning ===
        // 현재 버전 번호 찾기
        const lastVersion = await this.prisma.projectDocumentVersion.findFirst({
            where: { projectId, docType },
            orderBy: { versionNumber: 'desc' }
        });
        const nextVersion = (lastVersion?.versionNumber || 0) + 1;

        // 문서 갱신 (Upsert)
        const doc = await this.prisma.projectDocument.upsert({
            where: {
                projectId_docType: { projectId, docType }
            },
            update: { content },
            create: { projectId, docType, content }
        });

        // 버전 이력 남기기
        // 실제 상용화 시에는 Draft/Review 시스템이 도입되지만 여기서는 즉시 버전을 올림
        await this.prisma.projectDocumentVersion.create({
            data: {
                projectId,
                docType,
                content,
                versionNumber: nextVersion,
                createdBy: 'API Submitter'
            }
        });

        return doc;
    }

    async getVersions(projectId: string, docType: string) {
        return this.prisma.projectDocumentVersion.findMany({
            where: { projectId, docType },
            orderBy: { versionNumber: 'desc' }
        });
    }

    async restoreVersion(projectId: string, docType: string, versionId: string) {
        const version = await this.prisma.projectDocumentVersion.findUnique({
            where: { id: versionId }
        });
        if (!version || version.projectId !== projectId || version.docType !== docType) {
            throw new NotFoundException('해당 버전을 찾을 수 없습니다.');
        }

        // 복원도 일종의 'Update'이므로 버전을 추가로 생성하며 업데이트 진행
        return this.update(projectId, docType, { content: version.content || '' });
    }
}
