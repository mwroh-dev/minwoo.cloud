---
spec_version: 1
status: active
branch: feat/blog-text-list-fd
created_at: 2026-04-12T00:00:00.000Z
context_mode: standalone
scope_paths:
  - .agents/skills/
  - .eslintrc.json
  - .github/workflows/
  - .gitignore
  - .husky/
  - .prettierignore
  - .prettierrc.json
  - .vscode/
  - AGENTS.md
  - docs/agent-rules/
  - eslint.config.mjs
  - next.config.ts
  - package-lock.json
  - package.json
  - playwright.config.ts
  - postcss.config.mjs
  - scripts/
  - spec.md
  - specs/
  - src/app/
  - src/components/
  - src/content/
  - src/lib/
  - src/types/post.ts
  - tailwind.config.ts
  - tsconfig.json
  - vitest.config.ts
  - yarn.lock
updated_at: 2026-04-12T00:00:00.000Z
---

# Blog Text List FD Branch Work

## Goal

- Reshape the site into a bilingual editorial home and writings archive with Korean as the default entry point and English as a first-class alternate route.
- Add a branch-level umbrella spec workflow so future branch work can be explained and checked from repository state alone.

## Non-goals

- Do not add ADR enforcement in this branch.
- Do not turn this document into a commit log or release note dump.
- Do not add a CMS, search, tag filters, pagination, or a visual regression pipeline in this branch.

## Scope

- Home, archive, localized detail routes, and route-level metadata or redirect behavior under `src/app/`.
- Shared blog UI, content parsing, content source files, and related verification under `src/components/`, `src/lib/`, `src/content/`, and tests.
- Repository guidance, spec automation, Husky hooks, and CI wiring needed for the branch umbrella-spec workflow.

## Current Branch Delta

- The site shifts from a generic archive toward a Korean-first editorial home and writings flow, while keeping English routes and legacy blog redirects working.
- Content parsing, sitemap or metadata plumbing, and blog UI are aligned around that bilingual editorial information architecture.
- The repo gains a branch umbrella-spec convention, deterministic spec generation, and spec coverage checks wired into local and CI verification.

## Constraints

- The branch must remain understandable from this document plus checked-in files alone, without PR discussion or chat context.
- Coverage enforcement must come from `spec.md`, this spec's `scope_paths`, and the git diff only.
- Editorial routing must keep Korean as the default archive entry while preserving localized English routes and legacy `/blog/[slug]` redirects.
- Evergreen repository rules stay in `AGENTS.md` and `docs/agent-rules/`; this document should only describe branch-specific intent and constraints.

## Linked Detail Specs

- `specs/writings-editorial-current.md` captures the editorial and archive behavior in more detail.
- `specs/spec-workflow-automation.md` captures the spec workflow automation detail added during this branch.

## Verification

- `yarn check:content`
- `yarn check:guidance`
- `yarn check:specs`
- `yarn lint`
- `yarn format`
- `yarn typecheck`
- `yarn test`
- `yarn build`
- `yarn test:e2e:smoke`

## Rollback

- Revert the branch to `main` if the editorial IA or spec workflow additions introduce blocking regressions.
- Preserve the historical subsystem specs in `specs/` even if the umbrella-spec workflow is simplified later.
