# Supabase Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** NextAuth + self-hosted Postgres를 Supabase(로컬 self-hosted 스택) + Supabase Auth로 교체. 수직 슬라이스(projects/tasks/comments)만 웹에서 `supabase-js` 직접 호출로 전환. NestJS는 유지하되 JWT 검증만 교체.

**Architecture:** 풀 Supabase(옵션 C) + 수직 슬라이스(옵션 B). 로컬 self-hosted `supabase start`. dev 데이터 폐기. NestJS는 strangler fig으로 축소(billing/plan-reviews/notifications/events/keys/analytics/context/documents/subscriptions/api_keys/yc_answers 유지). GitHub OAuth + Email OTP. RLS는 `workspaces/workspace_members/projects/tasks/comments` 5개 테이블.

**Tech Stack:** Supabase CLI, Supabase Postgres + Auth, `@supabase/ssr` + `@supabase/supabase-js`, NestJS + Prisma + `passport-jwt` (HS256 대칭키 검증), Next.js 14 App Router.

**Spec:** `docs/superpowers/specs/2026-04-14-supabase-migration-design.md`

---

## File Structure

**새로 생성**
- `supabase/config.toml` (CLI init이 생성) — `[auth.external.github]` 섹션 수동 수정
- `supabase/migrations/001_init_schema.sql` — Prisma가 덤프한 스키마 그대로
- `supabase/migrations/002_auth_trigger.sql` — `auth.users` → `public.users` 트리거
- `supabase/migrations/003_rls_vertical_slice.sql` — RLS 정책
- `supabase/tests/rls.test.sql` — pgTAP 기반 RLS 교차 접근 검증
- `web/src/lib/supabase/client.ts` — 브라우저 클라이언트
- `web/src/lib/supabase/server.ts` — RSC/Route Handler 서버 클라이언트
- `web/src/lib/supabase/middleware.ts` — 세션 리프레시 헬퍼
- `web/src/middleware.ts` — Next.js 미들웨어

**수정**
- `docker-compose.yml` — `vibeplanner-postgres` 서비스 제거, `vibeplanner-api`의 `DATABASE_URL` 변경
- `api/prisma/schema.prisma` — `User.id` default 제거, `Project.workspaceId` NOT NULL
- `api/src/auth/jwt.strategy.ts` — Supabase JWT 검증으로 교체
- `api/src/auth/auth.controller.ts` — `login`/`register`/`sync` 엔드포인트 제거
- `api/src/auth/auth.service.ts` — bcrypt/password 로직 제거
- `api/src/auth/auth.module.ts` — 불필요 provider 제거
- `web/src/app/auth/signin/page.tsx` — Supabase Auth 기반으로 재작성
- `web/src/app/auth/signin/SignInForm.tsx` — 동일
- `web/src/components/NotificationBell.tsx` — `useSession` → `supabase.auth.getUser()`
- `web/src/components/UserProfileMenu.tsx` — 동일
- `web/src/components/SyncAuth.tsx` — 제거 또는 no-op화 (DB 트리거로 대체됨)
- `web/src/lib/db.ts` — `getServerSession` → `supabase.auth.getUser()` 기반 재작성
- `api/.env` / `web/.env.local` — Supabase URL/Key/JWT Secret 추가, 기존 GitHub OAuth 제거
- `api/package.json` / `web/package.json` — 의존성 변경

**삭제**
- `api/prisma/migrations/` (전체) — Phase 1에서 재생성
- `web/src/app/api/auth/[...nextauth]/route.ts`
- `web/src/lib/authOptions.ts`

**미변경 (확인만)**
- `api/src/projects/`, `api/src/tasks/`, `api/src/comments/` — NestJS 경로 유지 (다른 소비자 존재 가능성)
- `api/src/billing/`, `api/src/plan-reviews/`, `api/src/notifications/`, 기타 — JWT 검증 변화만 영향

---

## Branch Setup

- [ ] **Create migration branch**

```bash
cd D:/Project/16_VibePlanner
git status  # 현재 feat/gstack-phase1, docs 커밋 d8ceca1까지 포함 상태여야 함
git checkout -b feat/supabase-migration
git log --oneline -3
```

Expected: 새 브랜치 생성. 최근 커밋 `d8ceca1 docs(spec): add Supabase migration design ...`

---

## Phase 0 — Preparation

### Task 0.1: Install Supabase CLI

**Files:** (없음 — 시스템 설치)

- [ ] **Step 1: Install**

Windows 환경. scoop 있으면 scoop로, 없으면 공식 Windows 인스톨러 또는 `npm`:

```bash
# 옵션 A (scoop, 권장)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# 옵션 B (npm — 글로벌 CLI 래퍼)
# 주의: 공식 권장은 아님. scoop 실패 시 사용.
npm install -g supabase

# 검증
supabase --version
```

Expected: 버전 문자열(예: `1.x.x`) 출력

- [ ] **Step 2: Docker Desktop 실행 확인**

```bash
docker version
docker compose version
```

Expected: 양쪽 OK. Supabase CLI는 Docker 필요.

### Task 0.2: Initialize Supabase Project

**Files:**
- Create: `supabase/` 디렉터리 (CLI가 생성)

- [ ] **Step 1: Init**

```bash
cd D:/Project/16_VibePlanner
supabase init
```

Expected: `supabase/config.toml`, `supabase/seed.sql`, `supabase/migrations/` 생성

- [ ] **Step 2: `.gitignore` 점검**

```bash
grep -n "supabase" .gitignore || echo "supabase/.temp and supabase/.branches not ignored"
```

필요 시 추가:

```
# supabase
supabase/.temp/
supabase/.branches/
```

- [ ] **Step 3: Commit**

```bash
git add supabase .gitignore
git commit -m "chore(supabase): init supabase project scaffold"
```

### Task 0.3: Configure GitHub OAuth in Supabase

