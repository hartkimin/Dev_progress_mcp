import { Controller, Post, Get, Body, Param, Request } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('workspaces')
@ApiBearerAuth()
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workspace' })
  create(@Request() req, @Body('name') name: string) {
    return this.workspacesService.create(req.user.id, name);
  }

  @Get()
  @ApiOperation({ summary: 'Get all workspaces for the current user' })
  findAll(@Request() req) {
    return this.workspacesService.findAllForUser(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific workspace' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.workspacesService.findOne(id, req.user.id);
  }
}
