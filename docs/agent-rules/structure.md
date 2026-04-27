# Code Structure Rules

## Helper placement

- Code used by a single export should be placed physically close to that export.
- If a helper is used by 3 or more exports, move it upward into shared scope or a shared module.
- A named intermediate `const` should exist when it adds meaning, is reused, represents async/promise flow, or flattens a branch into a mechanically editable shape.
- If a value is a one-off synchronous pass-through, prefer direct usage over storing another intermediate constant unless extracting it avoids nested branch logic or an inline object-argument lookup.

## Guard proximity

- Keep a derived value and its guard together.
- Do not add a decorative blank line between:
  - `const document = ...`
  - `if (!document) { ... }`

## Codemod-friendly control flow

- If a branch condition depends on a function call with an object argument, extract the lookup result or a named predicate into a `const` before the branch.
- If a branch performs a side effect such as reporting, logging, throwing, returning early, or mutation, do not hide the lookup inside the branch test.
- Prefer adjacent `const value = lookup(...)` and `if (!value) { ... }` pairs over inline `if (!lookup(...)) { ... }` branches.

## Component organization

- If one component handles both empty-state and list-state rendering, prefer a dedicated subcomponent or prebuilt branch output over mixing large ternaries and nested render logic inline.
- Keep related constants close to where they are used, and separate unrelated constant groups with a blank line.
