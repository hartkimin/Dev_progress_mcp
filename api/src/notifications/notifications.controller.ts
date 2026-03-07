import { Controller, Get, Post, Param, Request, Patch } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user notifications' })
  findAll(@Request() req) {
    return this.notificationsService.findAllForUser(req.user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  read(@Request() req, @Param('id') id: string) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  readAll(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }
}
