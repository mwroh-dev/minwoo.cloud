---
spec_version: 1
status: active
branch: <branch-name>
created_at: <ISO-8601 timestamp>
context_mode: standalone
scope_paths:
  - <top-level-path-or-file>
  - <another-path-or-file>
updated_at: <ISO-8601 timestamp>
---

# <Branch Or Work Title>

## Goal

- <State the branch goal in 1-2 concrete bullets.>
- <Explain the intended user or system outcome, not the implementation mechanics.>

## Non-goals

- <Call out what this branch intentionally does not change.>
- <Keep this section short and decision-making oriented.>

## Scope

- <List the high-level repo areas touched by this branch.>
- <Do not repeat the full `scope_paths` inventory unless that detail is genuinely needed.>

## Current Branch Delta

- <Summarize what changed in this branch at a high level.>
- <Prefer behavior and architecture statements over file-by-file narration.>

## Constraints

- <List constraints that must remain true during implementation.>
- <Include compatibility, routing, validation, or rollout constraints when relevant.>

## Linked Detail Specs

- <Link deeper specs only when the umbrella spec would otherwise become noisy.>
- Example: `specs/<detail-spec>.md`

## Verification

- `<command>`
- `<command>`

## Rollback

- <State how to back out the branch safely if it causes blocking regressions.>
