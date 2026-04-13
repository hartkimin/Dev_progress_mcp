---
title: gstack(Garry Tan) 스킬군 VibePlanner 통합 설계
status: draft → review
date: 2026-04-13
author: solo (hartkimin)
scope: Phase 1 (기획·전략 클러스터) — Heavy, Hybrid (Workflow + Product), Parallel rollout
priority_chain: 1 (Plan) → 2 (QA) → 3 (Design) → 4 (Deploy)
---

# gstack 스킬군 VibePlanner 통합 설계 (Phase 1: 기획·전략)

## 0. 요약

VibePlanner에 gstack(Garry Tan / YC + 헤드리스 브라우저 툴킷) 스킬군을 도입한다. 우선순위는 **1 기획 → 2 QA → 3 디자인 → 4 배포**. 본 문서는 **Phase 1 (기획·전략 클러스터)**의 스펙이며, 후속 3개 Phase는 본 스펙이 도그푸드로 검증된 이후 각각의 스펙으로 분화한다.

**하이브리드 통합 (Hybrid, 옵션 C)**:
- 트랙 A — **개발 워크플로**: `AGENTS.md` + `docs/superpowers/specs/` + Plan Review 4종 체크리스트 + `.agents/briefs/` + `docs/vibe-kanban-board.md`(라이트).
- 트랙 B — **제품 기능**: Postgres 신규 테이블 2개(`plan_reviews`, `yc_answers`) + 14탭 내 컴포넌트 3개(신규 탭 없음) + MCP 도구 5개(기존 `src/index.ts` append-only) + Server Actions 5종.

**전제**:
- 개발자 1명(solo), Postgres 저장, Heavy 스코프(2주), Parallel 롤아웃.
- **3-tier 아키텍처**: MCP Server (`src/`, HTTP 클라이언트) → REST API (`api/`, NestJS + Prisma) → Postgres. Web (`web/`, Next.js)는 REST API 소비.
- 기존 `src/index.ts`(934줄) · `src/db.ts`(245줄) export/interface 불변.
- DB 변경은 Prisma 신규 모델 추가만, 기존 모델 변경 금지. 별도 `prisma migrate dev` 마이그레이션 파일로 격리.
- REST API 변경은 신규 NestJS 모듈(`api/src/plan-reviews/`, `api/src/yc-answers/`) 추가만, 기존 모듈 불변.
- 14탭 구조 유지, 신규 탭 신설 금지.

## 1. 아키텍처 레이어

```
┌─────────────────────────────────────────────────────────┐
│ 1. Workflow Layer                                       │
│    - AGENTS.md (패턴 A/B/D, F는 미사용)                 │
│    - MODEL_ROUTING.md                                   │
│    - docs/superpowers/specs/                            │
│    - docs/vibe-kanban-board.md (3컬럼 라이트)           │
│    - .agents/briefs/                                    │
├─────────────────────────────────────────────────────────┤
│ 2. Plan Review Checklist Layer (MD 4종)                 │
│    - docs/plan-reviews/templates/{ceo,eng,design,devex} │
│    - docs/plan-reviews/results/<project_id>/...         │
├─────────────────────────────────────────────────────────┤
│ 3. Product Layer (web/, 14탭 내 확장)                   │
│    - YCQuestionsCard.tsx (Phase 1 Ideation)             │
│    - PlanReviewBadges.tsx (5-Phase 대시보드)            │
│    - PlanReviewHistory.tsx (AIContextView)              │
│    - actions/planReviewActions.ts (REST API 호출)       │
├─────────────────────────────────────────────────────────┤
│ 4. REST API Layer (api/, NestJS + Prisma)               │
│    - api/src/plan-reviews/  (controller+service+dto)    │
│    - api/src/yc-answers/    (controller+service+dto)    │
├─────────────────────────────────────────────────────────┤
│ 5. Persistence Layer (Prisma, Postgres)                 │
│    - model PlanReview  (신규)                           │
│    - model YcAnswer    (신규)                           │
│    - 기존 모델 변경 없음                                │
├─────────────────────────────────────────────────────────┤
│ 6. MCP Tool Layer (src/index.ts append, HTTP only)      │
│    - save_yc_answers / get_yc_answers                   │
│    - save_plan_review / list_plan_reviews               │
│      / get_plan_review                                  │
│    - 모두 REST API 호출(src/db.ts 확장)                 │
└─────────────────────────────────────────────────────────┘
```

