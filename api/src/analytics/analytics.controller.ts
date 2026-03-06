import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('analytics')
@Controller('api/v1/analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('global')
    @ApiOperation({ summary: '전체 (또는 특정 프로젝트) 통계 조회' })
    @ApiQuery({ name: 'projectId', required: false, type: String })
    getGlobalAnalytics(@Query('projectId') projectId?: string) {
        return this.analyticsService.getGlobalAnalytics(projectId);
    }

    @Get('recent-tasks')
    @ApiOperation({ summary: '최근 업데이트된 태스크 목록 조회' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    getRecentTasks(@Query('limit') limit?: number) {
        return this.analyticsService.getRecentTasks(limit);
    }
}
