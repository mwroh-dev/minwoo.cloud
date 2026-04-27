# Testing Rules

## Global core

- Start from the home-scoped template at `/Users/cielo-iamdt/.codex/templates/agent-rules/testing.md`.
- This repo file is an adapter. Keep global taxonomy and writing defaults in the home template, and keep only repo-local tool mapping and behavior priorities here.

## Tool mapping

- Use `Vitest` for state-based unit tests, interaction-based unit tests, table-driven unit tests, and integration tests.
- Use `Playwright` for end-to-end smoke and journey coverage.
- Keep test placement under:
  - `tests/unit`
  - `tests/e2e`

## Behavior priorities

- Cover content parsing, content validation, and internal-link validation before expanding UI-only test depth.
- Cover locale/path helpers and metadata helpers in `src/lib` with fast unit tests.
- Cover redirects, `notFound`, static params, metadata generation, `robots`, and `sitemap` behavior for `src/app`.
- Keep spec and guidance automation covered through filesystem-backed integration tests in `tests/unit`.

## Local defaults

- Keep `AAA + state-based` as the default style for most unit tests in this repo.
- Use table-driven tests when helper behavior is a repeated allow/deny or input/output matrix.
- Keep scenario-style e2e test names short and flow-oriented.
- Do not force `Given / When / Then` phrasing on every test. Use it only when a multi-phase scenario becomes clearer because of it.
- Prefer real temp directories and files over mocks when validating content parsing, filesystem checks, or spec/guidance automation.
