import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AnalyticsService.getStrategyReadiness', () => {
  let service: AnalyticsService;
  let prisma: { project: { findMany: jest.Mock } };

  beforeEach(async () => {
    prisma = { project: { findMany: jest.fn() } };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(AnalyticsService);
  });

  it('filters projects by workspace membership', async () => {
    prisma.project.findMany.mockResolvedValue([]);
    await service.getStrategyReadiness('user-1');
    expect(prisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          workspace: { members: { some: { userId: 'user-1' } } },
        }),
      }),
    );
  });

  it('computes yc completion rate, plan review avg, kind counts, phase progress', async () => {
    prisma.project.findMany.mockResolvedValue([
      {
        id: 'p1',
        name: 'P1',
        tasks: [
          { status: 'DONE',  phase: 'Ideation & Requirements' },
          { status: 'TODO',  phase: 'Ideation & Requirements' },
          { status: 'DONE',  phase: 'Implementation' },
        ],
        ycAnswers: [{
          q1Demand: 'a',
          q2StatusQuo: 'b',
          q3Specific: 'c',
          q4Wedge: 'd',
          q5Observation: 'e',
          q6FutureFit: '',
        }],
        planReviews: [
          { kind: 'ceo', score: 8 },
          { kind: 'eng', score: 6 },
          { kind: 'eng', score: 7 },
        ],
      },
    ]);
    const result = await service.getStrategyReadiness('user-1');
    expect(result.projects[0]).toMatchObject({
      id: 'p1',
      ycCompletionRate: 5 / 6,
      planReviewAvgScore: 7,
      planReviewCountByKind: { ceo: 1, eng: 2, design: 0, devex: 0 },
    });
    const ideation = result.projects[0].phaseProgress.find(
      (p: any) => p.phase === 'Ideation & Requirements',
    );
    expect(ideation).toEqual({
      phase: 'Ideation & Requirements',
      total: 2,
      done: 1,
    });
    expect(result.aggregate.ycCompletionRate).toBeCloseTo(5 / 6);
    expect(result.aggregate.planReviewAvgScore).toBeCloseTo(7);
  });
});
