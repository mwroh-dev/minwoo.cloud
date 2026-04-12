# AGENTS.md

## Scope

- Applies to `src/app/**`.

## Required rule files

- `docs/agent-rules/imports.md`
- `docs/agent-rules/control-flow.md`
- `docs/agent-rules/structure.md`
- `docs/agent-rules/rendering.md`
- `docs/agent-rules/naming.md`
- `docs/agent-rules/i18n.md`
- `docs/agent-rules/validation.md`

## Route Rules

- Keep `/blog` as the default Korean archive entry point.
- Keep localized archives under `/{locale}/blog`.
- Keep legacy `/blog/[slug]` behavior as a redirect layer, not a second rendering implementation.
- Any locale or route change must update sitemap, metadata, and redirect behavior together.

## Composition Rules

- Page files own routing, params, redirects, metadata, and high-level composition.
- Shared UI belongs in `src/components`, not directly inside page files unless it is route-specific.
- Avoid pushing content parsing or schema logic into page components.
- Keep page-local helpers physically close to the export that uses them.
- Keep related guards and validation checks adjacent; do not separate a guard from the value it validates with decorative blank lines.

## Verification

- Route changes require `yarn build` and `yarn test:e2e:smoke`.
