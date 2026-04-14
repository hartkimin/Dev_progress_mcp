# Changelog

All notable changes to the DevProgress MCP project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### Version Format
Given the rules strictly defined for this project, the versioning will follow a 4-digit notation string: 
`Major.Minor.Patch.Build` (e.g., `0.0.0.0` to start, advancing accordingly).

## [1.3.0] - 2026-04-14
### Added — gstack Integration Phase 1 (Plan/Strategy cluster)
- **Workflow scaffolding**: `AGENTS.md` (orchestration patterns A/B/D + OWNER_RULES + GOTCHAS + SUBAGENT_PROTOCOL), `MODEL_ROUTING.md` (Haiku/Sonnet/Opus tier selection), `docs/vibe-kanban-board.md` (3-column solo board), `.agents/briefs/` (subagent completion reports).
- **Plan Review system**: 4 checklist templates (CEO / Eng / Design / DevEx) at `docs/plan-reviews/templates/`. Each review persists as DB row + MD snapshot.
- **Prisma models** (additive migration): `PlanReview` (kind / payload / score / decision), `YcAnswer` (q1–q6 Ideation responses). Both with FK CASCADE to `Project`.
- **NestJS REST API**: 2 new modules (`yc-answers`, `plan-reviews`) with 5 routes: `POST/GET projects/:id/yc-answers/(latest)`, `POST/GET projects/:id/plan-reviews`, `GET plan-reviews/:id`. JWT-guarded, `class-validator` enforced.
- **MCP server tools**: 5 new tools — `save_yc_answers`, `get_yc_answers`, `save_plan_review`, `list_plan_reviews`, `get_plan_review`.
- **Web UI**: `YCQuestionsCard` (Phase 1 Ideation), `PlanReviewBadges` (5-Phase dashboard summary), `PlanReviewHistory` (AIContextView collapsible). Three new components in `web/src/app/project/[id]/planReview/`. Server Actions in `web/src/app/actions/planReviewActions.ts`.
- **i18n**: 23 new keys per language (KR + EN) covering YC questions and plan-review labels.
### Changed
- `docker-compose.yml`: api service gains `PLAN_REVIEW_DIR` env + volume mount `./docs/plan-reviews/results:/app/data/plan-reviews/results` for host-visible MD snapshots.
- `web/src/lib/db.ts` and `src/db.ts`: each appended with 5 wrapper functions for the new endpoints (existing exports unchanged, append-only contract).
### Append-only contract preserved
- Zero modifications to existing MCP tools, existing Prisma models, existing NestJS modules, existing 14-tab navigation, or existing Server Actions. All changes additive.
### Known follow-ups (tracked in `docs/vibe-kanban-board.md`)
- Wire `planReview.kind.*` i18n keys into `PlanReviewBadges` + `PlanReviewHistory` (currently English-only).
- Yellow badge (score 5–7) text contrast (currently ~3.0:1, below WCAG AA).
- `globalAccessToken` module-level state isolation for multi-tenancy.
- Add `.gitattributes` `* text=auto eol=lf` to suppress Windows CRLF diff churn.
- Refactor `src/index.ts` plan-review tools out to `src/tools/planReview.ts`.
- Orphan MD files after project FK cascade delete.
- Slug duplication when `specPath` already starts with a date prefix.
- Rename MCP tool `get_yc_answers` → `get_latest_yc_answers` for clarity (no callers yet, breaking-safe).

## [1.2.0] - 2026-03-06
### Changed
- Removed hardcoded API key from `call_mcp.js` (security fix).
- Unified Node.js Docker images to `node:22-alpine` across all services.
- Centralized API route prefix (`api/v1`) via `app.setGlobalPrefix()` in NestJS.
- Removed deprecated `version` key from `docker-compose.yml`.
### Added
- CORS support enabled in NestJS API.
- `.env.example` template for API developers.
### Removed
- Legacy `migrate.js` and `seed.ts` (SQLite era, replaced by Prisma + PostgreSQL).

## [1.1.0] - 2026-03-05
### Added
- TopNav one-click language toggler (EN ↔ KO).
- `append_project_document` MCP tool for atomic JSON array append.
- Dashboard restructured to 4-category, 14-tab layout.
### Changed
- MCP Server migrated from SQLite direct access to NestJS REST API client.

## [0.0.0.1] - 2026-03-03
### Added
- Integrated changelog for tracking MCP application version.
- Re-located "Live Sync Active" MCP component from the left Sidebar into an interactive header Popup in the Dashboard display.
- Version string display now placed on the bottom left corner profile of the user interface.

## [0.0.0.0] - Initial Foundation
### Added
- Initial DevProgress dashboard creation.
- MCP Kanban server sync capabilities for tasks tracking.
- Markdown rendering, timeline features, custom ticket status layouts.