**Files:**
- Modify: `supabase/config.toml`

- [ ] **Step 1: Read existing config**

```bash
cat supabase/config.toml | grep -A 5 "\[auth.external"
```

- [ ] **Step 2: Set GitHub provider**

`supabase/config.toml`의 `[auth.external.github]` 섹션을 다음으로 수정:

```toml
[auth.external.github]
enabled = true
client_id = "env(GITHUB_ID)"
secret = "env(GITHUB_SECRET)"
redirect_uri = "http://127.0.0.1:54321/auth/v1/callback"
```

`[auth]` 섹션에서 site_url / additional_redirect_urls 설정:

```toml
[auth]
site_url = "http://localhost:3002"
additional_redirect_urls = ["http://localhost:3002/auth/callback"]
```

`[auth.email]` 섹션에서 OTP 활성화 (로컬 개발용):

```toml
[auth.email]
enable_signup = true
enable_confirmations = false  # 로컬만. 프로덕션은 true 권장
```

- [ ] **Step 3: Supabase CLI용 `.env` 파일 생성**

Create: `supabase/.env` (CLI가 `env(VAR)` 레퍼런스 시 참조)

```
GITHUB_ID=Ov23liZEBIUJeP1Bl4la
GITHUB_SECRET=8c5dda8ea7e995dfaa35c92b404be0eea347e1b0
```

`.gitignore`에 `supabase/.env` 추가 (이미 `.env`가 있으면 포함됨 — 확인):

```bash
grep -E "^supabase/\.env|^\.env" .gitignore
```

필요 시 `supabase/.env` 한 줄 추가.

- [ ] **Step 4: GitHub OAuth App 콜백 URL 추가**

수동 단계 (브라우저):
1. https://github.com/settings/developers → VibePlanner OAuth App
2. Authorization callback URL 항목에 `http://127.0.0.1:54321/auth/v1/callback` **추가** (기존 URL 삭제 금지 — 롤백 대비)
3. Save

- [ ] **Step 5: Commit**

```bash
git add supabase/config.toml .gitignore
# supabase/.env는 커밋하지 않음
git commit -m "chore(supabase): configure github oauth + email otp for local dev"
```

### Task 0.4: Remove vibeplanner-postgres from docker-compose

**Files:**
- Modify: `docker-compose.yml`

- [ ] **Step 1: Read current state**

```bash
cat docker-compose.yml
```

- [ ] **Step 2: Edit**

`docker-compose.yml`에서:
1. `postgres:` 서비스 블록 전체 삭제
2. `api:` 서비스의 `depends_on.postgres` 조건부 참조 제거
3. `api:` 서비스의 `DATABASE_URL` 환경변수를 `postgresql://postgres:postgres@host.docker.internal:54322/postgres`로 변경 (Docker 컨테이너가 호스트의 Supabase에 접근)
4. Volume `postgres_data:` 정의 삭제 (파일 끝 `volumes:` 섹션)

- [ ] **Step 3: Stop and remove old postgres**

```bash
docker compose down
docker volume ls | grep postgres  # 기존 볼륨 확인
docker volume rm 16_vibeplanner_postgres_data  # 있으면 제거 (이름은 prefix에 따라 다름)
```

- [ ] **Step 4: Commit**

```bash
git add docker-compose.yml
git commit -m "chore(docker): remove postgres service, supabase stack replaces it"
```

### Task 0.5: Start Supabase Stack

**Files:** (없음)

- [ ] **Step 1: Start**

```bash
cd D:/Project/16_VibePlanner
supabase start
```

Expected 출력 포함:
```
API URL: http://127.0.0.1:54321
DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL: http://127.0.0.1:54323
Inbucket URL: http://127.0.0.1:54324
JWT secret: <긴 문자열>
anon key: eyJ...
service_role key: eyJ...
```

**이 값들을 기록**. 다음 태스크에서 `.env`에 넣음.

- [ ] **Step 2: Verify Studio**

브라우저에서 http://127.0.0.1:54323 접속 → Supabase Studio 대시보드 표시

- [ ] **Step 3: Verify DB**

```bash
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -c "select version();"
```

Expected: PostgreSQL 15.x 버전 출력

### Task 0.6: Update Environment Files

**Files:**
- Modify: `api/.env`
- Modify: `web/.env.local`

- [ ] **Step 1: Update api/.env**

`api/.env`에서:
- `DATABASE_URL`을 `postgresql://postgres:postgres@127.0.0.1:54322/postgres`로 변경 (로컬 개발; Docker 내부에서는 `host.docker.internal:54322`)
- 다음 추가 (값은 Task 0.5의 출력에서):

```
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_JWT_SECRET=<Task 0.5의 JWT secret>
SUPABASE_SERVICE_ROLE_KEY=<Task 0.5의 service_role key>
```

- 제거: `JWT_SECRET` (있으면), NextAuth 관련 변수

- [ ] **Step 2: Update web/.env.local**

`web/.env.local`에서:
- 제거: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `ENABLE_DEV_AUTH`, `GITHUB_ID`, `GITHUB_SECRET` (기존 NextAuth GitHub 설정)
- 추가:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Task 0.5의 anon key>
```

`API_BASE_URL`은 기존대로 `http://localhost:3333/api/v1` 유지.

- [ ] **Step 3: Verify**

```bash
grep -E "SUPABASE|DATABASE_URL" api/.env web/.env.local
```

Expected: 위 변수들이 모두 설정됨

- [ ] **Step 4: Update `.env.example` files**

같은 구조로 `api/.env.example`과 `web/.env.example` 업데이트 (실제 값 대신 플레이스홀더).

- [ ] **Step 5: Commit**

```bash
git add api/.env.example web/.env.example
git commit -m "chore(env): switch env examples to supabase (DATABASE_URL + SUPABASE_*)"
# .env 파일들은 gitignore되어 커밋 안 됨
```

