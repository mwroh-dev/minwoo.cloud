# Spec Conventions

## Purpose

- `spec.md` points to the currently active feature spec.
- `specs/*.md` stores detailed, durable feature specs and historical snapshots.

## Naming

- Use short kebab-case names tied to the feature or subsystem.
- Example: `writings-editorial-current.md`, `content-validation.md`, `codex-review-lane.md`

## Recommended sections

- Goal
- Non-goals
- User-visible behavior
- Architecture / data flow
- Edge cases
- Verification
- Rollback

## Writing style

- Prefer decision-complete statements over brainstorm notes.
- Prefer explicit route, file, and validation contracts over broad intent language.
