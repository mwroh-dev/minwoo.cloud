# Writings Editorial Current State

## Goal

- Reposition the site from a generic career archive into a bilingual editorial home focused on problem framing, task decomposition, and clearer working conditions in the age of AI agents.
- Keep Korean as the default archive entry point while preserving English reading routes and legacy slug redirects.

## Non-goals

- No CMS or remote content source
- No search, tag filters, or pagination yet
- No visual regression pipeline in this phase

## User-visible behavior

- `/` renders the home page with centered cloud video, Korean-first copy, and a CTA to `/blog`.
- `/blog` renders the default Korean writings archive.
- `/en/blog` renders the English archive.
- `/blog/[slug]` remains a redirect layer that forwards to a localized detail route.
- `/{locale}/blog/[slug]` renders the post detail page with localized archive back-link and translation toggle.

## Information Architecture

- Home presents the editorial framing and points to writings.
- Archive presents the archive framing, language switch, featured post, and grouped archive entries.
- Detail pages present metadata, translation controls, MDX content, and localized return paths.

## Data Flow

- Source posts live in `src/content/<locale>/*.mdx`.
- `src/lib/post.ts` parses frontmatter, computes reading time, builds hrefs, and groups posts by `series`.
- Archive/detail routes consume parsed post data without re-implementing content parsing logic.
- Metadata and sitemap use the same parsed content graph.

## Frontmatter Contract

- Required: `title`, `date`, `description`
- Optional: `featured`, `series`, `tags`, `thumbnail`, `translationKey`
- `date` must remain `YYYY-MM-DD`
- `translationKey` links alternates across locales
- Slugs are derived from filenames and must remain globally unique because legacy `/blog/[slug]` redirects rely on them

## Edge Cases

- Missing locale content should produce an empty archive state, not a crash.
- Missing post for a known locale slug should return `notFound()`.
- Missing alternate translation should disable or omit translation navigation instead of linking to nowhere.
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