---

## Phase 1 — Schema Migration

### Task 1.1: Update Prisma Schema

**Files:**
- Modify: `api/prisma/schema.prisma`

- [ ] **Step 1: Change User.id default**

`api/prisma/schema.prisma`에서 `model User {` 블록:

```prisma
model User {
  id        String   @id  // @default(uuid()) 제거 — Supabase auth.users.id와 동일 값
  name      String
  email     String   @unique
  createdAt DateTime @default(now()) @map("created_at")
  // ... 나머지 그대로
}
```

- [ ] **Step 2: Change Project.workspaceId to NOT NULL**

```prisma
model Project {
  id          String   @id @default(uuid())
  workspaceId String   @map("workspace_id")  // ? 제거
  name        String
  description String?
  createdAt   DateTime @default(now()) @map("created_at")

  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)  // ? 제거
  // ... 나머지 그대로
}
```

### Task 1.2: Reset Prisma Migrations

**Files:**
- Delete: `api/prisma/migrations/` (전체)

- [ ] **Step 1: Remove old migrations**

```bash
cd D:/Project/16_VibePlanner
rm -rf api/prisma/migrations
ls api/prisma
```

Expected: `schema.prisma`만 남음 (`migrations/` 없음)

- [ ] **Step 2: Generate fresh init migration**

```bash
cd api
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres" npx prisma migrate dev --name init
```

Expected:
- `api/prisma/migrations/<timestamp>_init/migration.sql` 생성
- DB에 모든 테이블 생성됨

- [ ] **Step 3: Verify tables**

```bash
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -c "\dt public.*"
```

Expected: 14개 테이블 (users, workspaces, workspace_members, projects, tasks, comments, project_documents, project_document_versions, plan_reviews, yc_answers, subscriptions, notifications, api_keys, _prisma_migrations)

- [ ] **Step 4: Commit**

```bash
cd D:/Project/16_VibePlanner
git add api/prisma
git commit -m "feat(schema): reset migrations for supabase, enforce workspace_id NOT NULL"
```

### Task 1.3: Create Auth Trigger Migration

**Files:**
- Create: `supabase/migrations/<timestamp>_auth_trigger.sql`

- [ ] **Step 1: Generate migration file**

```bash
supabase migration new auth_trigger
```

Expected: `supabase/migrations/<timestamp>_auth_trigger.sql` 빈 파일 생성

- [ ] **Step 2: Write trigger**

해당 파일에 전체 내용:

```sql
-- Automatically create a public.users row when a new auth.users is inserted.
-- This replaces the old NestJS /auth/sync endpoint.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name, created_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    now()
  )
  on conflict (id) do nothing;
  return new;
exception when others then
  raise warning 'handle_new_user failed for %: %', new.id, sqlerrm;
  return new;  -- auth.users insert는 계속 진행 (유령 방지)
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### Task 1.4: Create RLS Vertical Slice Migration

**Files:**
- Create: `supabase/migrations/<timestamp>_rls_vertical_slice.sql`

- [ ] **Step 1: Generate**

```bash
supabase migration new rls_vertical_slice
```

- [ ] **Step 2: Write policies**

해당 파일에 전체 내용:

```sql
-- Row-Level Security for the vertical-slice domain.
-- Tables outside this list are NOT rls-enabled and must only be accessed
-- via the service_role key (NestJS) until future domain slices port them.

