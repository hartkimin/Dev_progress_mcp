import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspaceRole } from '@prisma/client';

@Injectable()
export class WorkspacesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, name: string) {
    return this.prisma.workspace.create({
      data: {
        name,
        members: {
          create: {
            userId,
            role: WorkspaceRole.OWNER,
          },
        },
      },
    });
  }

  async findAllForUser(userId: string) {
    return this.prisma.workspace.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        _count: {
          select: { projects: true, members: true },
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id,
        members: {
          some: { userId },
        },
      },
      include: {
        projects: true,
        members: {
          include: { user: true },
        },
      },
    });
    if (!workspace) throw new NotFoundException('Workspace not found or unauthorized');
    return workspace;
  }
}
