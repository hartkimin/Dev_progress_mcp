# Supabase 마이그레이션 설계 (VibePlanner)

- **날짜**: 2026-04-14
- **대상 브랜치**: `feat/supabase-migration` (미생성, Phase 시작 시 만들 것)
- **현재 브랜치**: `feat/gstack-phase1`
- **스코프 레벨**: 풀 Supabase(옵션 C) + 수직 슬라이스 이전(옵션 B)

## 1. 결정 요약

| 항목 | 결정 |
|---|---|
| Supabase 활용 범위 | 풀 Supabase (DB + Auth + RLS) |
| 데이터 이전 | 없음 — 로컬 dev 데이터 폐기. 스키마만 새로 구축 |
| 배포 대상 | 로컬 self-hosted (`supabase start`, Docker 스택) |
| NestJS 운명 | 유지(축소). CRUD만 클라이언트로 이전, 통합 로직은 NestJS |
| 이전 순서 | 수직 슬라이스 (`projects` → `tasks` → `comments`) |

## 2. 최종 아키텍처

```
[Web (Next.js, :3002)]
  ├─ @supabase/ssr (쿠키 세션)
  ├─ supabase-js → Supabase Postgres (CRUD, RLS 적용)
  └─ fetch(Bearer Supabase JWT) → NestJS API

[Supabase 로컬 스택]
  ├─ Postgres (:54322)  — Prisma도 같은 DB 사용
  ├─ Auth (:54321)       — GitHub OAuth + Email OTP
  ├─ Studio (:54323)
  └─ Inbucket (:54324)   — 로컬 이메일 캡처

[NestJS API (:3333) — 축소판]
  ├─ Stripe webhook / billing
  ├─ plan-reviews (Gemini)
  ├─ notifications, events, keys, analytics, context
  ├─ JWT 검증: Supabase JWKS
  └─ DB 접근: service_role 또는 Prisma (RLS 우회)
```

**제거**: `vibeplanner-postgres` 컨테이너, `next-auth`, `/api/auth/[...nextauth]`, NestJS의 `login`/`register`/`sync` 엔드포인트, `bcrypt`.

**추가**: `supabase/` 디렉터리(config + migrations + tests), `@supabase/ssr` + `@supabase/supabase-js`, `jwks-rsa`, DB 트리거(`handle_new_user`), RLS 정책.

## 3. 인증 설계

### 로그인 플로우 (After)
- GitHub: `supabase.auth.signInWithOAuth({ provider: 'github' })`
- Email OTP(개발): `supabase.auth.signInWithOtp({ email })` → Inbucket에서 매직링크 확인

### GitHub OAuth 앱 재설정
- 기존 콜백 `http://localhost:3002/api/auth/callback/github`는 폐기(앱에서 삭제하지 말고 신규 콜백 추가만)
- 신규 콜백: `http://127.0.0.1:54321/auth/v1/callback`
- Client ID / Secret은 그대로 재사용 (`supabase/config.toml`의 `[auth.external.github]`에 주입)

### User ↔ auth.users 매핑
- Prisma `User.id`의 `@default(uuid())` 제거. 값은 `auth.users.id`와 동일한 UUID 사용
- DB 트리거로 자동 생성:

