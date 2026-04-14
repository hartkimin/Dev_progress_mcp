# Dashboard Restructure — Phase-Centric Navigation + gstack Promotion

**Status:** Design approved (2026-04-14)
**Scope:** Both home dashboard (`/`) and project dashboard (`/project/[id]`)
**Approach:** Option C — Full reorganization along the Vibe Coding 5-phase axis, promoting gstack Phase 1 components (YC Ideation, Plan Reviews) to first-class navigation.

---

## 1. Problem

The existing 15-tab × 4-group project dashboard (📋 프로젝트 / 🏗️ 설계 / 🔌 개발 / 🤖 AI 관리) was designed before gstack Phase 1 landed. gstack components (`YCQuestionsCard`, `PlanReviewBadges`, `PlanReviewHistory`) were introduced as additive slots inside existing tabs (`VibePhaseDashboard`, `AIContextView`), which leaves them discoverable only to users who already know where to look. With gstack Phase 2/3 on the roadmap, we need a navigation axis that mirrors the actual user journey (idea → ship) and provides a clear home for future strategy/planning tooling.

The home dashboard (`/`) currently shows only project cards and heuristic Vibe Alerts. It offers no visibility into strategy readiness (YC completion, plan review scores) across projects, even though that is the signal users most need before committing to implementation.

## 2. Goals

- Make gstack Phase 1 capabilities (YC Q&A, Plan Reviews) discoverable as first-class features.
- Replace the implicit "what / how / build / AI" taxonomy with an explicit phase-based taxonomy that matches Vibe Coding's 5 phases.
- Surface strategy-readiness signals on the home dashboard.
- Keep risk low: no DB schema changes, no URL breakage, append-only API additions.

## 3. Non-Goals

- Building gstack Phase 2/3 features (only reserve structural room for them).
- Changing the Vibe Coding 5-phase definitions (Ideation & Requirements / Architecture & Design / Implementation / Testing & QA / Deployment & Review).
- Rewriting existing tab internals (kanban, architecture, etc.) — we relocate and re-group only.
- Adding cross-project rollups beyond what fits in two readiness widgets.

## 4. Project Dashboard Navigation

6 top-level groups, ~17 tabs. Cross-cutting tabs live in **Overview**; phase-specific work lives under the corresponding phase.

| Group | Tabs | Source |
|-------|------|--------|
| 🏠 **Overview** (cross-cutting) | 칸반보드 · 캘린더 · KPI · Phase 진행도 · AI 컨텍스트 · 의사결정 | existing |
| 💡 **Ideation** | YC 질문 (Q1–Q6) · Plan Review Hub | ★ promoted from gstack |
| 🏗️ **Design** | 아키텍처 · DB 설계 · API 명세 | existing |
| 🔨 **Build** | 코드 리뷰 · 환경/인프라 | existing |
| 🧪 **QA** | 테스트 · 이슈 트래커 | existing (이슈 트래커 moved from 프로젝트) |
| 🚀 **Deploy** | 배포 · 변경이력 | existing (변경이력 moved from AI 관리) |

Key relocations:

- `YCQuestionsCard` is **extracted** from `VibePhaseDashboard` and becomes the `YC 질문` tab under Ideation.
- `PlanReviewHistory` is **extracted** from `AIContextView` and becomes the `Plan Review Hub` tab under Ideation. The hub adds an in-tab filter over `kind` (`CEO` / `Eng` / `Design` / `DevEx`) so all four review types are reachable from one place.
- `PlanReviewBadges` is **reused** as a per-phase summary strip rendered at the top of each phase group's landing view (Ideation shows CEO/Design-relevant badges, Design shows Eng/Design-relevant, Deploy shows DevEx).
- `이슈 트래커` moves to QA (bugs are a QA-phase concern).
- `변경이력` moves to Deploy (the post-deploy record).
- `VibePhaseDashboard` shrinks to a Phase-progress-only view and becomes the `Phase 진행도` tab in Overview (no longer contains YC or plan-review cards).
- `AIContextView` shrinks to AI-context content only (no plan-review section). It stays in Overview as `AI 컨텍스트`.

Tab keys (the `ViewType` union used by URL/state) are **unchanged**. Only the `category` value each tab carries is remapped:

`project` / `design` / `development` / `ai` → `overview` / `ideation` / `design` / `build` / `qa` / `deploy`

New tab keys introduced: `yc_questions`, `plan_review_hub`. Existing tab keys (`issue_tracker`, `changelog`, etc.) keep their identity and simply change group assignment.

## 5. Home Dashboard Redesign

Three stacked sections, in order:

1. **Vibe Alerts** — unchanged from today.
2. **Strategy Readiness** (new).
   - Header line: cross-project averages — `YC 완료율 N%` · `Plan Review 평균 점수 X/10`.
   - Widget A — **YC 미응답 Top 3**: projects whose latest `yc_answers` row is missing or incomplete, each with a `Ideation 시작하기` CTA linking to `/project/{id}?view=yc_questions`.
   - Widget B — **최근 Plan Review 5건**: each row shows a colored kind badge (CEO/Eng/Design/DevEx), a score, the project name, and a deep link to the review detail in Plan Review Hub.
3. **Active Projects** — existing card grid, with a **Phase progress strip** appended to each card.
   - Five mini-bars representing task-completion percentage per phase (derived from `tasks.phase` + `status`).
   - Plan Review presence per kind shown as four small dots (filled / outlined) above or below the strip.

Empty states: each widget renders a quiet empty state rather than hiding, so users learn the feature exists.