-- Helper functions
create or replace function public.is_ws_member(ws uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists(
    select 1 from public.workspace_members
    where workspace_id = ws and user_id = auth.uid()
  );
$$;

create or replace function public.is_ws_owner(ws uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists(
    select 1 from public.workspace_members
    where workspace_id = ws and user_id = auth.uid() and role = 'OWNER'
  );
$$;

-- users: 본인 행만 조회/수정
alter table public.users enable row level security;
create policy users_self_read   on public.users for select using (id = auth.uid());
create policy users_self_update on public.users for update using (id = auth.uid());

-- workspaces
alter table public.workspaces enable row level security;
create policy ws_read   on public.workspaces for select using (public.is_ws_member(id));
create policy ws_update on public.workspaces for update using (public.is_ws_owner(id)) with check (public.is_ws_owner(id));
-- INSERT는 서버(service_role)에서만

-- workspace_members
alter table public.workspace_members enable row level security;
create policy wm_read  on public.workspace_members for select using (public.is_ws_member(workspace_id));
create policy wm_write on public.workspace_members for all
  using (public.is_ws_owner(workspace_id))
  with check (public.is_ws_owner(workspace_id));

-- projects
alter table public.projects enable row level security;
create policy proj_rw on public.projects for all
  using (public.is_ws_member(workspace_id))
  with check (public.is_ws_member(workspace_id));

-- tasks
alter table public.tasks enable row level security;
create policy task_rw on public.tasks for all
  using (exists(
    select 1 from public.projects p
    where p.id = tasks.project_id and public.is_ws_member(p.workspace_id)
  ))
  with check (exists(
    select 1 from public.projects p
    where p.id = tasks.project_id and public.is_ws_member(p.workspace_id)
  ));

-- comments
alter table public.comments enable row level security;
create policy comment_read on public.comments for select using (
  exists(
    select 1 from public.tasks t
    join public.projects p on p.id = t.project_id
    where t.id = comments.task_id and public.is_ws_member(p.workspace_id)
  )
);
create policy comment_write on public.comments for insert with check (
  author_id = auth.uid()
  and exists(
    select 1 from public.tasks t
    join public.projects p on p.id = t.project_id
    where t.id = comments.task_id and public.is_ws_member(p.workspace_id)
  )
);
create policy comment_update on public.comments for update using (author_id = auth.uid());
create policy comment_delete on public.comments for delete using (author_id = auth.uid());
```

### Task 1.5: Apply Migrations and Verify

**Files:** (없음)

- [ ] **Step 1: Reset Supabase DB with all migrations**

```bash
supabase db reset
```

Expected: 무에러. 모든 마이그레이션 적용됨 (Prisma의 init + auth_trigger + rls).

> ⚠️ **주의**: `supabase db reset`은 기본적으로 `supabase/migrations/*.sql`만 적용. Prisma 마이그레이션은 별도. 순서:
> 1. `supabase db reset` → supabase/migrations만 적용 (이 시점엔 Prisma 테이블 없음 → trigger가 users 테이블 없어 fail)
> 
> 따라서 **Prisma 스키마를 supabase/migrations에 복사**해야 함. Step 2 참조.

- [ ] **Step 2: Consolidate Prisma init into supabase migrations**

```bash
# Prisma가 생성한 init SQL 확인
cat api/prisma/migrations/*_init/migration.sql

# 이 내용을 supabase/migrations/<earliest>_init_schema.sql로 복사
# 순서: init_schema → auth_trigger → rls_vertical_slice (파일명 타임스탬프로 보장)
```

실제 순서 보장을 위해 파일명 앞 타임스탬프를 조정:
- `YYYYMMDDHHMMSS_init_schema.sql` (가장 빠른 타임스탬프)
- `YYYYMMDDHHMMSS_auth_trigger.sql`
- `YYYYMMDDHHMMSS_rls_vertical_slice.sql`

```bash
ls supabase/migrations  # 파일명 순서 확인
```

- [ ] **Step 3: Reset and apply**

```bash
supabase db reset
```

Expected: 3개 마이그레이션 순차 적용, 무에러

- [ ] **Step 4: Verify RLS is ON**

```bash
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -c "
  select tablename, rowsecurity from pg_tables 
  where schemaname = 'public' and tablename in ('users','workspaces','workspace_members','projects','tasks','comments');
"
```

Expected: 6개 테이블 모두 `rowsecurity = t`

- [ ] **Step 5: Verify anonymous access is blocked**

```bash
# anon 키로 projects 조회 → 0행 (인증 없으므로 auth.uid()가 null)
curl "http://127.0.0.1:54321/rest/v1/projects?select=*" \
  -H "apikey: <anon key>" \
  -H "Authorization: Bearer <anon key>"
```

Expected: `[]`

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations
git commit -m "feat(supabase): add auth trigger and RLS for vertical slice"
```

### Task 1.6: Prisma Schema Sync Check

**Files:** (없음)

- [ ] **Step 1: Regenerate Prisma client**

```bash
cd api
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres" npx prisma generate
```

- [ ] **Step 2: Verify Prisma sees tables**

```bash
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres" npx prisma db pull --print | head -50
```

Expected: 스키마 일치 확인

---

## Phase 2 — NestJS JWT Verification Swap

### Task 2.1: Remove Old Auth Endpoints

**Files:**
- Modify: `api/src/auth/auth.controller.ts`
- Modify: `api/src/auth/auth.service.ts`

- [ ] **Step 1: Read current controller**

```bash
cat api/src/auth/auth.controller.ts
```

- [ ] **Step 2: Remove login/register/sync**

`api/src/auth/auth.controller.ts`에서 `@Post('login')`, `@Post('register')`, `@Post('sync')` 핸들러 메서드 삭제. 관련 DTO import도 정리.

`getProfile` 같은 보호된 GET 엔드포인트는 유지(디버깅용).

- [ ] **Step 3: Remove bcrypt/password from service**

`api/src/auth/auth.service.ts`:
- `validateUser`, `register`, `login`, `syncUser` 중 password/bcrypt 사용 메서드 모두 삭제
- `bcrypt` import 제거

- [ ] **Step 4: Update module**

`api/src/auth/auth.module.ts`에서 더 이상 사용 안 하는 provider/import 제거.

- [ ] **Step 5: Run tests to see what breaks**

```bash
cd api && pnpm test auth
```

Expected: 일부 테스트 실패. Task 2.3에서 수정.

### Task 2.2: Switch JWT Strategy to Supabase

**Files:**
- Modify: `api/src/auth/jwt.strategy.ts`

- [ ] **Step 1: Read current strategy**

```bash
cat api/src/auth/jwt.strategy.ts
```

- [ ] **Step 2: Rewrite**

`api/src/auth/jwt.strategy.ts` 전체 교체:

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface SupabaseJwtPayload {
  sub: string;          // auth.users.id (uuid)
  email?: string;
  aud: string;          // "authenticated"
  role: string;         // "authenticated" | "anon" | "service_role"
  iss?: string;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret = process.env.SUPABASE_JWT_SECRET;
    if (!secret) {
      throw new Error('SUPABASE_JWT_SECRET is not set');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      audience: 'authenticated',
      algorithms: ['HS256'],
    });
  }

  async validate(payload: SupabaseJwtPayload) {
    // Passport이 req.user에 주입
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
```

- [ ] **Step 3: Build and check**

```bash
cd api && pnpm build
```

Expected: TS 에러 없음

### Task 2.3: Update Tests

**Files:**
- Modify: `api/src/auth/auth.service.spec.ts`
- Modify: `api/src/auth/auth.controller.spec.ts`

- [ ] **Step 1: Remove deleted-endpoint tests**

두 파일에서 삭제된 메서드(`login`, `register`, `syncUser`, `validateUser`) 관련 테스트 제거.

- [ ] **Step 2: Add JWT strategy test**

`api/src/auth/jwt.strategy.spec.ts` 새로 생성:

```typescript
import { JwtStrategy } from './jwt.strategy';
import * as jwt from 'jsonwebtoken';

describe('JwtStrategy (Supabase HS256)', () => {
  const SECRET = 'test-secret-at-least-32-chars-long-for-hs256-ok';
  let strategy: JwtStrategy;

  beforeAll(() => {
    process.env.SUPABASE_JWT_SECRET = SECRET;
    strategy = new JwtStrategy();
  });

  it('validates a supabase-shape payload and returns req.user', async () => {
    const payload = {
      sub: '00000000-0000-0000-0000-000000000001',
      email: 'u@test.local',
      aud: 'authenticated',
      role: 'authenticated',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    const user = await strategy.validate(payload as any);
    expect(user).toEqual({
      id: payload.sub,
      email: payload.email,
      role: 'authenticated',
    });
  });

  it('rejects missing SUPABASE_JWT_SECRET at construction', () => {
    const prev = process.env.SUPABASE_JWT_SECRET;
    delete process.env.SUPABASE_JWT_SECRET;
    expect(() => new JwtStrategy()).toThrow(/SUPABASE_JWT_SECRET/);
    process.env.SUPABASE_JWT_SECRET = prev;
  });

  // 통합 테스트: passport-jwt가 실제로 secret으로 서명 검증하는지
  it('passport-jwt verifies HS256 with SUPABASE_JWT_SECRET', () => {
    const token = jwt.sign(
      { sub: 'u1', aud: 'authenticated', role: 'authenticated' },
      SECRET,
      { algorithm: 'HS256', expiresIn: '1h' },
    );
    const decoded = jwt.verify(token, SECRET, {
      audience: 'authenticated',
      algorithms: ['HS256'],
    });
    expect((decoded as any).sub).toBe('u1');
  });
});
```

- [ ] **Step 3: Run tests**

```bash
cd api && pnpm test -- --testPathPattern=auth
```

Expected: 전체 PASS

### Task 2.4: E2E Test with Real Supabase Token

**Files:** (없음 — 수동 검증)

- [ ] **Step 1: Run NestJS**

```bash
cd api && SUPABASE_JWT_SECRET=<secret> DATABASE_URL=... pnpm dev
```

- [ ] **Step 2: Obtain a test JWT**

Supabase Studio의 SQL Editor에서:

```sql
-- 임시 유저 생성 후 토큰 발급 (CLI가 로컬에서 자동 토큰 제공)
-- 또는 signInWithPassword로 토큰 발급 후 curl
```

실제로는 Phase 3에서 웹으로 로그인 후 쿠키의 `access_token` 추출이 더 편함. 일단 NestJS는 401로 보호됨을 확인.

- [ ] **Step 3: Test protected endpoint without token**

```bash
curl -i http://localhost:3333/api/v1/projects
```

Expected: `401 Unauthorized`

- [ ] **Step 4: Commit**

```bash
git add api/src/auth
git commit -m "feat(api): swap nestjs jwt verification to supabase HS256"
```

---

## Phase 3 — Web Auth Swap

### Task 3.1: Install Supabase SSR, Remove NextAuth

**Files:**
- Modify: `web/package.json`

- [ ] **Step 1: Install**

```bash
cd web
pnpm add @supabase/ssr @supabase/supabase-js
pnpm remove next-auth
```

- [ ] **Step 2: Verify**

```bash
grep -E "supabase|next-auth" package.json
```

Expected: `@supabase/ssr`, `@supabase/supabase-js` 있음. `next-auth` 없음.

### Task 3.2: Create Supabase Client Utilities

**Files:**
- Create: `web/src/lib/supabase/client.ts`
- Create: `web/src/lib/supabase/server.ts`
- Create: `web/src/lib/supabase/middleware.ts`

- [ ] **Step 1: Browser client**

Create `web/src/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

- [ ] **Step 2: Server client**

Create `web/src/lib/supabase/server.ts`:

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set({ name, value, ...options }); } catch { /* RSC read-only */ }
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set({ name, value: '', ...options }); } catch { /* RSC read-only */ }
        },
      },
    },
  );
}
```

- [ ] **Step 3: Middleware helper**

Create `web/src/lib/supabase/middleware.ts`:

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return request.cookies.get(name)?.value; },
        set(name, value, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    },
  );

  // 세션 리프레시 트리거
  await supabase.auth.getUser();
  return response;
}
```

