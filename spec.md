# Active Spec

## Current feature

- `specs/writings-editorial-current.md`

## Status

- Implemented on the current branch and treated as the living source of truth for the active home/writings restructure.

## Required verification

- `yarn check:content`
- `yarn lint`
- `yarn format`
- `yarn typecheck`
- `yarn test`
- `yarn build`
- `yarn test:e2e:smoke`

## Notes

- Add new feature-level specs under `specs/`.
- Keep this file short; use it as the active index, not the detailed implementation document.
