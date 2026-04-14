import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { GetUser } from '../auth/get-user.decorator';

@ApiTags('analytics')
@Controller('analytics')
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

    @Get('project-summary')
    @ApiOperation({ summary: '특정 프로젝트의 요약 통계 (카드 뷰용)' })
    @ApiQuery({ name: 'projectId', required: true, type: String })
    getProjectSummary(@Query('projectId') projectId: string) {
        return this.analyticsService.getProjectSummary(projectId);
    }

    @Get('project-summaries')
    @ApiOperation({ summary: '현재 사용자가 접근 가능한 프로젝트 요약 목록 (대시보드 카드용)' })
    getAllProjectSummaries(@GetUser('id') userId: string) {
        return this.analyticsService.getAllProjectSummaries(userId);
    }

    @Get('phase-breakdown')
    @ApiOperation({ summary: 'Vibe Coding 5단계 Phase별 상세 분석' })
    @ApiQuery({ name: 'projectId', required: true, type: String })
    getPhaseBreakdown(@Query('projectId') projectId: string) {
        return this.analyticsService.getPhaseBreakdown(projectId);
    }

    @Get('burndown')
    @ApiOperation({ summary: '번다운 차트 데이터 (일별 잔여 태스크)' })
    @ApiQuery({ name: 'projectId', required: true, type: String })
    @ApiQuery({ name: 'days', required: false, type: Number })
    getBurndownData(@Query('projectId') projectId: string, @Query('days') days?: number) {
        return this.analyticsService.getBurndownData(projectId, days ? Number(days) : 30);
    }

    @Get('category-distribution')
    @ApiOperation({ summary: '카테고리별 태스크 분포' })
    @ApiQuery({ name: 'projectId', required: true, type: String })
    getCategoryDistribution(@Query('projectId') projectId: string) {
        return this.analyticsService.getCategoryDistribution(projectId);
    }

    @Get('velocity')
    @ApiOperation({ summary: '주간 Velocity 추이 (Mock 대체)' })
    @ApiQuery({ name: 'projectId', required: true, type: String })
    @ApiQuery({ name: 'weeks', required: false, type: Number })
    getVelocityHistory(@Query('projectId') projectId: string, @Query('weeks') weeks?: number) {
        return this.analyticsService.getVelocityHistory(projectId, weeks ? Number(weeks) : 8);
    }
}
