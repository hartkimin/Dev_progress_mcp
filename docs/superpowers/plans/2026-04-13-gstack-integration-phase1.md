# gstack Integration Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate gstack (Garry Tan) Plan/Strategy skills into VibePlanner as both dev workflow scaffolding (AGENTS.md + checklists) and product feature (Prisma models, NestJS modules, MCP tools, Web UI components), without modifying existing APIs or schemas.

**Architecture:** 3-tier append-only. (1) Prisma schema grows by 2 new models; (2) NestJS `api/` gains 2 new modules wired into `app.module.ts`; (3) MCP server `src/` gets 5 new tools that call the REST API over HTTP; (4) Next.js `web/` gets 3 new components + 1 Server Actions file inside existing Phase 1 dashboard.

**Tech Stack:** TypeScript, NestJS 10, Prisma (Postgres), Next.js 15 App Router, MCP SDK, `class-validator`, Docker Compose.

**Spec:** `docs/superpowers/specs/2026-04-13-gstack-integration-design.md`

---

## Pre-flight: Environment & Branch

- [ ] **Step 0.1: Verify clean working tree**

```bash
cd D:/Project/16_VibePlanner && git status
```
Expected: `working tree clean` or only uncommitted plan file.

- [ ] **Step 0.2: Create feature branch**

```bash
git checkout -b feat/gstack-phase1
```

- [ ] **Step 0.3: Verify services can start (baseline)**

```bash
cd api && npm run build && cd ../web && npm run build && cd ..
npm run build
```
Expected: all three build green. If any fail, fix baseline before continuing.

---

## Task 1: Workflow Scaffolding — AGENTS.md

**Files:**
- Create: `AGENTS.md`

- [ ] **Step 1.1: Create AGENTS.md**

Write file with sections: header, OWNER_RULES, GOTCHAS, SUBAGENT_PROTOCOL (6 items), gstack skill routing table, orchestration patterns (A/B/D adopted, C conditional, E/F excluded).

```markdown
# AGENTS.md — VibePlanner

Solo developer. Orchestra Protocol patterns A/B/D adopted; C conditional; E/F excluded.

## OWNER_RULES
- `src/index.ts`: append-only. New MCP tools go at end of file.
- `src/db.ts`: append new HTTP wrapper functions; do not modify existing exports.
- `api/prisma/schema.prisma`: append new models only. No ALTER on existing models.
- `api/src/app.module.ts`: append to `imports` array; do not reorder.
- `web/src/app/project/[id]/planReview/`: new components live here.
- `web/src/app/actions/planReviewActions.ts`: new Server Actions.
- `docs/plan-reviews/results/<project_id>/`: MD snapshots of reviews.

## GOTCHAS
- Postgres: add new models, never ALTER existing columns.
- i18n (`web/src/lib/i18n.tsx`): add KR and EN in the same commit.
- 14-tab navigation unchanged; no new tab.
- MD output path uses `PLAN_REVIEW_DIR` env (default `api/data/plan-reviews/results`).
- NestJS global `JwtAuthGuard` is active; new controllers inherit auth unless `@Public()`.
- Prisma migrations must be additive (`prisma migrate dev --name ...`) with a separate migration file per spec.

## SUBAGENT_PROTOCOL (6 items)
1. Read prior `.agents/briefs/` reports before starting.
2. Verify schema/contract/endpoint names by Grep/Read (no guessing).
3. Append-only contract: never change existing export signatures.
4. Write completion report to `.agents/briefs/<agent-name>.md`.
5. After 2+ parallel agents, spawn Reviewer (pattern D) read-only audit.
6. Record which gstack skills were invoked in the completion report.

## gstack Skill Routing (Phase 1)
| Skill | When |
|-------|------|
| `/brainstorming` | Before any non-trivial feature |
| `/office-hours` | Ideation Phase 1 (YC 6Q) |
| `/plan-ceo-review` | After spec draft |
| `/plan-eng-review` | After spec draft, before plan |
| `/plan-design-review` | UI-touching specs |
| `/plan-devex-review` | Before release |
| `/writing-plans` | After 4 reviews approved |
| `/executing-plans` or subagent-driven | During implementation |
| `/qa` | Day 11 E2E gate |
| `/design-review` | Day 12 UI audit |

## Orchestration Patterns
- **A (Simple parallel)**: 2+ independent files, dispatch parallel Opus agents.
- **B (Lead + parallel)**: Shared dependency change (e.g., new MCP tool affecting both api and web). Lead agent lands core, then fan out.
- **D (Reviewer audit)**: After any 2+ parallel agents, spawn read-only Reviewer to audit.
- **C (Cross-stack)**: Only when both MCP (TS) and Web (Next.js) touched in same sprint.
- **E/F**: Not used at solo scale.
```

- [ ] **Step 1.2: Commit**

```bash
git add AGENTS.md
git commit -m "docs: add AGENTS.md orchestration contract for solo workflow"
```

---

## Task 2: Workflow Scaffolding — MODEL_ROUTING.md

**Files:**
- Create: `MODEL_ROUTING.md`

- [ ] **Step 2.1: Create MODEL_ROUTING.md**

```markdown
# MODEL_ROUTING.md — VibePlanner

## Default tier
- **Sonnet (4.6)**: Drafting, code edits, reviews, day-to-day implementation.
- **Opus (4.6, 1M context)**: Architecture decisions, multi-file refactors, cross-layer reasoning (MCP↔API↔Web), spec writing, plan writing.
- **Haiku (4.5)**: Mechanical substitutions (i18n bulk add, path renames, import sorts). Use with explicit find/replace map.

## Decision rules
| Task trait | Model |
|------------|-------|
| Touches ≥3 files across api/ + web/ + src/ | Opus |
| Single file, straightforward CRUD | Sonnet |
| Pure text find/replace with explicit map | Haiku |
| New Prisma model or new NestJS module | Opus (plan), Sonnet (impl) |
| i18n KR/EN pair addition | Haiku |
| Plan review checklist application | Sonnet |
| QA / E2E investigation | Opus |

## Subagent dispatch
- Pattern A (parallel): each agent on Sonnet unless task is Opus-tier above.
- Pattern D (Reviewer): Opus (independent judgment).

## Evidence
Record actual model used in `.agents/briefs/<agent>.md` so routing can be tuned.
```

- [ ] **Step 2.2: Commit**

```bash
git add MODEL_ROUTING.md
git commit -m "docs: add MODEL_ROUTING.md for solo model tier selection"
```

---

## Task 3: Workflow Scaffolding — Kanban Board + Briefs Dir

