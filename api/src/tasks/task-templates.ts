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
