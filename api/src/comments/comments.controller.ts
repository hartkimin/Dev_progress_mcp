import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('comments')
@Controller('tasks/:taskId/comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Get()
    @ApiOperation({ summary: '태스크의 코멘트 조회' })
    findAll(@Param('taskId') taskId: string) {
        return this.commentsService.findAll(taskId);
    }

    @Post()
    @ApiOperation({ summary: '코멘트 생성' })
    create(
        @Param('taskId') taskId: string,
        @Body() createCommentDto: { author: string; content: string }
    ) {
        return this.commentsService.create(taskId, createCommentDto);
    }
}