**Files:**
- Create: `docs/vibe-kanban-board.md`
- Create: `.agents/briefs/README.md`
- Modify: `.gitignore` (if needed — keep briefs tracked)

- [ ] **Step 3.1: Create board**

```markdown
# VibePlanner Vibe Kanban Board

Solo, 3-column. Reviewer (pattern D) recommendations auto-migrate to Todo.

## Todo
- (empty)

## In Progress
- gstack Phase 1 Implementation (plan: docs/superpowers/plans/2026-04-13-gstack-integration-phase1.md)

## Done
- gstack Phase 1 Spec (commit 1ffbfb6)
```

- [ ] **Step 3.2: Create briefs directory**

```bash
mkdir -p .agents/briefs
```

Write `.agents/briefs/README.md`:
```markdown
# Subagent Completion Briefs

Each subagent dispatched per SUBAGENT_PROTOCOL writes a report here: `<agent-name>-<YYYYMMDD-HHMM>.md`.

## Format
- **Task:** what was requested
- **Files changed:** list with paths
- **Evidence used:** grep/read confirmations
- **Skills invoked:** gstack skills called
- **Handoff notes:** anything the next agent should know
```

- [ ] **Step 3.3: Commit**

```bash
git add docs/vibe-kanban-board.md .agents/briefs/README.md
git commit -m "docs: add vibe-kanban board and agent briefs scaffolding"
```

---

## Task 4: Plan Review Templates (4 MD files)

**Files:**
- Create: `docs/plan-reviews/templates/ceo-review.md`
- Create: `docs/plan-reviews/templates/eng-review.md`
- Create: `docs/plan-reviews/templates/design-review.md`
- Create: `docs/plan-reviews/templates/devex-review.md`

- [ ] **Step 4.1: Write ceo-review.md**

```markdown
---
kind: ceo
project_id: <uuid>
spec: docs/superpowers/specs/<spec-file>.md
reviewer: solo
date: YYYY-MM-DD
score: 0-10
decision: accept|revise|reject
---

## 1. Core Questions
1. Is this on the path to a 10-star product?
2. Would scope expansion make a better product? (Be honest: would it, or is it noise?)
3. What is the narrowest wedge that still delivers the core value?
4. What is actually broken about the status quo? Be specific.
5. Demand reality check — who has asked for this, and how many?
6. Future-fit — will this decision still be correct in 12 months?

## 2. Evidence
- File paths / commit hashes / screenshots supporting each answer.

## 3. What would make this a 10?
- Concrete changes to the spec to raise the bar.

## 4. Decision
- [ ] accept
- [ ] revise (spec must be updated; re-review required)
- [ ] reject
Reason:

## 5. Todo migration (docs/vibe-kanban-board.md)
- New Todo items derived from this review.
```

- [ ] **Step 4.2: Write eng-review.md**

```markdown
---
kind: eng
project_id: <uuid>
spec: docs/superpowers/specs/<spec-file>.md
reviewer: solo
date: YYYY-MM-DD
score: 0-10
decision: accept|revise|reject
---

## 1. Core Questions
1. Append-only contract preserved on `src/index.ts`, `src/db.ts`, existing Prisma models?
2. Schema changes additive only (new tables/columns with defaults)?
3. Edge cases: null project, empty payload, i18n key missing, auth disabled path?
4. How is this verified? (Manual QA scenario + any automated test)
5. 14-tab load time impact — any regression?

## 2. Evidence
- Grep confirmations of no signature changes.
- Prisma `migrate diff` output.

## 3. What would make this a 10?

## 4. Decision + Reason

## 5. Todo migration
```

- [ ] **Step 4.3: Write design-review.md**

```markdown
---
kind: design
project_id: <uuid>
spec: docs/superpowers/specs/<spec-file>.md
reviewer: solo
date: YYYY-MM-DD
score: 0-10
decision: accept|revise|reject
---

## 1. Core Questions
1. Visual hierarchy — does the new section conflict with existing 14-tab layout?
2. Tokens — does it render correctly in both dark and light mode?
3. AI slop check — no gratuitous gradients, meaningless icons, or filler?
4. Accessibility — WCAG 2.1 AA (keyboard nav, contrast ratio)?
5. i18n — KR and EN copy reads naturally?

## 2. Evidence
- Screenshots (dark/light, KR/EN).
- Axe or similar a11y check results.

## 3. What would make this a 10?

## 4. Decision + Reason

## 5. Todo migration
```

- [ ] **Step 4.4: Write devex-review.md**

```markdown
---
kind: devex
project_id: <uuid>
spec: docs/superpowers/specs/<spec-file>.md
reviewer: solo
date: YYYY-MM-DD
score: 0-10
decision: accept|revise|reject
---

## 1. Core Questions
1. Can I resume this in a fresh session just by reading AGENTS.md + the latest brief?
2. Are MCP tool names discoverable and intuitive to an AI agent caller?
3. Does AGENTS.md restore enough context for a cold start?
4. Are error messages and logs useful in production?

## 2. Evidence

## 3. What would make this a 10?

## 4. Decision + Reason

## 5. Todo migration
```

- [ ] **Step 4.5: Commit**

```bash
git add docs/plan-reviews/templates/
git commit -m "docs: add 4 plan-review checklist templates (ceo/eng/design/devex)"
```

---

## Task 5: Prisma Schema — Add PlanReview & YcAnswer

**Files:**
- Modify: `api/prisma/schema.prisma` (append at end + add back-relations to Project)
- Create: `api/prisma/migrations/<timestamp>_add_plan_reviews_and_yc_answers/migration.sql` (generated)

- [ ] **Step 5.1: Verify baseline Prisma state**

```bash
cd api && npx prisma migrate status
```
Expected: `Database schema is up to date!` or a clean baseline. If migrations are pending locally, resolve before continuing.

- [ ] **Step 5.2: Add back-relations to existing Project model**

In `api/prisma/schema.prisma`, find the `Project` model and append two fields inside the model (just before `@@map("projects")`):

```prisma
  planReviews             PlanReview[]
  ycAnswers               YcAnswer[]
```

Do not change any existing field in `Project`.

- [ ] **Step 5.3: Append new models**

Append at the end of `api/prisma/schema.prisma`:

