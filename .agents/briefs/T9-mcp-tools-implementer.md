# T9 Brief — MCP Tools Implementer

## Commit Hash
`abe071c` — feat(mcp): add 5 tools for plan-reviews and yc-answers

## Registration Pattern
**Pattern B (low-level)**: `server.setRequestHandler(ListToolsRequestSchema, ...)` + `server.setRequestHandler(CallToolRequestSchema, ...)` with a switch statement and hand-written JSON schema objects.

Style snippet:
```ts
// ListToolsRequestSchema handler — each tool entry:
{ name: "save_yc_answers", description: "...", inputSchema: { type: "object", properties: { ... }, required: [...] } }

// CallToolRequestSchema handler — each case:
case "save_yc_answers": {
    const { project_id, ... } = args as Record<string, any>;
    const row = await db.saveYcAnswers(project_id, { ... });
    return { content: [{ type: "text", text: JSON.stringify(row, null, 2) }] };
}
```

## Import Change
No change needed. The file uses `import * as db from './db.js'` (namespace import), so all 5 wrapper functions (`db.saveYcAnswers`, `db.getLatestYcAnswers`, `db.savePlanReview`, `db.listPlanReviews`, `db.getPlanReview`) were already accessible without modifying the import line.

## 5 Tools Added
| Tool name | DB wrapper |
|---|---|
| `save_yc_answers` | `db.saveYcAnswers(projectId, answers)` |
| `get_yc_answers` | `db.getLatestYcAnswers(projectId)` |
| `save_plan_review` | `db.savePlanReview(projectId, input)` |
| `list_plan_reviews` | `db.listPlanReviews(projectId, kind?)` |
| `get_plan_review` | `db.getPlanReview(id)` |

## git diff HEAD~1 --stat
```
 src/index.ts | 170 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++-
 1 file changed, 169 insertions(+), 1 deletion(-) 
```

## Notes
- T8 had a CRLF line-ending churn issue. Applied edits via Python with `newline=''` (no translation) to preserve the original LF-only endings. Verified 0 CRLF after write.
- Build: `npm run build` → exit 0 (zero TypeScript errors).
- All 5 tool names verified in `dist/index.js` (both ListTools array and CallTool switch cases).
