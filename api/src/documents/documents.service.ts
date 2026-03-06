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

        // === 2. Update and Versioning (Draft System) ===
        // 기본적으로 모든 업로드는 일단 DRAFT 처리로 간주하는 로직 (상용화 시)
        // (현재는 호환성을 위해 DRAFT 여부를 dto나 플래그로 받을 수 있도록 확장할 수 있으나, 우선 DRAFT 로직을 태웁니다)
        const status = 'DRAFT'; // 향후 dto.isDraft 형식으로 분기처리

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
            update: { content, status },
            create: { projectId, docType, content, status }
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

    async appendItem(projectId: string, docType: string, itemData: any) {
        // 단일 아이템 스키마 검증
        this.validateItemSchema(docType, itemData);

        // 기존 배열 파싱
        const doc = await this.prisma.projectDocument.findUnique({
            where: { projectId_docType: { projectId, docType } }
        });

        let arr: any[] = [];
        if (doc && doc.content) {
            try {
                arr = JSON.parse(doc.content);
                if (!Array.isArray(arr)) arr = [];
            } catch (e) {
                arr = []; // 파싱 에러나면 빈 배열로 초기화
            }
        }

        // 아이디가 없으면 임의 생성 (이슈 트래커 등)
        if (!itemData.id) {
            itemData.id = Math.random().toString(36).substr(2, 9);
        }

        arr.push(itemData);
        const content = JSON.stringify(arr, null, 2);

        // 업데이트 수행 (내부적으로 버전 생성도 함)
        return this.update(projectId, docType, { content });
    }

    private validateItemSchema(docType: string, item: any) {
        const jsonTypes = ['ISSUE_TRACKER', 'CODE_REVIEW', 'TEST', 'DEPLOY', 'AI_CONTEXT'];
        if (!jsonTypes.includes(docType)) {
            throw new BadRequestException('이 문서 타입은 배열 기반 Append 동작을 지원하지 않습니다.');
        }

        if (typeof item !== 'object' || Array.isArray(item)) {
            throw new BadRequestException('아이템은 단일 구조 형태여야 합니다.');
        }

        if (docType === 'ISSUE_TRACKER') {
            if (!item.title || !item.status) throw new BadRequestException('ISSUE_TRACKER 아이템은 title과 status가 필수입니다.');
        } else if (docType === 'CODE_REVIEW') {
            if (!item.prLink || !item.status) throw new BadRequestException('CODE_REVIEW 아이템은 prLink와 status가 필수입니다.');
        } else if (docType === 'TEST') {
            if (!item.testName || !item.status) throw new BadRequestException('TEST 아이템은 testName과 status가 필수입니다.');
        } else if (docType === 'DEPLOY') {
            if (!item.version || !item.env || !item.status) throw new BadRequestException('DEPLOY 아이템은 version, env, status가 필수입니다.');
        }
    }
}
