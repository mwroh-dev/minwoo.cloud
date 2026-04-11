---
name: content-post
description: Use when editing `src/content/**/*.mdx` or `src/lib/post.ts` so frontmatter, translation keys, and internal links stay valid.
---

# Content Post

Use this skill when changing post content or the content-loading pipeline.

## Checklist

- Confirm required frontmatter exists: `title`, `date`, `description`
- Keep `date` in `YYYY-MM-DD`
- Treat `translationKey` as the stable cross-locale identifier
- Check that new or changed internal links resolve
- Re-run `yarn check:content`

## When content and code change together

- Read `src/content/AGENTS.md`
- Read `src/lib/AGENTS.md`
- Prefer updating parsing logic in one place instead of duplicating content assumptions in pages or components
