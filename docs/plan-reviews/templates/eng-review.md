---
kind: eng
project_id: <uuid>
spec: docs/superpowers/specs/<spec-file>.md
reviewer: solo
date: YYYY-MM-DD
score: 0-10
decision: accept|revise|reject
---

## 1. Core Questions
1. Append-only contract preserved on `src/index.ts`, `src/db.ts`, existing Prisma models?
2. Schema changes additive only (new tables/columns with defaults)?
3. Edge cases: null project, empty payload, i18n key missing, auth disabled path?
4. How is this verified? (Manual QA scenario + any automated test)
5. 14-tab load time impact — any regression?

## 2. Evidence
- Grep confirmations of no signature changes.
- Prisma `migrate diff` output.

## 3. What would make this a 10?

## 4. Decision + Reason

## 5. Todo migration
