-- Backfill empty work_* fields on existing tasks with standard per-status templates.
-- Only fills NULL or whitespace-only rows; any user-entered content is preserved.

UPDATE "tasks"
SET "work_todo" = E'## 🗂️ TODO 단계 (작업 준비)\n<!-- 작업을 수행하기 전에 정한 계획/접근/의사결정을 기록하세요. -->\n- 문제 정의:\n- 조사 및 분석:\n- 접근 방식 / 설계:\n- 의존성·리소스 확인:\n- 예상 리스크:\n'
WHERE "work_todo" IS NULL OR btrim("work_todo") = '';

UPDATE "tasks"
SET "work_in_progress" = E'## 🔧 IN_PROGRESS 단계 (구현 및 수행)\n<!-- 실제로 수행한 작업의 상세 내역을 기록하세요. -->\n- 주요 변경 사항:\n- 커밋 / PR 링크:\n- 테스트 / 로그:\n- 만난 이슈와 대응:\n- 남은 할 일:\n'
WHERE "work_in_progress" IS NULL OR btrim("work_in_progress") = '';

UPDATE "tasks"
SET "work_review" = E'## 🔎 REVIEW 단계 (검토)\n<!-- 리뷰 과정에서 확인한 내용과 피드백을 기록하세요. -->\n- 자체 점검 체크리스트:\n- 리뷰어 피드백:\n- 반영된 수정 사항:\n- 남은 논의 항목:\n'
WHERE "work_review" IS NULL OR btrim("work_review") = '';

UPDATE "tasks"
SET "work_done" = E'## ✅ DONE 단계 (마무리)\n<!-- 완료 후 최종 산출물과 회고를 기록하세요. -->\n- 최종 산출물 / 배포 링크:\n- 성과 / 측정 결과:\n- 회고 (잘된 점 / 아쉬운 점):\n- 후속 작업 / 팔로업:\n'
WHERE "work_done" IS NULL OR btrim("work_done") = '';
