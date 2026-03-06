import { Controller, Get, Param } from '@nestjs/common';
import { ContextService } from './context.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('context')
@Controller('api/v1/projects/:projectId/context')
export class ContextController {
    constructor(private readonly contextService: ContextService) { }

    @Get()
    @ApiOperation({ summary: '프로젝트 컨텍스트 압축 조회 (LLM 토큰 최적화용)' })
    getCompressedContext(@Param('projectId') projectId: string) {
        return this.contextService.getCompressedContext(projectId);
    }
}
