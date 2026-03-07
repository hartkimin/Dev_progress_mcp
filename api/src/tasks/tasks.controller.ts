import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto, UpdateTaskDetailsDto } from './dto/update-task.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Post()
    @ApiOperation({ summary: '새 태스크 추가' })
    create(@Body() createTaskDto: CreateTaskDto) {
        return this.tasksService.create(createTaskDto);
    }

    @Get('project/:projectId')
    @ApiOperation({ summary: '특정 프로젝트의 모든 태스크 조회 (칸반/리스트용)' })
    findAllByProject(@Param('projectId') projectId: string) {
        return this.tasksService.findAllByProject(projectId);
    }

    @Get(':id')
    @ApiOperation({ summary: '특정 태스크 조회' })
    findOne(@Param('id') id: string) {
        return this.tasksService.findOne(id);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: '태스크 상태 업데이트 (Validation 포함)' })
    updateStatus(@Param('id') id: string, @Body() updateDto: UpdateTaskStatusDto) {
        return this.tasksService.updateStatus(id, updateDto);
    }

    @Patch(':id/details')
    @ApiOperation({ summary: '태스크 상세 내용 업데이트' })
    updateDetails(@Param('id') id: string, @Body() updateDto: UpdateTaskDetailsDto) {
        return this.tasksService.updateDetails(id, updateDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: '태스크 삭제' })
    remove(@Param('id') id: string) {
        return this.tasksService.remove(id);
    }
}
