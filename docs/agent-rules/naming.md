# Naming Rules

## Booleans

- Boolean values should use the `is` prefix.
- Examples:
  - `isActive`
  - `isDisabled`
  - `isPrimaryLocale`

## Props types

- If a props type is not exported, do not create a separate `*Props` alias by default.
- Prefer inline parameter typing for local-only component props.
- If an internal type is used only once, inline it instead of creating a top-level alias.
- If an internal type is reused, define it near the top of the file.

## Function parameters

- If a function receives a single object argument, destructure it at the parameter boundary instead of naming a generic wrapper like `input` or `options`, unless the whole object is forwarded unchanged.
- If a function receives a single primitive or path-like argument, prefer the domain name directly, such as `filePath` or `directory`.

## Complex conditions

- If a function argument or branch condition is complex, pull it into a named `const` that explains intent.
- If `===` and `&&` appear together, add parentheses to make the intended grouping explicit.
- Name lookup results as nouns such as `localizedPost` or `document`.
- Name derived branch predicates by intent such as `isMissingLocalizedPost` instead of encoding the implementation detail of the lookup call.
- Prefer `const localizedPost = getPostByLocaleAndSlug(...); if (!localizedPost) { ... }` over inline negated lookup calls inside branches.

## Raw strings

- Do not use important URL strings directly in renderers.
- Do not use raw locale strings like `'ko'` and `'en'` in renderers when locale constants/types already exist.
- Prefer key-based locale relationships such as `DEFAULT_LOCALE = LOCALE_VALUES.KOREAN` over repeated raw literals.
