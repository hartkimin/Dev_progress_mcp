# T8 — MCP `src/db.ts` HTTP Wrappers Brief

**Task**: T8 — Add HTTP client wrappers for plan-reviews and yc-answers endpoints  
**Branch**: `feat/gstack-phase1`  
**Date**: 2026-04-13  
**Status**: DONE

## What Was Done

Appended 70 lines to `src/db.ts` (append-only, zero existing lines modified):

### New Interfaces
- `YcAnswer` — snake_case fields matching `fetchApi`'s `toSnake` response conversion
- `PlanReview` — snake_case fields, `kind` union `'ceo'|'eng'|'design'|'devex'`

### New Exported Functions (5)
| Function | Method | Endpoint |
|---|---|---|
| `saveYcAnswers(projectId, answers)` | POST | `/projects/:id/yc-answers` |
| `getLatestYcAnswers(projectId)` | GET | `/projects/:id/yc-answers/latest` |
| `savePlanReview(projectId, input)` | POST | `/projects/:id/plan-reviews` |
| `listPlanReviews(projectId, kind?)` | GET | `/projects/:id/plan-reviews?kind=` |
| `getPlanReview(id)` | GET | `/plan-reviews/:id` |

## Verification
- `git diff` showed only additions — 245 → 315 lines (+70)
- `npm run build` → exit 0 (zero TypeScript errors)
- `dist/db.js` exports all 5 functions confirmed via grep

## Commit
`08fad35` — feat(mcp): add HTTP wrappers for plan-reviews and yc-answers

## Contract Notes
- Request bodies use **camelCase** (NestJS DTOs expect camelCase)
- Interface fields use **snake_case** (matches `fetchApi` → `toSnake` response conversion)
- Uses existing `fetchApi` helper — no new HTTP client introduced
- Existing exports untouched (append-only contract honored)
