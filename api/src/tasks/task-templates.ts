/**
 * 태스크 상태별(work_todo / work_in_progress / work_review / work_done) 표준 템플릿.
 * web/src/lib/taskTemplates.ts 및 src/taskTemplates.ts와 동기화 유지.
 */

export const WORK_TODO_TEMPLATE = `## 🗂️ TODO 단계 (작업 준비)
<!-- 작업을 수행하기 전에 정한 계획/접근/의사결정을 기록하세요. -->
- 문제 정의:
- 조사 및 분석:
- 접근 방식 / 설계:
- 의존성·리소스 확인:
- 예상 리스크:
`;

export const WORK_IN_PROGRESS_TEMPLATE = `## 🔧 IN_PROGRESS 단계 (구현 및 수행)
<!-- 실제로 수행한 작업의 상세 내역을 기록하세요. -->
- 주요 변경 사항:
- 커밋 / PR 링크:
- 테스트 / 로그:
- 만난 이슈와 대응:
- 남은 할 일:
`;

export const WORK_REVIEW_TEMPLATE = `## 🔎 REVIEW 단계 (검토)
<!-- 리뷰 과정에서 확인한 내용과 피드백을 기록하세요. -->
- 자체 점검 체크리스트:
- 리뷰어 피드백:
- 반영된 수정 사항:
- 남은 논의 항목:
`;

export const WORK_DONE_TEMPLATE = `## ✅ DONE 단계 (마무리)
<!-- 완료 후 최종 산출물과 회고를 기록하세요. -->
- 최종 산출물 / 배포 링크:
- 성과 / 측정 결과:
- 회고 (잘된 점 / 아쉬운 점):
- 후속 작업 / 팔로업:
`;

export const WORK_TEMPLATES = {
    workTodo: WORK_TODO_TEMPLATE,
    workInProgress: WORK_IN_PROGRESS_TEMPLATE,
    workReview: WORK_REVIEW_TEMPLATE,
    workDone: WORK_DONE_TEMPLATE,
} as const;

export function isTemplateEmpty(value: string | null | undefined): boolean {
    if (!value) return true;
    const stripped = value
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\s+/g, '')
        .trim();
    return stripped.length === 0;
}

/**
 * 값이 비어있거나 기본 템플릿 그대로인지 판정. 사용자가 아무 내용도 추가하지 않은 상태로 본다.
 */
export function isDefaultOrEmpty(value: string | null | undefined, defaultTemplate: string): boolean {
    if (isTemplateEmpty(value)) return true;
    const norm = (s: string) => s.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim();
    return norm(value!) === norm(defaultTemplate);
}

/**
 * REVIEW 단계 진입 시점에 태스크 메타데이터로부터 맥락형 리뷰 체크리스트를 생성.
 * - 공통 항목은 항상 포함
 * - category / taskType / phase 에 따라 특화 항목 추가
 * - workInProgress 내용이 있으면 "구현 요약" 참조 링크 힌트 추가
 * 기존 workReview가 비어있거나 템플릿만 있을 때만 사용.
 */
