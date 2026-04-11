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

## Complex conditions

- If a function argument or branch condition is complex, pull it into a named `const` that explains intent.
- If `===` and `&&` appear together, add parentheses to make the intended grouping explicit.

## Raw strings

- Do not use important URL strings directly in renderers.
- Do not use raw locale strings like `'ko'` and `'en'` in renderers when locale constants/types already exist.
- Prefer key-based locale relationships such as `DEFAULT_LOCALE = LOCALE_VALUES.KOREAN` over repeated raw literals.
