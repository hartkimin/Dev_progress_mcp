# VibePlanner Design System

> **Source of truth**: `web/src/app/globals.css`, `web/src/app/layout.tsx`, `web/src/components/**`
>
> 이 문서는 현재 구현된 UI를 분석해 뽑아낸 디자인 시스템입니다. 새로운 UI를 만들거나 리팩터링할 때 이 문서를 따라 일관성을 유지하세요. 문서와 코드가 어긋나면 **코드가 기준**이며, 변경 시 이 문서도 함께 갱신합니다.

## 1. Foundation

### 1.1 Tech Stack
- **Tailwind CSS v4** (`@import "tailwindcss"`, `@theme inline` 블록)
- **next-themes** — class 기반 다크모드. 루트 `<html class="dark">` 토글
- **CSS 변수**: `--background`, `--foreground`, `--font-sans`, `--font-mono` (globals.css)
- **Icons**: [lucide-react](https://lucide.dev) 전용. 다른 아이콘 세트 혼용 금지
- **Fonts**: Geist Sans + Geist Mono (`next/font/google`)

### 1.2 Dark Mode
- **구현**: Tailwind custom variant `@custom-variant dark (&:is(.dark *))`
- **사용**: 모든 색상 유틸리티는 `light:` 기본값 + `dark:` 변형을 반드시 쌍으로 작성
  ```tsx
  className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-300"
  ```
- **누락 금지**: light만 정의하면 다크모드에서 깨집니다. CI나 리뷰에서 잡아야 함.

---

## 2. Color Tokens

### 2.1 Role Palette

| Role | Light | Dark | Usage |
|---|---|---|---|
| **Primary (Brand)** | `indigo-500` / `indigo-600` | `indigo-400` | CTA, 활성 네비, 포커스 링, 링크 |
| **Accent (Secondary)** | `cyan-500` | `cyan-400` | 그라디언트 보조, 인포 강조 |
| **Settings / Warning** | `amber-500` / `amber-600` | `amber-400` | 설정 영역, 주의 상태 |
| **Success** | `emerald-500` / `emerald-600` | `emerald-400` | 완료, 긍정적 상태 |
| **Danger** | `rose-500` / `rose-600` | `rose-400` | 삭제, 로그아웃, 파괴적 액션 |
| **Info (rare)** | `blue-500` | `blue-400` | 잘 쓰지 않음. indigo로 통합 권장 |
| **Purple (rare)** | `purple-500` / `purple-600` | `purple-400` | 아바타 그라디언트 종점에만 |

**원칙**:
- **Primary = indigo**. 새 UI에서 `blue`/`violet`/`fuchsia` 등 유사 색은 도입 금지.
- 주어진 role을 벗어나는 색 사용(예: 저장 버튼에 amber) 금지.

### 2.2 Neutral Scale (Slate)

모든 텍스트·테두리·배경 뉴트럴은 **slate** 한 팔레트만 사용:

| 용도 | Light | Dark |
|---|---|---|
| Body bg | `white` / `slate-50` | `slate-900` / `slate-950` |
| Card bg | `white` | `slate-900` |
| Hover bg | `slate-100` / `slate-200` | `slate-800` / `slate-800/50` |
| Border subtle | `slate-200` | `slate-800` |
| Border strong | `slate-300` | `slate-700` |
| Text primary | `slate-900` | `white` / `slate-100` |
| Text body | `slate-700` / `slate-800` | `slate-200` / `slate-300` |
| Text muted | `slate-500` / `slate-600` | `slate-400` |
| Text disabled/hint | `slate-400` | `slate-500` |

**금지**: `gray-*`, `zinc-*`, `neutral-*`, `stone-*`. 전부 `slate`로 통일.

### 2.3 Gradient Tokens

| 이름 | Classes | 용도 |
|---|---|---|
| `gradient.brand` | `bg-gradient-to-r from-indigo-500 to-cyan-500` | 로고 텍스트, 히어로 제목, 주요 강조 |
| `gradient.avatar` | `bg-gradient-to-br from-indigo-500 to-purple-600` | 유저 아바타, 개인 식별자 |
| `gradient.success` | `bg-gradient-to-r from-emerald-500 to-emerald-600` | 성공 상태 배지 |

**3종 외 사용 금지**. 추가가 필요하면 먼저 이 문서에 등록 후 사용.

### 2.4 Status Tinted Backgrounds (약한 배경)
- Primary tint: `bg-indigo-50 dark:bg-indigo-500/10` + text `indigo-600 dark:indigo-400`
- Success tint: `bg-emerald-50 dark:bg-emerald-500/10`
- Danger tint: `bg-rose-50 dark:bg-rose-950/30`
- Warning tint: `bg-amber-50 dark:bg-amber-500/10`

---

## 3. Typography

### 3.1 Families
- **Sans** (default): `var(--font-geist-sans)` via `next/font/google`
- **Mono**: `var(--font-geist-mono)` (코드, 숫자 집중 영역)
- 추가 폰트 금지. 필요 시 `next/font`로만 로드.

### 3.2 Type Scale (실사용 빈도 기반)

| Token | Class | 용도 |
|---|---|---|
| `t.micro` | `text-[10px]` (드물게) | 배지 한 줄 메타 (예: "Free Plan") |
| `t.caption` | `text-xs` (110회 사용) | 캡션, 보조 메타, uppercase 라벨 |
| `t.body` | `text-sm` (193회 사용, **기본**) | 본문, 버튼, 폼 |
| `t.body-lg` | `text-base` | 거의 안 씀. 기본은 sm. |
| `t.heading-sm` | `text-lg` | 섹션 소제목 |
| `t.heading` | `text-xl` / `text-2xl` | 페이지 제목 |
| `t.display` | `text-3xl` / `text-4xl` | 랜딩 히어로 |
| `t.hero` | `text-5xl` (1회) | 최대치. 남용 금지 |

**기본은 `text-sm`**. 애매하면 sm.

### 3.3 Weights

| Class | 빈도 | 용도 |
|---|---|---|
| `font-medium` | 114 | 버튼, 폼 레이블, 네비 항목 (**기본 강조**) |
| `font-semibold` | 72 | 서브 헤딩, 유저 이름 |
| `font-bold` | 157 | 헤딩, 숫자 강조, 제목 |
| `font-extrabold` | 17 | 랜딩 히어로만 |
| `font-normal` | 4 | 거의 안 씀 |

### 3.4 Uppercase Labels
섹션 그룹 레이블은 일관된 패턴:
```tsx
className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider"
```
예: Sidebar의 "WORKSPACE", "SETTINGS".

---

## 4. Spacing & Layout

### 4.1 Spacing Scale (실사용 기반)
- **Gap**: `gap-2` (기본), `gap-3` (카드 내 섹션), `gap-4` (관련 그룹), `gap-1.5` (아이콘+텍스트)
- **Button padding**: `px-3 py-1.5` (sm) / `px-4 py-2` (md) / `px-4 py-3` (lg)
- **Card padding**: `p-4` (compact) / `p-6` (default) / `p-8` (spacious, ex: signin)
- **Icon padding**: `p-2` (원형 아이콘 버튼)

### 4.2 Container Widths
- Sidebar: `w-64` (expanded) / `w-20` (collapsed)
- Top nav height: `h-20` (80px)
- Modal/dropdown typical: `w-64` (menu), `max-w-md` (dialog), `max-w-2xl` (wide form)

### 4.3 Responsive Breakpoints
- `md:` (768px)에서 데스크톱 레이아웃으로 전환 (Sidebar 노출 등)
- `sm:` (640px)에서 TopNav 내 라벨 노출
- 모바일 우선으로 작성하되, 핵심 생산성 UI는 데스크톱 중심

---

## 5. Radius & Elevation

### 5.1 Border Radius

| Token | Class | 빈도 | 용도 |
|---|---|---|---|
| `r.pill` | `rounded-full` | 123 | 아바타, 아이콘 버튼, 배지, TopNav pill |
| `r.lg` | `rounded-lg` | 75 | 버튼, 인풋, 드롭다운 아이템 |
| `r.xl` | `rounded-xl` | 73 | 네비 아이템, 드롭다운 컨테이너, 카드 |
| `r.2xl` | `rounded-2xl` | 55 | 주요 카드, Signin 박스 |
| `r.md` | `rounded-md` | 28 | 컴팩트한 서브 아이템 |
| `r.3xl` | `rounded-3xl` | 5 | 거의 안 씀. 랜딩 히어로 등 특수 |

**원칙**: 같은 수준의 UI는 동일 radius를 공유. 카드는 `2xl`, 카드 내부 버튼은 `lg` 식.

### 5.2 Shadow

| Token | Class | 용도 |
|---|---|---|
| `e.subtle` | `shadow-sm` | **기본**. 사이드바, 필 버튼, 카드 기본 |
| `e.medium` | `shadow-md` | 부유 컨테이너, 호버된 카드 |
| `e.high` | `shadow-xl` | 시그인, 모달, 주요 페이지 카드 |
| `e.max` | `shadow-2xl` | 드롭다운 메뉴 (UserProfileMenu 등) |
| `e.inset` | `shadow-[inset_3px_0_0_0_#6366f1]` | 활성 네비 좌측 강조 바 (indigo=primary, amber=settings) |

**다크모드에서 shadow는 약화**. 기본은 유지하되 과하면 `dark:shadow-none`으로 제거.

---

## 6. Component Patterns

### 6.1 Button

**Primary (Solid Brand)**
```tsx
className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
```

**Secondary (Neutral outlined)**
```tsx
className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
```

**Dark Solid (GitHub/Auth)**
```tsx
className="px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
```

**Icon Button (Circular)**
```tsx
className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-indigo-500 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 transition-all duration-200"
```

**Destructive**
```tsx
className="px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors rounded-lg"
```

### 6.2 Input
```tsx
className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
```
- Focus ring: **항상** `focus:ring-2 focus:ring-indigo-500`
- Error state: border 교체 `border-rose-500`, help text `text-rose-600 dark:text-rose-400`

### 6.3 Card
```tsx
className="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800"
```
- **High-emphasis** 카드(로그인/히어로): `rounded-2xl shadow-xl`
- **Inline/list** 카드: `rounded-xl shadow-sm`

### 6.4 Nav Item (Sidebar 기준)

**Inactive**
```tsx
className="flex items-center space-x-3 px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-indigo-500 dark:hover:text-white transition-all duration-200"
```

**Active (Primary area)**
```tsx
className="... bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-[inset_3px_0_0_0_#6366f1] dark:shadow-[inset_3px_0_0_0_#818cf8]"
```
- Settings 영역 active는 indigo 대신 **amber** 사용 (`shadow-[inset_3px_0_0_0_#f59e0b]`)
- 아이콘은 활성 시 `strokeWidth={2.5}` + `scale-110`

### 6.5 Dropdown Menu
```tsx
className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in duration-200 origin-top-right"
```
- 내부 아이템: `w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors`
- 구분선: `my-2 border-t border-slate-100 dark:border-slate-800`
- 파괴적 액션(logout, delete)은 rose 스케일

### 6.6 Avatar
```tsx
className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden border border-white/20 shadow-sm"
```
- 사진 없으면 이니셜 대문자 1자
- 사이즈: `w-8 h-8` (sm), `w-10 h-10` (md), `w-14 h-14` (lg)

### 6.7 Pill Floating (TopNav)
반투명 + blur 배경 + 캡슐:
```tsx
<div className="relative flex items-center gap-2 px-3 py-2">
  <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-full border border-slate-200/50 dark:border-slate-800/50 shadow-sm pointer-events-none -z-10" />
  {/* children */}
</div>
```
**주의**: `backdrop-blur`는 absolute 드롭다운과 충돌. 배경 레이어는 별도 요소로 분리(`-z-10`).

### 6.8 Badge
- Primary tint: `px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-medium`
- Status (success/danger/warning): tinted bg + 동일 패밀리 text (2.4 참조)

---

## 7. Motion

### 7.1 Transition Defaults

| Class | 빈도 | 용도 |
|---|---|---|
| `transition-colors` | 84 | hover 색상 변화 (**가장 흔함**) |
| `transition-all` | 60 | 여러 속성 변화 (그림자+색+변형) |
| `duration-200` | 23 | 빠른 인터랙션 (hover, focus) |
| `duration-300` | 18 | 중간 (사이드바 collapse) |
| `duration-500/1000` | 소수 | 진행 바, 로딩 |

**기본값**: `transition-colors duration-200`. hover에 `transition-all` 쓸지 `transition-colors`만 쓸지 의식적으로 결정.

### 7.2 Hover Micro-interactions
- **Scale**: `hover:scale-105` (로고), `group-hover:scale-110` (아이콘)
- **Rotate**: `${isOpen ? 'rotate-180' : ''}` (chevron)
- **Color shift**: neutral → indigo/amber/rose (role에 맞게)

### 7.3 Entrance Animations
드롭다운: `animate-in fade-in zoom-in duration-200 origin-top-right`

### 7.4 Reduced Motion
`@media (prefers-reduced-motion: reduce)` 준수 필요. 현재 미구현 — 장기 TODO.

---

## 8. Accessibility Rules

1. **Focus**: 모든 interactive 요소는 `focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2` 또는 동등한 가시적 포커스
2. **Icon-only button**: 반드시 `title="..."` 또는 `aria-label`
3. **Color alone 금지**: 상태를 색으로만 전달하지 않음. 아이콘/라벨 병행 (예: 성공은 ✓ emerald, 경고는 ⚠ amber)
4. **Contrast**: Tailwind slate 기본 조합은 AA 충족. 단 **다크모드 `text-slate-400`은 의사소통적 정보에 금지** (보조 메타만)
5. **Semantic HTML**: `button`/`a`/`nav`/`aside`/`h1-h6` 태그 목적에 맞게. 모든 걸 `div`로 하지 않기

---

## 9. Iconography

- **Set**: `lucide-react`만 사용
- **Default size**: `size={20}` (aside button), `size={16}` (dropdown), `size={22}` (nav item)
- **Default strokeWidth**: `2` (inactive) / `2.5` (active/emphasized)
- **Color**: 텍스트 색 상속 (`currentColor`). 명시적 색 지정은 비활성 상태에만(`text-slate-400`)

---

## 10. Brand Elements

### 10.1 Logo (Wordmark)
```tsx
<h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">
  VibePlanner <span className="text-sm font-medium text-indigo-400">Pro</span>
</h1>
```
- **변경 시**: "Pro" 서브 라벨과 gradient 범위는 유지. 색 바꾸지 말 것.

### 10.2 Empty State
- 중앙 정렬, `max-w-md`
- 일러스트/아이콘 + 헤딩(`text-xl font-bold`) + 설명(`text-sm text-slate-600 dark:text-slate-400`) + 주요 CTA 1개

---

## 11. Do / Don't (빠른 참조)

### Do
- slate 뉴트럴, indigo primary를 고집
- 다크모드 변형 항상 쌍으로 작성
- `text-sm` 기본, `font-medium` 기본 강조
- `rounded-lg` 버튼, `rounded-2xl` 주요 카드, `rounded-full` 아바타/pill
- lucide-react 아이콘, 20/16 사이즈, strokeWidth 2
- `transition-colors duration-200`로 호버 처리

### Don't
- `gray/zinc/neutral/stone` 팔레트 쓰지 말기 (slate로 통일)
- 새 가디언트 추가 (등록된 3종만)
- 팔레트 바깥 색(violet, fuchsia, teal 등) 도입
- `text-base`를 기본으로 쓰기 (sm이 기본)
- dark: 누락한 채 light만 작성
- 아이콘 세트 혼용 (heroicons/feather 등)
- `shadow-2xl`를 카드에 남발 (드롭다운·모달 전용)
- inline `style={{...}}` 색상 지정 (Tailwind 유틸리티만)

---

## 12. Extension Procedure

새 토큰/컴포넌트/색을 도입하고 싶을 때:
1. 이 문서의 해당 섹션에 **먼저 추가**
2. 최소 2곳에서 재사용되는지 확인 (안 그러면 yagni)
3. PR 리뷰에 이 문서 링크 포함
4. 기존 코드를 점진 마이그레이션 (일시적 혼재는 허용, 단 6개월 내 정리)

---

## 13. 알려진 기술 부채

- `globals.css`의 `body`는 `font-family: Arial, Helvetica, sans-serif`로 fallback만 지정. 실제 렌더링은 Tailwind가 `--font-geist-sans` 적용. 혼동 소지 있으므로 정리 필요.
- `prefers-reduced-motion` 미대응
- 커스텀 스크롤바(`custom-scrollbar`) 클래스 정의가 globals.css에 없음 — 누락 여부 확인 필요
- GrayScale 잔존 클래스 스캔 필요 (`gray-*` grep으로 점검 권장)