## 2. Workflow Layer

### 2.1 AGENTS.md (경량, solo)

Orchestra 6패턴 중 채택:
- **A (단순 병렬)**: 독립 파일 2개 이상이면 Opus 병렬.
- **B (Lead 선행 + 병렬)**: 공통 의존성(MCP 도구 추가 등).
- **D (Reviewer 독립 감사)**: 복수 에이전트 실행 직후.
- **C (이종 언어 풀스택)**: MCP(TS) + Web(Next.js) 양측 변경 시 조건부.
- **E / F**: 미사용 (solo 스케일 오버헤드).

섹션:
- **OWNER_RULES**: `src/index.ts` append-only / `web/src/app/project/[id]/planReview/` 컴포넌트 분리 / `src/db.ts` 신규 테이블만 추가.
- **GOTCHAS**: Postgres 컬럼 추가 금지 · i18n 한/영 동시 반영 · 14탭 네비 불변 · CWD 의존 경로는 `PLAN_REVIEW_DIR` 환경변수로.
- **SUBAGENT_PROTOCOL (6항목)**: 선행 brief 참조 / Evidence Grep 확증 / Append-only 계약 / 완료 보고 `.agents/briefs/` / Reviewer 자동 스폰 / gstack 스킬 호출 기록.
- **gstack 스킬 연동표**: Phase 1에서 사용하는 스킬 — `/brainstorming`, `/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/plan-devex-review`, `/writing-plans`, `/executing-plans`.

### 2.2 MODEL_ROUTING.md

Haiku / Sonnet / Opus 판정 기준. Phase 1 기본: Sonnet(작성·리뷰), Opus(아키텍처 판단), Haiku(기계적 치환·i18n 일괄 추가).

### 2.3 docs/vibe-kanban-board.md (라이트, 3컬럼)

Todo / In Progress / Done. Reviewer 권고는 Todo로 자동 이관. Icebox·Blocked 생략.

### 2.4 .agents/briefs/

서브에이전트 완료 보고서. 커밋 추적 (solo 히스토리).

## 3. Plan Review 체크리스트 4종

### 3.1 파일 구조

```
docs/plan-reviews/
├── templates/
│   ├── ceo-review.md
│   ├── eng-review.md
│   ├── design-review.md
│   └── devex-review.md
└── results/
    └── <project-id>/
        └── YYYY-MM-DD-<kind>-<slug>.md
```

### 3.2 공통 프론트매터

```markdown
---
kind: ceo|eng|design|devex
project_id: <uuid>
spec: docs/superpowers/specs/<spec-file>.md
reviewer: solo
date: YYYY-MM-DD
score: 0-10
decision: accept|revise|reject
---
```

### 3.3 kind별 질문 (압축)

- **CEO (6Q)**: 10점 제품 경로 / 스코프 확장 / 좁은 웨지 / 현상 유지 문제 / 수요 현실 / Future-fit.
- **Eng (5Q)**: append-only 준수 / 스키마 신규 테이블만 / 엣지 케이스(i18n·Null·빈 리뷰) / 검증 방법 / 14탭 로드 영향.
- **Design (5Q)**: 시각 계층 / 다크·라이트 토큰 / AI slop 방지 / WCAG 2.1 AA / i18n 자연스러움.
- **DevEx (4Q)**: 세션 핸드오프 / MCP 도구 직관성 / AGENTS.md 복원 가능성 / 에러·로그 품질.

### 3.4 운영 규약

- **트리거**: spec 작성 직후 → writing-plans 직전. 순서: **스펙 → 리뷰 4종 → 플랜 → 실행**.
- **Reject 처리**: spec 수정 후 해당 kind만 재리뷰.
- **저장**: MD 파일(사람용) + Postgres `plan_reviews` 테이블(제품 UI용) 양측 동시. MCP 도구 `save_plan_review` 하나로 처리.

## 4. Persistence & REST API Layer

### 4.1 Prisma 스키마 (api/prisma/schema.prisma append)

