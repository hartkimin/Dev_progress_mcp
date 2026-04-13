import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KeysService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, name: string) {
    // Ensure the user exists (especially for mock-user-1 in dev)
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user && userId === 'mock-user-1') {
      await this.prisma.user.create({
        data: {
          id: 'mock-user-1',
          name: 'Mock User',
          email: 'mock@vibeplanner.com',
        },
      });
    }

    const keyValue = `vp_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    return this.prisma.apiKey.create({
      data: {
        userId,
        name,
        keyValue,
      },
    });
  }

  async findAll(userId: string) {
    // Ensure mock user exists for local development list view
    if (userId === 'mock-user-1') {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        await this.prisma.user.create({
          data: {
            id: 'mock-user-1',
            name: 'Mock User',
            email: 'mock@vibeplanner.com',
          },
        });
      }
    }
    return this.prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string) {
    return this.prisma.apiKey.delete({
      where: { id },
    });
  }
}
