---
current_spec: specs/feat-blog-text-list-fd.md
---

# Current Branch Spec

## Current spec

- `specs/feat-blog-text-list-fd.md`

## Status

- The current spec is the umbrella document for the active branch.
- Every non-exempt changed file must be covered by the current spec through its `scope_paths`.

## Required verification

- `yarn check:content`
- `yarn check:specs`
- `yarn lint`
- `yarn format`
- `yarn typecheck`
- `yarn test`
- `yarn build`
- `yarn test:e2e:smoke`

## Notes

- Add new work-level specs under `specs/`.
- Keep this file short; use it as the branch pointer, not the detailed implementation document.
