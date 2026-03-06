# VibePlanner Backend API

본 문서는 VibePlanner 백엔드 API 서버가 Next.js 대시보드 및 MCP(Model Context Protocol) 시스템과 상호작용하는 방식을 설명하는 가이드라인입니다.

## 아키텍처 개요 (Architecture Overview)

VibePlanner 시스템은 다음과 같이 구성됩니다.
1. **Next.js Dashboard**: 사용자 친화적인 칸반 보드 및 각종 프로젝트 뷰 제공. 클라이언트 데이터 패칭은 REST API 채널을 통합니다.
2. **NestJS Backend API**: PostgreSQL와 직접 통신하며, 대시보드와 서버(MCP) 단에서 요구하는 모든 데이터 CRUD 작업을 처리합니다.
3. **MCP Server**: Cursor/Cline 등 LLM 기반 IDE 에이전트와 소통하기 위한 인터페이스. 로컬 DB에 직접 접근하지 않고, 백엔드 API에 HTTP 요청을 보내어 데이터를 조작합니다.

---

## 대시보드 기능별 API 매핑 (API Dashboard Mapping)

대시보드의 주요 화면과 동작은 다음 백엔드 API 엔드포인트들을 호출하여 렌더링됩니다.

### 1. 프로젝트 관리 (Projects)
**화면:** 대시보드 메인 홈 화면 및 14-Tabs 레이아웃
- `GET /api/v1/projects`: 메인 화면에 표시할 프로젝트 목록을 로드합니다.
- `GET /api/v1/projects/:id`: 특정 프로젝트 진입 시(ex. `/project/[id]`) 메타 정보를 가져옵니다.
- `POST /api/v1/projects`: "New Project" 모달을 통해 새로운 프로젝트를 생성합니다. DB 트랜잭션을 통해 기본 태스크 파이프라인(Default Tasks)이 함께 시딩됩니다.
- `PATCH /api/v1/projects/:id`: 프로젝트의 제목 및 설명을 수정합니다.
- `DELETE /api/v1/projects/:id`: 프로젝트 및 하위 모든 데이터(태스크, 문서 등)를 Cascade 삭제합니다.

### 2. 칸반 (Kanban) 태스크 관리
**화면:** 프로젝트 뷰 내의 칸반 보드 레이아웃
- `GET /api/v1/tasks/project/:projectId`: 칸반 보드를 그리기 위한 프로젝트 내 모든 태스크를 반환합니다. 카테고리(`category`) 및 단계(`phase`)별로 프론트엔드에서 그룹핑됩니다.
- `POST /api/v1/tasks`: 새로운 태스크(티켓)를 칸반 보드에 추가합니다.
- `PATCH /api/v1/tasks/:id`: 칸반 보드에서 드래그 앤 드롭 이동 시 상태(`status`)를 업데이트 하거나, 티켓 상세 모달에서 내용(`description`, `beforeWork`, `afterWork`)을 갱신합니다.
- `DELETE /api/v1/tasks/:id`: 태스크를 영구 삭제합니다.

### 3. 문서 및 다이어그램 (Documents & Diagrams)
**화면:** 시스템 구조(Architecture), 워크플로우, 데이터베이스 스키마 등을 보여주는 뷰어 창
- `GET /api/v1/documents/project/:projectId/type/:docType`: 요청한 프로젝트의 특정 문서(예: `ARCHITECTURE`, `DATABASE`)를 Markdown 또는 JSON 형태로 반환합니다.
- `PATCH /api/v1/documents`: MCP 에이전트나 대시보드에서 문서 구조가 갱신될 때 내용을 저장합니다. 자동 문서 버전 관리(`Versioning`) 로직이 실행되어 `ProjectDocumentVersion` 테이블에도 스냅샷을 남깁니다.

### 4. 코멘트 보드 (Comments)
**화면:** 각 태스크 상세 보기 모달 하단의 커뮤니케이션 및 로깅 로그
- `GET /api/v1/tasks/:taskId/comments`: 해당 태스크와 연관된 AI 및 사용자의 상호작용 코멘트를 시간순으로 불러옵니다.
- `POST /api/v1/tasks/:taskId/comments`: AI Vibe Coding 에이전트 작업 과정이나 사용자의 지시를 코멘트로 추가합니다.

### 5. 통계 및 리뷰 (Analytics)
**화면:** 전체 작업 진척도를 확인할 수 있는 통계 뷰
- `GET /api/v1/analytics/global`: (전역 대시보드 전용) 현재 등록된 프로젝트 수, 총 태스크 수량 및 상태(`TODO`, `IN_PROGRESS`, `DONE`)별 분포를 계산하여 반환합니다.
- `GET /api/v1/analytics/recent-tasks`: 수정된 시간 기준 상위 50개의 최근 변경 작업을 피드로 반환하여, 작업 최신성을 보장합니다.

---

## 통합 (Integration) 환경 변수

백엔드 서버 구동 시 다음 환경 변수를 주입해야 합니다. (`api/.env`)
```env
# PostgreSQL DB Connection Profile
DATABASE_URL="postgresql://vibeplanner:vibeplanner_secret@localhost:5433/vibeplanner?schema=public"
```

대시보드와 MCP 서버가 백엔드 API를 찾기 위해서는 프론트/프록시 환경변수에 API 경로를 지정해야 합니다:
```env
# URL for the proxy clients
API_BASE_URL="http://localhost:3333/api/v1"
```

---

## 빌드 및 실행 (Build and Run)

docker-compose 에 의한 일괄 실행:
```bash
docker compose up -d --build
```
> 도커로 띄웠을 시 내부적으로 `api:3333` 의 가상 네트워크 호스트명을 통해 포트 매핑을 수행합니다.