기존 모델 수정 없음. 파일 끝에 append:

```prisma
model PlanReview {
  id        String   @id @default(uuid())
  projectId String   @map("project_id")
  kind      String   // 'ceo' | 'eng' | 'design' | 'devex'
  specPath  String?  @map("spec_path")
  mdPath    String?  @map("md_path")
  score     Int?
  decision  String?  // 'accept' | 'revise' | 'reject'
  payload   Json
  reviewer  String   @default("solo")
  createdAt DateTime @default(now()) @map("created_at")

  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId, kind, createdAt])
  @@map("plan_reviews")
}

model YcAnswer {
  id            String   @id @default(uuid())
  projectId     String   @map("project_id")
  q1Demand      String?  @map("q1_demand")
  q2StatusQuo   String?  @map("q2_status_quo")
  q3Specific    String?  @map("q3_specific")
  q4Wedge       String?  @map("q4_wedge")
  q5Observation String?  @map("q5_observation")
  q6FutureFit   String?  @map("q6_future_fit")
  createdAt     DateTime @default(now()) @map("created_at")

  project       Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId, createdAt])
  @@map("yc_answers")
}
```

`Project` 모델에는 `planReviews PlanReview[]` + `ycAnswers YcAnswer[]` 두 줄만 append. 다른 필드 변경 없음.

마이그레이션: `cd api && npx prisma migrate dev --name add_plan_reviews_and_yc_answers`. 단일 마이그레이션 파일로 격리.

`kind` / `decision` enum 강제는 NestJS DTO (`class-validator`) 레벨에서. Prisma enum은 기존 관례(`DocumentStatus`) 있으나 append-only 최소 변경 위해 생략.

### 4.2 REST API (NestJS 신규 모듈 2개)

`api/src/plan-reviews/`:
- `plan-reviews.module.ts`
- `plan-reviews.controller.ts` — 라우트:
  - `POST /api/v1/projects/:projectId/plan-reviews`
  - `GET  /api/v1/projects/:projectId/plan-reviews?kind=...`
  - `GET  /api/v1/plan-reviews/:id`
- `plan-reviews.service.ts` — Prisma 호출 + MD 파일 write (`PLAN_REVIEW_DIR` env, default `api/data/plan-reviews/results`)
- `dto/create-plan-review.dto.ts` — `class-validator`로 `kind` IN / `decision` IN / `score` 0-10 검증

`api/src/yc-answers/`:
- `yc-answers.module.ts`
- `yc-answers.controller.ts`:
  - `POST /api/v1/projects/:projectId/yc-answers`
  - `GET  /api/v1/projects/:projectId/yc-answers/latest`
- `yc-answers.service.ts` — Prisma 호출
- `dto/create-yc-answer.dto.ts`

두 모듈 모두 `api/src/app.module.ts` `imports` 배열에 append (기존 라인 변경 없음).

### 4.3 UI 컴포넌트 (신규 탭 없음)

| 위치 | 섹션 | 컴포넌트 (신규) |
|------|------|-----------------|
| `VibePhaseDashboard.tsx` (Phase 1 Ideation) | YC 6-Question 카드 | `YCQuestionsCard.tsx` |
| `VibePhaseDashboard.tsx` (각 Phase) | kind별 최신 score 배지 | `PlanReviewBadges.tsx` |
| `AIContextView.tsx` | "Plan Review History" 접이식 | `PlanReviewHistory.tsx` |

파일 경로: `web/src/app/project/[id]/planReview/`.

### 4.4 Web Server Actions

`web/src/app/actions/planReviewActions.ts` (신규) — 내부에서 REST API 호출:
- `saveYCAnswers(projectId, answers)` → `POST /yc-answers`
- `getLatestYCAnswers(projectId)` → `GET /yc-answers/latest`
- `savePlanReview(projectId, kind, payload)` → `POST /plan-reviews`
- `listPlanReviews(projectId, kind?)` → `GET /plan-reviews`
- `getPlanReview(id)` → `GET /plan-reviews/:id`

기존 `actions.ts` / `documentActions.ts`는 불변.

### 4.5 i18n

`web/src/lib/i18n.tsx`에 한/영 동시 추가:
- `planReview.kind.{ceo|eng|design|devex}`
- `yc.q1` ~ `yc.q6` (제목+플레이스홀더)
- `planReview.decision.{accept|revise|reject}`

