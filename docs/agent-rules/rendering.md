# Rendering Rules

## JSX return rules

- Avoid function creation inside JSX return blocks.
- Avoid array iteration such as `.map(...)` directly inside JSX return blocks.
- Build lists, branch outputs, and derived render fragments in `const` values before `return`.

## Branching

- If the same return block mixes empty-state and list rendering, extract subcomponents or precompute the branch result before JSX.
- If a conditional pattern is repeated twice or more, extract it into a helper or named constant.
