# Spec Conventions

## Purpose

- `spec.md` points to the single umbrella spec for the current branch.
- `specs/*.md` stores branch umbrella specs plus optional subsystem detail specs and historical snapshots.
- Specs must stay understandable without relying on PR descriptions, chat history, or hidden reviewer context.
- Read [spec-writing-guide.md](/Users/cielo-iamdt/projects/cielo.dev/specs/spec-writing-guide.md) before creating or rewriting an umbrella spec.
- Start new umbrella specs from [branch-umbrella-spec.template.md](/Users/cielo-iamdt/projects/cielo.dev/specs/templates/branch-umbrella-spec.template.md).

## Naming

- Use short kebab-case names tied to the branch or subsystem.
- Examples: `feat-blog-text-list-fd.md`, `writings-editorial-current.md`, `content-validation.md`

## Frontmatter

- Every branch umbrella spec must define:
  - `spec_version: 1`
  - `status: active|implemented|merged|archived`
  - `context_mode: standalone`
  - `created_at: <ISO-8601 timestamp>`
  - `scope_paths: []`
  - `updated_at: <ISO-8601 timestamp>`
- `scope_paths` entries are exact file paths by default.
- Directory scope entries must end with `/`, for example `scripts/` or `src/app/`.
- `spec.md` stores the current umbrella spec in the `current_spec` frontmatter field.
- Optional subsystem specs can use the same structure, but only the current umbrella spec is enforced by CI.

## Recommended sections

- Goal
- Non-goals
- Scope
- Constraints
- Verification
- Rollback

## Writing style

- Prefer decision-complete statements over brainstorm notes.
- Prefer explicit route, file, and validation contracts over broad intent language.
- Use the deterministic generator for the first draft, then let AI or a human refine the prose.
- When the branch scope grows, update the umbrella spec instead of creating another active spec.
- Keep machine-readable coverage in frontmatter and keep the body focused on human-readable intent.
