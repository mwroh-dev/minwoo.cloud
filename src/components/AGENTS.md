# AGENTS.md

## Scope

- Applies to `src/components/**`.

## Required rule files

- `docs/agent-rules/imports.md`
- `docs/agent-rules/control-flow.md`
- `docs/agent-rules/structure.md`
- `docs/agent-rules/rendering.md`
- `docs/agent-rules/naming.md`
- `docs/agent-rules/copy.md`
- `docs/agent-rules/validation.md`

## Component Rules

- Presentation components should not shape content data or route metadata.
- JSX return blocks should stay declarative; precompute lists, booleans, and branch outputs before `return`.
- Repeated conditional rendering patterns should be extracted to helpers or dedicated subcomponents.