### 4.2 UI 컴포넌트 (신규 탭 없음)

| 위치 | 섹션 | 컴포넌트 (신규) |
|------|------|-----------------|
| `VibePhaseDashboard.tsx` (Phase 1 Ideation) | YC 6-Question 카드 | `YCQuestionsCard.tsx` |
| `VibePhaseDashboard.tsx` (각 Phase) | kind별 최신 score 배지 | `PlanReviewBadges.tsx` |
| `AIContextView.tsx` | "Plan Review History" 접이식 | `PlanReviewHistory.tsx` |

파일 경로: `web/src/app/project/[id]/planReview/`.

### 4.3 Server Actions

`web/src/app/actions/planReviewActions.ts` (신규):
- `saveYCAnswers(projectId, answers)`
- `getLatestYCAnswers(projectId)`
- `savePlanReview(projectId, kind, payload)` — DB insert + MD write
- `listPlanReviews(projectId, kind?)`
- `getPlanReview(id)`

기존 `actions.ts` / `documentActions.ts`는 불변.

### 4.4 i18n

`web/src/lib/i18n.tsx`에 한/영 동시 추가:
- `planReview.kind.{ceo|eng|design|devex}`
- `yc.q1` ~ `yc.q6` (제목+플레이스홀더)
- `planReview.decision.{accept|revise|reject}`

## 5. MCP Tool Layer

`src/index.ts` 말미에 append (append-only) — 모두 HTTP로 `api/` REST 호출:

| Tool | HTTP 호출 | 용도 |
|------|-----------|------|
| `save_yc_answers` | `POST /yc-answers` | YC 6Q 저장 |
| `get_yc_answers` | `GET /yc-answers/latest` | 세션 복원 참조 |
| `save_plan_review` | `POST /plan-reviews` | 리뷰 저장 (MD write는 API가 담당) |
| `list_plan_reviews` | `GET /plan-reviews?kind=` | 히스토리 |
| `get_plan_review` | `GET /plan-reviews/:id` | 단건 |

`src/db.ts`에 래퍼 함수 5개 append (기존 export 불변). `initDb()`는 no-op 유지.

**MD 파일 write 책임**: MCP 서버가 아니라 **NestJS `PlanReviewsService`**가 수행. 경로: `${PLAN_REVIEW_DIR ?? 'api/data/plan-reviews/results'}/<projectId>/YYYY-MM-DD-<kind>-<slug>.md`. Docker 볼륨 마운트: `docker-compose.yml`의 api 서비스에 `./docs/plan-reviews/results:/app/api/data/plan-reviews/results` 추가(선택, 호스트 접근용). **docker-compose 볼륨 추가만 허용, 기존 설정 변경 금지**.

Slug 생성: `spec_path`의 basename 또는 payload의 title에서 영문/숫자/하이픈만 유지하고 소문자화. 예: `2026-04-13-ceo-gstack-integration.md`.

## 6. 2주 롤아웃 (Parallel)

### Week 1 — 스캐폴딩 + API 백엔드

| Day | 트랙 A (Workflow) | 트랙 B (API + DB) |
|-----|-------------------|------------------|
| 1 | `AGENTS.md` 초안 | 본 spec 커밋 + `docs/plan-reviews/templates/` 4 MD |
| 2 | `MODEL_ROUTING.md` | Prisma 스키마 append (PlanReview, YcAnswer) + `prisma migrate dev` |
| 3 | `docs/vibe-kanban-board.md` + `.agents/briefs/` | NestJS `yc-answers` 모듈 (controller+service+dto) |
| 4 | Plan Review 템플릿 자기적용 시작 | NestJS `plan-reviews` 모듈 + MD write 로직 |
| 5 | 체크리스트 4종 자기적용 완료 (도그푸드) | `src/db.ts` + `src/index.ts` MCP 도구 5개 append + 빌드 검증 |

### Week 2 — Web UI + 통합 QA

