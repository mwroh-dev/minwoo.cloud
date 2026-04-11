# Code Structure Rules

## Helper placement

- Code used by a single export should be placed physically close to that export.
- If a helper is used by 3 or more exports, move it upward into shared scope or a shared module.
- A named intermediate `const` should exist only when it adds meaning, is reused, or represents async/promise flow.
- If a value is a one-off synchronous pass-through, prefer direct usage over storing another intermediate constant.

## Guard proximity

- Keep a derived value and its guard together.
- Do not add a decorative blank line between:
  - `const document = ...`
  - `if (!document) { ... }`

## Component organization

- If one component handles both empty-state and list-state rendering, prefer a dedicated subcomponent or prebuilt branch output over mixing large ternaries and nested render logic inline.
- Keep related constants close to where they are used, and separate unrelated constant groups with a blank line.
