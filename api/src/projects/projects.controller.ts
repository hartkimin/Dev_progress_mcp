import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('projects')
@Controller('api/v1/projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Post()
    @ApiOperation({ summary: '새 프로젝트 생성' })
    create(@Body() createProjectDto: CreateProjectDto) {
        return this.projectsService.create(createProjectDto);
    }

    @Get()
    @ApiOperation({ summary: '진행 중인 모든 프로젝트 리스트 조회' })
    findAll() {
        return this.projectsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: '특정 프로젝트 조회' })
    findOne(@Param('id') id: string) {
        return this.projectsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: '프로젝트 정보 수정' })
    update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
        return this.projectsService.update(id, updateProjectDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: '프로젝트 삭제' })
    remove(@Param('id') id: string) {
        return this.projectsService.remove(id);
    }
}