- [ ] **Step 4: Next.js middleware**

Create `web/src/middleware.ts`:

```typescript
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth/callback).*)'],
};
```

- [ ] **Step 5: Type check**

```bash
cd web && pnpm tsc --noEmit
```

Expected: 에러 없음 (있다면 해당 task에서 수정)

### Task 3.3: Add OAuth Callback Route

**Files:**
- Create: `web/src/app/auth/callback/route.ts`

- [ ] **Step 1: Create callback handler**

Create `web/src/app/auth/callback/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/auth/signin?error=oauth`);
}
```

### Task 3.4: Rewrite Signin Page

**Files:**
- Modify: `web/src/app/auth/signin/page.tsx`
- Modify: `web/src/app/auth/signin/SignInForm.tsx`

- [ ] **Step 1: Rewrite page.tsx**

`web/src/app/auth/signin/page.tsx` 전체 교체:

```tsx
import SignInForm from './SignInForm';

export default function SignIn() {
  return <SignInForm />;
}
```

- [ ] **Step 2: Rewrite SignInForm.tsx**

`web/src/app/auth/signin/SignInForm.tsx` 전체 교체:

```tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SignInForm() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function githubLogin() {
    setErr(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) setErr(error.message);
  }

  async function emailOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setErr(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    setSubmitting(false);
    if (error) setErr(error.message);
    else setOtpSent(true);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
      <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-slate-900 dark:text-white">VibePlanner Sign In</h1>

        <button
          onClick={githubLogin}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Sign in with GitHub
        </button>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">or</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>

        {otpSent ? (
          <p className="text-sm text-center text-slate-600 dark:text-slate-300">
            메일을 보냈습니다. 로컬에서는 <a className="underline" href="http://127.0.0.1:54324" target="_blank" rel="noopener noreferrer">Inbucket</a>에서 링크를 확인하세요.
          </p>
        ) : (
          <form onSubmit={emailOtp} className="flex flex-col gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={submitting || !email.trim()}
              className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {submitting ? 'Sending…' : 'Send magic link'}
            </button>
          </form>
        )}

        {err && <p className="mt-3 text-sm text-red-600 dark:text-red-400 text-center">{err}</p>}
      </div>
    </div>
  );
}
```

### Task 3.5: Delete NextAuth Route and authOptions

**Files:**
- Delete: `web/src/app/api/auth/[...nextauth]/route.ts`
- Delete: `web/src/lib/authOptions.ts`

- [ ] **Step 1: Delete**

```bash
cd D:/Project/16_VibePlanner
rm web/src/app/api/auth/\[...nextauth\]/route.ts
rmdir web/src/app/api/auth/\[...nextauth\]
rm web/src/lib/authOptions.ts
```

- [ ] **Step 2: Search for remaining imports**

```bash
grep -rn "authOptions\|next-auth\|NextAuth" web/src
```

Expected: 결과 없음 (있으면 다음 태스크에서 수정)

### Task 3.6: Replace useSession / getServerSession Callers

**Files:**
- Modify: `web/src/components/NotificationBell.tsx`
- Modify: `web/src/components/UserProfileMenu.tsx`
- Modify: `web/src/components/SyncAuth.tsx`
- Modify: `web/src/lib/db.ts`
- Modify: `web/src/lib/i18n.tsx`

- [ ] **Step 1: NotificationBell (client component)**

`web/src/components/NotificationBell.tsx`:
- `useSession` import 제거
- `import { createClient } from '@/lib/supabase/client'` 추가
- `const { data: session } = useSession()` → 다음 패턴으로 교체:

```tsx
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

