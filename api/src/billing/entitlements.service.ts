import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EntitlementsService {
    constructor(private prisma: PrismaService) { }

    async checkProjectLimit(userId: string) {
        // Find user and their subscription
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { subscription: true }
        });

        if (!user) {
            throw new ForbiddenException('User not found');
        }

        // Count projects the user has access to
        const projectCount = await this.prisma.project.count({
            where: {
                workspace: {
                    members: {
                        some: { userId }
                    }
                }
            }
        });

        const isPro = user.subscription?.status === 'PRO';
        const limit = isPro ? 100 : 3; // FREE limits to 3 projects, PRO limits to 100

        if (projectCount >= limit) {
            const message = isPro
                ? 'PRO 플랜의 프로젝트 생성 한도(100개)에 도달했습니다.'
                : 'FREE 플랜은 최대 3개의 프로젝트만 생성할 수 있습니다. 상용화를 위해 PRO로 업그레이드하세요!';
            throw new ForbiddenException(message);
        }
    }

    async isUserPro(userId: string): Promise<boolean> {
        const sub = await this.prisma.subscription.findUnique({
            where: { userId }
        });
        return sub?.status === 'PRO';
    }
}
