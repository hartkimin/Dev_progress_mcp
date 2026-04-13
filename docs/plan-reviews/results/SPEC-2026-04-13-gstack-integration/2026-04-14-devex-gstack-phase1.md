---
kind: devex
project_id: SPEC-2026-04-13-gstack-integration
spec: docs/superpowers/specs/2026-04-13-gstack-integration-design.md
reviewer: solo (Claude as proxy)
date: 2026-04-14
score: 8
decision: accept
---

## 1. Core Questions

1. **Can I resume this in a fresh session by reading AGENTS.md + the latest brief?**
   Yes, with caveats. AGENTS.md contains OWNER_RULES, GOTCHAS, SUBAGENT_PROTOCOL, and gstack skill routing — sufficient to recover orchestration patterns. `.agents/briefs/T1`–`T14` provide commit-by-commit handoff. Plus `docs/vibe-kanban-board.md` lists all Done items with commit hashes and Todo with concrete next steps.

   Caveat: a fresh agent might not realize that `web/src/lib/db.ts` and `src/db.ts` are TWO different files (Web vs MCP HTTP clients). AGENTS.md OWNER_RULES mentions both, but explicit clarification ("Web is `web/src/lib/db.ts`, MCP is `src/db.ts`, both wrap the same NestJS API") would reduce confusion.

2. **MCP tool names discoverable and intuitive?**
   Names are clear: `save_yc_answers`, `get_yc_answers`, `save_plan_review`, `list_plan_reviews`, `get_plan_review`. Snake_case matches existing tool conventions in `src/index.ts`. Descriptions clearly state intent. Pass.

   Minor nit: `get_yc_answers` returns the *latest* one, not all answers. Name implies a list. Better: `get_latest_yc_answers`. Defer.

3. **Does AGENTS.md restore enough context for cold start?**
   Mostly yes. Pattern A/B/D coverage is sufficient. Risks:
   - The phrase "Reviewer (pattern D) auto-migrate to Todo" is a process rule but no mechanism enforces it — relies on agent discipline. Could be a checkbox in the kanban update commit message.
   - SUBAGENT_PROTOCOL item 6 ("Record which gstack skills were invoked") was inconsistently followed across T1–T15 briefs. Either tighten to a required field or drop it.

4. **Error messages and logs useful in production?**
   Adequate:
   - NestJS `NotFoundException(`Project ${projectId} not found`)` — actionable.
   - `fetchApi` throws `Error(`API error ${res.status}: ${text}`)` with body — useful for debugging.
   - MCP tool handlers return JSON — Claude Desktop / Cursor will surface errors clearly.
   - Web Server Actions propagate errors via thrown exceptions → Next.js error boundary or console.

   Gap: no structured logging (no log levels, no request IDs). For solo dev, console output is fine. Production would want pino/winston.

## 2. Evidence

- Cold-start dry run mental model: open `AGENTS.md` → `docs/vibe-kanban-board.md` → `docs/superpowers/plans/2026-04-13-gstack-integration-phase1.md` → resume from "Todo" column.
- Brief files exist for T1, T2, T3, T4, T5, T6, T7, T8, T9, T10-T11, T12-T13, T14.
- T15 (docker volume) and the board update have no brief — handled inline by orchestrator.

## 3. What would make this a 10?

- Add to `AGENTS.md` GOTCHAS: "MCP and Web have separate `db.ts` files; MCP=`src/db.ts`, Web=`web/src/lib/db.ts`. Both call same NestJS API."
- Rename `get_yc_answers` → `get_latest_yc_answers` to remove ambiguity.
- Add a `make` or `npm` script that runs the full dogfood loop (`docker-compose up`, get JWT, post a test review, verify file).
- Structured logging for production (deferred — Phase 2 scope).

## 4. Decision

- [x] accept
- [ ] revise
- [ ] reject

**Reason:** DevEx is solid for solo + AI-orchestrated workflow. Three "make it 10" items are small refinements, not blockers.

## 5. Todo migration

- Add db.ts disambiguation note to AGENTS.md GOTCHAS — quick win.
- Rename MCP tool `get_yc_answers` → `get_latest_yc_answers` (breaking, but no caller exists yet — safe now).
- (deferred) Dogfood-loop helper script.
- (deferred) Structured logging.
