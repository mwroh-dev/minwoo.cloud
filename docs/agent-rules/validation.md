# Validation Rules

## Issue and error representation

- Validation issues should not use raw prose strings as the primary identifier.
- Use uppercase underscore codes such as `INVALID_FRONTMATTER` or `MISSING_PUBLIC_ASSET`.
- Distinguish logical and physical errors through explicit categories.

## Internal type rules

- If an internal type is used in only one place, inline it instead of defining a top-level type.
- If an internal type is used in multiple places, define it near the top of the file.
- Do not export a type or interface unless another module imports it.

## Shared literal sources

- If a local constant object or union already defines the allowed string values, reuse that shared symbol instead of repeating raw literals in factories, filters, or tagged objects.

## Function argument rules

- If a function has 2 or more arguments, use an object parameter.
- If a function has multiple arguments with the same primitive type, use an object parameter even when the count is small.

## Long logical conditions

- If `||` or `&&` chains have 3 or more conditions, format them vertically for readability.
