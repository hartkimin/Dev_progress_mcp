---
kind: design
project_id: SPEC-2026-04-13-gstack-integration
spec: docs/superpowers/specs/2026-04-13-gstack-integration-design.md
reviewer: solo (Claude as proxy)
date: 2026-04-14
score: 6
decision: revise
---

## 1. Core Questions

1. **Visual hierarchy — does the new section conflict with existing 14-tab layout?**
   Mostly OK. Three insertion points used (Phase 1 Ideation card, Overall Progress card top, AIContextView bottom). All append, no rearrangement of existing tabs/sections. Risk: `<YCQuestionsCard>` is a 6-textarea grid that takes significant vertical space inside the Phase 1 area — may dominate the dashboard if user has not collapsed any section. Consider wrapping in a `<details>` (as `PlanReviewHistory` does) to default-collapse on view.

2. **Tokens — dark/light mode?**
   Partial. New components use Tailwind utilities (`bg-blue-600`, `bg-green-600`, `text-white`, `border`, `opacity-60`) — these are theme-agnostic literals, not project token variables. Existing VibePlanner components likely use shared tokens or CSS variables for theming. **Important:** verify in browser at T17. If existing dashboard uses theme tokens, new components should mirror that for consistency in dark mode.

3. **AI slop check — gradients, meaningless icons, filler?**
   Clean. No gradients, no decorative icons, no filler text. Each element has purpose. Pass.

4. **Accessibility — WCAG 2.1 AA?**
   Two known issues:
   - **Yellow-600 + white text** in `PlanReviewBadges` for score 5–7 — contrast ~3.0:1, fails AA. Fix: use `text-slate-900` or `bg-yellow-500`.
   - **Save button** in `YCQuestionsCard` uses `bg-blue-600 text-white` — passes AA contrast.
   - Textareas have associated `<label>` (semantic), keyboard-navigable. Pass.
   - `<details>/<summary>` is keyboard-accessible by default. Pass.

5. **i18n — KR/EN reads naturally?**
   23 keys per language reviewed:
   - KR translations are concise and natural (e.g., `'수요 현실: 누가, 몇 명이 이걸 요청했나?'`). Pass.
   - EN matches gstack/YC vocabulary (e.g., "Demand reality", "Narrowest wedge"). Pass.
   - **Important**: Plan Review Badges and History are server-rendered with hardcoded English ("Plan Review History", "CEO"/"ENG"/etc.). They bypass i18n entirely. T14 added `planReview.kind.*` keys but T12/T13 don't use them. Either wire them up (small Client-side adaptation) or accept English-only for these surfaces.

## 2. Evidence

- Components: `web/src/app/project/[id]/planReview/{YCQuestionsCard,PlanReviewBadges,PlanReviewHistory}.tsx`
- i18n: `web/src/lib/i18n.tsx` keys committed in `a1afea7`
- Build: `npm run build` exit 0
- No live screenshots yet (T17 will produce these)

## 3. What would make this a 10?

- Wire `planReview.kind.*` keys into `PlanReviewBadges` and `PlanReviewHistory` (KR/EN coverage).
- Fix yellow contrast (bg-yellow-500 + text-slate-900).
- Wrap `<YCQuestionsCard>` in `<details>` for default-collapsed state, opt-in expansion.
- Verify dark/light token consistency via T17 visual QA — may require swapping literal Tailwind colors for project's design tokens.

## 4. Decision

- [ ] accept
- [x] revise
- [ ] reject

**Reason:** Two real issues (yellow contrast, hardcoded EN in badges/history) and one UX concern (Phase 1 dominance). All small fixes. Spec doesn't need to change — implementation does. Track as deferred items, address before T18 release tag if quick, otherwise queue for Phase 1 follow-up.

## 5. Todo migration

- Wire `planReview.kind.*` i18n keys into `PlanReviewBadges` + `PlanReviewHistory` — promote from deferred.
- Yellow contrast fix — promote from deferred.
- Consider `<details>` wrap on `YCQuestionsCard` — new Todo.
- Visual QA dark/light mode in T17 — track results.
