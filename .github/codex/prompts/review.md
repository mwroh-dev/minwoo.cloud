# Codex PR Review Prompt

Review this pull request against `origin/$BASE_REF...HEAD`.

Before reviewing:

1. Read the root `AGENTS.md`.
2. Read any nested `AGENTS.md` files for directories touched by the diff.
3. Read `spec.md` and any linked detailed spec relevant to the changed area.

Focus on high-signal findings only:

- architecture boundary violations
- duplicate logic or repeated data shaping
- performance bottlenecks or unnecessary work
- maintainability risks
- missing edge-case or error-handling coverage
- mismatch between spec and implementation
- missing or weak tests for behavior that changed

Output rules:

- Start with findings, ordered by severity.
- For each finding, cite file paths and explain the concrete risk.
- Distinguish symptom vs. likely root cause vs. robust fix.
- If no significant findings exist, say so briefly and mention any residual risk or test gap.
