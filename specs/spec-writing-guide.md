# Spec Writing Guide

## Purpose

- Use one umbrella spec per active branch.
- Keep `spec.md` as a short pointer to that umbrella spec.
- Keep evergreen repo rules in `AGENTS.md` or `CLAUDE.md`, not in the branch spec.
- Use detail specs only when one branch needs deeper subsystem notes.

## Why This Shape

- OpenAI recommends giving Codex task context in the shape of a GitHub issue or PR: concrete, scoped, and grounded in paths and docs.  
  Reference: [How OpenAI uses Codex](https://openai.com/business/guides-and-resources/how-openai-uses-codex/)
- Anthropic recommends keeping persistent agent instructions specific, concise, and structured, and separating always-on project memory from narrower path-specific rules.  
  References: [Claude memory](https://code.claude.com/docs/en/memory), [Claude common workflows](https://code.claude.com/docs/en/tutorials)
- GitLab recommends a single living design document that starts small, gets refined during implementation, and stays under version control.  
  Reference: [GitLab Architecture Design Workflow](https://handbook.gitlab.com/handbook/engineering/architecture/workflow/)
- The broader `AGENTS.md` ecosystem also treats agent guidance as a predictable, dedicated document rather than ad hoc chat context.  
  Reference: [AGENTS.md open format](https://agents.md/)

## Core Rule

- The umbrella spec is not a commit log.
- The umbrella spec is not a copy of `git diff`.
- The umbrella spec is the shortest standalone explanation of:
  - what this branch is trying to do
  - what it is explicitly not doing
  - which repo areas are in scope
  - which constraints must stay true
  - how the change will be verified

## Machine Fields vs Human Body

### Frontmatter is for machines

- Keep frontmatter minimal and stable.
- Use it for fields the checker can validate.
- Current enforced fields:
  - `spec_version`
  - `status`
  - `branch`
  - `created_at`
  - `context_mode`
  - `scope_paths`
  - `updated_at`

### Body is for humans

- The body should explain intent and constraints in natural language.
- The body should not repeat long file inventories if frontmatter already captures them.
- Prefer a few strong sections over exhaustive bullet dumps.
- If detail is needed, link to a subsystem spec instead of bloating the umbrella spec.
- Time metadata belongs in frontmatter, not in a prose changelog.

## What Goes Where

### Put this in `AGENTS.md`

- build and test commands that matter in every session
- repository architecture
- coding conventions
- stable workflow rules
- rules that apply across branches

### Put this in the umbrella spec

- the branch goal
- branch-specific constraints
- the current change shape
- links to deeper detail specs if needed
- verification for this branch

### Put this in detail specs

- subsystem behavior contracts
- route-by-route behavior
- schema or parsing rules
- edge cases that are too verbose for the umbrella spec

## Recommended Body Shape

- `Goal`
- `Non-goals`
- `Scope`
- `Current Branch Delta`
- `Constraints`
- `Linked Detail Specs`
- `Verification`
- `Rollback`

## Writing Rules

- Write for a new engineer or agent with no chat history.
- Use concrete nouns and file paths where they materially help.
- Keep prose concise; do not narrate every commit.
- Describe the branch delta, not the entire product.
- Use the `Scope` section for high-level repo areas, not a duplicate of every `scope_paths` entry.
- Link to detail specs instead of copying them.
- Keep `scope_paths` broad enough to survive normal iteration, but not so broad that every branch looks the same.
- Update the umbrella spec when scope or constraints change, not for every small commit.
- `created_at` is set once when the spec is created.
- `updated_at` moves whenever the umbrella spec is materially updated.
- Use ISO 8601 timestamps so tooling can validate and sort them.

## Anti-Patterns

- large duplicated file lists in both frontmatter and body
- “changed X, changed Y, changed Z” commit-style prose
- vague goals like “improve code quality”
- hiding crucial constraints only in chat or PR comments
- putting durable repo rules in a branch-only spec

## Review Checklist

- Can someone understand the branch without chat history?
- Is the goal branch-specific and concrete?
- Are the non-goals explicit?
- Do `scope_paths` cover the current branch diff?
- Does the body describe intent instead of dumping file names?
- Are deeper subsystem details linked instead of duplicated?
- Are verification steps realistic for this branch?

## Template

- Start from [branch-umbrella-spec.template.md](/Users/cielo-iamdt/projects/cielo.dev/specs/templates/branch-umbrella-spec.template.md).
