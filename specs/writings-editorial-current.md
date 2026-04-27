---
spec_version: 1
status: implemented
context_mode: standalone
scope_paths:
  - .agents/skills/
  - .eslintrc.json
  - .gitignore
  - .prettierignore
  - .prettierrc.json
  - .vscode/
  - AGENTS.md
  - docs/agent-rules/
  - eslint.config.mjs
  - next.config.ts
  - package-lock.json
  - playwright.config.ts
  - postcss.config.mjs
  - specs/writings-editorial-current.md
  - src/app/
  - src/components/
  - src/content/
  - src/lib/
  - src/types/post.ts
  - tailwind.config.ts
  - tests/e2e/smoke.spec.ts
  - tests/unit/post.test.ts
  - tsconfig.json
  - vitest.config.ts
  - yarn.lock
---

# Writings Editorial Current State

## Goal

- Reposition the site from a generic career archive into an editorial home focused on problem framing, task decomposition, and clearer working conditions in the age of AI agents.
- Keep `/blog` as the writings archive entry point while preserving legacy slug redirects.

## Non-goals

- No CMS or remote content source
- No search, tag filters, or pagination yet
- No visual regression pipeline in this phase

## Scope

- `.agents/skills/`
- `.eslintrc.json`
- `.gitignore`
- `.prettierignore`
- `.prettierrc.json`
- `.vscode/`
- `AGENTS.md`
- `docs/agent-rules/`
- `eslint.config.mjs`
- `next.config.ts`
- `package-lock.json`
- `playwright.config.ts`
- `postcss.config.mjs`
- `specs/writings-editorial-current.md`
- `src/app/`
- `src/components/`
- `src/content/`
- `src/lib/`
- `src/types/post.ts`
- `tailwind.config.ts`
- `tests/e2e/smoke.spec.ts`
- `tests/unit/post.test.ts`
- `tsconfig.json`
- `vitest.config.ts`
- `yarn.lock`

## User-visible behavior

- `/` renders the home page with centered cloud video, Korean-first copy, and a CTA to `/blog`.
- `/blog` renders the writings archive.
- `/blog/[slug]` renders the post detail page.

## Information Architecture

- Home presents the editorial framing and points to writings.
- Archive presents the archive framing, featured post, and grouped archive entries.
- Detail pages present metadata and MDX content.

## Data Flow

- Source posts live in `src/content/*.mdx`.
- `src/lib/post.ts` parses frontmatter, computes reading time, builds hrefs, and groups posts by `series`.
- Archive/detail routes consume parsed post data without re-implementing content parsing logic.
- Metadata and sitemap use the same parsed content graph.

## Frontmatter Contract

- Required: `title`, `date`, `description`
- Optional: `featured`, `series`, `tags`, `thumbnail`
- `date` must remain `YYYY-MM-DD`
- Slugs are derived from filenames and must remain globally unique because legacy `/blog/[slug]` redirects rely on them

## Constraints

- Keep `/blog` as the archive entry point while preserving legacy slug redirects.
- Reuse the shared post parsing graph instead of re-implementing content parsing inside routes.

## Edge Cases

- Missing posts should produce an empty archive state, not a crash.
- Missing post for a known slug should return `notFound()`.
- Invalid frontmatter must fail validation and be treated as a content error.
- Internal MDX links to posts or static assets must resolve.

## Verification

- `yarn check:content`
- `yarn lint`
- `yarn format`
- `yarn typecheck`
- `yarn test`
- `yarn build`
- `yarn test:e2e:smoke`

## Rollback

- Revert the current branch to `main` route/content structure if the editorial IA causes blocking regressions.
- Preserve content files; do not discard MDX source as part of rollback.