## 6. Data Layer

Append-only. No Prisma schema changes.

**New endpoint** — `GET /api/v1/analytics/strategy-readiness`:

- Auth-guarded; filters by `workspace.members.some({ userId })` like the fix applied 2026-04-14.
- Response shape (per project):
  ```json
  {
    "projects": [
      {
        "id": "...",
        "name": "...",
        "ycCompletionRate": 0.67,
        "planReviewAvgScore": 7.2,
        "planReviewCountByKind": { "CEO": 2, "Eng": 1, "Design": 0, "DevEx": 1 },
        "phaseProgress": [
          { "phase": "Ideation & Requirements", "total": 4, "done": 2 },
          { "phase": "Architecture & Design",   "total": 3, "done": 1 },
          { "phase": "Implementation",          "total": 6, "done": 0 },
          { "phase": "Testing & QA",            "total": 2, "done": 0 },
          { "phase": "Deployment & Review",     "total": 1, "done": 0 }
        ]
      }
    ],
    "aggregate": {
      "ycCompletionRate": 0.55,
      "planReviewAvgScore": 7.0
    }
  }
  ```
- Top-3 missing YC and Recent-5 plan reviews can be derived client-side from this response or provided as separate fields; we choose to derive client-side to keep the endpoint surface small.

**Extension of `/api/v1/analytics/project-summaries`**:

- Add a `phaseProgress` array (same shape as above) to each project summary so the existing `ProjectCard` strip can render without a second request. This is an additive field; existing consumers ignore it.

## 7. Frontend Refactor Map

| Change | File | Type |
|--------|------|------|
| 6-group `CATEGORIES` constant + tab `category` remap | `web/src/app/project/[id]/ProjectViewsContainer.tsx` | edit |
| New tab views `yc_questions`, `plan_review_hub` | same file | edit |
| Per-phase PlanReviewBadges strip — rendered as a fixed header above the active sub-tab for Ideation / Design / Deploy groups, filtered to the kinds listed below | same file | edit |

Badge-to-group mapping (kinds rendered in each group's header strip):

- Ideation → `CEO`, `Design`
- Design → `Eng`, `Design`
- Deploy → `DevEx`
- Build, QA, Overview → no badge strip (keeps these groups visually lighter; all reviews remain reachable in Plan Review Hub)
| Extracted YC tab component | `web/src/app/project/[id]/planReview/YCQuestionsView.tsx` | new (thin wrapper over existing `YCQuestionsCard`) |
| New Plan Review Hub with kind filter | `web/src/app/project/[id]/planReview/PlanReviewHub.tsx` | new |
| Shrink VibePhaseDashboard (remove YC card, remove plan-review badges if duplicative) | `web/src/app/project/[id]/VibePhaseDashboard.tsx` | edit |
| Shrink AIContextView (remove plan-review history section) | `web/src/app/project/[id]/AIContextView.tsx` | edit |
| Strategy Readiness section | `web/src/app/components/StrategyReadiness.tsx` | new |
| Phase progress strip on project card | `web/src/app/components/DashboardContent.tsx` | edit |
| DB client wrappers for new endpoint + extended summary | `web/src/lib/db.ts` | edit (append-only exports) |
| Analytics service + controller changes | `api/src/analytics/analytics.service.ts`, `analytics.controller.ts` | edit |

## 8. i18n

New keys (KR + EN simultaneously, per repo convention):

- Group labels: `navGroupOverview`, `navGroupIdeation`, `navGroupDesign`, `navGroupBuild`, `navGroupQa`, `navGroupDeploy`.
- Tab labels: `tabYcQuestions`, `tabPlanReviewHub`.
- Strategy Readiness: `strategyReadinessTitle`, `ycCompletionLabel`, `planReviewAvgLabel`, `ycMissingTop3Title`, `recentPlanReviewsTitle`, `startIdeationCta`.

Existing tab labels (`tabIssueTracker`, `tabChangelog`, etc.) are reused unchanged.

## 9. Backwards Compatibility

- All existing tab `key` values are preserved; any deep link like `?view=kanban` keeps working.
- `category` values change but are internal to `ProjectViewsContainer`; no external callers.
- API changes are additive; old clients ignore `phaseProgress`.
- No database migration.

## 10. Testing

- **Playwright E2E**: for each of the 6 groups, click a representative tab and assert its view renders. One extra test navigates Overview → Ideation → YC 질문 and verifies the YC form from the old embedded location is reachable at the new URL.
- **API unit**: `strategy-readiness` endpoint returns data only for projects the caller is a workspace member of (copy the 2026-04-14 regression pattern).
- **Home dashboard**: snapshot test ensures Phase progress strip renders with zero-task projects without throwing.

## 11. Rollout

Five PRs, in order:

1. Backend — `strategy-readiness` endpoint + `project-summaries.phaseProgress`.
2. Frontend — `ProjectViewsContainer` 6-group remap (pure relocation; no new views yet).
3. Frontend — extract YC + Plan Review into dedicated tabs; shrink `VibePhaseDashboard` and `AIContextView`.
4. Frontend — `StrategyReadiness` section + card phase strip on home.
5. i18n completion + E2E.

Each PR is independently shippable. After PR 2, users see the new grouping with all existing content still working. After PR 3, gstack Phase 1 is first-class. After PR 4, the home dashboard reflects the new axis.

## 12. Open Questions

None at sign-off. Minor details (exact colors for the 4 plan-review kind badges, empty-state copy) are delegated to the implementing engineer using existing design tokens.
