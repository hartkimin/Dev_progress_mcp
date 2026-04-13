# VibePlanner Vibe Kanban Board

Solo, 3-column. Reviewer (pattern D) recommendations auto-migrate to Todo.

## Todo
- **T16 Dogfood — apply 4 reviews to gstack Phase 1 spec** (CEO/Eng/Design/DevEx). Use MCP `save_plan_review` tool to persist results to DB + MD. Spec at `docs/superpowers/specs/2026-04-13-gstack-integration-design.md`.
- **T17 E2E QA** — `docker-compose up -d --build`, then exercise: YCQuestionsCard save+reload, KR/EN toggle on new keys, dark/light, MCP tool round-trip, FK cascade on project delete. Write report to `.agents/briefs/qa-phase1.md`.
- **T18 Release 1.3.0** — CHANGELOG entry, version bump (root + api + web), `git tag v1.3.0`, merge `feat/gstack-phase1` → `main`.
- *(deferred)* Replace `useState<boolean>` loading flag in `PlanReviewBadges` to disambiguate "loading" from "no data" (T12 quality nit).
- *(deferred)* Yellow-600 + white text contrast — bump to `text-slate-900` for WCAG AA (T12 quality nit).
- *(deferred)* `web/src/lib/db.ts` `globalAccessToken` is module-level → session bleed risk in multi-user deploy. Move to per-request context before commercial release (T10 quality nit).
- *(deferred)* CRLF line-ending normalization — add `.gitattributes` `* text=auto eol=lf` to stop full-file diff churn on Windows edits.
- *(deferred)* Refactor `src/index.ts` planReview tools out to `src/tools/planReview.ts` (Phase 1 followup spec).

## In Progress
- (empty)

## Done
- **gstack Phase 1 Spec** — `1ffbfb6` (`docs/superpowers/specs/2026-04-13-gstack-integration-design.md`)
- **gstack Phase 1 Plan** — `c4e4174` (`docs/superpowers/plans/2026-04-13-gstack-integration-phase1.md`)
- **T1 AGENTS.md** — `cb715cb`
- **T2 MODEL_ROUTING.md** — `b294b25`
- **T3 Kanban board + .agents/briefs/** — `4750fc9`
- **T4 Plan Review templates 4종** — `aa02347`
- **T5 Prisma `PlanReview` + `YcAnswer` models + additive migration** — `0506761`
- **T6 NestJS `yc-answers` module** — `56d1352`
- **T7 NestJS `plan-reviews` module (with MD write)** — `ed4d628`
- **T8 MCP `src/db.ts` HTTP wrappers (5 functions)** — `08fad35`
- **T9 MCP `src/index.ts` 5 new tools** — `abe071c`
- **T10 Web `lib/db.ts` wrappers** — `de807a3`
- **T10 Web Server Actions `planReviewActions.ts`** — `77f0074`
- **T11 `YCQuestionsCard` + Phase 1 mount** — `d94441c`
- **T12 `PlanReviewBadges` + dashboard mount** — `e63dd5c`
- **T13 `PlanReviewHistory` + AIContextView mount** — `5b293b1`
- **T14 i18n keys (YC + planReview, KR + EN, 23 each)** — `a1afea7`
- **T15 docker-compose `PLAN_REVIEW_DIR` + volume mount** — `1fdb621`
