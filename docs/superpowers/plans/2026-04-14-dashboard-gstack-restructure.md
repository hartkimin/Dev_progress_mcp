# Dashboard Phase-Centric Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure both the home dashboard (`/`) and the project dashboard (`/project/[id]`) around the Vibe Coding 5-phase axis (Ideation / Design / Build / QA / Deploy + cross-cutting Overview) and promote gstack Phase 1 surfaces (YC Q&A, Plan Reviews) to first-class navigation.

**Architecture:** 6 top-level navigation groups in `ProjectViewsContainer`, two new tabs (`yc_questions`, `plan_review_hub`), one new analytics endpoint (`/analytics/strategy-readiness`), one additive field (`phaseProgress`) on `/analytics/project-summaries`. All schema-compatible, all API changes append-only. No URL/deep-link breakage (existing tab `key` values preserved; only `category` assignments change).

**Tech Stack:** NestJS + Prisma (API), Next.js 16 App Router + React 19 + Tailwind (web), lucide-react icons, next-auth JWT (auth), Playwright (E2E).

**Spec:** `docs/superpowers/specs/2026-04-14-dashboard-gstack-restructure-design.md`

---

## File Structure

**New files:**
- `web/src/app/project/[id]/planReview/YCQuestionsView.tsx` — thin wrapper making `YCQuestionsCard` renderable as a full-width tab.
- `web/src/app/project/[id]/planReview/PlanReviewHub.tsx` — unified 4-kind view with kind filter, reuses `PlanReviewHistory` internals.
- `web/src/app/components/StrategyReadiness.tsx` — home-dashboard section with cross-project aggregate + top-3 missing YC + recent 5 plan reviews.
- `web/src/app/components/PhaseProgressStrip.tsx` — 5-block mini progress bar rendered inside `ProjectCard`.

**Modified files:**
- `api/src/analytics/analytics.service.ts` — add `getStrategyReadiness(userId)`, extend `getAllProjectSummaries` return shape with `phaseProgress`.
- `api/src/analytics/analytics.controller.ts` — expose `GET /strategy-readiness`.
- `api/src/analytics/analytics.service.spec.ts` (create if missing) — unit tests for new/changed service methods.
- `web/src/lib/db.ts` — add `getStrategyReadiness()` wrapper, extend `ProjectSummary` type with `phase_progress` array.
- `web/src/app/project/[id]/ProjectViewsContainer.tsx` — 6-group `CATEGORIES`, new tab view renderers, per-phase `PlanReviewBadges` header strip.
- `web/src/app/project/[id]/VibePhaseDashboard.tsx` — remove `YCQuestionsCard` rendering (lines around 154) and `PlanReviewBadges` rendering (line ~61).
- `web/src/app/project/[id]/AIContextView.tsx` — remove `PlanReviewHistory` rendering (line ~144) and its import.
- `web/src/app/components/DashboardContent.tsx` — add `<StrategyReadiness/>` section + `<PhaseProgressStrip/>` inside `ProjectCard`.
- `web/src/lib/i18n.tsx` — new keys for nav groups and Strategy Readiness.

**Phase-to-task mapping (Vibe Coding phases already stored in `tasks.phase` as these exact strings):**
- `Ideation & Requirements`
- `Architecture & Design`
- `Implementation`
- `Testing & QA`
- `Deployment & Review`

---

## Task 1: Backend — Strategy Readiness service method

**Files:**
- Modify: `api/src/analytics/analytics.service.ts`
- Test: `api/src/analytics/analytics.service.spec.ts` (create if not present)

- [ ] **Step 1: Write the failing test**