| Day | 작업 |
|-----|------|
| 6  | `web/.../planReviewActions.ts` 5 함수 (REST 호출) |
| 7  | `YCQuestionsCard.tsx` + Phase 1 통합 |
| 8  | `PlanReviewBadges.tsx` + 5-Phase 통합 |
| 9  | `PlanReviewHistory.tsx` + AIContextView 통합 |
| 10 | i18n 한/영 + 다크/라이트 QA |
| 11 | `/qa` 스킬 E2E (MCP→API→DB→Web 전 경로) + 버그 수정 |
| 12 | `/design-review` UI 감사 + 폴리시 |
| 13 | `/plan-eng-review` 자기적용 → Revise 반영 |
| 14 | CHANGELOG + 커밋 정리 + 1.3.0 태깅 |

## 7. 검증 기준 (완료 조건)

- [ ] `AGENTS.md`·`MODEL_ROUTING.md`·`docs/vibe-kanban-board.md` 커밋됨.
- [ ] 4종 체크리스트 템플릿이 **본 프로젝트에** 최소 1회씩 자기적용되어 `docs/plan-reviews/results/<this-project>/`에 기록됨.
- [ ] Prisma 마이그레이션 파일 1개로 `plan_reviews`·`yc_answers` 테이블 생성됨, 인덱스 포함.
- [ ] NestJS `plan-reviews`·`yc-answers` 모듈이 `app.module.ts`에 등록되고 `POST`/`GET` E2E 동작.
- [ ] MCP 도구 5개가 Claude Desktop/Cursor에서 호출 가능(수동 검증), 내부적으로 REST API 경유.
- [ ] MD 파일이 `api/data/plan-reviews/results/<projectId>/`에 생성됨.
- [ ] 3개 신규 컴포넌트가 다크/라이트·한/영 모두에서 정상 렌더.
- [ ] 기존 14탭·기존 MCP 도구·기존 Prisma 모델 모두 회귀 없음 (Prisma `db push` 또는 마이그레이션 diff로 확인).
- [ ] `/design-review` 감사 P1 이슈 0건.
- [ ] CHANGELOG 1.3.0 엔트리 작성.

## 8. 리스크 & 완화

| 리스크 | 완화 |
|--------|------|
| `src/index.ts` 부풀음 | Phase 1 직후 `src/tools/planReview.ts` 추출 리팩토링 spec 신설 |
| MD 경로 Docker 파손 | API 서비스 내부 경로 `api/data/...` 기본값, 호스트 접근은 volume 마운트(선택) |
| solo QA 누락 | Day 11 `/qa` 자동 실행 게이트 |
| Week 2 지연 | Day 14 hard cut, 폴리시는 Phase 2로 이관 |
| Prisma 마이그레이션 기존 DB 충돌 | `migrate dev` 전 `db pull`로 상태 확인, shadow DB로 dry-run |
| 기존 SQLite README 레거시 혼동 | 본 spec은 Postgres 전제 (Prisma datasource 기준) — README 정정은 Phase 2 스코프 |
| API 신규 모듈이 Auth 미적용 | 기존 `api/src/auth/` 가드를 신규 컨트롤러에도 동일 적용 (AuthGuard 데코레이터 확인) |

## 9. 후속 Phase 프리뷰 (본 스펙 외 스코프)

- **Phase 2 (QA)** — `/qa`, `/browse`, `/benchmark`, `/canary`, `/audit`, `/health`. 신규 테이블: `qa_sessions`, `health_scores`. 탭: Testing에 통합.
- **Phase 3 (Design)** — `/design-review`, `/critique`, `/polish`, `/normalize`. 테이블: `design_audits`. 탭: AIContext/Documentation에 통합.
- **Phase 4 (Deploy)** — `/ship`, `/land-and-deploy`, `/canary`, `/retro`. 테이블: `deployments`, `retros`. 탭: Deployment에 통합.

각 Phase는 본 Phase 1이 자기적용으로 검증된 이후 동일 절차(spec → review 4종 → plan → execute)로 진행.

## 10. Out of Scope

- 다중 사용자 리뷰(공동 리뷰어) — solo 전제.
- 실시간 알림 / 웹훅.
- Phase 2~4의 구현.
- `src/index.ts` 리팩토링(추출).
- README의 SQLite 레거시 정정.
- 기존 NestJS 모듈(projects/tasks/documents 등) 리팩토링.
