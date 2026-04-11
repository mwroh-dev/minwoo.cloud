# AGENTS.md

## Purpose

- This repository is a bilingual editorial site built with Next.js App Router and MDX content.
- Read `spec.md` first for the currently active feature. Follow any linked detailed spec in `specs/` before editing repo-tracked files.
- When touching `src/app` or `src/components`, also read the relevant files in `docs/agent-rules/`.

## Architecture Overview

- `src/app` owns routes, metadata, redirects, localized page behavior, and page-level composition.
- `src/components` owns presentational UI and route-agnostic interaction patterns.
- `src/lib` owns content parsing, schemas, grouping, localized path resolution, and metadata helpers.
- `src/content` owns editorial source material and frontmatter contracts.

## Primary Data Flow

- `src/content/<locale>/*.mdx` stores post frontmatter and body content.
- `src/lib/post.ts` parses frontmatter, derives href/reading time, groups posts, and resolves alternates.
- `src/app/blog`, `src/app/[locale]/blog`, and `src/app/[locale]/blog/[slug]` render archive/detail routes from parsed post data.
- `src/app/sitemap.ts` and metadata generation depend on the same parsed content graph.

## Working Rules

- Preserve the current user-facing IA unless a spec explicitly changes it.
- Prefer schema-first changes in `src/lib` before changing rendering or content assumptions.
- When changing routes or locale behavior, verify redirects, metadata, sitemap, and localized links together.
- When changing `src/content`, treat frontmatter validity, translation pairing, and internal links as part of the code change.
- Keep presentation logic in components and content/data shaping in `src/lib`.
- Follow concern-specific rule files instead of inventing local style decisions:
  - `docs/agent-rules/imports.md`
  - `docs/agent-rules/structure.md`
  - `docs/agent-rules/rendering.md`
  - `docs/agent-rules/naming.md`
  - `docs/agent-rules/i18n.md`

## Definition of Done

- `yarn lint`
- `yarn format`
- `yarn typecheck`
- `yarn test`
- `yarn build`
- `yarn test:e2e:smoke`
- `yarn check:content`

## Review Focus

- Architecture boundary violations or mixed responsibilities
- Duplicate parsing, routing, or rendering logic
- Missing edge-case handling for locales, redirects, empty states, and invalid content
- Performance risks caused by unnecessary re-parsing or route-level work
- Maintainability risks caused by implicit contracts between content, routing, and UI
- Mismatch between `spec.md`/`specs/*` and the implemented behavior
