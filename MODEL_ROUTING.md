# MODEL_ROUTING.md — VibePlanner

## Default tier
- **Sonnet (4.6)**: Drafting, code edits, reviews, day-to-day implementation.
- **Opus (4.6, 1M context)**: Architecture decisions, multi-file refactors, cross-layer reasoning (MCP↔API↔Web), spec writing, plan writing.
- **Haiku (4.5)**: Mechanical substitutions (i18n bulk add, path renames, import sorts). Use with explicit find/replace map.

## Decision rules
| Task trait | Model |
|------------|-------|
| Touches ≥3 files across api/ + web/ + src/ | Opus |
| Single file, straightforward CRUD | Sonnet |
| Pure text find/replace with explicit map | Haiku |
| New Prisma model or new NestJS module | Opus (plan), Sonnet (impl) |
| i18n KR/EN pair addition | Haiku |
| Plan review checklist application | Sonnet |
| QA / E2E investigation | Opus |

## Subagent dispatch
- Pattern A (parallel): each agent on Sonnet unless task is Opus-tier above.
- Pattern D (Reviewer): Opus (independent judgment).

## Evidence
Record actual model used in `.agents/briefs/<agent>.md` so routing can be tuned.
