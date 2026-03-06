import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('documents')
@Controller('api/v1/projects/:projectId/documents')
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) { }

    @Get(':docType')
    @ApiOperation({ summary: '문서 조회' })
    findOne(
        @Param('projectId') projectId: string,
        @Param('docType') docType: string
    ) {
        return this.documentsService.findOne(projectId, docType);
    }

    @Patch(':docType')
    @ApiOperation({ summary: '문서 업데이트 (포맷 검증 포함)' })
    update(
        @Param('projectId') projectId: string,
        @Param('docType') docType: string,
        @Body() updateDto: UpdateDocumentDto
    ) {
        return this.documentsService.update(projectId, docType, updateDto);
    }

    @Get(':docType/versions')
    @ApiOperation({ summary: '문서 버전 기록 조회' })
    getVersions(
        @Param('projectId') projectId: string,
        @Param('docType') docType: string
    ) {
        return this.documentsService.getVersions(projectId, docType);
    }

    @Post(':docType/versions/:versionId/restore')
    @ApiOperation({ summary: '과거 버전으로 롤백' })
    restoreVersion(
        @Param('projectId') projectId: string,
        @Param('docType') docType: string,
        @Param('versionId') versionId: string
    ) {
        return this.documentsService.restoreVersion(projectId, docType, versionId);
    }
}