// 컴포넌트 내부
const supabase = createClient();
const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
useEffect(() => {
  let mounted = true;
  supabase.auth.getUser().then(({ data }) => {
    if (mounted) setUser(data.user ? { id: data.user.id, email: data.user.email } : null);
  });
  const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
    setUser(s?.user ? { id: s.user.id, email: s.user.email } : null);
  });
  return () => { mounted = false; sub.subscription.unsubscribe(); };
}, []);
```

이후 `session?.user?.email` → `user?.email` 식으로 교체. API 호출 시 accessToken이 필요하면 `(await supabase.auth.getSession()).data.session?.access_token` 사용.

- [ ] **Step 2: UserProfileMenu (client component)**

Step 1과 동일 패턴 적용. `signOut()` 호출은 `supabase.auth.signOut()`으로 교체. 로그아웃 후 `/auth/signin`으로 redirect.

- [ ] **Step 3: SyncAuth**

`web/src/components/SyncAuth.tsx` 열어보고:
- `/auth/sync` 호출이 하던 일이 DB 트리거로 대체되었으므로 컴포넌트 **제거** 또는 no-op 처리
- 소비처(`layout.tsx` 등)에서 해당 import도 함께 제거

```bash
grep -rn "SyncAuth" web/src
```

발견된 위치들에서 렌더링 제거.

- [ ] **Step 4: db.ts (server-only helper)**

`web/src/lib/db.ts` 열어 `getServerSession` 사용을 `createClient()` (server) + `supabase.auth.getUser()`로 교체. accessToken이 필요하면 `supabase.auth.getSession()`. 반환 타입 유지.

- [ ] **Step 5: i18n.tsx**

`web/src/lib/i18n.tsx`에서 `useSession` 사용처 확인 후 Step 1 패턴 적용. i18n 초기 언어 결정에만 쓰이면 user locale 추출 로직만 교체.

- [ ] **Step 6: SessionProvider 제거**

`web/src/app/layout.tsx` (또는 providers.tsx)에서 `<SessionProvider>` 래핑 제거. Supabase는 SSR 쿠키 기반이라 최상위 provider 불필요.

- [ ] **Step 7: Type check and build**

```bash
cd web && pnpm tsc --noEmit
pnpm build
```

Expected: 에러 없음. (의존성 이슈 시 해당 파일에서 추가 수정)

- [ ] **Step 8: Commit**

```bash
cd D:/Project/16_VibePlanner
git add web
git commit -m "feat(web): replace nextauth with supabase ssr auth"
```

### Task 3.7: Manual Login E2E

**Files:** (없음 — 수동 검증)

- [ ] **Step 1: Run**

```bash
# Terminal 1
supabase status  # 실행 중인지 확인
# Terminal 2
cd api && pnpm dev
# Terminal 3
cd web && pnpm dev
```

- [ ] **Step 2: GitHub 로그인**

1. http://localhost:3002/auth/signin
2. "Sign in with GitHub" 클릭
3. GitHub 인증 → `/auth/callback` → `/` 리다이렉트

- [ ] **Step 3: Verify DB**

```bash
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -c "
  select u.id, u.email from auth.users u;
  select id, email, name from public.users;
"
```

Expected: `auth.users`에 1행, `public.users`에 같은 ID의 1행 (트리거 동작 확인)

- [ ] **Step 4: Email OTP 로그인 (다른 이메일)**

1. 새 시크릿 창 → signin → 이메일 입력 → "Send magic link"
2. http://127.0.0.1:54324 (Inbucket) 접속 → 메일 확인 → 링크 클릭
3. `/` 리다이렉트 확인

- [ ] **Step 5: Verify two users exist**

```bash
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -c "select count(*) from public.users;"
```

Expected: 2

---

## Phase 4 — Vertical Slice Web Migration

### Task 4.1: Inventory Consumer Components

**Files:** (없음 — 조사)

- [ ] **Step 1: Find consumers**

```bash
grep -rn -E "fetch.*['\"](\./)?/api/(projects|tasks|comments)" web/src
grep -rn -E "fetch.*\\\`.*/api/(projects|tasks|comments)" web/src
```

List 출력을 다음 태스크에서 교체.

### Task 4.2: Replace Projects Fetch with supabase-js

**Files:**
- Modify: (Task 4.1에서 발견된 프로젝트 목록 페이지)

- [ ] **Step 1: Server component list**

예시 (실제 파일명은 Task 4.1에서 확정):

Before:
```tsx
const res = await fetch(`${process.env.API_BASE_URL}/projects`, { headers: { Authorization: `Bearer ${token}` }});
const projects = await res.json();
```

After (Server Component):
```tsx
import { createClient } from '@/lib/supabase/server';