```prisma
model PlanReview {
  id        String   @id @default(uuid())
  projectId String   @map("project_id")
  kind      String   // 'ceo' | 'eng' | 'design' | 'devex'
  specPath  String?  @map("spec_path")
  mdPath    String?  @map("md_path")
  score     Int?
  decision  String?  // 'accept' | 'revise' | 'reject'
  payload   Json
  reviewer  String   @default("solo")
  createdAt DateTime @default(now()) @map("created_at")

  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId, kind, createdAt])
  @@map("plan_reviews")
}

model YcAnswer {
  id            String   @id @default(uuid())
  projectId     String   @map("project_id")
  q1Demand      String?  @map("q1_demand")
  q2StatusQuo   String?  @map("q2_status_quo")
  q3Specific    String?  @map("q3_specific")
  q4Wedge       String?  @map("q4_wedge")
  q5Observation String?  @map("q5_observation")
  q6FutureFit   String?  @map("q6_future_fit")
  createdAt     DateTime @default(now()) @map("created_at")

  project       Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId, createdAt])
  @@map("yc_answers")
}
```

- [ ] **Step 5.4: Generate migration**

```bash
cd api && npx prisma migrate dev --name add_plan_reviews_and_yc_answers
```
Expected: new folder `api/prisma/migrations/<ts>_add_plan_reviews_and_yc_answers/` with `migration.sql`. Prisma client regenerated.

- [ ] **Step 5.5: Verify generated SQL is additive**

```bash
cat api/prisma/migrations/*_add_plan_reviews_and_yc_answers/migration.sql
```
Expected: only `CREATE TABLE "plan_reviews"`, `CREATE TABLE "yc_answers"`, `CREATE INDEX`, and `ALTER TABLE ... ADD CONSTRAINT` (FK). No DROP, no column changes on existing tables.

- [ ] **Step 5.6: Commit**

```bash
git add api/prisma/schema.prisma api/prisma/migrations/
git commit -m "feat(db): add PlanReview and YcAnswer Prisma models with additive migration"
```

---

## Task 6: NestJS `yc-answers` Module

**Files:**
- Create: `api/src/yc-answers/yc-answers.module.ts`
- Create: `api/src/yc-answers/yc-answers.controller.ts`
- Create: `api/src/yc-answers/yc-answers.service.ts`
- Create: `api/src/yc-answers/dto/create-yc-answer.dto.ts`
- Modify: `api/src/app.module.ts` (append import + entry in `imports` array)

- [ ] **Step 6.1: Write DTO**

`api/src/yc-answers/dto/create-yc-answer.dto.ts`:
```ts
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateYcAnswerDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(4000) q1Demand?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(4000) q2StatusQuo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(4000) q3Specific?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(4000) q4Wedge?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(4000) q5Observation?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(4000) q6FutureFit?: string;
}
```

- [ ] **Step 6.2: Write service**

`api/src/yc-answers/yc-answers.service.ts`:
```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateYcAnswerDto } from './dto/create-yc-answer.dto';

@Injectable()
export class YcAnswersService {
  constructor(private prisma: PrismaService) {}

  async create(projectId: string, dto: CreateYcAnswerDto) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException(`Project ${projectId} not found`);
    return this.prisma.ycAnswer.create({ data: { projectId, ...dto } });
  }

  async findLatest(projectId: string) {
    return this.prisma.ycAnswer.findFirst({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
```

- [ ] **Step 6.3: Write controller**

`api/src/yc-answers/yc-answers.controller.ts`:
```ts
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { YcAnswersService } from './yc-answers.service';
import { CreateYcAnswerDto } from './dto/create-yc-answer.dto';

@ApiTags('yc-answers')
@ApiBearerAuth()
@Controller('projects/:projectId/yc-answers')
export class YcAnswersController {
  constructor(private readonly service: YcAnswersService) {}

  @Post()
  @ApiOperation({ summary: 'YC 6-Question 응답 저장' })
  create(@Param('projectId') projectId: string, @Body() dto: CreateYcAnswerDto) {
    return this.service.create(projectId, dto);
  }

  @Get('latest')
  @ApiOperation({ summary: '최신 YC 응답 조회' })
  findLatest(@Param('projectId') projectId: string) {
    return this.service.findLatest(projectId);
  }
}
```

- [ ] **Step 6.4: Write module**

`api/src/yc-answers/yc-answers.module.ts`:
```ts
import { Module } from '@nestjs/common';
import { YcAnswersService } from './yc-answers.service';
import { YcAnswersController } from './yc-answers.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [YcAnswersController],
  providers: [YcAnswersService],
})
export class YcAnswersModule {}
```

- [ ] **Step 6.5: Register in app.module.ts**

In `api/src/app.module.ts`, append to the imports at the top:
```ts
import { YcAnswersModule } from './yc-answers/yc-answers.module';
```
And append `YcAnswersModule` to the `@Module({ imports: [...] })` array (keep existing order, add at end of list).

- [ ] **Step 6.6: Build and smoke test**

```bash
cd api && npm run build
```
Expected: zero errors. If type errors about `prisma.ycAnswer`, run `npx prisma generate`.

- [ ] **Step 6.7: Commit**

```bash
git add api/src/yc-answers/ api/src/app.module.ts
git commit -m "feat(api): add yc-answers module (POST/GET latest)"
```

---

## Task 7: NestJS `plan-reviews` Module

**Files:**
- Create: `api/src/plan-reviews/plan-reviews.module.ts`
- Create: `api/src/plan-reviews/plan-reviews.controller.ts`
- Create: `api/src/plan-reviews/plan-reviews.service.ts`
- Create: `api/src/plan-reviews/dto/create-plan-review.dto.ts`
- Modify: `api/src/app.module.ts` (append PlanReviewsModule)

- [ ] **Step 7.1: Write DTO**

`api/src/plan-reviews/dto/create-plan-review.dto.ts`:
```ts
import { IsIn, IsInt, IsObject, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const PLAN_REVIEW_KINDS = ['ceo', 'eng', 'design', 'devex'] as const;
export const PLAN_REVIEW_DECISIONS = ['accept', 'revise', 'reject'] as const;

export class CreatePlanReviewDto {
  @ApiProperty({ enum: PLAN_REVIEW_KINDS })
  @IsIn(PLAN_REVIEW_KINDS as readonly string[])
  kind!: (typeof PLAN_REVIEW_KINDS)[number];

  @ApiPropertyOptional() @IsOptional() @IsString() specPath?: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 10 })
  @IsOptional() @IsInt() @Min(0) @Max(10)
  score?: number;

  @ApiPropertyOptional({ enum: PLAN_REVIEW_DECISIONS })
  @IsOptional() @IsIn(PLAN_REVIEW_DECISIONS as readonly string[])
  decision?: (typeof PLAN_REVIEW_DECISIONS)[number];

  @ApiProperty({ description: '체크리스트 응답 전체 (JSON)' })
  @IsObject()
  payload!: Record<string, unknown>;

  @ApiPropertyOptional() @IsOptional() @IsString() reviewer?: string;
}
```

