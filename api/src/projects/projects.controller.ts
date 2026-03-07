import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GetUser } from '../auth/get-user.decorator';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Post()
    @ApiOperation({ summary: '새 프로젝트 생성' })
    create(
        @GetUser('id') userId: string,
        @Body() createProjectDto: CreateProjectDto
    ) {
        return this.projectsService.create(userId, createProjectDto);
    }

    @Get()
    @ApiOperation({ summary: '사용자가 접근 가능한 모든 프로젝트 리스트 조회' })
    findAll(@GetUser('id') userId: string) {
        return this.projectsService.findAll(userId);
    }

    @Get(':id')
    @ApiOperation({ summary: '특정 프로젝트 조회' })
    findOne(
        @Param('id') id: string,
        @GetUser('id') userId: string
    ) {
        return this.projectsService.findOne(id, userId);
    }

    @Patch(':id')
    @ApiOperation({ summary: '프로젝트 정보 수정' })
    update(
        @Param('id') id: string,
        @GetUser('id') userId: string,
        @Body() updateProjectDto: UpdateProjectDto
    ) {
        return this.projectsService.update(id, userId, updateProjectDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: '프로젝트 삭제' })
    remove(
        @Param('id') id: string,
        @GetUser('id') userId: string
    ) {
        return this.projectsService.remove(id, userId);
    }
}
