# Changelog

All notable changes to the DevProgress MCP project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### Version Format
Given the rules strictly defined for this project, the versioning will follow a 4-digit notation string: 
`Major.Minor.Patch.Build` (e.g., `0.0.0.0` to start, advancing accordingly).

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