const supabase = createClient();
const { data: projects, error } = await supabase
  .from('projects')
  .select('id, name, description, created_at, workspace_id')
  .order('created_at', { ascending: false });
if (error) throw error;
```

- [ ] **Step 2: Project detail**

```tsx
const { data: project, error } = await supabase
  .from('projects')
  .select('*, workspaces(name)')
  .eq('id', projectId)
  .single();
```

- [ ] **Step 3: Create project**

Client side:
```tsx
const supabase = createClient();
const { data, error } = await supabase
  .from('projects')
  .insert({ name, description, workspace_id })
  .select()
  .single();
```

- [ ] **Step 4: Test**

- 동일 워크스페이스 프로젝트 목록: 정상 표시
- 로그아웃 상태에서 접근: 미들웨어 또는 RLS로 차단

### Task 4.3: Replace Tasks Fetch

**Files:** (Task 4.1 결과)

- [ ] **Step 1: List by project**

```tsx
const { data: tasks } = await supabase
  .from('tasks')
  .select('*')
  .eq('project_id', projectId)
  .order('created_at');
```

- [ ] **Step 2: Create/Update/Delete**

```tsx
// create
await supabase.from('tasks').insert({ project_id, title, status: 'TODO' });
// update
await supabase.from('tasks').update({ status: 'DONE' }).eq('id', taskId);
// delete
await supabase.from('tasks').delete().eq('id', taskId);
```

### Task 4.4: Replace Comments Fetch

**Files:** (Task 4.1 결과)

- [ ] **Step 1: List by task**

```tsx
const { data: comments } = await supabase
  .from('comments')
  .select('id, content, created_at, author_id, users(name, email)')
  .eq('task_id', taskId)
  .order('created_at');
```

- [ ] **Step 2: Create**

```tsx
const { data: { user } } = await supabase.auth.getUser();
await supabase.from('comments').insert({
  task_id: taskId,
  content,
  author_id: user!.id,
  author: user!.email ?? 'unknown',  // legacy column
});
```

### Task 4.5: RLS Cross-Workspace E2E

**Files:**
- Create: `supabase/tests/rls.test.sql`

- [ ] **Step 1: Write pgTAP test**

Create `supabase/tests/rls.test.sql`:

```sql
begin;
select plan(6);

