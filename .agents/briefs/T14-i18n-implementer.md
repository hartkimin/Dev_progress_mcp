# T14 Brief — i18n KR + EN Keys (YC Questions + Plan Review)

**Agent**: T14-i18n-implementer  
**Branch**: feat/gstack-phase1  
**Commit**: a1afea7

---

## Key style of i18n.tsx

The file uses a **flat object with literal string keys** — not dot-notation path access, not nested objects. Each entry is:

```ts
'some.dot.key': { en: '...', ko: '...' }
```

The `t()` function does `translations[key][language]`, so dot-string keys like `'yc.q1'` work as ordinary object property names. No structural adaptation to `YCQuestionsCard.tsx` was required — the component already calls `t('yc.q1')` etc. and those exact strings are now registered.

---

## Keys added to KR map: 24

| Key | KR value |
|-----|----------|
| `common.save` | 저장 |
| `common.saving` | 저장 중... |
| `common.loading` | 로딩 중... |
| `yc.title` | YC 6가지 질문 (Ideation) |
| `yc.q1` | 수요 현실: 누가, 몇 명이 이걸 요청했나? |
| `yc.q1.placeholder` | 구체적 사용자/팀명과 횟수 |
| `yc.q2` | 현상 유지의 진짜 문제는? |
| `yc.q2.placeholder` | 지금 방식의 고통점 |
| `yc.q3` | 절박한 구체성 |
| `yc.q3.placeholder` | 가장 구체적인 유스케이스 1개 |
| `yc.q4` | 가장 좁은 웨지 |
| `yc.q4.placeholder` | 최소 진입 범위 |
| `yc.q5` | 관찰 |
| `yc.q5.placeholder` | 실제 사용 관찰 증거 |
| `yc.q6` | Future-fit |
| `yc.q6.placeholder` | 1년 뒤에도 유효한가? |
| `planReview.kind.ceo` | CEO 리뷰 |
| `planReview.kind.eng` | 엔지니어링 리뷰 |
| `planReview.kind.design` | 디자인 리뷰 |
| `planReview.kind.devex` | DevEx 리뷰 |
| `planReview.decision.accept` | 수락 |
| `planReview.decision.revise` | 수정 |
| `planReview.decision.reject` | 거절 |

Note: `'loading'` (bare key, line 19 in original file) is a different, pre-existing key used by top-level loading states. `common.loading` is a new, separate key for component-level use.

---

## Keys added to EN map: 24

Identical key set to KR — same 24 keys. No orphan keys.

---

## Keys skipped (already existed)

None of the `common.*` or `yc.*` or `planReview.*` keys existed before this task.

The bare `'loading'` key (line 19) was NOT touched — it remains as-is. The YCQuestionsCard uses `t('loading')` for its initial loading state (line 51), which resolves to the existing `'loading'` entry correctly.

---

## YCQuestionsCard adaptation

**No changes made.** The component already calls keys in the exact dot-string format (`'yc.title'`, `'yc.q1'`, `'yc.q1.placeholder'`, `'common.save'`, `'common.saving'`) that now exist in the translations map.

---

## Build result

`npm run build` — exit 0, no errors. All routes compiled successfully.