export function buildReviewChecklist(input: {
    title?: string | null;
    category?: string | null;
    taskType?: string | null;
    phase?: string | null;
    workInProgress?: string | null;
}): string {
    const cat = (input.category || '').toLowerCase();
    const type = (input.taskType || '').toLowerCase();
    const phase = (input.phase || '').toLowerCase();

    const categorySpecific: string[] = [];
    if (cat.includes('frontend')) {
        categorySpecific.push(
            '반응형 레이아웃 (모바일/태블릿/데스크톱) 확인',
            '접근성 (키보드 내비게이션, 스크린리더, 대비비) 점검',
            '다크모드 전환 시 이상 없음',
            'i18n 번역 키 누락 여부 (en/ko/zh/ja)',
            '콘솔 에러/경고 0건',
        );
    }
    if (cat.includes('backend')) {
        categorySpecific.push(
            'API 계약 (Swagger/OpenAPI) 업데이트 여부',
            '에러 응답 포맷 일관성 (statusCode/message/timestamp)',
            '인증/인가 가드 적용 확인',
            '트랜잭션 경계 및 롤백 시나리오',
            '로그 레벨/민감정보 마스킹',
        );
    }
    if (cat.includes('database')) {
        categorySpecific.push(
            '마이그레이션 idempotent 여부 및 롤백 스크립트',
            '인덱스 추가/변경에 따른 성능 영향',
            '기존 데이터 호환성 (nullable, 기본값)',
            'Prisma 스키마 ↔ 실제 DDL 일치',
        );
    }
    if (cat.includes('infra') || cat.includes('devops')) {
        categorySpecific.push(
            '배포 롤아웃 전략 및 롤백 절차',
            '환경 변수 / 시크릿 관리 (커밋 누락 방지)',
            '모니터링/알림 설정',
            '리소스 사용량 / 비용 영향',
        );
    }
    if (cat.includes('docs')) {
        categorySpecific.push(
            '예제 코드 실행 가능 여부',
            '링크 깨짐 없음',
            '오탈자/문법 검수',
        );
    }

    const typeSpecific: string[] = [];
    if (type.includes('bugfix')) {
        typeSpecific.push(
            '재현 시나리오 검증 (fix 적용 전/후)',
            '동일 원인의 다른 영향 지점 확인',
            '회귀 방지 테스트 추가 여부',
        );
    }
    if (type.includes('refactor')) {
        typeSpecific.push(
            '기존 동작 동일성 (behavior parity) 확인',
            '공개 API/export 시그니처 변경 여부',
            '성능/메모리 프로파일 비교',
        );
    }
    if (type.includes('review')) {
        typeSpecific.push(
            'Plan Review / CodeRabbit 결과 반영',
            '미해결 코멘트 여부',
        );
    }

    const phaseSpecific: string[] = [];
    if (phase.includes('testing') || phase.includes('qa')) {
        phaseSpecific.push(
            '유닛/통합/E2E 테스트 결과',
            '커버리지 변화 및 미커버 핵심 경로',
        );
    }
    if (phase.includes('deployment') || phase.includes('deploy')) {
        phaseSpecific.push(
            '스테이징 검증 완료',
            '프로덕션 배포 체크리스트 통과',
            '롤백 절차 준비',
        );
    }

    const common = [
        '요구사항 대비 구현 완결성 (누락 기능 여부)',
        '에러 / 예외 처리 경로 검증',
        '타입 체크 / 린트 통과',
        '관련 문서 업데이트 (README/CHANGELOG/API)',
    ];

    const toBullets = (items: string[]) =>
        items.length ? items.map((it) => `- [ ] ${it}`).join('\n') : '- [ ] (해당 없음)';

    const parts: string[] = [];
    parts.push('## 🔎 REVIEW 단계 (검토)');
    parts.push('<!-- 아래 체크리스트는 전이 시점에 자동 생성되었습니다. 필요한 항목은 수정/추가하세요. -->');
    parts.push('');
    parts.push('### ✅ 공통 체크');
    parts.push(toBullets(common));
    if (categorySpecific.length) {
        parts.push('');
        parts.push(`### 📂 카테고리(${input.category}) 특화`);
        parts.push(toBullets(categorySpecific));
    }
    if (typeSpecific.length) {
        parts.push('');
        parts.push(`### 🏷️ 유형(${input.taskType}) 특화`);
        parts.push(toBullets(typeSpecific));
    }
    if (phaseSpecific.length) {
        parts.push('');
        parts.push(`### 🎯 단계(${input.phase}) 특화`);
        parts.push(toBullets(phaseSpecific));
    }
    parts.push('');
    parts.push('### 💬 리뷰 기록');
    parts.push('- 자체 점검 결과:');
    parts.push('- 리뷰어 피드백:');
    parts.push('- 반영된 수정 사항:');
    parts.push('- 남은 논의 항목:');
    if (input.workInProgress && !isTemplateEmpty(input.workInProgress)) {
        parts.push('');
        parts.push('> ℹ️ IN_PROGRESS 단계의 구현 요약은 workInProgress 필드를 참고하세요.');
    }
    return parts.join('\n') + '\n';
}
