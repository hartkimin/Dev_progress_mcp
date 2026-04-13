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