- [ ] **Step 7.2: Write service (with MD file write)**

`api/src/plan-reviews/plan-reviews.service.ts`:
```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanReviewDto } from './dto/create-plan-review.dto';

@Injectable()
export class PlanReviewsService {
  private readonly baseDir =
    process.env.PLAN_REVIEW_DIR ?? path.join(process.cwd(), 'data', 'plan-reviews', 'results');

  constructor(private prisma: PrismaService) {}

  async create(projectId: string, dto: CreatePlanReviewDto) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException(`Project ${projectId} not found`);

    const date = new Date().toISOString().slice(0, 10);
    const slug = this.slugify(dto.specPath ?? dto.kind);
    const mdPath = path.join(this.baseDir, projectId, `${date}-${dto.kind}-${slug}.md`);

    await this.writeMarkdown(mdPath, projectId, dto);

    return this.prisma.planReview.create({
      data: {
        projectId,
        kind: dto.kind,
        specPath: dto.specPath,
        mdPath,
        score: dto.score,
        decision: dto.decision,
        payload: dto.payload as any,
        reviewer: dto.reviewer ?? 'solo',
      },
    });
  }

  async findAll(projectId: string, kind?: string) {
    return this.prisma.planReview.findMany({
      where: { projectId, ...(kind ? { kind } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const r = await this.prisma.planReview.findUnique({ where: { id } });
    if (!r) throw new NotFoundException(`PlanReview ${id} not found`);
    return r;
  }

  private slugify(input: string): string {
    const base = path.basename(input, path.extname(input));
    return base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'review';
  }

  private async writeMarkdown(filePath: string, projectId: string, dto: CreatePlanReviewDto) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const fm = [
      '---',
      `kind: ${dto.kind}`,
      `project_id: ${projectId}`,
      `spec: ${dto.specPath ?? ''}`,
      `reviewer: ${dto.reviewer ?? 'solo'}`,
      `date: ${new Date().toISOString().slice(0, 10)}`,
      `score: ${dto.score ?? ''}`,
      `decision: ${dto.decision ?? ''}`,
      '---',
      '',
      '## Payload',
      '```json',
      JSON.stringify(dto.payload, null, 2),
      '```',
      '',
    ].join('\n');
    await fs.writeFile(filePath, fm, 'utf8');
  }
}
```

- [ ] **Step 7.3: Write controller**

`api/src/plan-reviews/plan-reviews.controller.ts`:
```ts
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PlanReviewsService } from './plan-reviews.service';
import { CreatePlanReviewDto } from './dto/create-plan-review.dto';

@ApiTags('plan-reviews')
@ApiBearerAuth()
@Controller()
export class PlanReviewsController {
  constructor(private readonly service: PlanReviewsService) {}

  @Post('projects/:projectId/plan-reviews')
  @ApiOperation({ summary: 'Plan Review 저장 (DB + MD 파일)' })
  create(@Param('projectId') projectId: string, @Body() dto: CreatePlanReviewDto) {
    return this.service.create(projectId, dto);
  }

  @Get('projects/:projectId/plan-reviews')
  @ApiOperation({ summary: '프로젝트의 Plan Review 목록' })
  findAll(@Param('projectId') projectId: string, @Query('kind') kind?: string) {
    return this.service.findAll(projectId, kind);
  }

  @Get('plan-reviews/:id')
  @ApiOperation({ summary: 'Plan Review 단건 조회' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
```

- [ ] **Step 7.4: Write module**

`api/src/plan-reviews/plan-reviews.module.ts`:
```ts
import { Module } from '@nestjs/common';
import { PlanReviewsService } from './plan-reviews.service';
import { PlanReviewsController } from './plan-reviews.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PlanReviewsController],
  providers: [PlanReviewsService],
})
export class PlanReviewsModule {}
```

- [ ] **Step 7.5: Register in app.module.ts**

```ts
import { PlanReviewsModule } from './plan-reviews/plan-reviews.module';
```
Append `PlanReviewsModule` to imports array.

- [ ] **Step 7.6: Build**

```bash
cd api && npm run build
```

- [ ] **Step 7.7: Smoke test via curl (requires running API and valid JWT)**

Start api in another terminal (`cd api && npm run start:dev`), then:
```bash
TOKEN=<paste-valid-jwt>
PID=<existing-project-uuid>
curl -s -X POST "http://localhost:3333/api/v1/projects/$PID/plan-reviews" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"kind":"ceo","payload":{"notes":"smoke"},"score":7,"decision":"accept"}' | jq
```
Expected: 201 with `id`, `mdPath`. Verify file exists at `api/data/plan-reviews/results/<PID>/...`.

- [ ] **Step 7.8: Commit**

```bash
git add api/src/plan-reviews/ api/src/app.module.ts
git commit -m "feat(api): add plan-reviews module (POST/GET list/GET one) with MD write"
```

---

## Task 8: MCP Server — `src/db.ts` HTTP Wrappers

**Files:**
- Modify: `src/db.ts` (append at end)

- [ ] **Step 8.1: Append types and wrappers**

At the end of `src/db.ts`, append:

```ts
// ---------- Plan Review & YC Answers (Phase 1 gstack integration) ----------

export interface YcAnswer {
    id: string;
    project_id: string;
    q1_demand?: string;
    q2_status_quo?: string;
    q3_specific?: string;
    q4_wedge?: string;
    q5_observation?: string;
    q6_future_fit?: string;
    created_at: string;
}

export interface PlanReview {
    id: string;
    project_id: string;
    kind: 'ceo' | 'eng' | 'design' | 'devex';
    spec_path?: string;
    md_path?: string;
    score?: number;
    decision?: 'accept' | 'revise' | 'reject';
    payload: Record<string, unknown>;
    reviewer: string;
    created_at: string;
}

export async function saveYcAnswers(
    projectId: string,
    answers: {
        q1Demand?: string; q2StatusQuo?: string; q3Specific?: string;
        q4Wedge?: string; q5Observation?: string; q6FutureFit?: string;
    }
): Promise<YcAnswer> {
    return await fetchApi(`/projects/${projectId}/yc-answers`, {
        method: 'POST',
        body: JSON.stringify(answers),
    });
}

export async function getLatestYcAnswers(projectId: string): Promise<YcAnswer | null> {
    return await fetchApi(`/projects/${projectId}/yc-answers/latest`);
}

export async function savePlanReview(
    projectId: string,
    input: {
        kind: 'ceo' | 'eng' | 'design' | 'devex';
        specPath?: string;
        score?: number;
        decision?: 'accept' | 'revise' | 'reject';
        payload: Record<string, unknown>;
        reviewer?: string;
    }
): Promise<PlanReview> {
    return await fetchApi(`/projects/${projectId}/plan-reviews`, {
        method: 'POST',
        body: JSON.stringify(input),
    });
}