-- 세팅: 2개 워크스페이스, 2명 유저, 교차 데이터
-- auth.users에 직접 INSERT (테스트 전용)
insert into auth.users (id, email, aud, role)
values
  ('00000000-0000-0000-0000-00000000000a', 'a@test.local', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-00000000000b', 'b@test.local', 'authenticated', 'authenticated');

-- public.users는 트리거로 자동 생성됨

insert into public.workspaces (id, name) values
  ('11111111-0000-0000-0000-000000000001', 'WS-A'),
  ('22222222-0000-0000-0000-000000000002', 'WS-B');

insert into public.workspace_members (workspace_id, user_id, role) values
  ('11111111-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', 'OWNER'),
  ('22222222-0000-0000-0000-000000000002', '00000000-0000-0000-0000-00000000000b', 'OWNER');

insert into public.projects (id, workspace_id, name) values
  ('33333333-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000001', 'P-A'),
  ('44444444-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000002', 'P-B');

-- 유저 A로 스위치
set local role authenticated;
set local "request.jwt.claims" to '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';

-- T1: A는 P-A만 본다
select is(
  (select count(*)::int from public.projects),
  1,
  'user A sees only 1 project (RLS filters)'
);

-- T2: A는 P-B 직접 id로도 못 본다
select is(
  (select count(*)::int from public.projects where id = '44444444-0000-0000-0000-000000000004'),
  0,
  'user A cannot read cross-workspace project by id'
);

-- T3: A가 P-B에 task INSERT 시 RLS 거부
select throws_ok(
  $$insert into public.tasks (id, project_id, title, status) 
    values (gen_random_uuid(), '44444444-0000-0000-0000-000000000004', 'x', 'TODO')$$,
  '42501',  -- insufficient_privilege
  null,
  'user A cannot insert task into cross-workspace project'
);

-- 유저 B로 스위치
set local "request.jwt.claims" to '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}';

-- T4: B는 P-B만 본다
select is(
  (select count(*)::int from public.projects),
  1,
  'user B sees only 1 project'
);

-- T5: B가 본인 comment 만들기는 허용
insert into public.tasks (id, project_id, title, status) values
  ('55555555-0000-0000-0000-000000000005', '44444444-0000-0000-0000-000000000004', 'T-B', 'TODO');

select lives_ok(
  $$insert into public.comments (task_id, author_id, author, content)
    values ('55555555-0000-0000-0000-000000000005',
            '00000000-0000-0000-0000-00000000000b',
            'b@test.local', 'hi')$$,
  'user B can insert comment on own task'
);

-- T6: B가 A인 척 author_id 속여서 insert 시 거부
select throws_ok(
  $$insert into public.comments (task_id, author_id, author, content)
    values ('55555555-0000-0000-0000-000000000005',
            '00000000-0000-0000-0000-00000000000a',
            'a@test.local', 'impersonate')$$,
  '42501',
  null,
  'user B cannot insert comment impersonating user A'
);

select * from finish();
rollback;
```

- [ ] **Step 2: Install pgTAP extension (one-time)**

Supabase 로컬은 pgTAP 미리 설치됨. 확인:

```bash
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -c "
  create extension if not exists pgtap;
  select * from pg_available_extensions where name = 'pgtap';
"
```

- [ ] **Step 3: Run test**

```bash
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -f supabase/tests/rls.test.sql
```

Expected: `ok 1 .. ok 6` 모두 PASS. `1..6` 총 6개 통과.

- [ ] **Step 4: Commit**

```bash
git add supabase/tests web/src
git commit -m "feat(web): migrate projects/tasks/comments to supabase-js + rls tests"
```

---

## Phase 5 — Cleanup

### Task 5.1: Verify Remaining NestJS Modules

**Files:** (없음 — 검증)

- [ ] **Step 1: Run NestJS + web, exercise each domain**

다음 기능이 Supabase JWT로 정상 동작하는지 수동 체크:
- [ ] billing
- [ ] plan-reviews (AI 호출 포함)
- [ ] notifications
- [ ] events
- [ ] keys (API key)
- [ ] analytics
- [ ] context (MCP 관련)
- [ ] documents
- [ ] subscriptions
- [ ] yc-answers

이슈 발생 시 해당 모듈의 `@UseGuards(JwtAuthGuard)` + `req.user` 사용이 새 payload 형태(id/email/role)와 호환되는지 확인하고 수정.

### Task 5.2: Remove Unused Dependencies

**Files:**
- Modify: `api/package.json`
- Modify: `web/package.json`

- [ ] **Step 1: API**

```bash
cd api
pnpm remove bcrypt @types/bcrypt
```

(다른 불필요 의존성은 build에서 에러 안 나면 유지)

- [ ] **Step 2: Web**

```bash
cd web
# 이미 next-auth는 제거됨. 추가로:
# (Task 3에서 signin/SignInForm의 ENABLE_DEV_AUTH 쓰임 제거됐는지 확인)
```

- [ ] **Step 3: Full build**

```bash
cd D:/Project/16_VibePlanner
cd api && pnpm build && cd ..
cd web && pnpm build && cd ..
```

Expected: 양쪽 성공

### Task 5.3: Update Docker and Documentation

**Files:**
- Modify: `docker-compose.yml`
- Modify: `README.md` (있으면)
- Modify: `api/.env.example`, `web/.env.example`

- [ ] **Step 1: docker-compose.yml 주석**

`docker-compose.yml` 상단에 주석 추가:

```yaml
# NOTE: DB는 Supabase 로컬 스택이 제공 (supabase start 선행).
# api 서비스는 host.docker.internal:54322에 연결. 
# 개발 흐름: 
#   1) supabase start
#   2) docker compose up -d api web  (또는 api/web을 호스트에서 pnpm dev)
```

- [ ] **Step 2: README 지침 (있으면)**

Quickstart 섹션에 다음 추가:

```
1. Install supabase CLI (scoop install supabase 또는 npm i -g supabase)
2. `supabase start` — 로컬 스택 기동 (최초 ~분 단위 다운로드)
3. `cd api && pnpm prisma generate && pnpm dev`
4. `cd web && pnpm dev`
5. http://localhost:3002/auth/signin
```

- [ ] **Step 3: Verify env examples completeness**

```bash
grep -E "SUPABASE|DATABASE_URL" api/.env.example web/.env.example
```

필요한 모든 변수 포함 확인.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: update docs and cleanup after supabase migration"
```

### Task 5.4: Final E2E Smoke Test

**Files:** (없음 — 수동)

- [ ] **Step 1: Full clean restart**

```bash
supabase stop
docker compose down
supabase start
supabase db reset
cd api && pnpm dev &
cd web && pnpm dev &
```

- [ ] **Step 2: End-to-end scenario**

1. http://localhost:3002 → signin → GitHub 로그인
2. Workspace 생성 (NestJS `/workspaces` 호출, service_role로 RLS 우회)
3. Project 생성 (supabase-js 직접, RLS 적용)
4. Task 생성
5. Comment 생성
6. 다른 시크릿 창 → 다른 이메일로 OTP 로그인
7. 해당 유저는 앞의 Workspace/Project를 못 봐야 함 (RLS 검증)

- [ ] **Step 3: If all pass**

```bash
git log --oneline feat/gstack-phase1..feat/supabase-migration
```

Expected: 의미 있는 커밋들이 순서대로 나열

---

## Final Acceptance Checklist

- [ ] `supabase start` + `pnpm --dir api dev` + `pnpm --dir web dev`로 개발 가능
- [ ] GitHub 로그인 동작
- [ ] Email OTP 로그인 동작 (Inbucket에서 링크 확인)
- [ ] `auth.users` 생성 시 `public.users` 자동 생성 (트리거)
- [ ] projects/tasks/comments CRUD가 Web에서 `supabase-js`로 직접 동작
- [ ] `supabase/tests/rls.test.sql` 전체 PASS (6/6)
- [ ] NestJS가 Supabase JWT(HS256)로 인증됨
- [ ] billing/plan-reviews/notifications 등 남은 도메인이 Supabase JWT로 정상 동작
- [ ] `next-auth`, `bcrypt` 의존성 제거됨
- [ ] `api/.env.example`, `web/.env.example`에 Supabase 관련 변수 문서화됨
- [ ] `docker-compose.yml`에서 postgres 서비스 제거됨
- [ ] `main`/`feat/gstack-phase1` 브랜치의 Prisma 마이그레이션 원본은 **보존**됨

---

## Rollback

문제 발생 시:

```bash
git checkout feat/gstack-phase1  # 원본 브랜치로 복귀
git branch -D feat/supabase-migration  # 또는 나중에 수정하려면 유지
supabase stop
# 원래 postgres 복구:
git checkout main -- docker-compose.yml
docker compose up -d postgres
```

dev 데이터는 폐기 전제이므로 데이터 손실 없음.
