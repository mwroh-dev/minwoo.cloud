# AGENTS.md

## Scope

- Applies to `src/content/**`.

## Frontmatter Contract

- Required fields: `title`, `date`, `description`
- Optional fields currently supported: `featured`, `series`, `tags`, `thumbnail`, `translationKey`
- `date` must be `YYYY-MM-DD`.
- `translationKey` must be unique per locale and stable across translations of the same post.

## Content Rules

- Keep posts under `src/content/<locale>/*.mdx`.
- Internal links to posts must use either `/blog/<slug>` or `/{locale}/blog/<slug>` paths that actually resolve.
- When adding or renaming content, re-check alternate links, archive visibility, and localized navigation.

## Verification

- Run `yarn check:content` after any MDX change.
