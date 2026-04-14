import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const VIBE_PHASES = [
    'Ideation & Requirements',
    'Architecture & Design',
    'Implementation',
    'Testing & QA',
    'Deployment & Review',
] as const;

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    // ─── Existing ────────────────────────────────────────────────
    async getGlobalAnalytics(projectId?: string) {
        const projectFilter = projectId ? { id: projectId } : {};
        const taskFilter = projectId ? { projectId } : {};

        const totalProjects = await this.prisma.project.count({ where: projectFilter });
        const totalUsers = await this.prisma.user.count();
        const totalTasks = await this.prisma.task.count({ where: taskFilter });

        const statusCounts = await this.prisma.task.groupBy({
            by: ['status'],
            where: taskFilter,
            _count: true,
        });

        const tasksByStatus = { TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0 };
        statusCounts.forEach(s => {
            if (tasksByStatus.hasOwnProperty(s.status)) {
                tasksByStatus[s.status as keyof typeof tasksByStatus] = s._count;
            }
        });

        return { totalProjects, totalTasks, tasksByStatus, totalUsers };
    }

    async getRecentTasks(limit: number = 50) {
        return this.prisma.task.findMany({
            take: limit,
            orderBy: { updatedAt: 'desc' },
            include: {
                project: { select: { name: true } }
            }
        });
    }

    // ─── NEW: Project Summary (for project cards) ────────────────
    async getProjectSummary(projectId: string) {
        const tasks = await this.prisma.task.findMany({
            where: { projectId },
            select: {
                id: true,
                status: true,
                phase: true,
                category: true,
                updatedAt: true,
            },
        });

        const total = tasks.length;
        const byStatus = { TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0 };
        const byPhase: Record<string, { total: number; done: number }> = {};
        const byCategory: Record<string, { total: number; done: number }> = {};
        let lastActivity: Date | null = null;

        for (const task of tasks) {
            // Status counts
            if (byStatus.hasOwnProperty(task.status)) {
                byStatus[task.status as keyof typeof byStatus]++;
            }

            // Phase breakdown
            const phase = task.phase || 'Unassigned';
            if (!byPhase[phase]) byPhase[phase] = { total: 0, done: 0 };
            byPhase[phase].total++;
            if (task.status === 'DONE') byPhase[phase].done++;

            // Category breakdown
            const category = task.category || 'Uncategorized';
            if (!byCategory[category]) byCategory[category] = { total: 0, done: 0 };
            byCategory[category].total++;
            if (task.status === 'DONE') byCategory[category].done++;

            // Last activity
            if (!lastActivity || task.updatedAt > lastActivity) {
                lastActivity = task.updatedAt;
            }
        }

        const completionRate = total > 0 ? Math.round((byStatus.DONE / total) * 100) : 0;

        // Determine dominant phase (most IN_PROGRESS tasks)
        let dominantPhase = 'Ideation & Requirements';
        let maxInProgress = 0;
        for (const task of tasks) {
            if (task.status === 'IN_PROGRESS') {
                const phase = task.phase || 'Unassigned';
                const count = tasks.filter(t => t.phase === task.phase && t.status === 'IN_PROGRESS').length;
                if (count > maxInProgress) {
                    maxInProgress = count;
                    dominantPhase = phase;
                }
            }
        }

        return {
            total,
            byStatus,
            byPhase,
            byCategory,
            completionRate,
            dominantPhase,
            lastActivity: lastActivity?.toISOString() || null,
        };
    }

    // ─── NEW: Phase Breakdown (Vibe Coding 5 Phases) ─────────────
    async getPhaseBreakdown(projectId: string) {
        const tasks = await this.prisma.task.findMany({
            where: { projectId },
            select: {
                status: true,
                phase: true,
                createdAt: true,
                completedAt: true,
            },
        });

        const phases = VIBE_PHASES.map(phaseName => {
            const phaseTasks = tasks.filter(t => t.phase === phaseName);
            const total = phaseTasks.length;
            const done = phaseTasks.filter(t => t.status === 'DONE').length;
            const inProgress = phaseTasks.filter(t => t.status === 'IN_PROGRESS').length;
            const review = phaseTasks.filter(t => t.status === 'REVIEW').length;
            const todo = phaseTasks.filter(t => t.status === 'TODO').length;
            const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

            // Average lead time (days) for completed tasks
            const completedTasks = phaseTasks.filter(t => t.completedAt && t.createdAt);
            const avgLeadTimeDays = completedTasks.length > 0
                ? Math.round(completedTasks.reduce((sum, t) => {
                    const created = new Date(t.createdAt).getTime();
                    const completed = new Date(t.completedAt!).getTime();
                    return sum + (completed - created) / (1000 * 60 * 60 * 24);
                }, 0) / completedTasks.length * 10) / 10
                : null;

            return {
                name: phaseName as string,
                total,
                todo,
                inProgress,
                review,
                done,
                completionRate,
                avgLeadTimeDays,
            };
        });

        // Unassigned tasks
        const unassigned = tasks.filter(t => !t.phase || !(VIBE_PHASES as readonly string[]).includes(t.phase));
        if (unassigned.length > 0) {
            phases.push({
                name: 'Unassigned',
                total: unassigned.length,
                todo: unassigned.filter(t => t.status === 'TODO').length,
                inProgress: unassigned.filter(t => t.status === 'IN_PROGRESS').length,
                review: unassigned.filter(t => t.status === 'REVIEW').length,
                done: unassigned.filter(t => t.status === 'DONE').length,
                completionRate: unassigned.length > 0
                    ? Math.round((unassigned.filter(t => t.status === 'DONE').length / unassigned.length) * 100)
                    : 0,
                avgLeadTimeDays: null,
            });
        }

        return { phases };
    }

    // ─── NEW: Burndown Data (daily remaining tasks) ──────────────
    async getBurndownData(projectId: string, days: number = 30) {
        const tasks = await this.prisma.task.findMany({
            where: { projectId },
            select: {
                createdAt: true,
                completedAt: true,
                status: true,
            },
        });

        const now = new Date();
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - days);

        const totalTasks = tasks.length;
        const dataPoints: { date: string; remaining: number; completed: number; created: number }[] = [];

        for (let d = 0; d <= days; d++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + d);
            const dateStr = date.toISOString().split('T')[0];
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            // Tasks created by this date
            const createdByDate = tasks.filter(t => new Date(t.createdAt) <= endOfDay).length;
            // Tasks completed by this date
            const completedByDate = tasks.filter(t => t.completedAt && new Date(t.completedAt) <= endOfDay).length;
            const remaining = createdByDate - completedByDate;

            // Daily new tasks & completions
            const dayStart = new Date(date);
            dayStart.setHours(0, 0, 0, 0);
            const createdToday = tasks.filter(t => {
                const c = new Date(t.createdAt);
                return c >= dayStart && c <= endOfDay;
            }).length;
            const completedToday = tasks.filter(t => {
                if (!t.completedAt) return false;
                const c = new Date(t.completedAt);
                return c >= dayStart && c <= endOfDay;
            }).length;

            dataPoints.push({
                date: dateStr,
                remaining,
                completed: completedToday,
                created: createdToday,
            });
        }

        return {
            totalTasks,
            days,
            dataPoints,
        };
    }

    // ─── NEW: Category Distribution ──────────────────────────────
    async getCategoryDistribution(projectId: string) {
        const tasks = await this.prisma.task.findMany({
            where: { projectId },
            select: { category: true, status: true },
        });

        const categories: Record<string, { total: number; done: number; inProgress: number; todo: number; review: number }> = {};
        for (const task of tasks) {
            const cat = task.category || 'Uncategorized';
            if (!categories[cat]) categories[cat] = { total: 0, done: 0, inProgress: 0, todo: 0, review: 0 };
            categories[cat].total++;
            if (task.status === 'DONE') categories[cat].done++;
            if (task.status === 'IN_PROGRESS') categories[cat].inProgress++;
            if (task.status === 'TODO') categories[cat].todo++;
            if (task.status === 'REVIEW') categories[cat].review++;
        }

        const distribution = Object.entries(categories).map(([name, stats]) => ({
            name,
            ...stats,
            completionRate: stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0,
        }));

        return { distribution, totalTasks: tasks.length };
    }

    // ─── NEW: Velocity History (weekly completed tasks) ──────────
    async getVelocityHistory(projectId: string, weeks: number = 8) {
        const tasks = await this.prisma.task.findMany({
            where: {
                projectId,
                completedAt: { not: null },
            },
            select: {
                completedAt: true,
            },
            orderBy: { completedAt: 'asc' },
        });

        const now = new Date();
        const velocityData: { weekLabel: string; weekStart: string; completed: number }[] = [];

        for (let w = weeks - 1; w >= 0; w--) {
            const weekEnd = new Date(now);
            weekEnd.setDate(weekEnd.getDate() - (w * 7));
            weekEnd.setHours(23, 59, 59, 999);

            const weekStart = new Date(weekEnd);
            weekStart.setDate(weekStart.getDate() - 6);
            weekStart.setHours(0, 0, 0, 0);

            const completed = tasks.filter(t => {
                const d = new Date(t.completedAt!);
                return d >= weekStart && d <= weekEnd;
            }).length;

            const label = w === 0 ? 'This Week' : w === 1 ? 'Last Week' : `${w}w ago`;

            velocityData.push({
                weekLabel: label,
                weekStart: weekStart.toISOString().split('T')[0],
                completed,
            });
        }

        const avgVelocity = velocityData.length > 0
            ? Math.round(velocityData.reduce((sum, v) => sum + v.completed, 0) / velocityData.length * 10) / 10
            : 0;

        return {
            weeks,
            avgVelocity,
            velocityData,
        };
    }

    // ─── NEW: Strategy Readiness (cross-project dashboard) ───────
    async getStrategyReadiness(userId: string) {
        const KINDS = ['ceo', 'eng', 'design', 'devex'] as const;
        const YC_FIELDS = ['q1Demand', 'q2StatusQuo', 'q3Specific', 'q4Wedge', 'q5Observation', 'q6FutureFit'] as const;

        const projects = await this.prisma.project.findMany({
            where: {
                workspace: { members: { some: { userId } } },
            },
            include: {
                tasks: { select: { status: true, phase: true } },
                ycAnswers: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
                planReviews: { select: { kind: true, score: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        const projectRows = projects.map((project) => {
            const latestYc = project.ycAnswers[0];
            const answered = latestYc
                ? YC_FIELDS.filter((f) => ((latestYc as any)[f] ?? '').toString().trim().length > 0).length
                : 0;
            const ycCompletionRate = answered / YC_FIELDS.length;

            const reviewScores = project.planReviews
                .map((r) => r.score)
                .filter((s): s is number => typeof s === 'number');
            const planReviewAvgScore = reviewScores.length
                ? reviewScores.reduce((a, b) => a + b, 0) / reviewScores.length
                : null;

            const planReviewCountByKind = KINDS.reduce<Record<string, number>>((acc, k) => {
                acc[k] = project.planReviews.filter((r) => r.kind === k).length;
                return acc;
            }, {});

            const phaseProgress = VIBE_PHASES.map((phase) => {
                const phaseTasks = project.tasks.filter((t) => t.phase === phase);
                return {
                    phase,
                    total: phaseTasks.length,
                    done: phaseTasks.filter((t) => t.status === 'DONE').length,
                };
            });

            return {
                id: project.id,
                name: project.name,
                ycCompletionRate,
                planReviewAvgScore,
                planReviewCountByKind,
                phaseProgress,
            };
        });

        const aggYc =
            projectRows.length > 0
                ? projectRows.reduce((a, r) => a + r.ycCompletionRate, 0) / projectRows.length
                : 0;
        const scoresAll = projectRows
            .map((r) => r.planReviewAvgScore)
            .filter((s): s is number => s != null);
        const aggScore = scoresAll.length
            ? scoresAll.reduce((a, b) => a + b, 0) / scoresAll.length
            : null;

        return {
            projects: projectRows,
            aggregate: {
                ycCompletionRate: aggYc,
                planReviewAvgScore: aggScore,
            },
        };
    }

    // ─── NEW: All project summaries (for dashboard cards) ────────
    async getAllProjectSummaries(userId: string) {
        const projects = await this.prisma.project.findMany({
            where: {
                workspace: {
                    members: {
                        some: { userId },
                    },
                },
            },
            include: {
                tasks: {
                    select: {
                        status: true,
                        phase: true,
                        updatedAt: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return projects.map(project => {
            const total = project.tasks.length;
            const done = project.tasks.filter(t => t.status === 'DONE').length;
            const inProgress = project.tasks.filter(t => t.status === 'IN_PROGRESS').length;
            const review = project.tasks.filter(t => t.status === 'REVIEW').length;
            const todo = project.tasks.filter(t => t.status === 'TODO').length;
            const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

            // Find dominant phase
            let dominantPhase = '';
            if (total > 0) {
                const phaseCounts: Record<string, number> = {};
                project.tasks
                    .filter(t => t.status === 'IN_PROGRESS' && t.phase)
                    .forEach(t => {
                        phaseCounts[t.phase!] = (phaseCounts[t.phase!] || 0) + 1;
                    });
                const entries = Object.entries(phaseCounts);
                if (entries.length > 0) {
                    dominantPhase = entries.sort((a, b) => b[1] - a[1])[0][0];
                }
            }

            const lastActivity = project.tasks.length > 0
                ? project.tasks.reduce((latest, t) => t.updatedAt > latest ? t.updatedAt : latest, project.tasks[0].updatedAt).toISOString()
                : project.createdAt.toISOString();

            const phaseProgress = VIBE_PHASES.map((phase) => {
                const phaseTasks = project.tasks.filter((t) => t.phase === phase);
                return {
                    phase,
                    total: phaseTasks.length,
                    done: phaseTasks.filter((t) => t.status === 'DONE').length,
                };
            });

            return {
                id: project.id,
                name: project.name,
                description: project.description,
                createdAt: project.createdAt,
                taskSummary: {
                    total,
                    todo,
                    inProgress,
                    review,
                    done,
                    completionRate,
                    dominantPhase,
                    lastActivity,
                },
                phaseProgress,
            };
        });
    }
}