Add to `api/src/analytics/analytics.service.spec.ts` (create file if it doesn't exist — see existing spec file next to `projects.service.ts` for Nest testing pattern, or use the minimal form below):

```ts
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
        ycAnswers: [{ q1: 'a', q2: 'b', q3: 'c', q4: 'd', q5: 'e', q6: '' }], // 5/6
        planReviews: [
          { kind: 'CEO',   score: 8 },
          { kind: 'Eng',   score: 6 },
          { kind: 'Eng',   score: 7 },
        ],
      },
    ]);
    const result = await service.getStrategyReadiness('user-1');
    expect(result.projects[0]).toMatchObject({
      id: 'p1',
      ycCompletionRate: 5 / 6,
      planReviewAvgScore: 7,
      planReviewCountByKind: { CEO: 1, Eng: 2, Design: 0, DevEx: 0 },
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
    expect(result.aggregate.planReviewAvgScore).toBe(7);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd api && npm test -- analytics.service.spec`
Expected: FAIL — `getStrategyReadiness` is not a function.

- [ ] **Step 3: Implement the method**

Append to `api/src/analytics/analytics.service.ts` inside the `AnalyticsService` class:

```ts
async getStrategyReadiness(userId: string) {
    const VIBE_PHASES = [
        'Ideation & Requirements',
        'Architecture & Design',
        'Implementation',
        'Testing & QA',
        'Deployment & Review',
    ] as const;
    const KINDS = ['CEO', 'Eng', 'Design', 'DevEx'] as const;
    const YC_FIELDS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'] as const;

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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd api && npm test -- analytics.service.spec`
Expected: PASS (2 tests green).

- [ ] **Step 5: Commit**

```bash
git add api/src/analytics/analytics.service.ts api/src/analytics/analytics.service.spec.ts
git commit -m "feat(api): add AnalyticsService.getStrategyReadiness"
```

---

## Task 2: Backend — expose `/analytics/strategy-readiness` route

**Files:**
- Modify: `api/src/analytics/analytics.controller.ts`

- [ ] **Step 1: Add controller route**

Edit `api/src/analytics/analytics.controller.ts`, adding a new `@Get` handler after `getAllProjectSummaries`:

```ts
@Get('strategy-readiness')
@ApiOperation({ summary: '현재 사용자의 전략 준비도 (YC + Plan Review 집계)' })
getStrategyReadiness(@GetUser('id') userId: string) {
    return this.analyticsService.getStrategyReadiness(userId);
}
```

- [ ] **Step 2: Rebuild and verify endpoint returns 200 for authed caller**

```bash
docker compose build api && docker compose up -d api
# Get a token by signing in via /auth/signin in the web UI, then from devtools:
# curl http://localhost:3333/api/v1/analytics/strategy-readiness -H "Authorization: Bearer <token>"
```
Expected: 200 with `{ projects: [...], aggregate: {...} }` shape.

- [ ] **Step 3: Commit**

```bash
git add api/src/analytics/analytics.controller.ts
git commit -m "feat(api): GET /analytics/strategy-readiness endpoint"
```

---

## Task 3: Backend — extend project-summaries with `phaseProgress`

**Files:**
- Modify: `api/src/analytics/analytics.service.ts`

- [ ] **Step 1: Write the failing test**

Add to `api/src/analytics/analytics.service.spec.ts`:

```ts
describe('AnalyticsService.getAllProjectSummaries', () => {
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

  it('includes phase_progress per project', async () => {
    prisma.project.findMany.mockResolvedValue([
      {
        id: 'p1',
        name: 'P1',
        createdAt: new Date(),
        tasks: [
          { status: 'DONE',  phase: 'Ideation & Requirements', updatedAt: new Date() },
          { status: 'TODO',  phase: 'Implementation',          updatedAt: new Date() },
        ],
      },
    ]);
    const summaries = await service.getAllProjectSummaries('user-1');
    const ideation = summaries[0].phase_progress.find(
      (p: any) => p.phase === 'Ideation & Requirements',
    );
    expect(ideation).toEqual({
      phase: 'Ideation & Requirements',
      total: 1,
      done: 1,
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd api && npm test -- analytics.service.spec`
Expected: FAIL — `phase_progress` is `undefined`.

- [ ] **Step 3: Extend `getAllProjectSummaries`**

In `api/src/analytics/analytics.service.ts`, inside `getAllProjectSummaries`, find the `return projects.map(project => { ... })` block. Add a phase-progress computation and include it in the returned object:

```ts
// Inside the existing projects.map(...) callback, BEFORE the final `return { ... }`:
const VIBE_PHASES = [
    'Ideation & Requirements',
    'Architecture & Design',
    'Implementation',
    'Testing & QA',
    'Deployment & Review',
] as const;
const phaseProgress = VIBE_PHASES.map((phase) => {
    const phaseTasks = project.tasks.filter((t) => t.phase === phase);
    return {
        phase,
        total: phaseTasks.length,
        done: phaseTasks.filter((t) => t.status === 'DONE').length,
    };
});

// Then add to the existing return object:
// return { id, name, ..., phase_progress: phaseProgress };
```

Add `phase_progress: phaseProgress` as a new field on the returned object (snake_case to match existing return shape convention used in this endpoint's response).

- [ ] **Step 4: Run test to verify it passes**

Run: `cd api && npm test -- analytics.service.spec`
Expected: all existing + new tests PASS.

- [ ] **Step 5: Commit**

```bash
git add api/src/analytics/analytics.service.ts api/src/analytics/analytics.service.spec.ts
git commit -m "feat(api): include phase_progress in project-summaries"
```

---

## Task 4: Web client — db.ts wrappers for new/extended endpoints

**Files:**
- Modify: `web/src/lib/db.ts`

- [ ] **Step 1: Extend `ProjectSummary` interface**

Find the `ProjectSummary` interface in `web/src/lib/db.ts`. Add a `phase_progress` field to `task_summary` or as a top-level field matching the API response. Use top-level field (matches API):

```ts
export interface PhaseProgress {
    phase: string;
    total: number;
    done: number;
}

// In the existing ProjectSummary interface, add:
//   phase_progress?: PhaseProgress[];  // optional to keep old clients happy
```

- [ ] **Step 2: Add `StrategyReadiness` type + fetcher**

Append to `web/src/lib/db.ts`:

```ts
export interface StrategyReadinessProject {
    id: string;
    name: string;
    yc_completion_rate: number;
    plan_review_avg_score: number | null;
    plan_review_count_by_kind: Record<'CEO' | 'Eng' | 'Design' | 'DevEx', number>;
    phase_progress: PhaseProgress[];
}

export interface StrategyReadiness {
    projects: StrategyReadinessProject[];
    aggregate: {
        yc_completion_rate: number;
        plan_review_avg_score: number | null;
    };
}

export async function getStrategyReadiness(): Promise<StrategyReadiness> {
    return await fetchApi('/analytics/strategy-readiness');
}
```

Note: the existing `fetchApi` already runs `toSnake` on responses, so camelCase fields coming from NestJS (`ycCompletionRate`) are automatically translated to snake_case (`yc_completion_rate`) on the client side. The types above declare snake_case to reflect the post-transform shape.

- [ ] **Step 3: Commit**

```bash
git add web/src/lib/db.ts
git commit -m "feat(web): db.ts types + getStrategyReadiness wrapper"
```

---

## Task 5: Web — i18n keys for new nav groups and Strategy Readiness

**Files:**
- Modify: `web/src/lib/i18n.tsx`

- [ ] **Step 1: Add keys**

Inside the translation dictionary in `web/src/lib/i18n.tsx`, add (KR + EN):

```ts
'navGroupOverview':   { en: 'Overview',  ko: '개요' },
'navGroupIdeation':   { en: 'Ideation',  ko: '기획' },
'navGroupDesign':     { en: 'Design',    ko: '설계' },
'navGroupBuild':      { en: 'Build',     ko: '개발' },
'navGroupQa':         { en: 'QA',        ko: '품질' },
'navGroupDeploy':     { en: 'Deploy',    ko: '배포' },
'tabYcQuestions':     { en: 'YC Questions', ko: 'YC 질문' },
'tabPlanReviewHub':   { en: 'Plan Reviews', ko: 'Plan Review' },
'strategyReadinessTitle':    { en: 'Strategy Readiness',   ko: '전략 준비도' },
'ycCompletionLabel':         { en: 'YC completion',        ko: 'YC 완료율' },
'planReviewAvgLabel':        { en: 'Plan review avg',      ko: 'Plan Review 평균' },
'ycMissingTop3Title':        { en: 'Top 3 projects missing YC answers',
                                ko: 'YC 미응답 Top 3' },
'recentPlanReviewsTitle':    { en: 'Recent Plan Reviews',  ko: '최근 Plan Review' },
'startIdeationCta':          { en: 'Start Ideation',       ko: 'Ideation 시작하기' },
```

- [ ] **Step 2: Commit**

```bash
git add web/src/lib/i18n.tsx
git commit -m "feat(web): i18n keys for 6-group nav and strategy readiness"
```

---

## Task 6: Web — remap `ProjectViewsContainer` to 6 groups (pure relocation)

**Files:**
- Modify: `web/src/app/project/[id]/ProjectViewsContainer.tsx`

This task changes categorization only. Views remain identical; we do not add `yc_questions` / `plan_review_hub` yet.

- [ ] **Step 1: Update type + `CATEGORIES`**

Replace the `CategoryKey` type and `CATEGORIES` array at the top of the file:

```ts
type CategoryKey = 'overview' | 'ideation' | 'design' | 'build' | 'qa' | 'deploy';

const CATEGORIES: CategoryConfig[] = [
    { key: 'overview', emoji: '🏠', activeColor: 'bg-slate-500/10 text-slate-700 dark:text-slate-200 shadow-[inset_0_-2px_0_0_#64748b]',  hoverBg: 'hover:text-slate-700 dark:hover:text-slate-200' },
    { key: 'ideation', emoji: '💡', activeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-[inset_0_-2px_0_0_#f59e0b]',  hoverBg: 'hover:text-amber-500 dark:hover:text-amber-400' },
    { key: 'design',   emoji: '🏗️', activeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-[inset_0_-2px_0_0_#10b981]', hoverBg: 'hover:text-emerald-500 dark:hover:text-emerald-400' },
    { key: 'build',    emoji: '🔨', activeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-[inset_0_-2px_0_0_#6366f1]',  hoverBg: 'hover:text-indigo-500 dark:hover:text-indigo-400' },
    { key: 'qa',       emoji: '🧪', activeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-[inset_0_-2px_0_0_#f43f5e]',       hoverBg: 'hover:text-rose-500 dark:hover:text-rose-400' },
    { key: 'deploy',   emoji: '🚀', activeColor: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 shadow-[inset_0_-2px_0_0_#8b5cf6]', hoverBg: 'hover:text-violet-500 dark:hover:text-violet-400' },
];
```

- [ ] **Step 2: Remap `tabs` category assignments**

Replace the `tabs` array inside `ProjectViewsContainer` with:

```ts
const tabs: { key: ViewType; label: string; icon: React.ReactNode; category: CategoryKey }[] = [
    // 🏠 Overview
    { key: 'kanban',        label: t('tabKanban'),       icon: <LayoutDashboard className="w-4 h-4" />, category: 'overview' },
    { key: 'calendar',      label: t('tabCalendar'),     icon: <Calendar className="w-4 h-4" />,        category: 'overview' },
    { key: 'kpi',           label: 'KPI',                icon: <BarChart3 className="w-4 h-4" />,       category: 'overview' },
    { key: 'phase_tracker', label: 'Phases',             icon: <Workflow className="w-4 h-4" />,        category: 'overview' },
    { key: 'ai_context',    label: t('tabAIContext'),    icon: <Brain className="w-4 h-4" />,           category: 'overview' },
    { key: 'decision',      label: t('tabDecision'),     icon: <Lightbulb className="w-4 h-4" />,       category: 'overview' },
    // 💡 Ideation  (Task 7 will add yc_questions + plan_review_hub here)
    // 🏗️ Design
    { key: 'architecture',  label: t('tabArchitecture'), icon: <Box className="w-4 h-4" />,             category: 'design' },
    { key: 'database',      label: t('tabDatabase'),     icon: <Database className="w-4 h-4" />,        category: 'design' },
    { key: 'api_spec',      label: t('tabApiSpec'),      icon: <FileJson className="w-4 h-4" />,        category: 'design' },
    // 🔨 Build
    { key: 'code_review',   label: t('tabCodeReview'),   icon: <GitPullRequest className="w-4 h-4" />,  category: 'build' },
    { key: 'environment',   label: t('tabEnvironment'),  icon: <Server className="w-4 h-4" />,          category: 'build' },
    // 🧪 QA
    { key: 'test',          label: t('tabTest'),         icon: <TestTube2 className="w-4 h-4" />,       category: 'qa' },
    { key: 'issue_tracker', label: t('tabIssueTracker'), icon: <Bug className="w-4 h-4" />,             category: 'qa' },
    // 🚀 Deploy
    { key: 'deploy',        label: t('tabDeploy'),       icon: <Rocket className="w-4 h-4" />,          category: 'deploy' },
    { key: 'changelog',     label: t('tabChangelog'),    icon: <FileText className="w-4 h-4" />,        category: 'deploy' },
];
```

- [ ] **Step 3: Update group label i18n lookup**

Find the `title={t(\`cat${cat.key.charAt(0).toUpperCase() + cat.key.slice(1)}\`)}` expression and replace it with the new `navGroup*` keys:

```tsx
<span
    className="text-xs px-1 shrink-0 select-none"
    title={t(`navGroup${cat.key.charAt(0).toUpperCase() + cat.key.slice(1)}`)}
>
    {cat.emoji}
</span>
```

- [ ] **Step 4: Change default view to keep existing entry-point UX**

`useState<ViewType>('kanban')` — leave as-is. Kanban is in Overview group now, so the default entry still works.

- [ ] **Step 5: Rebuild web and smoke-test each group tab renders**

```bash
docker compose build web && docker compose up -d web
```

Manually or via Playwright: open a project, click each group's representative tab, assert no blank view.

- [ ] **Step 6: Commit**

```bash
git add web/src/app/project/[id]/ProjectViewsContainer.tsx
git commit -m "feat(web): 6-group phase-centric project dashboard nav"
```

---

## Task 7: Web — extract `YCQuestionsView` tab component

**Files:**
- Create: `web/src/app/project/[id]/planReview/YCQuestionsView.tsx`

- [ ] **Step 1: Create the view wrapper**

```tsx
'use client';

import YCQuestionsCard from './YCQuestionsCard';

export default function YCQuestionsView({ projectId }: { projectId: string }) {
    return (
        <div className="max-w-4xl mx-auto">
            <YCQuestionsCard projectId={projectId} />
        </div>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/app/project/[id]/planReview/YCQuestionsView.tsx
git commit -m "feat(web): YCQuestionsView tab wrapper"
```

---

## Task 8: Web — build `PlanReviewHub` with kind filter

**Files:**
- Create: `web/src/app/project/[id]/planReview/PlanReviewHub.tsx`
- Read (for reference): `web/src/app/project/[id]/planReview/PlanReviewHistory.tsx`

- [ ] **Step 1: Inspect PlanReviewHistory shape**

Open `PlanReviewHistory.tsx` to confirm the props it accepts (`projectId: string`) and internal data-fetching hook or server action used. The hub will wrap it and pass down a `kindFilter` prop. If `PlanReviewHistory` does not accept a filter prop, the hub filters client-side after the component exposes data via a render-prop OR we copy the fetch logic into the hub.

- [ ] **Step 2: Create the hub component**

```tsx
'use client';

import { useState } from 'react';
import PlanReviewHistory from './PlanReviewHistory';

type Kind = 'all' | 'CEO' | 'Eng' | 'Design' | 'DevEx';

const KIND_BUTTONS: { key: Kind; label: string }[] = [
    { key: 'all',    label: 'All' },
    { key: 'CEO',    label: 'CEO' },
    { key: 'Eng',    label: 'Eng' },
    { key: 'Design', label: 'Design' },
    { key: 'DevEx',  label: 'DevEx' },
];

export default function PlanReviewHub({ projectId }: { projectId: string }) {
    const [kind, setKind] = useState<Kind>('all');
    return (
        <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                {KIND_BUTTONS.map((b) => (
                    <button
                        key={b.key}
                        onClick={() => setKind(b.key)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            kind === b.key
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        {b.label}
                    </button>
                ))}
            </div>
            <PlanReviewHistory
                projectId={projectId}
                kindFilter={kind === 'all' ? undefined : kind}
            />
        </div>
    );
}
```

- [ ] **Step 3: Add `kindFilter` prop to `PlanReviewHistory`**

Edit `web/src/app/project/[id]/planReview/PlanReviewHistory.tsx` to accept an optional `kindFilter?: 'CEO' | 'Eng' | 'Design' | 'DevEx'` prop. Filter the list it renders by `review.kind === kindFilter` when set. Default behavior (no prop) is unchanged — backwards compatible.

- [ ] **Step 4: Commit**

```bash
git add web/src/app/project/[id]/planReview/PlanReviewHub.tsx web/src/app/project/[id]/planReview/PlanReviewHistory.tsx
git commit -m "feat(web): PlanReviewHub with kind filter"
```

---

## Task 9: Web — wire new tabs into `ProjectViewsContainer`

**Files:**
- Modify: `web/src/app/project/[id]/ProjectViewsContainer.tsx`

- [ ] **Step 1: Extend `ViewType` union**

```ts
type ViewType =
    | 'kanban' | 'calendar' | 'issue_tracker' | 'kpi' | 'phase_tracker'
    | 'yc_questions' | 'plan_review_hub'
    | 'architecture' | 'database' | 'api_spec'
    | 'code_review' | 'test' | 'environment' | 'deploy'
    | 'ai_context' | 'decision' | 'changelog';
```

- [ ] **Step 2: Add imports**

```ts
import YCQuestionsView from './planReview/YCQuestionsView';
import PlanReviewHub from './planReview/PlanReviewHub';
import { Sparkles, ClipboardList } from 'lucide-react';
```

- [ ] **Step 3: Insert Ideation tabs into the `tabs` array**

Insert before the Design section:

```ts
// 💡 Ideation
{ key: 'yc_questions',    label: t('tabYcQuestions'),   icon: <Sparkles className="w-4 h-4" />,      category: 'ideation' },
{ key: 'plan_review_hub', label: t('tabPlanReviewHub'), icon: <ClipboardList className="w-4 h-4" />, category: 'ideation' },
```

- [ ] **Step 4: Add render cases**

Before the Design `view === 'architecture'` block:

```tsx
{/* 💡 Ideation */}
{view === 'yc_questions' && (
    <YCQuestionsView projectId={projectId} />
)}
{view === 'plan_review_hub' && (
    <PlanReviewHub projectId={projectId} />
)}
```

- [ ] **Step 5: Rebuild web and verify tab clicks render correct views**

```bash
docker compose build web && docker compose up -d web
```

Open a project → click Ideation → YC 질문 renders YC form, Plan Review renders filter buttons + history.

- [ ] **Step 6: Commit**

```bash
git add web/src/app/project/[id]/ProjectViewsContainer.tsx
git commit -m "feat(web): Ideation group with YC Questions + Plan Review Hub tabs"
```

---

## Task 10: Web — shrink `VibePhaseDashboard`

**Files:**
- Modify: `web/src/app/project/[id]/VibePhaseDashboard.tsx`

After Task 9, YC/Plan Review live in their own tabs. Remove the embedded cards from the phase dashboard so there is no duplication.

- [ ] **Step 1: Remove `YCQuestionsCard` rendering**

Find `{idx === 0 && <YCQuestionsCard projectId={projectId} />}` (around line 154) and delete the line.

- [ ] **Step 2: Remove the import**

Delete `import YCQuestionsCard from './planReview/YCQuestionsCard';` at line 7.

- [ ] **Step 3: Leave `PlanReviewBadges` as-is for now**

The badges will be relocated in Task 12. Keep the current rendering at line ~61 intact until then, to avoid a broken intermediate state.

- [ ] **Step 4: Rebuild and verify Phases tab still renders without errors, no YC card appears inline**

```bash
docker compose build web && docker compose up -d web
```

- [ ] **Step 5: Commit**

```bash
git add web/src/app/project/[id]/VibePhaseDashboard.tsx
git commit -m "refactor(web): remove embedded YCQuestionsCard from VibePhaseDashboard"
```

---

## Task 11: Web — shrink `AIContextView`

**Files:**
- Modify: `web/src/app/project/[id]/AIContextView.tsx`

- [ ] **Step 1: Remove `PlanReviewHistory` rendering**

Find `<PlanReviewHistory projectId={projectId} />` (around line 144) and delete it, along with any wrapping section heading that becomes empty as a result.

- [ ] **Step 2: Remove the import**

Delete `import PlanReviewHistory from './planReview/PlanReviewHistory';` at line 8.

- [ ] **Step 3: Rebuild and verify AI 컨텍스트 tab renders without PlanReview section**

```bash
docker compose build web && docker compose up -d web
```

- [ ] **Step 4: Commit**

```bash
git add web/src/app/project/[id]/AIContextView.tsx
git commit -m "refactor(web): remove embedded PlanReviewHistory from AIContextView"
```

---

## Task 12: Web — per-phase `PlanReviewBadges` header strip

**Files:**
- Modify: `web/src/app/project/[id]/ProjectViewsContainer.tsx`
- Modify: `web/src/app/project/[id]/VibePhaseDashboard.tsx` (remove the now-duplicated badge render)
- Modify: `web/src/app/project/[id]/planReview/PlanReviewBadges.tsx` (add kinds-filter prop)

- [ ] **Step 1: Add `kinds` prop to `PlanReviewBadges`**

Edit `PlanReviewBadges.tsx` to accept an optional `kinds?: Array<'CEO' | 'Eng' | 'Design' | 'DevEx'>`. When provided, the component renders only the badges whose `kind` is in the list (or shows all relevant ones, keeping the visual identical if the list matches what was rendered before).

- [ ] **Step 2: Render the header strip above the active view in `ProjectViewsContainer`**

Above the existing conditional view renderers, insert:

```tsx
{activeCategory === 'ideation' && (
    <PlanReviewBadges projectId={projectId} kinds={['CEO', 'Design']} />
)}
{activeCategory === 'design' && (
    <PlanReviewBadges projectId={projectId} kinds={['Eng', 'Design']} />
)}
{activeCategory === 'deploy' && (
    <PlanReviewBadges projectId={projectId} kinds={['DevEx']} />
)}
```

Add `import PlanReviewBadges from './planReview/PlanReviewBadges';` near the other imports.

- [ ] **Step 3: Remove the duplicate render in `VibePhaseDashboard`**

Delete `<PlanReviewBadges projectId={projectId} />` (around line 61) and its `import` at line 8.

- [ ] **Step 4: Rebuild and verify badges appear above Ideation/Design/Deploy views and not Overview/Build/QA**

```bash
docker compose build web && docker compose up -d web
```

- [ ] **Step 5: Commit**

```bash
git add web/src/app/project/[id]/ProjectViewsContainer.tsx web/src/app/project/[id]/VibePhaseDashboard.tsx web/src/app/project/[id]/planReview/PlanReviewBadges.tsx
git commit -m "feat(web): per-phase PlanReviewBadges header strip"
```

---

## Task 13: Web — `StrategyReadiness` home section

**Files:**
- Create: `web/src/app/components/StrategyReadiness.tsx`
- Modify: `web/src/app/page.tsx` — fetch data and pass down.
- Modify: `web/src/app/components/DashboardContent.tsx` — render the section between `VibeAlertPanel` and `Active Projects`.

- [ ] **Step 1: Create component**

```tsx
'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import type { StrategyReadiness } from '@/lib/db';

export default function StrategyReadinessSection({ data }: { data: StrategyReadiness | null }) {
    const { t } = useTranslation();
    if (!data) return null;

    const avgScore = data.aggregate.plan_review_avg_score;
    const ycPct = Math.round(data.aggregate.yc_completion_rate * 100);

    const missingYcTop3 = [...data.projects]
        .sort((a, b) => a.yc_completion_rate - b.yc_completion_rate)
        .slice(0, 3)
        .filter(p => p.yc_completion_rate < 1);

    return (
        <div className="mb-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm p-6 shadow-sm">
            <div className="flex flex-wrap items-baseline gap-4 mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {t('strategyReadinessTitle')}
                </h3>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                    {t('ycCompletionLabel')}: <b>{ycPct}%</b>
                    {' · '}
                    {t('planReviewAvgLabel')}: <b>{avgScore != null ? avgScore.toFixed(1) : '-'}</b>
                </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                    <h4 className="text-sm font-semibold mb-2 text-slate-800 dark:text-slate-200">
                        {t('ycMissingTop3Title')}
                    </h4>
                    {missingYcTop3.length === 0 ? (
                        <p className="text-xs text-slate-400">—</p>
                    ) : (
                        <ul className="space-y-2">
                            {missingYcTop3.map(p => (
                                <li key={p.id} className="flex items-center justify-between text-sm">
                                    <span className="truncate pr-2">{p.name}</span>
                                    <Link
                                        href={`/project/${p.id}?view=yc_questions`}
                                        className="shrink-0 text-xs font-medium text-indigo-600 hover:text-indigo-500"
                                    >
                                        {t('startIdeationCta')} →
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                    <h4 className="text-sm font-semibold mb-2 text-slate-800 dark:text-slate-200">
                        {t('recentPlanReviewsTitle')}
                    </h4>
                    {/* Recent reviews — rendered per project with non-zero review counts */}
                    <ul className="space-y-1">
                        {data.projects
                            .filter(p => Object.values(p.plan_review_count_by_kind).some(c => c > 0))
                            .slice(0, 5)
                            .map(p => {
                                const total = Object.values(p.plan_review_count_by_kind).reduce((a,b)=>a+b,0);
                                return (
                                    <li key={p.id} className="flex items-center justify-between text-sm">
                                        <Link
                                            href={`/project/${p.id}?view=plan_review_hub`}
                                            className="truncate pr-2 hover:text-indigo-600"
                                        >
                                            {p.name}
                                        </Link>
                                        <span className="shrink-0 text-xs text-slate-500">
                                            {total} reviews{p.plan_review_avg_score != null ? ` · ${p.plan_review_avg_score.toFixed(1)}/10` : ''}
                                        </span>
                                    </li>
                                );
                            })}
                    </ul>
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Fetch the data in `page.tsx`**

Edit `web/src/app/page.tsx`:

```tsx
import { getAllProjectSummaries, getStrategyReadiness, ProjectSummary, StrategyReadiness } from '@/lib/db';
// ...
let projectSummaries: ProjectSummary[] = [];
let strategyReadiness: StrategyReadiness | null = null;
try {
    projectSummaries = await getAllProjectSummaries();
} catch (e) { console.error('Failed to fetch project summaries:', e); }
try {
    strategyReadiness = await getStrategyReadiness();
} catch (e) { console.error('Failed to fetch strategy readiness:', e); }
// ...
<DashboardContent projectSummaries={projectSummaries} strategyReadiness={strategyReadiness} />
```

- [ ] **Step 3: Render in `DashboardContent`**

Add `strategyReadiness` prop to the component signature, and render `<StrategyReadinessSection data={strategyReadiness} />` between `<VibeAlertPanel />` and the project-count/Create Project header.

- [ ] **Step 4: Rebuild and verify the section appears on home with aggregate numbers and two sub-cards**

```bash
docker compose build web && docker compose up -d web
```

- [ ] **Step 5: Commit**

```bash
git add web/src/app/components/StrategyReadiness.tsx web/src/app/page.tsx web/src/app/components/DashboardContent.tsx
git commit -m "feat(web): Strategy Readiness section on home dashboard"
```

---

## Task 14: Web — `PhaseProgressStrip` on `ProjectCard`

**Files:**
- Create: `web/src/app/components/PhaseProgressStrip.tsx`
- Modify: `web/src/app/components/DashboardContent.tsx` — include strip inside `ProjectCard`.

- [ ] **Step 1: Create the strip component**

```tsx
import type { PhaseProgress } from '@/lib/db';

const PHASE_LABELS: Record<string, string> = {
    'Ideation & Requirements': '💡',
    'Architecture & Design':   '🏗️',
    'Implementation':          '🔨',
    'Testing & QA':            '🧪',
    'Deployment & Review':     '🚀',
};

export default function PhaseProgressStrip({ phases }: { phases?: PhaseProgress[] }) {
    if (!phases || phases.length === 0) return null;
    return (
        <div className="flex items-stretch gap-1 h-5" aria-label="Phase progress">
            {phases.map((p) => {
                const pct = p.total > 0 ? Math.round((p.done / p.total) * 100) : 0;
                return (
                    <div
                        key={p.phase}
                        title={`${PHASE_LABELS[p.phase] ?? ''} ${p.phase}: ${p.done}/${p.total}`}
                        className="flex-1 rounded bg-slate-100 dark:bg-slate-800 overflow-hidden"
                    >
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all"
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                );
            })}
        </div>
    );
}
```

- [ ] **Step 2: Render strip inside `ProjectCard`**

Inside `web/src/app/components/DashboardContent.tsx`, `ProjectCard` function, add after the Status Breakdown block:

```tsx
{project.phase_progress && project.phase_progress.length > 0 && (
    <div className="mb-4">
        <PhaseProgressStrip phases={project.phase_progress} />
    </div>
)}
```

Add `import PhaseProgressStrip from './PhaseProgressStrip';` at the top.

- [ ] **Step 3: Rebuild and verify cards render a 5-segment strip when tasks exist, and render nothing when tasks do not exist**

```bash
docker compose build web && docker compose up -d web
```

- [ ] **Step 4: Commit**

```bash
git add web/src/app/components/PhaseProgressStrip.tsx web/src/app/components/DashboardContent.tsx
git commit -m "feat(web): phase progress strip on ProjectCard"
```

---

## Task 15: Playwright E2E — one happy-path per group + deep-link from home

**Files:**
- Create: `web/tests/e2e/dashboard-groups.spec.ts` (Playwright project under `web` if it does not already exist; otherwise colocate with existing E2E tests).

- [ ] **Step 1: Write E2E test**

```ts
import { test, expect } from '@playwright/test';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3002';

test('6-group project dashboard — one tab per group renders', async ({ page, context }) => {
    // Assumes Dev login is enabled and a project exists.
    await page.goto(`${BASE}/auth/signin`);
    await page.getByPlaceholder('dev@local').fill('dev@local');
    await page.getByRole('button', { name: /Sign in \(Dev/ }).click();
    await page.waitForURL(`${BASE}/`);

    // Create a test project to operate on
    await page.getByRole('button', { name: 'Create Project' }).click();
    await page.getByPlaceholder('예: SafeTrip Mobile App').fill('E2E Project');
    await page.getByRole('button', { name: '생성' }).click();
    await page.waitForURL(/\/project\//);

    for (const label of ['칸반보드', 'YC 질문', '아키텍처', '코드 리뷰', '테스트', '배포']) {
        await page.getByRole('button', { name: label }).first().click();
        await expect(page.getByRole('main')).not.toBeEmpty();
    }
});

test('home strategy readiness deep-links to plan_review_hub', async ({ page }) => {
    await page.goto(`${BASE}/auth/signin`);
    await page.getByPlaceholder('dev@local').fill('dev@local');
    await page.getByRole('button', { name: /Sign in \(Dev/ }).click();
    await page.waitForURL(`${BASE}/`);

    const link = page.getByRole('link', { name: /Ideation 시작하기|plan_review_hub/ }).first();
    if (await link.count()) {
        await link.click();
        await expect(page).toHaveURL(/view=(yc_questions|plan_review_hub)/);
    }
});
```

- [ ] **Step 2: Run Playwright**

```bash
cd web && npx playwright test tests/e2e/dashboard-groups.spec.ts
```

Expected: both tests PASS.

- [ ] **Step 3: Commit**

```bash
git add web/tests/e2e/dashboard-groups.spec.ts
git commit -m "test(web): e2e for 6-group dashboard + strategy deep-link"
```

---

## Final verification

- [ ] Run full API test suite: `cd api && npm test`
- [ ] Run full web lint+build: `cd web && npm run lint && npm run build`
- [ ] Smoke-test in browser: sign in, visit home, see Strategy Readiness section + phase strip on cards, click a project, navigate through all 6 groups, confirm gstack tabs reachable at one click from Ideation.
- [ ] Push and open PR.