export async function listPlanReviews(projectId: string, kind?: string): Promise<PlanReview[]> {
    const q = kind ? `?kind=${encodeURIComponent(kind)}` : '';
    return await fetchApi(`/projects/${projectId}/plan-reviews${q}`);
}

export async function getPlanReview(id: string): Promise<PlanReview | null> {
    return await fetchApi(`/plan-reviews/${id}`);
}
```

- [ ] **Step 8.2: Build**

```bash
npm run build
```
Expected: zero errors in `dist/db.js`.

- [ ] **Step 8.3: Commit**

```bash
git add src/db.ts
git commit -m "feat(mcp): add HTTP wrappers for plan-reviews and yc-answers"
```

---

## Task 9: MCP Server — `src/index.ts` Tools

**Files:**
- Modify: `src/index.ts` (append at end — before any final export, after the last existing tool)

- [ ] **Step 9.1: Locate insertion point**

```bash
grep -n "server.registerTool\|server.tool\|ListToolsRequestSchema" src/index.ts | tail -10
```
Identify the MCP tool registration style used and the last tool block. All new tools will follow the same pattern.

- [ ] **Step 9.2: Append 5 tools**

Append 5 new tool registrations following the existing style. Each calls its corresponding wrapper in `src/db.ts`. Pseudocode (adapt to the actual registration API found in Step 9.1):

```ts
import {
    saveYcAnswers, getLatestYcAnswers,
    savePlanReview, listPlanReviews, getPlanReview,
} from './db';

// save_yc_answers
server.tool(
    'save_yc_answers',
    'Save YC 6-Question answers for a project (Ideation Phase).',
    {
        project_id: z.string(),
        q1_demand: z.string().optional(),
        q2_status_quo: z.string().optional(),
        q3_specific: z.string().optional(),
        q4_wedge: z.string().optional(),
        q5_observation: z.string().optional(),
        q6_future_fit: z.string().optional(),
    },
    async (args) => {
        const row = await saveYcAnswers(args.project_id, {
            q1Demand: args.q1_demand, q2StatusQuo: args.q2_status_quo,
            q3Specific: args.q3_specific, q4Wedge: args.q4_wedge,
            q5Observation: args.q5_observation, q6FutureFit: args.q6_future_fit,
        });
        return { content: [{ type: 'text', text: JSON.stringify(row, null, 2) }] };
    }
);

// get_yc_answers
server.tool(
    'get_yc_answers',
    'Get the latest YC 6-Question answers for a project.',
    { project_id: z.string() },
    async ({ project_id }) => {
        const row = await getLatestYcAnswers(project_id);
        return { content: [{ type: 'text', text: JSON.stringify(row, null, 2) }] };
    }
);

// save_plan_review
server.tool(
    'save_plan_review',
    'Save a Plan Review (kind: ceo/eng/design/devex). Writes DB row and MD snapshot.',
    {
        project_id: z.string(),
        kind: z.enum(['ceo', 'eng', 'design', 'devex']),
        spec_path: z.string().optional(),
        score: z.number().int().min(0).max(10).optional(),
        decision: z.enum(['accept', 'revise', 'reject']).optional(),
        payload: z.record(z.unknown()),
        reviewer: z.string().optional(),
    },
    async (args) => {
        const row = await savePlanReview(args.project_id, {
            kind: args.kind, specPath: args.spec_path, score: args.score,
            decision: args.decision, payload: args.payload, reviewer: args.reviewer,
        });
        return { content: [{ type: 'text', text: JSON.stringify(row, null, 2) }] };
    }
);

// list_plan_reviews
server.tool(
    'list_plan_reviews',
    'List Plan Reviews for a project, optionally filtered by kind.',
    { project_id: z.string(), kind: z.string().optional() },
    async ({ project_id, kind }) => {
        const rows = await listPlanReviews(project_id, kind);
        return { content: [{ type: 'text', text: JSON.stringify(rows, null, 2) }] };
    }
);

// get_plan_review
server.tool(
    'get_plan_review',
    'Get a Plan Review by id.',
    { id: z.string() },
    async ({ id }) => {
        const row = await getPlanReview(id);
        return { content: [{ type: 'text', text: JSON.stringify(row, null, 2) }] };
    }
);
```

If `src/index.ts` uses the lower-level `ListToolsRequestSchema` + `CallToolRequestSchema` dispatch pattern instead of `server.tool(...)`, mirror that pattern: add 5 entries to the tools list and 5 case branches to the call handler.

- [ ] **Step 9.3: Build**

```bash
npm run build
```
Expected: zero errors.

- [ ] **Step 9.4: Manual tool smoke test**

Start MCP server: `node dist/index.js` (with `DP_API_KEY` and api running). In Claude Desktop/Cursor, invoke `save_yc_answers` and `save_plan_review` with a valid `project_id`. Verify rows in Postgres and MD files on disk.

- [ ] **Step 9.5: Commit**

```bash
git add src/index.ts
git commit -m "feat(mcp): add 5 tools for plan-reviews and yc-answers"
```

---

## Task 10: Web — Server Actions

**Files:**
- Create: `web/src/app/actions/planReviewActions.ts`

- [ ] **Step 10.1: Discover existing REST call helper**

```bash
grep -rn "API_BASE_URL\|process.env.API" web/src/app/actions/ web/src/lib/ 2>&1 | head
```
Use the same helper/pattern existing actions use (likely `fetch` with a base URL + auth header). If none, call REST directly with `process.env.API_BASE_URL` server-side.

- [ ] **Step 10.2: Write actions file**

`web/src/app/actions/planReviewActions.ts`:
```ts
'use server';

const API = process.env.API_BASE_URL ?? 'http://localhost:3333/api/v1';

async function call<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            // Auth header wiring follows existing actions in this codebase.
            ...(init?.headers ?? {}),
        },
        cache: 'no-store',
    });
    if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
    const text = await res.text();
    return text ? (JSON.parse(text) as T) : (null as T);
}

export type PlanReviewKind = 'ceo' | 'eng' | 'design' | 'devex';
export type PlanReviewDecision = 'accept' | 'revise' | 'reject';

export interface YcAnswersInput {
    q1Demand?: string; q2StatusQuo?: string; q3Specific?: string;
    q4Wedge?: string; q5Observation?: string; q6FutureFit?: string;
}

export async function saveYCAnswers(projectId: string, answers: YcAnswersInput) {
    return call(`/projects/${projectId}/yc-answers`, {
        method: 'POST',
        body: JSON.stringify(answers),
    });
}

