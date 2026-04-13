import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { YcAnswersService } from './yc-answers.service';
import { CreateYcAnswerDto } from './dto/create-yc-answer.dto';

@ApiTags('yc-answers')
@ApiBearerAuth()
@Controller('projects/:projectId/yc-answers')
export class YcAnswersController {
  constructor(private readonly service: YcAnswersService) {}

  @Post()
  @ApiOperation({ summary: 'YC 6-Question 응답 저장' })
  create(@Param('projectId') projectId: string, @Body() dto: CreateYcAnswerDto) {
    return this.service.create(projectId, dto);
  }

  @Get('latest')
  @ApiOperation({ summary: '최신 YC 응답 조회' })
  findLatest(@Param('projectId') projectId: string) {
    return this.service.findLatest(projectId);
  }
}
