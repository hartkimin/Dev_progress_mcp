# T10+T11 Web Implementer Brief

**Branch**: feat/gstack-phase1
**Date**: 2026-04-13
**Commits**:
- `de807a3` feat(web): add plan-review/yc-answer wrappers in lib/db
- `77f0074` feat(web): add plan-review/yc-answer Server Actions
- `d94441c` feat(web): add YCQuestionsCard to Phase 1 Ideation

---

## i18n Hook Adaptation

**Finding**: `web/src/lib/i18n.tsx` exports `useTranslation()` (not `useI18n`).
Signature: `{ language: Language, toggleLanguage: () => void, t: (key: string) => string }`.

**Adaptation**: Changed prompt's `useI18n` import/usage to `useTranslation` from `@/lib/i18n`.

**Translation keys**: The YC-specific keys (`yc.title`, `yc.q1`–`yc.q6`, `yc.*.placeholder`,
`common.saving`, `common.save`) are NOT registered in the translations map in `i18n.tsx`.
The `t()` function returns the key string when a key is missing, so the UI will show the raw
key names as readable English fallback text. The loading state uses the existing `'loading'` key
which IS registered (`Loading...` / `불러오는 중...`).

**T14 action required**: Register the following keys in `web/src/lib/i18n.tsx` translations map:
- `yc.title`
- `yc.q1` through `yc.q6`
- `yc.q1.placeholder` through `yc.q6.placeholder`
- `common.saving`
- `common.save`

---

## Phase 1 Mount Location

**File**: `web/src/app/project/[id]/VibePhaseDashboard.tsx`
**Prop name in scope**: `projectId` (component signature: `{ projectId }: { projectId: string }`)
**Mount approach**: The dashboard renders all phases via a single `PHASE_CONFIG.map()` loop —
there is no dedicated per-phase JSX section. The Phase 1 card is rendered at `idx === 0`.

**Implementation**: Wrapped each map iteration in `<React.Fragment key={config.name}>` and
added `{idx === 0 && <YCQuestionsCard projectId={projectId} />}` immediately after the Phase 1
card `<div>`, before closing the Fragment. This places the YC card directly below the
"Ideation & Requirements" phase card.

**Line reference** (post-patch): The `{idx === 0 && ...}` guard is at approximately line 153
in the patched file.

---

## Deviations from Prompt

1. **`useI18n` → `useTranslation`**: Adapted as instructed (prompt noted to adapt if hook name differs).
2. **YC i18n keys absent**: Fell back to key-as-string display; documented above for T14.
3. **CRLF normalization**: Edit tool normalized line endings in `VibePhaseDashboard.tsx` from
   CRLF to LF (Windows repo). Content logic is identical; git diff shows 354 line changes due
   to line-ending conversion, but build passed cleanly.
4. **`field()` helper**: Added `key={key}` prop to the returned `<label>` element to satisfy
   React list key requirements (prompt code omitted it; would cause a React warning).

---

## Build Result

```
✓ Compiled successfully in 7.8s
✓ Generating static pages (12/12)
```
Exit 0. No TypeScript errors. No new warnings introduced.

---

## Self-Review Checklist

- [x] `web/src/lib/db.ts` extended only by appending; existing functions untouched (verified via `git diff`).
- [x] `planReviewActions.ts` is `'use server'` and re-exports db wrappers (no direct fetch).
- [x] YCQuestionsCard uses `useTranslation` (correct hook) with fallback documented.
- [x] VibePhaseDashboard mount is in Phase 1 area (`idx === 0`), using `projectId` prop.
- [x] Build exit 0.