```sql
-- supabase/migrations/001_auth_trigger.sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
exception when others then
  raise warning 'handle_new_user failed: %', sqlerrm;
  return null;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### NestJS JWT 검증 교체
- **방식 A (권장, 로컬에 충분)**: HS256 대칭키 검증. `passport-jwt`의 `secretOrKey`를 `SUPABASE_JWT_SECRET` 환경변수로 설정. `supabase status`로 확인 가능. 단순하고 JWKS 불필요
- **방식 B (프로덕션용)**: RS256 + JWKS. Supabase 최신 버전은 비대칭 키 지원. `jwks-rsa`로 `<SUPABASE_URL>/auth/v1/.well-known/jwks.json`(경로는 CLI 버전에 따라 다를 수 있어 Phase 2에서 실제 엔드포인트 확인) 조회. 로컬은 방식 A로 시작하고 프로덕션 이전 시 B로 마이그레이션
- `req.user.sub` = `auth.users.id` (UUID) → Prisma `User.id`와 즉시 조인
- 만료/`aud`(`authenticated`)/`iss` 검증 필수

### 제거/교체 대상
- 제거: `web/src/app/api/auth/[...nextauth]/route.ts`, `api/src/auth/*`의 register/login/sync/bcrypt 관련
- 교체: `web/src/app/auth/signin/page.tsx`, `web/src/app/auth/signin/SignInForm.tsx` (Supabase Auth 기반 재작성)

## 4. 스키마 & RLS (수직 슬라이스)

### 스키마 변경점
- `users.id`: `@default(uuid())` 제거 (트리거가 채움)
- `projects.workspace_id`: NULLable → NOT NULL (RLS의 테넌시 기준)
- `@@map` 이름 유지(`users`, `workspaces`, `projects`, `tasks`, `comments`, `workspace_members`)
- Prisma 기존 마이그레이션 4개 폐기 → `prisma migrate dev --name init`으로 재생성

### RLS 정책 (수직 슬라이스 범위)

```sql
-- supabase/migrations/002_rls_vertical_slice.sql

create or replace function public.is_ws_member(ws uuid)
returns boolean language sql security definer stable as $$
  select exists(
    select 1 from public.workspace_members
    where workspace_id = ws and user_id = auth.uid()
  );
$$;

create or replace function public.is_ws_owner(ws uuid)
returns boolean language sql security definer stable as $$
  select exists(
    select 1 from public.workspace_members
    where workspace_id = ws and user_id = auth.uid() and role = 'OWNER'
  );
$$;

-- workspaces
alter table public.workspaces enable row level security;
create policy ws_read   on public.workspaces for select using (is_ws_member(id));
create policy ws_update on public.workspaces for update using (is_ws_owner(id));
-- INSERT는 서버 측(NestJS)에서만

-- workspace_members
alter table public.workspace_members enable row level security;
create policy wm_read   on public.workspace_members for select using (is_ws_member(workspace_id));
create policy wm_write  on public.workspace_members for all
  using (is_ws_owner(workspace_id))
  with check (is_ws_owner(workspace_id));

-- projects
alter table public.projects enable row level security;
create policy proj_rw on public.projects for all
  using (is_ws_member(workspace_id))
  with check (is_ws_member(workspace_id));

-- tasks
alter table public.tasks enable row level security;
create policy task_rw on public.tasks for all
  using (exists(select 1 from public.projects p
                where p.id = tasks.project_id and is_ws_member(p.workspace_id)))
  with check (exists(select 1 from public.projects p
                     where p.id = tasks.project_id and is_ws_member(p.workspace_id)));

-- comments
alter table public.comments enable row level security;
create policy comment_rw on public.comments for all
  using (exists(select 1 from public.tasks t
                join public.projects p on p.id = t.project_id
                where t.id = comments.task_id and is_ws_member(p.workspace_id)))
  with check (author_id = auth.uid()
              and exists(select 1 from public.tasks t
                         join public.projects p on p.id = t.project_id
                         where t.id = comments.task_id and is_ws_member(p.workspace_id)));
```

### RLS 적용 범위
- **적용**: `workspaces`, `workspace_members`, `projects`, `tasks`, `comments`
- **미적용 (당장)**: `documents`, `plan_reviews`, `notifications`, `subscriptions`, `api_keys`, `yc_answers`, `project_documents`, `project_document_versions`
- 미적용 테이블은 NestJS가 service_role 키로만 접근하므로 안전. 추후 도메인 단위 포팅 시 RLS 설계

## 5. 실행 순서

### Phase 0 — 준비 (~1h)
1. Supabase CLI 설치 (`scoop install supabase` 또는 공식 설치 스크립트)
2. `supabase init` → `supabase/` 디렉터리 생성
3. `supabase/config.toml` 편집: `[auth.external.github]`에 Client ID/Secret + 리다이렉트 URI
4. `docker-compose.yml`에서 `vibeplanner-postgres` 서비스 제거
5. `.env` 파일 갱신:
   - `api/.env`: `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres`, `SUPABASE_URL`, `SUPABASE_JWT_SECRET`(JWKS 사용 시 불필요)
   - `web/.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. `supabase start` → Studio 54323 접속 검증

### Phase 1 — 스키마 이전 (~4h)
> ⚠️ **전용 브랜치 `feat/supabase-migration`에서만 수행**. `main`/`feat/gstack-phase1`의 마이그레이션 원본은 보존.
1. `api/prisma/migrations/` 디렉터리 삭제
2. `schema.prisma` 수정:
   - `User.id`에서 `@default(uuid())` 제거
   - `projects.workspace_id`를 NOT NULL로
3. `supabase db reset` (Supabase DB 초기화)
4. `cd api && DATABASE_URL=... pnpm prisma migrate dev --name init`
5. `supabase/migrations/001_auth_trigger.sql` 작성
6. `supabase/migrations/002_rls_vertical_slice.sql` 작성
7. `supabase db reset` 재실행 → 무에러 확인

### Phase 2 — NestJS 인증 교체 (~4h)
1. `api/package.json`: `jwks-rsa` 추가
2. `api/src/auth/jwt.strategy.ts`: `secretOrKeyProvider`를 JWKS 기반으로 변경
3. `api/src/auth/auth.controller.ts`: `login`, `register`, `sync` 엔드포인트 제거
4. `api/src/auth/auth.service.ts`: bcrypt/password 관련 제거
5. `passport-jwt` `secret` 대신 `secretOrKeyProvider` 옵션 확인
6. 수동 테스트: Supabase에서 발급한 JWT로 NestJS `/projects` 200

### Phase 3 — Web 인증 교체 (~4h)
1. `web/package.json`: `@supabase/ssr`, `@supabase/supabase-js` 추가, `next-auth` 제거
2. `web/src/lib/supabase/{client,server,middleware}.ts` 생성 (Supabase 공식 Next.js 패턴)
3. `web/src/middleware.ts`: 세션 리프레시 미들웨어
4. `web/src/app/auth/signin/page.tsx`: Supabase Auth 기반으로 재작성 (GitHub 버튼 + Email OTP 폼)
5. `web/src/app/api/auth/[...nextauth]/route.ts` 삭제
6. 전 프로젝트에서 `useSession` / `getServerSession` 호출부를 `supabase.auth.getUser()`로 교체
7. 브라우저 테스트: GitHub → `auth.users` + `public.users` 생성 확인

### Phase 4 — 수직 슬라이스 웹 전환 (~1d)
1. `web/src/app/project/[id]/` 및 관련 컴포넌트 탐색
2. `fetch('/api/projects')` → `supabase.from('projects').select(...)` 교체
3. task/comment도 동일하게 교체
4. RLS 검증: 워크스페이스 A 유저로 워크스페이스 B의 project_id 직접 요청 → 0행

### Phase 5 — 정리 (~2h)
1. 나머지 도메인(billing, plan-reviews, notifications, events, keys, analytics, context, documents)의 JWT 검증 동작 확인
2. 사용 안 하는 의존성 제거(`next-auth`, `bcrypt`, `passport-local` 등)
3. README / `.env.example` / `docker-compose.yml` 주석 갱신

**총 예상: 3일 (집중 개발 기준)**

## 6. 검증 & 롤백

### 각 Phase DoD
| Phase | 성공 판정 |
|---|---|
| 0 | `supabase start` 정상, Studio/Inbucket 접속 |
| 1 | `supabase db reset` 무에러, 14개 테이블 확인, RLS가 anon role에 대해 0행 반환 |
| 2 | Supabase JWT로 NestJS 엔드포인트 200, 위조/만료 JWT 401 |
| 3 | GitHub/OTP 로그인 성공, `auth.users` + `public.users` 행 확인 |
| 4 | 수직 슬라이스 CRUD 정상, **교차 워크스페이스 접근 RLS 차단 확인** |
| 5 | `pnpm build`(api/web) 무에러, lint/tsc 통과 |

### RLS 테스트 (필수)
`supabase/tests/rls.test.sql` 작성. 최소 케이스:
1. 타 워크스페이스 project SELECT → 0행
2. 타 워크스페이스 task INSERT → 거부
3. 타인의 comment UPDATE (`with check` 위반) → 거부
4. 본인 workspace의 정상 CRUD → 성공

### 롤백 전략
- **브랜치 격리**: 전체 작업을 `feat/supabase-migration`에서. `main`/`feat/gstack-phase1`은 불변
- **Phase 0–1**: `git checkout -- .` + `supabase stop --no-backup`으로 리셋. dev 데이터 없어 손실 無
- **Phase 2–3**: 각 Phase별 별도 커밋. 문제 시 `git revert`
- **Phase 4**: 컴포넌트 단위 커밋

### 위험 요소 & 완화
| 위험 | 완화 |
|---|---|
| GitHub OAuth 콜백 충돌 | 기존 앱에 신규 콜백 URL **추가** (삭제X). 공존 |
| JWKS 캐시 무효화 지연 (방식 B 사용 시) | `jwks-rsa` `cacheMaxAge` 10분 이하, 재시작 시 수동 퍼지. 로컬은 방식 A(HS256)로 회피 |
| 트리거 실패 시 유령 auth.users | `handle_new_user` 함수에 `exception` 블록 + 경고 로그 |
| service_role 키 유출 | NestJS `.env`에만, Web 금지. `.env.example`/`.gitignore` 점검 |
| Prisma 마이그레이션 삭제 비가역 | 전용 브랜치에서만 작업. `main`은 원본 유지 |

## 7. 수락 기준 (전체)

1. 로컬에서 `supabase start` + `pnpm --dir api dev` + `pnpm --dir web dev`로 개발 가능
2. GitHub 로그인과 Email OTP 두 경로 모두 동작
3. `projects`/`tasks`/`comments` CRUD가 Web에서 `supabase-js` 직접 호출로 동작
4. 교차 워크스페이스 접근이 RLS로 차단됨 (테스트 스크립트 통과)
5. NestJS의 billing/plan-reviews/notifications 등 남은 기능이 Supabase JWT 인증으로 정상 동작
6. `next-auth`, `bcrypt` 등 제거 대상 의존성이 완전히 삭제됨

## 8. 이 스펙에서 다루지 않는 것 (Out of Scope)

- 프로덕션 데이터 이전 (dev only)
- Supabase Cloud 배포 / 환경 분리 (로컬만)
- Storage, Realtime, Edge Functions 활용
- 나머지 9개 도메인(documents/plan_reviews/notifications/subscriptions/api_keys/yc_answers/project_documents/project_document_versions/analytics)의 RLS 설계 — 추후 별도 스펙
- NestJS 잔존 모듈의 Edge Function 포팅 — 추후 별도 스펙
