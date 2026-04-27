# Import Rules

## Order

Use this order, with a blank line between groups:

1. `react`
2. `next/*`
3. third-party packages
4. `@/` alias imports
5. relative imports such as `./`

## Additional rules

- Do not use import aliasing such as `import { foo as bar } ...`.
- If imported names collide, rename the exported helper at the source module or use a different local symbol strategy that does not rely on import aliasing.
