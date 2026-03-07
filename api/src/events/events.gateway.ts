import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/ws-jwt.guard';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private prisma: PrismaService) { }

  // Broadcasters for server-side updates
  broadcastTaskUpdate(projectId: string, payload: any) {
    this.server.to(`project_${projectId}`).emit('taskUpdated', payload);
  }

  broadcastTaskCreated(projectId: string, payload: any) {
    this.server.to(`project_${projectId}`).emit('taskCreated', payload);
  }

  broadcastTaskDeleted(projectId: string, payload: any) {
    this.server.to(`project_${projectId}`).emit('taskDeleted', payload);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinProject')
  async handleJoinProject(
    @MessageBody() data: { projectId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.sub;

    // Check if user is a member of the workspace that owns the project
    const project = await this.prisma.project.findUnique({
      where: { id: data.projectId },
      include: {
        workspace: {
          include: {
            members: {
              where: { userId }
            }
          }
        }
      }
    });

    if (!project || project.workspace?.members.length === 0) {
      return { event: 'error', data: 'Unauthorized to join this project room' };
    }

    client.join(`project_${data.projectId}`);
    console.log(`User ${userId} joined room project_${data.projectId}`);
    return { event: 'joined', data: `project_${data.projectId}` };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leaveProject')
  handleLeaveProject(
    @MessageBody() data: { projectId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`project_${data.projectId}`);
    return { event: 'left', data: `project_${data.projectId}` };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinUserNotifications')
  handleJoinNotifications(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const currentUserId = client.data.user.sub;
    
    // Only allow joining your own notification room
    if (data.userId !== currentUserId) {
        return { event: 'error', data: 'Cannot subscribe to other users notifications' };
    }

    client.join(`user_${data.userId}`);
    return { event: 'joinedNotifications', data: `user_${data.userId}` };
  }
}