export async function getLatestYCAnswers(projectId: string) {
    return call(`/projects/${projectId}/yc-answers/latest`);
}

export async function savePlanReview(
    projectId: string,
    input: {
        kind: PlanReviewKind;
        specPath?: string;
        score?: number;
        decision?: PlanReviewDecision;
        payload: Record<string, unknown>;
        reviewer?: string;
    }
) {
    return call(`/projects/${projectId}/plan-reviews`, {
        method: 'POST',
        body: JSON.stringify(input),
    });
}

export async function listPlanReviews(projectId: string, kind?: PlanReviewKind) {
    const q = kind ? `?kind=${encodeURIComponent(kind)}` : '';
    return call(`/projects/${projectId}/plan-reviews${q}`);
}

export async function getPlanReview(id: string) {
    return call(`/plan-reviews/${id}`);
}
```

- [ ] **Step 10.3: Align auth wiring**

Open one existing action file (e.g., `web/src/app/actions/documentActions.ts`) and copy the exact auth-header pattern into `call(...)` above (often a bearer token from `next-auth` session or a server-side session cookie forward).

- [ ] **Step 10.4: Build web**

```bash
cd web && npm run build
```
Expected: zero errors.

- [ ] **Step 10.5: Commit**

```bash
git add web/src/app/actions/planReviewActions.ts
git commit -m "feat(web): add plan-review/yc-answer Server Actions"
```

---

## Task 11: Web — YCQuestionsCard Component

**Files:**
- Create: `web/src/app/project/[id]/planReview/YCQuestionsCard.tsx`
- Modify: `web/src/app/project/[id]/VibePhaseDashboard.tsx` (mount card inside Phase 1 section)

- [ ] **Step 11.1: Read existing Phase 1 section**

```bash
grep -n "Ideation\|phase.*1\|Phase 1\|IDEATION" web/src/app/project/[id]/VibePhaseDashboard.tsx
```
Identify where Phase 1 content renders.

- [ ] **Step 11.2: Write YCQuestionsCard**

`web/src/app/project/[id]/planReview/YCQuestionsCard.tsx`:
```tsx
'use client';
import { useEffect, useState, useTransition } from 'react';
import { getLatestYCAnswers, saveYCAnswers, type YcAnswersInput } from '@/app/actions/planReviewActions';
import { useI18n } from '@/lib/i18n';

interface Props { projectId: string; }

export default function YCQuestionsCard({ projectId }: Props) {
    const { t } = useI18n();
    const [vals, setVals] = useState<YcAnswersInput>({});
    const [saving, startSave] = useTransition();
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const latest = await getLatestYCAnswers(projectId) as YcAnswersInput | null;
            if (!cancelled && latest) setVals({
                q1Demand: latest.q1Demand, q2StatusQuo: latest.q2StatusQuo,
                q3Specific: latest.q3Specific, q4Wedge: latest.q4Wedge,
                q5Observation: latest.q5Observation, q6FutureFit: latest.q6FutureFit,
            });
            if (!cancelled) setLoaded(true);
        })();
        return () => { cancelled = true; };
    }, [projectId]);

    const field = (key: keyof YcAnswersInput, labelKey: string) => (
        <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">{t(labelKey)}</span>
            <textarea
                className="rounded border px-2 py-1 bg-transparent"
                rows={3}
                value={vals[key] ?? ''}
                onChange={(e) => setVals((v) => ({ ...v, [key]: e.target.value }))}
                placeholder={t(`${labelKey}.placeholder`)}
            />
        </label>
    );

    if (!loaded) return <div className="rounded-lg border p-4 text-sm opacity-60">{t('common.loading')}</div>;

    return (
        <section className="rounded-lg border p-4 space-y-3">
            <header className="flex items-center justify-between">
                <h3 className="text-base font-semibold">{t('yc.title')}</h3>
                <button
                    disabled={saving}
                    onClick={() => startSave(async () => { await saveYCAnswers(projectId, vals); })}
                    className="rounded bg-blue-600 px-3 py-1 text-xs text-white disabled:opacity-50"
                >
                    {saving ? t('common.saving') : t('common.save')}
                </button>
            </header>
            <div className="grid gap-3 md:grid-cols-2">
                {field('q1Demand', 'yc.q1')}
                {field('q2StatusQuo', 'yc.q2')}
                {field('q3Specific', 'yc.q3')}
                {field('q4Wedge', 'yc.q4')}
                {field('q5Observation', 'yc.q5')}
                {field('q6FutureFit', 'yc.q6')}
            </div>
        </section>
    );
}
```

- [ ] **Step 11.3: Mount inside VibePhaseDashboard Phase 1 area**

Edit `VibePhaseDashboard.tsx`. Import at top:
```tsx
import YCQuestionsCard from './planReview/YCQuestionsCard';
```
In the Phase 1 section identified in 11.1, add after existing content:
```tsx
<YCQuestionsCard projectId={projectId} />
```
Do not reorder or remove existing Phase 1 content.

- [ ] **Step 11.4: Build**

```bash
cd web && npm run build
```

- [ ] **Step 11.5: Commit**

```bash
git add web/src/app/project/[id]/planReview/YCQuestionsCard.tsx web/src/app/project/[id]/VibePhaseDashboard.tsx
git commit -m "feat(web): add YCQuestionsCard to Phase 1 Ideation"
```

---

## Task 12: Web — PlanReviewBadges Component

**Files:**
- Create: `web/src/app/project/[id]/planReview/PlanReviewBadges.tsx`
- Modify: `web/src/app/project/[id]/VibePhaseDashboard.tsx` (render row of badges on each Phase header)

- [ ] **Step 12.1: Write component**

`web/src/app/project/[id]/planReview/PlanReviewBadges.tsx`:
```tsx
import { listPlanReviews } from '@/app/actions/planReviewActions';

type Kind = 'ceo' | 'eng' | 'design' | 'devex';
const KINDS: Kind[] = ['ceo', 'eng', 'design', 'devex'];

interface Props { projectId: string; }

