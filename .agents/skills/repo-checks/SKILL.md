---
name: repo-checks
description: Use when a task changes repo-tracked files in cielo.dev and you need to confirm the active spec, affected architecture boundaries, and required verification commands.
---

# Repo Checks

1. Read the root `AGENTS.md`.
2. Read `spec.md` and the linked detailed spec in `specs/`.
3. If the task touches `src/app`, `src/lib`, `src/content`, or `src/components`, read the nearest nested `AGENTS.md`.
4. If the task touches `src/app`, `src/components`, `src/lib`, or `scripts`, also read the relevant files in `docs/agent-rules/`.
5. Identify which subsystems changed: routing, content parsing, UI composition, metadata, or content files.
6. Run the narrowest verification commands that still cover the affected subsystem.
7. Summarize failures as:
   - affected area
   - likely root cause
   - concrete next fix

## Default verification order

- `yarn check:content`
- `yarn lint`
- `yarn format`
- `yarn typecheck`
- `yarn test`
- `yarn build`
- `yarn test:e2e:smoke`
