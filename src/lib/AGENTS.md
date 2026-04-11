# AGENTS.md

## Scope

- Applies to `src/lib/**`.

## Data Rules

- Prefer schema-first changes before updating UI or content.
- Keep helpers pure where possible.
- Keep UI strings and visual state out of `src/lib`.
- Make data-flow impact explicit when changing post parsing, locale resolution, or metadata helpers.

## Change Checklist

- If you change content parsing, also verify `yarn check:content` and `yarn test`.
- If you change localized href resolution or alternates, also verify archive/detail redirects in smoke e2e.
- Avoid duplicating frontmatter parsing logic outside `src/lib/post.ts`.
