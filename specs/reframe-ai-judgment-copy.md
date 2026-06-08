---
spec_version: 1
status: active
branch: reframe-ai-judgment-copy
created_at: 2026-06-08T00:00:00.000Z
context_mode: standalone
scope_paths:
  - spec.md
  - specs/reframe-ai-judgment-copy.md
  - src/lib/i18n.ts
  - src/content/
  - tests/e2e/smoke.spec.ts
updated_at: 2026-06-08T00:00:00.000Z
---

# Reframe AI Judgment Copy

## Goal

- Reframe the public site copy away from an explicit developer identity and toward AI-era judgment, delegation, criteria, context, and verification.
- Keep the home and blog IA unchanged while updating the visible copy, metadata copy, active series label, and representative featured post copy.

## Non-goals

- No route, layout, content parsing, or component behavior changes.
- No rewrite of all post bodies.
- No removal of contextual developer references that are part of an article's narrative.

## Scope

- `src/lib/i18n.ts`: home, blog, footer, and metadata copy.
- `src/content/*.mdx`: frontmatter series label updates and the featured post copy updates needed for surface-level consistency.
- `tests/e2e/smoke.spec.ts`: expected archive heading copy.

## User-visible behavior

- Home no longer presents the site as an "AI-era developer note."
- Blog archive no longer uses "developer thinking" as the primary archive frame.
- Active series formerly labeled `AI 엔지니어링 노트` is relabeled to `AI 위임과 검증에 대한 생각`.
- Metadata descriptions and title align with the new framing.

## Constraints

- Preserve existing slugs, dates, featured flags, and routes.
- Preserve frontmatter validity: `title`, `date`, and `description` remain required; `date` remains `YYYY-MM-DD`.
- Keep centralized UI copy in `src/lib/i18n.ts`.
- Stop before PR creation if surface-level search still finds the old developer framing after the planned edits.

## Verification

- `yarn check:content`
- `yarn check:specs`
- `yarn lint`
- `yarn format`
- `yarn typecheck`
- `yarn test`
- `yarn build`
- `yarn test:e2e:smoke`

## Rollback

- Restore `src/lib/i18n.ts`, affected `src/content/*.mdx` frontmatter/body copy, `tests/e2e/smoke.spec.ts`, and `spec.md` to their previous copy.
