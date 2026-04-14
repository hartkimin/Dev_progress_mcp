---
kind: eng
project_id: SPEC-2026-04-13-gstack-integration
spec: docs/superpowers/specs/2026-04-13-gstack-integration-design.md
reviewer: solo (Claude as proxy)
date: 2026-04-14
score: 9
decision: accept
---

## 1. Core Questions

1. **Append-only contract preserved on `src/index.ts`, `src/db.ts`, existing Prisma models?**
   Yes. Verified across all 25 commits:
   - `src/index.ts`: 5 new tools added at EOF (lines 429–551), zero existing tools touched.
   - `src/db.ts`: 5 new wrappers + 2 interfaces appended at EOF, no existing function body modified (CRLF artifact noted but content-identical).
   - `web/src/lib/db.ts`: 5 new wrappers + 4 interfaces appended at EOF; existing `fetchApi`, `setAccessToken`, project/task/document functions intact.
   - `api/prisma/schema.prisma`: only 2 lines added inside `Project` model (back-relations), 2 new models appended at EOF. No existing column changed.
   - `api/src/app.module.ts`: 2 new imports + 2 entries appended to `imports[]` array; existing imports/order preserved.

2. **Schema changes additive only?**
   Yes. Migration `20260413072114_add_plan_reviews_and_yc_answers/migration.sql` contains exactly: 2 CREATE TABLE, 2 CREATE INDEX, 2 ALTER TABLE ADD CONSTRAINT (FK to projects). Zero DROP, zero ALTER COLUMN on existing tables.

3. **Edge cases?**
   - Null project: `PlanReviewsService.create` and `YcAnswersService.create` both check `findUnique` and throw `NotFoundException` → clean 404.
   - Empty payload: DTO requires `payload: {}` (IsObject); empty `{}` is technically valid — acceptable for partial drafts.
   - i18n key missing: `t()` returns the key string as fallback (verified in T11 implementation); ugly but non-fatal.
   - Auth disabled: not tested; global JwtAuthGuard active. If env disables auth (no env override path observed), everything 401s — acceptable behavior.
   - Empty review history: `PlanReviewHistory` returns `null` for clean dashboard.
   - Concurrent writes to same project's MD file: `writeMarkdown` uses unique date+kind+slug filename, low collision risk; not atomic vs DB insert — accepted tradeoff.

4. **How is this verified?**
   - Build green on all 3 stacks.
   - NestJS startup logs confirm 5 new routes registered (T6/T7 review evidence).
   - MCP `dist/index.js` contains 5 new tool names (T9 grep evidence).
   - T17 (next) will perform end-to-end POST/GET via curl + verify MD file appears via volume mount.

5. **14-tab load time impact?**
   Minimal. Two new Server Action calls on Phase Dashboard render (`listPlanReviews` for badges) and one in AIContextView (`listPlanReviews` for history). Both fetch from the same endpoint — could be deduped with React `cache()` in a follow-up. For solo + small data, no observable regression.

## 2. Evidence

- `git diff main feat/gstack-phase1 --stat` — 42 files, +2526 / −899 (deletions are largely CRLF rewrites; functional deletions zero).
- `npx prisma migrate status` — clean.
- All 3 `npm run build` exit 0.
- Smoke logs in T6/T7/T9 review reports show route + tool registration at runtime.

## 3. What would make this a 10?

- Atomic write of MD + DB row (transaction wrapping the file write, or outbox pattern).
- Automated integration test (Jest + supertest hitting NestJS in-memory) for the 5 new routes.
- Add `React.cache()` around `listPlanReviews` to dedupe multi-component fetches.

## 4. Decision

- [x] accept
- [ ] revise
- [ ] reject

**Reason:** Append-only contract honored without exception. Schema purely additive. Edge cases reasonable. Three "make it a 10" items are nice-to-haves, not blockers — track as deferred.

## 5. Todo migration

- (deferred) Wrap MD write + DB insert in a single retry-safe operation.
- (deferred) Add NestJS e2e tests for plan-reviews and yc-answers controllers.
- (deferred) `React.cache()` for `listPlanReviews`.
