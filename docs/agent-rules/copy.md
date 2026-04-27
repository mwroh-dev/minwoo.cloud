# Copy Rules

## Copy location

- User-visible labels, CTA text, empty states, footer text, aria labels, and metadata strings should come from centralized copy data (not ad-hoc inline strings).
- Keep centralized copy in `src/lib` and consume it from `src/app` and `src/components`.

## URLs and routes in renderers

- Do not inline important internal route strings directly in JSX.
- Prefer named constants or helpers for internal routes that appear in multiple places (e.g. `/blog`).

## Formatting helpers

- Keep label-formatting helpers (date labels, reading time labels) centralized and deterministic.
