import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PlanReviewsService } from './plan-reviews.service';
import { CreatePlanReviewDto } from './dto/create-plan-review.dto';

@ApiTags('plan-reviews')
@ApiBearerAuth()
@Controller()
export class PlanReviewsController {
  constructor(private readonly service: PlanReviewsService) {}

  @Post('projects/:projectId/plan-reviews')
  @ApiOperation({ summary: 'Plan Review 저장 (DB + MD 파일)' })
  create(@Param('projectId') projectId: string, @Body() dto: CreatePlanReviewDto) {
    return this.service.create(projectId, dto);
  }

  @Get('projects/:projectId/plan-reviews')
  @ApiOperation({ summary: '프로젝트의 Plan Review 목록' })
  findAll(@Param('projectId') projectId: string, @Query('kind') kind?: string) {
    return this.service.findAll(projectId, kind);
  }

  @Get('plan-reviews/:id')
  @ApiOperation({ summary: 'Plan Review 단건 조회' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
