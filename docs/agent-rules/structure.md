# Code Structure Rules

## Helper placement

- Code used by a single export should be placed physically close to that export.
- If a helper is used by 3 or more exports, move it upward into shared scope or a shared module.

## Guard proximity

- Keep a derived value and its guard together.
- Do not add a decorative blank line between:
  - `const document = ...`
  - `if (!document) { ... }`

## Component organization

- If one component handles both empty-state and list-state rendering, prefer a dedicated subcomponent or prebuilt branch output over mixing large ternaries and nested render logic inline.
