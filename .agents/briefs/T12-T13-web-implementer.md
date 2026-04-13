# T12 + T13 Web Implementer Brief

**Branch**: `feat/gstack-phase1`
**Commits**: `e63dd5c` (T12), `5b293b1` (T13)
**Date**: 2026-04-13

---

## Server vs Client Decision

### Both parent files are `'use client'`

- `VibePhaseDashboard.tsx` — line 1: `'use client'`
- `AIContextView.tsx` — line 1: `'use client'`

**Chosen: Option B (Client Component) for both T12 and T13.**

Rationale: Both mount targets are Client Components. React does not allow async Server Components as JSX children rendered from a Client Component module in the same render tree. Option A (slot pattern) would require refactoring the parent pages that import `VibePhaseDashboard` and `AIContextView` to pass server-rendered slots as `children` props — a larger diff with more blast radius.

Option B converts both new components to `'use client'` with `useEffect` + `useState` fetch. This matches the established pattern in `YCQuestionsCard.tsx` (T11) exactly:
- `useEffect` with a cancellation flag
- Call server action (`listPlanReviews`) directly — Next.js allows calling Server Actions from Client Components
- Graceful error handling (catch silently, render empty/null)

---

## T12 — PlanReviewBadges

**File**: `web/src/app/project/[id]/planReview/PlanReviewBadges.tsx`

**Deviations from canonical (async Server Component) spec**:
- Added `'use client'` directive at top
- Replaced module-level `await listPlanReviews()` with `useEffect` + `useState<Map<Kind, Row>>`
- State initializes as empty `Map` so badges render immediately with gray/no-score appearance while data loads (no loading spinner — matches the spec's intent of an always-visible badge row)
- Cancellation flag (`cancelled`) prevents state updates after unmount

**Mount point in VibePhaseDashboard.tsx**:
- Import added at line 8 (after `YCQuestionsCard` import)
- JSX mount at line 61, inside the "Overall Progress" card, **between** the title/percentage row and the progress bar — visually sits in the header section above the phase grid
- Surrounded by comment `{/* Plan review score badges — T12 */}`

---

## T13 — PlanReviewHistory

**File**: `web/src/app/project/[id]/planReview/PlanReviewHistory.tsx`

**Deviations from canonical (async Server Component) spec**:
- Added `'use client'` directive at top
- Replaced module-level `await listPlanReviews()` + early return with `useEffect` + `useState<Row[]>`
- Added `loaded` boolean state: component returns `null` until fetch completes (prevents flash of empty `<details>`)
- `return null` guard: `if (!loaded || !rows.length) return null` — preserves the canonical spec's "render nothing if empty" behavior
- Cancellation flag prevents state update after unmount

**Mount point in AIContextView.tsx**:
- Import added at line 8 (after `EmptyStatePrompt` import)
- JSX mount at line 143-144, **outside** the `{MOCK.length === 0 ? ... : ...}` conditional, immediately before the closing `</div>` of the outer container
- This means `PlanReviewHistory` renders regardless of whether AI context records exist — it is bottom-of-page "more info" content, not gated on the AI context empty state
- Surrounded by comment `{/* Plan review history — T13 */}`

---

## Build

`npm run build` — exit 0, no TypeScript errors, no lint warnings related to these changes.
Compiled in 10.2s with 12 static pages generated successfully.
