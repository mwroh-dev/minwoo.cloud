---
spec_version: 1
status: implemented
context_mode: standalone
scope_paths:
  - .github/workflows/ci.yml
  - .husky/
  - package.json
  - spec.md
  - specs/README.md
  - specs/spec-workflow-automation.md
  - scripts/
  - tests/unit/
---

# Spec Workflow Automation

## Goal

- Add a repository-native PR and work spec workflow that can be created and checked from git state alone.
- Make spec coverage verifiable without relying on chat history, PR descriptions, or reviewer memory.

## Non-goals

- Do not add ADR enforcement in this first pass.
- Do not turn work specs into release notes or changelog fragments.

## Scope

- `.github/workflows/ci.yml`
- `.husky/`
- `package.json`
- `spec.md`
- `specs/README.md`
- `specs/spec-workflow-automation.md`
- `scripts/`
- `tests/unit/`

## Constraints

- Coverage decisions must come from `spec.md`, spec frontmatter, and the git diff only.
- Active specs must stay human-readable and machine-parseable at the same time.
- Docs-only and tests-only changes remain exempt from the coverage requirement.

## Workflow

- `spec.md` points to the current branch umbrella spec.
- The current umbrella spec declares `scope_paths` and stays understandable without hidden context.
- The generator creates a deterministic first draft from branch and changed paths; AI can refine the prose afterward.
- The checker validates required metadata, required sections, and changed-file coverage.

## Verification

- `yarn check:specs`
- `yarn lint`
- `yarn format`
- `yarn typecheck`
- `yarn test`

## Rollback

- Remove the spec workflow scripts and CI step.
- Restore `spec.md` to a single-pointer format if the active-spec index proves too noisy.