export default async function PlanReviewBadges({ projectId }: Props) {
    const all = (await listPlanReviews(projectId)) as Array<{ kind: Kind; score?: number; createdAt: string }>;
    const latestByKind = new Map<Kind, { score?: number; createdAt: string }>();
    for (const r of all ?? []) if (!latestByKind.has(r.kind)) latestByKind.set(r.kind, r);

    return (
        <div className="flex flex-wrap gap-2 text-xs">
            {KINDS.map((k) => {
                const r = latestByKind.get(k);
                const label = `${k.toUpperCase()}${r?.score != null ? `: ${r.score}/10` : ''}`;
                const cls = r
                    ? (r.score ?? 0) >= 8 ? 'bg-green-600 text-white'
                    : (r.score ?? 0) >= 5 ? 'bg-yellow-600 text-white'
                    : 'bg-red-600 text-white'
                    : 'bg-gray-400 text-white';
                return <span key={k} className={`rounded px-2 py-0.5 ${cls}`}>{label}</span>;
            })}
        </div>
    );
}
```

- [ ] **Step 12.2: Mount**

In `VibePhaseDashboard.tsx`, import and render `<PlanReviewBadges projectId={projectId} />` in the dashboard header area (once, not per-phase — it summarizes all 4 kinds).

- [ ] **Step 12.3: Build**

```bash
cd web && npm run build
```

- [ ] **Step 12.4: Commit**

```bash
git add web/src/app/project/[id]/planReview/PlanReviewBadges.tsx web/src/app/project/[id]/VibePhaseDashboard.tsx
git commit -m "feat(web): add PlanReviewBadges summary to 5-Phase dashboard"
```

---

## Task 13: Web — PlanReviewHistory Component

**Files:**
- Create: `web/src/app/project/[id]/planReview/PlanReviewHistory.tsx`
- Modify: `web/src/app/project/[id]/AIContextView.tsx` (append collapsible section)

- [ ] **Step 13.1: Write component**

`web/src/app/project/[id]/planReview/PlanReviewHistory.tsx`:
```tsx
import { listPlanReviews } from '@/app/actions/planReviewActions';

interface Props { projectId: string; }

export default async function PlanReviewHistory({ projectId }: Props) {
    const rows = (await listPlanReviews(projectId)) as Array<{
        id: string; kind: string; score?: number; decision?: string; createdAt: string; specPath?: string;
    }>;
    if (!rows?.length) return null;

    return (
        <details className="rounded-lg border p-3">
            <summary className="cursor-pointer text-sm font-semibold">Plan Review History ({rows.length})</summary>
            <ul className="mt-2 space-y-1 text-xs">
                {rows.map((r) => (
                    <li key={r.id} className="flex gap-2">
                        <span className="font-mono opacity-70">{r.createdAt.slice(0, 10)}</span>
                        <span className="font-semibold">{r.kind}</span>
                        <span>{r.score != null ? `${r.score}/10` : '-'}</span>
                        <span className="opacity-70">{r.decision ?? '-'}</span>
                        <span className="opacity-60 truncate">{r.specPath ?? ''}</span>
                    </li>
                ))}
            </ul>
        </details>
    );
}
```

- [ ] **Step 13.2: Mount in AIContextView**

Append `<PlanReviewHistory projectId={projectId} />` at the bottom of `AIContextView.tsx`. Import at top.

- [ ] **Step 13.3: Build**

```bash
cd web && npm run build
```

- [ ] **Step 13.4: Commit**

```bash
git add web/src/app/project/[id]/planReview/PlanReviewHistory.tsx web/src/app/project/[id]/AIContextView.tsx
git commit -m "feat(web): add PlanReviewHistory section to AIContextView"
```

---

## Task 14: i18n — KR + EN keys

**Files:**
- Modify: `web/src/lib/i18n.tsx`

- [ ] **Step 14.1: Read current structure**

```bash
grep -n "en:\|ko:\|translations" web/src/lib/i18n.tsx | head -20
```
Identify the two language maps and their key nesting convention.

- [ ] **Step 14.2: Append keys in both languages (paired)**

Add to KR map:
```ts
'yc.title': 'YC 6가지 질문 (Ideation)',
'yc.q1': '수요 현실: 누가, 몇 명이 이걸 요청했나?',
'yc.q1.placeholder': '구체적 사용자/팀명과 횟수',
'yc.q2': '현상 유지의 진짜 문제는?',
'yc.q2.placeholder': '지금 방식의 고통점',
'yc.q3': '절박한 구체성',
'yc.q3.placeholder': '가장 구체적인 유스케이스 1개',
'yc.q4': '가장 좁은 웨지',
'yc.q4.placeholder': '최소 진입 범위',
'yc.q5': '관찰',
'yc.q5.placeholder': '실제 사용 관찰 증거',
'yc.q6': 'Future-fit',
'yc.q6.placeholder': '1년 뒤에도 유효한가?',
'planReview.kind.ceo': 'CEO 리뷰',
'planReview.kind.eng': '엔지니어링 리뷰',
'planReview.kind.design': '디자인 리뷰',
'planReview.kind.devex': 'DevEx 리뷰',
'planReview.decision.accept': '수락',
'planReview.decision.revise': '수정',
'planReview.decision.reject': '거절',
'common.save': '저장',
'common.saving': '저장 중...',
'common.loading': '로딩 중...',
```

Add equivalent to EN map:
```ts
'yc.title': 'YC 6 Questions (Ideation)',
'yc.q1': 'Demand reality: who and how many asked for this?',
'yc.q1.placeholder': 'Specific users/teams and counts',
'yc.q2': 'What is actually broken about the status quo?',
'yc.q2.placeholder': 'Pain points of the current way',
'yc.q3': 'Desperate specificity',
'yc.q3.placeholder': 'One most specific use case',
'yc.q4': 'Narrowest wedge',
'yc.q4.placeholder': 'Minimal entry scope',
'yc.q5': 'Observation',
'yc.q5.placeholder': 'Evidence from real usage observation',
'yc.q6': 'Future-fit',
'yc.q6.placeholder': 'Still valid in 12 months?',
'planReview.kind.ceo': 'CEO Review',
'planReview.kind.eng': 'Engineering Review',
'planReview.kind.design': 'Design Review',
'planReview.kind.devex': 'DevEx Review',
'planReview.decision.accept': 'Accept',
'planReview.decision.revise': 'Revise',
'planReview.decision.reject': 'Reject',
'common.save': 'Save',
'common.saving': 'Saving...',
'common.loading': 'Loading...',
```

If `common.save`/`common.saving`/`common.loading` already exist, skip those three (use existing).

- [ ] **Step 14.3: Build and run dev**

```bash
cd web && npm run build && npm run dev
```
Toggle KR/EN in the UI, verify new Phase 1 card labels appear in both.

- [ ] **Step 14.4: Commit**

```bash
git add web/src/lib/i18n.tsx
git commit -m "feat(web): add i18n keys for YC questions and plan-review kinds (KR/EN)"
```

---

## Task 15: Docker Compose — Optional Volume for MD Snapshots

**Files:**
- Modify: `docker-compose.yml` (add volume under api service only)

- [ ] **Step 15.1: Read current api service block**

```bash
grep -n "api:\|volumes:" docker-compose.yml
```

- [ ] **Step 15.2: Append volume line under api service's `volumes:`**

Append to existing `volumes:` list under the api service:
```yaml
      - ./docs/plan-reviews/results:/app/data/plan-reviews/results
