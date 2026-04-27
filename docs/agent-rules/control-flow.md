# Control Flow Rules

## Cheap terminal branches first

- If an empty or missing branch is terminal and cheaper than the populated branch, return it before grouping, sorting, mapping, or other derived work.
- Prefer `if (items.length === 0) return ...;` over building derived collections first and checking the derived result later.

## Guard clause shape

- Single-line `return`, `continue`, and `break` guard clauses should stay on one line without braces.
- Multi-line guard bodies still require braces.

## Helper extraction

- Do not extract a helper that only wraps a single obvious mutation or pass-through statement.
- Extract a helper when it owns business logic, branch selection, reusable transformation, or code that deserves direct tests.
- If a conditional expression also performs collection work such as `map`, `filter`, `sort`, or `reduce`, move that work into an adjacent block or dedicated helper before assigning the branch result.

## Sentinel values

- Repeated sentinel values with domain meaning, such as root-directory `''` or current-directory `'.'`, should live in named constants near the top of the file.
