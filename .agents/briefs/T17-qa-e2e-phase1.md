# T17 — E2E QA Phase 1

**Date:** 2026-04-14
**Tester:** solo (Claude as proxy)
**Stack:** docker-compose api + postgres (web/mcp not exercised in this run)
**Branch:** feat/gstack-phase1 @ 661060d

## Scenario coverage

| # | Test | Result |
|---|------|--------|
| 1 | API container builds & starts | ✅ |
| 2 | `/health` returns `{status:ok, database:up}` | ✅ |
| 3 | All 5 new routes registered (NestJS log) | ✅ |
| 4 | `/auth/sync` issues JWT (Public route) | ✅ |
| 5 | `POST /projects` creates project, returns id | ✅ |
| 6 | `POST /projects/:id/yc-answers` persists row | ✅ |
| 7 | `GET /projects/:id/yc-answers/latest` returns saved row | ✅ |
| 8 | `POST /projects/:id/plan-reviews` persists DB row + MD file | ✅ |
| 9 | `GET /projects/:id/plan-reviews` lists all | ✅ |
| 10 | `GET /projects/:id/plan-reviews?kind=ceo` filters | ✅ |
| 11 | `GET /plan-reviews/:id` returns single | ✅ |
| 12 | DTO validation: `kind=INVALID` → 400 Bad Request | ✅ |
| 13 | DTO validation: `score=99` → 400 Bad Request | ✅ |
| 14 | Volume mount: MD file visible on host (`docs/plan-reviews/results/<pid>/...`) | ✅ |
| 15 | FK Cascade: `DELETE /projects/:id` → reviews + answers cleaned | ✅ |
| 16 | MD file orphaned after cascade (known behavior, acceptable) | ⚠️ |
| 17 | Web UI smoke test (YC card, badges, history) | ⏭️ deferred to manual |
| 18 | Dark/light mode visual QA | ⏭️ deferred to manual |
| 19 | KR/EN i18n toggle on new keys | ⏭️ deferred to manual |
| 20 | MCP tool round-trip from Claude Desktop / Cursor | ⏭️ deferred to manual |

## Key evidence

- Project `f127c429-c27b-4552-b3b0-1c71ad3aa491` created and exercised end-to-end.
- Plan review `bef2a74a-c24a-41c5-969c-83856da56a68` written with `mdPath=/app/data/plan-reviews/results/f127c429-.../2026-04-13-ceo-2026-04-13-gstack-integration-design.md`.
- Same file confirmed at host path `D:/Project/16_VibePlanner/docs/plan-reviews/results/f127c429-c27b-4552-b3b0-1c71ad3aa491/2026-04-13-ceo-2026-04-13-gstack-integration-design.md` (252 bytes), demonstrating volume mount works.
- After `DELETE /projects/f127c429-...` returned 200, `GET /plan-reviews/bef2a74a-...` returned 404 — FK cascade triggered as designed.
- Validation rejected `kind=INVALID` and `score=99` with HTTP 400 (class-validator working).

## Known issues surfaced

1. **Orphan MD files after cascade** — when a project is deleted, its `plan_reviews` rows are cascade-removed but the corresponding MD files on disk remain. Not a bug per spec (out-of-scope: "FK CASCADE" only references DB). Track as deferred cleanup task.
2. **Slug duplication** — observed `mdPath` filename `2026-04-13-ceo-2026-04-13-gstack-integration-design.md`. Date prefix appears twice because `slugify()` runs on the full `specPath` which itself starts with a date. Cosmetic only. Track as polish item.

## gstack Skills invoked

- `/qa` (concept; this brief is the artifact)
- No automated `/browse` skill used — Web UI tests deferred to manual.

## Handoff notes

- API container left in `Up` state with seed data: 1 user (`qa@local`), 0 projects (cascade test deleted the only one).
- Web container NOT built — `docker-compose up -d --build web` to bring it up for UI testing.
- For UI QA: visit `http://localhost:3002/project/<id>` after creating a project via UI; verify YCQuestionsCard renders in Phase 1, badges in dashboard header, history at AIContextView bottom.
- For MCP tool QA: run `node dist/index.js` with `DP_API_KEY` and a JWT proxy, invoke `save_plan_review` from Claude Desktop / Cursor.