```
Do not remove or modify any other volume, port, or env entry.

- [ ] **Step 15.3: Rebuild and verify**

```bash
docker-compose up -d --build api
docker-compose exec api ls -la /app/data/plan-reviews/results 2>&1 || true
```

- [ ] **Step 15.4: Commit**

```bash
git add docker-compose.yml
git commit -m "chore(docker): mount plan-reviews output volume on api service"
```

---

## Task 16: Dogfood — Apply 4 Checklists to This Project

**Files:**
- Create: `docs/plan-reviews/results/<this-project-id>/2026-04-13-ceo-gstack-integration.md` (and eng/design/devex)

- [ ] **Step 16.1: Get or create a project in the running app**

Run web + api + MCP stack, create a project named "VibePlanner-Meta" if missing. Copy its `id`.

- [ ] **Step 16.2: Apply CEO review**

Fill `docs/plan-reviews/templates/ceo-review.md` against the spec, save the completed copy to `docs/plan-reviews/results/<project-id>/2026-04-13-ceo-gstack-integration.md`. Invoke MCP tool `save_plan_review` with kind=ceo and the payload, confirm DB row + MD file at `api/data/...`.

- [ ] **Step 16.3: Apply Eng review**

Same for eng. Any `revise` here must update the spec commit before proceeding.

- [ ] **Step 16.4: Apply Design review**

Same for design. UI-touching concerns only (Phase 1 card, badges, history).

- [ ] **Step 16.5: Apply DevEx review**

Same for devex. Focus on MCP tool discoverability and AGENTS.md cold-start.

- [ ] **Step 16.6: Commit**

```bash
git add docs/plan-reviews/results/
git commit -m "docs: self-applied 4 plan reviews against gstack Phase 1 spec"
```

---

## Task 17: E2E QA via `/qa` Skill

**Files:**
- None (report only)

- [ ] **Step 17.1: Start full stack**

```bash
docker-compose up -d --build
```
Or locally: `cd api && npm run start:dev`, `cd web && npm run dev`, `npm run start` (MCP).

- [ ] **Step 17.2: Invoke `/qa` skill**

Instruct the skill to exercise:
1. Create project → open Phase 1 → fill YC card → save → reload → values persisted.
2. Toggle KR/EN → all new labels render correctly.
3. Toggle dark/light → no contrast failures on new components.
4. Invoke MCP `save_plan_review` from Claude Desktop → row appears → badge updates → history shows entry.
5. Invalid input (score=11, kind=foo) rejected by API with 400.
6. Delete project → cascade clears plan_reviews and yc_answers (FK `onDelete: Cascade`).

- [ ] **Step 17.3: Fix any bugs found**

Create focused follow-up commits per bug. No bug ships.

- [ ] **Step 17.4: Commit QA report**

Write `.agents/briefs/qa-phase1-<date>.md` with findings and fixes. Commit.

---

## Task 18: Design Review + Polish + Release

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `package.json` (root + api + web) → version bump to 1.3.0

- [ ] **Step 18.1: `/design-review` skill on the running app**

Target: new Phase 1 card + badges + history. Fix any P1 issues.

- [ ] **Step 18.2: `/plan-devex-review` final pass**

Re-run devex review after QA to confirm AGENTS.md and MCP tool UX hold up.

- [ ] **Step 18.3: Update CHANGELOG**

```markdown
## 1.3.0 — 2026-04-2x
### Added
- AGENTS.md + MODEL_ROUTING.md + docs/vibe-kanban-board.md + .agents/briefs/ (orchestration contract).
- Plan Review system (ceo/eng/design/devex) with DB + MD persistence.
- YC 6-Question card in Phase 1 Ideation.
- Prisma models `PlanReview`, `YcAnswer` (additive migration).
- NestJS modules `plan-reviews`, `yc-answers`.
- MCP tools: `save_yc_answers`, `get_yc_answers`, `save_plan_review`, `list_plan_reviews`, `get_plan_review`.
- Web components `YCQuestionsCard`, `PlanReviewBadges`, `PlanReviewHistory`.
- i18n keys for YC / PlanReview (KR+EN).
### Changed
- `docker-compose.yml`: optional volume for plan-review MD snapshots.
### Unchanged (append-only contract)
- Existing MCP tools, existing Prisma models, existing 14-tab layout, existing Server Actions.
```

- [ ] **Step 18.4: Version bump**

Edit `package.json` (root), `api/package.json`, `web/package.json`: `"version": "1.3.0"`.

- [ ] **Step 18.5: Build all**

```bash
cd api && npm run build && cd ../web && npm run build && cd .. && npm run build
```
Expected: three green builds.

- [ ] **Step 18.6: Tag and commit**

```bash
git add CHANGELOG.md package.json api/package.json web/package.json
git commit -m "release: 1.3.0 — gstack Phase 1 integration"
git tag v1.3.0
```

- [ ] **Step 18.7: Update board**

Move this initiative to Done in `docs/vibe-kanban-board.md` with commit hash. Commit.

- [ ] **Step 18.8: Merge to main**

```bash
git checkout main
git merge --no-ff feat/gstack-phase1 -m "Merge feat/gstack-phase1: gstack Phase 1 integration"
```

---

## Self-Review Notes

- **Spec coverage:** Every section of the spec maps to a task: Workflow → T1/T2/T3, Checklists → T4, Prisma → T5, NestJS → T6/T7, MCP → T8/T9, Web → T10/T11/T12/T13, i18n → T14, Docker → T15, Dogfood → T16, QA → T17, Release → T18.
- **Placeholder scan:** No TBD/TODO remains. Auth header wiring in Task 10 references the existing code pattern rather than a placeholder (the engineer must copy from an existing action file).
- **Type consistency:** `PlanReview.kind` is `'ceo'|'eng'|'design'|'devex'` across Prisma, DTO, MCP types, Server Actions, and i18n keys. `decision` is `'accept'|'revise'|'reject'` everywhere. `score` is `0-10` integer. Function names used consistently (`saveYCAnswers`, `saveYcAnswers`, `save_yc_answers`) — note case differences between layers are intentional (TS actions camelCase, MCP snake_case, matching existing codebase conventions from `src/db.ts` toSnake helper).
- **Scope:** Phase 1 only. Phase 2~4 explicitly out of scope per spec.
