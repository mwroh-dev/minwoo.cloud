---
spec_version: 1
status: active
branch: content/post-sizing-work-for-ai
created_at: 2026-05-07T00:00:00.000Z
context_mode: standalone
scope_paths:
  - .gitignore
  - .prettierignore
  - spec.md
  - specs/
  - src/components/blog/blog-index.tsx
  - src/content/
updated_at: 2026-05-07T00:00:00.000Z
---

# Post: 일을 AI가 맡을 수 있는 크기로 바꾸는 일

## Goal

- 아티클 한 편(`sizing-work-for-ai.mdx`)을 2026-05-07 날짜로 발행한다.
- 기존 콘텐츠 파이프라인과 frontmatter 계약을 유지한 채 새 글을 추가한다.

## Non-goals

- 라우팅, UI, 파싱 로직 변경 없음.
- 새 시리즈(`감각의 기록`) 관련 UI 처리나 필터 추가 없음.

## Scope

- `src/content/sizing-work-for-ai.mdx` 신규 추가.

## Current Branch Delta

- 아티클 한 편(`sizing-work-for-ai.mdx`) 추가.
- `blog-index.tsx`: featured post를 아카이브 그룹에서 제외하던 필터 제거 — 모든 시리즈가 아카이브에 표시되도록 수정.
- `.gitignore`: `.omc/`, `tasks/` 추가.

## Constraints

- frontmatter 필수 필드(`title`, `date`, `description`) 충족.
- `date` 형식 `YYYY-MM-DD` 준수.
- 내부 링크 없으므로 slug 해석 외 추가 검증 불필요.

## Linked Detail Specs

- 없음.

## Verification

- `yarn check:content`

## Rollback

- `src/content/sizing-work-for-ai.mdx` 삭제로 완전 복구 가능.
