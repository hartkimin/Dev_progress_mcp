/**
 * MCP 서버에서 create_task / update_task_details 호출 시
 * description / afterWork가 비어있으면 적용되는 표준 템플릿.
 * web/src/lib/taskTemplates.ts와 동기화 유지.
 */

export const TASK_DESCRIPTION_TEMPLATE = `## 📌 배경 (Background)
<!-- 이 작업이 왜 필요한지, 어떤 맥락에서 발생했는지 작성하세요. -->

## 🎯 목표 (Goal)
<!-- 이 작업이 끝났을 때 달성되어야 할 구체적 목표를 1~3줄로 작성하세요. -->

## 📦 범위 (Scope)
<!-- 포함되는 것 / 포함되지 않는 것을 명확히 구분하세요. -->
- [ ] In scope:
- [ ] Out of scope:

## ⚠️ 제약 및 리스크 (Constraints & Risks)
<!-- 기술적 제약, 일정 리스크, 의존성, 주의사항 등을 작성하세요. -->

## 🔗 참고 자료 (References)
<!-- 관련 링크, 문서, 이슈, PR, 스펙 등을 나열하세요. -->
`;

export const TASK_AFTER_WORK_TEMPLATE = `## 🗂️ TODO → IN_PROGRESS (작업 시작 준비)
<!-- 작업을 시작하기 위해 수행한 선행 조사/설계/의사결정 내역을 상세히 기록하세요. -->
- 조사 및 분석:
- 설계 및 접근 방식:
- 의존성/리소스 확보:

## 🔧 IN_PROGRESS → REVIEW (구현 및 수행 상세)
<!-- 실제로 수행한 작업의 상세 내역을 기록하세요. 파일 변경, 커밋, 배포, 실험 결과 등. -->
- 주요 변경 사항:
- 커밋/PR 링크:
- 테스트 및 검증:
- 이슈 및 대응:

## ✅ REVIEW → DONE (검토 및 마무리)
<!-- 리뷰 피드백, 수정 사항, 최종 산출물, 배포 결과 등을 기록하세요. -->
- 리뷰 피드백 및 반영:
- 최종 산출물/링크:
- 배포/릴리스 결과:
- 회고 및 후속 작업:
`;

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

export function isTemplateEmpty(value: string | null | undefined): boolean {
    if (!value) return true;
    const stripped = value
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\s+/g, '')
        .trim();
    return stripped.length === 0;
}

/** 상태별 work 필드 ↔ 템플릿 매핑. 전이 시 FROM 단계의 work 필드를 결정할 때 사용. */
export const WORK_TEMPLATES: Record<'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE', string> = {
    TODO: WORK_TODO_TEMPLATE,
    IN_PROGRESS: WORK_IN_PROGRESS_TEMPLATE,
    REVIEW: WORK_REVIEW_TEMPLATE,
    DONE: WORK_DONE_TEMPLATE,
};

export const WORK_FIELD_KEY: Record<'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE', 'workTodo' | 'workInProgress' | 'workReview' | 'workDone'> = {
    TODO: 'workTodo',
    IN_PROGRESS: 'workInProgress',
    REVIEW: 'workReview',
    DONE: 'workDone',
};
