# T6 Brief: yc-answers NestJS Module

**Task**: T6 — `yc-answers` module implementation  
**Branch**: `feat/gstack-phase1`  
**Code commit**: `56d1352`  
**Date**: 2026-04-13

## What was done

Created the `yc-answers` NestJS module under `api/src/yc-answers/`:

| File | Purpose |
|------|---------|
| `dto/create-yc-answer.dto.ts` | 6-field optional DTO (q1–q6, each `@MaxLength(4000)`) |
| `yc-answers.service.ts` | `create()` + `findLatest()` via PrismaService |
| `yc-answers.controller.ts` | `POST /projects/:projectId/yc-answers`, `GET /projects/:projectId/yc-answers/latest` |
| `yc-answers.module.ts` | Module wiring PrismaModule + controller + service |

`app.module.ts`: added import line (line 25) and `YcAnswersModule` entry at end of `imports[]` (line 66). No existing imports reordered.

## Verification

- `PrismaClient` already had `ycAnswer` (T5 migration + `prisma generate` done). Confirmed with `node -e "'ycAnswer' in new PrismaClient()"` → `true`.
- `npm run build` (`nest build`) exited with zero errors, zero output.

## Endpoints registered

| Method | Path | Description |
|--------|------|-------------|
| POST | `/projects/:projectId/yc-answers` | YC 6-Question 응답 저장 |
| GET  | `/projects/:projectId/yc-answers/latest` | 최신 YC 응답 조회 |

Global `JwtAuthGuard` covers both routes — no per-route guard added.

## Conventions followed

- Swagger: `@ApiTags`, `@ApiBearerAuth`, `@ApiOperation` on controller
- PrismaService injected via `PrismaModule` import (not direct provider)
- Service throws `NotFoundException` if `projectId` not found before insert
