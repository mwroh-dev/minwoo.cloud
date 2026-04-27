# AGENTS.md

## Scope

- Applies to `src/content/**`.

## Frontmatter Contract

- Required fields: `title`, `date`, `description`
- Optional fields currently supported: `featured`, `series`, `tags`, `thumbnail`
- `date` must be `YYYY-MM-DD`.

## Content Rules

- Keep posts under `src/content/*.mdx`.
- Internal links to posts must use `/blog/<slug>` paths that actually resolve.
- When adding or renaming content, re-check archive visibility and navigation.

## Verification

- Run `yarn check:content` after any MDX change.
