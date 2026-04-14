# VibePlanner Vibe Kanban Board

Solo, 3-column. Reviewer (pattern D) recommendations auto-migrate to Todo.

## Todo
- **Manual UI/QA** (extends T17): YC card visual verify, dark/light toggle, KR/EN toggle on new keys, MCP tool client (Claude Desktop / Cursor) round-trip.
- **Merge to main** — `feat/gstack-phase1` → `main` (awaiting solo confirmation).
- *(deferred)* Wire `planReview.kind.*` i18n keys into `PlanReviewBadges` + `PlanReviewHistory` (T16 design review, score 6/revise — promoted).
- *(deferred)* Yellow-600 + white text contrast — bump to `text-slate-900` for WCAG AA (T12+T16 nit, promoted from "deferred").
- *(deferred)* `<details>` wrap on `YCQuestionsCard` for default-collapsed state (T16 design suggestion).
- *(deferred)* `useState<boolean>` loading flag in `PlanReviewBadges` to disambiguate "loading" vs "no data" (T12 nit).
- *(deferred)* `web/src/lib/db.ts` `globalAccessToken` is module-level → session bleed risk in multi-user deploy.
- *(deferred)* `.gitattributes` `* text=auto eol=lf` to stop CRLF diff churn on Windows.
- *(deferred)* Refactor `src/index.ts` planReview tools out to `src/tools/planReview.ts` (Phase 1 followup spec).
- *(deferred)* Add db.ts disambiguation note to AGENTS.md GOTCHAS (T16 devex review).
- *(deferred)* Rename MCP tool `get_yc_answers` → `get_latest_yc_answers` (no callers yet, breaking-safe now).
- *(deferred)* Atomic write of MD + DB row in `PlanReviewsService.create` (T16 eng review).
- *(deferred)* NestJS e2e tests for plan-reviews and yc-answers controllers.
- *(deferred)* `React.cache()` for `listPlanReviews` to dedupe multi-component fetches.
- *(deferred)* Orphan MD files cleanup on FK cascade (T17 known issue).
- *(deferred)* Slug duplication fix when specPath already starts with date (T17 polish).
- **Phase 2 spec** — QA cluster (`/qa`, `/browse`, `/benchmark`, `/canary`, `/audit`, `/health`).

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
- **T16 Dogfood — 4 self-reviews on Phase 1 spec** — `661060d` (CEO 7/accept, Eng 9/accept, Design 6/revise, DevEx 8/accept)
- **T17 E2E QA — 16/20 automated tests passed** — `8f60d13` (4 manual UI tests deferred)
- **T18 Release 1.3.0** — CHANGELOG + 3 package.json bumps + tag v1.3.0
