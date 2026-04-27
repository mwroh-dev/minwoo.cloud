import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

import { afterEach, describe, expect, it } from 'vitest';

import {
	buildCurrentSpecIndexDocument,
	runSpecsCheck,
	writeSpecDraft,
} from '../../scripts/specs.lib';
import { specsCheckConfig } from '../../scripts/specs.config';

const tempRoots: string[] = [];

function createWorkspaceRoot() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cielo-specs-'));
	tempRoots.push(root);
	return root;
}

function runGitCommand(input: { args: string[]; cwd: string }) {
	return execFileSync('git', input.args, { cwd: input.cwd, encoding: 'utf8' }).trim();
}

function writeWorkspaceFile(input: { content: string; filePath: string; root: string }) {
	const absolutePath = path.join(input.root, input.filePath);
	fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
	fs.writeFileSync(absolutePath, input.content, 'utf8');
}

afterEach(() => {
	for (const root of tempRoots.splice(0)) {
		fs.rmSync(root, { force: true, recursive: true });
	}
});

describe('runSpecsCheck', () => {
	it('passes when a changed file is covered by the current branch spec', () => {
		const root = createWorkspaceRoot();

		writeWorkspaceFile({
			content: buildCurrentSpecIndexDocument({ currentSpec: 'specs/tooling.md' }),
			filePath: 'spec.md',
			root,
		});
		writeWorkspaceFile({
			content: `---
spec_version: 1
status: active
created_at: 2026-04-12T00:00:00.000Z
context_mode: standalone
scope_paths:
  - scripts/
updated_at: 2026-04-12T00:00:00.000Z
---
# Tooling

## Goal

- Cover scripts.

## Non-goals

- None.

## Scope

- \`scripts/\`

## Constraints

- Standalone.

## Verification

- \`yarn check:specs\`

## Rollback

- Revert.
`,
			filePath: 'specs/tooling.md',
			root,
		});

		const result = runSpecsCheck({
			changedPaths: ['scripts/check-specs.ts', 'docs/process.md', 'tests/unit/tool.test.ts'],
			cwd: root,
		});

		expect(result.issues).toEqual([]);
		expect(result.currentSpecPath).toBe('specs/tooling.md');
		expect(result.nonExemptChangedPaths).toEqual(['scripts/check-specs.ts']);
	});

	it('fails when a non-exempt changed file is not covered', () => {
		const root = createWorkspaceRoot();

		writeWorkspaceFile({
			content: buildCurrentSpecIndexDocument({ currentSpec: 'specs/content.md' }),
			filePath: 'spec.md',
			root,
		});
		writeWorkspaceFile({
			content: `---
spec_version: 1
status: active
created_at: 2026-04-12T00:00:00.000Z
context_mode: standalone
scope_paths:
  - src/content/
updated_at: 2026-04-12T00:00:00.000Z
---
# Content

## Goal

- Cover content.

## Non-goals

- None.

## Scope

- \`src/content/\`

## Constraints

- Standalone.

## Verification

- \`yarn check:specs\`

## Rollback

- Revert.
`,
			filePath: 'specs/content.md',
			root,
		});

		const result = runSpecsCheck({ changedPaths: ['scripts/check-specs.ts'], cwd: root });

		expect(result.issues.map(issue => issue.code)).toContain('UNCOVERED_CHANGED_FILE');
	});

	it('fails when spec.md does not declare a single current spec', () => {
		const root = createWorkspaceRoot();

		writeWorkspaceFile({
			content: `---
active_specs:
  - specs/tooling.md
  - specs/scripts.md
---

# Legacy Spec Index
`,
			filePath: 'spec.md',
			root,
		});

		const result = runSpecsCheck({ changedPaths: ['scripts/check-specs.ts'], cwd: root });

		expect(result.issues.map(issue => issue.code)).toContain('CURRENT_SPEC_INDEX_INVALID');
	});
});

describe('writeSpecDraft', () => {
	it('creates a deterministic draft and passes a context-free coverage check in a temp repo', () => {
		const root = createWorkspaceRoot();

		writeWorkspaceFile({
			content: buildCurrentSpecIndexDocument({ currentSpec: 'specs/existing.md' }),
			filePath: 'spec.md',
			root,
		});
		writeWorkspaceFile({
			content: `---
spec_version: 1
status: active
created_at: 2026-04-12T00:00:00.000Z
context_mode: standalone
scope_paths:
  - src/app/
updated_at: 2026-04-12T00:00:00.000Z
---
# Existing

## Goal

- Existing work.

## Non-goals

- None.

## Scope

- \`src/app/\`

## Constraints

- Standalone.

## Verification

- \`yarn check:specs\`

## Rollback

- Revert.
`,
			filePath: 'specs/existing.md',
			root,
		});
		writeWorkspaceFile({ content: 'console.log("base");\n', filePath: 'src/app/page.tsx', root });

		runGitCommand({ args: ['init', '-b', 'main'], cwd: root });
		runGitCommand({ args: ['config', 'user.email', 'codex@example.com'], cwd: root });
		runGitCommand({ args: ['config', 'user.name', 'Codex'], cwd: root });
		runGitCommand({ args: ['add', '.'], cwd: root });
		runGitCommand({ args: ['commit', '-m', 'base'], cwd: root });
		runGitCommand({ args: ['checkout', '-b', 'feat/spec-workflow'], cwd: root });

		writeWorkspaceFile({
			content: 'export const value = 1;\n',
			filePath: 'scripts/check-specs.ts',
			root,
		});
		writeWorkspaceFile({
			content: 'export const testValue = 1;\n',
			filePath: 'tests/unit/specs.test.ts',
			root,
		});

		const draftResult = writeSpecDraft({
			baseRef: 'main',
			config: specsCheckConfig,
			cwd: root,
			slug: 'spec-workflow',
			title: 'Spec Workflow',
		});
		const checkResult = runSpecsCheck({ baseRef: 'main', cwd: root });
		const draftSpecContent = fs.readFileSync(path.join(root, draftResult.specFilePath), 'utf8');

		expect(draftResult.specFilePath).toBe('specs/spec-workflow.md');
		expect(fs.existsSync(path.join(root, draftResult.specFilePath))).toBe(true);
		expect(draftSpecContent).toMatch(/created_at:\s+'?\d{4}-\d{2}-\d{2}T/);
		expect(draftSpecContent).toMatch(/updated_at:\s+'?\d{4}-\d{2}-\d{2}T/);
		expect(checkResult.currentSpecPath).toBe('specs/spec-workflow.md');
		expect(checkResult.issues).toEqual([]);
		expect(checkResult.nonExemptChangedPaths).toEqual([
			'scripts/check-specs.ts',
			'spec.md',
			'specs/spec-workflow.md',
		]);
	});

	it('updates an existing current spec instead of leaving its scope stale', () => {
		const root = createWorkspaceRoot();

		runGitCommand({ args: ['init', '-b', 'main'], cwd: root });
		runGitCommand({ args: ['config', 'user.email', 'codex@example.com'], cwd: root });
		runGitCommand({ args: ['config', 'user.name', 'Codex'], cwd: root });

		writeWorkspaceFile({
			content: buildCurrentSpecIndexDocument({ currentSpec: 'specs/feat-branch.md' }),
			filePath: 'spec.md',
			root,
		});
		writeWorkspaceFile({
			content: `---
spec_version: 1
status: active
branch: feat/branch
created_at: 2026-04-10T00:00:00.000Z
context_mode: standalone
scope_paths:
  - src/app/
updated_at: 2026-04-10T00:00:00.000Z
---
# Existing Branch Spec

## Goal

- Existing prose should stay in place.

## Non-goals

- None.

## Scope

- \`src/app/\`

## Constraints

- Standalone.

## Verification

- \`yarn check:specs\`

## Rollback

- Revert.
`,
			filePath: 'specs/feat-branch.md',
			root,
		});
		writeWorkspaceFile({ content: 'base\n', filePath: 'src/app/page.tsx', root });

		runGitCommand({ args: ['add', '.'], cwd: root });
		runGitCommand({ args: ['commit', '-m', 'base'], cwd: root });
		runGitCommand({ args: ['checkout', '-b', 'feat/branch'], cwd: root });

		writeWorkspaceFile({ content: '{\"name\":\"demo\"}\n', filePath: 'package.json', root });

		writeSpecDraft({ baseRef: 'main', config: specsCheckConfig, cwd: root, slug: 'feat-branch' });

		const updatedSpec = fs.readFileSync(path.join(root, 'specs/feat-branch.md'), 'utf8');
		const checkResult = runSpecsCheck({ baseRef: 'main', cwd: root });

		expect(updatedSpec).toContain('Existing prose should stay in place.');
		expect(updatedSpec).toContain("created_at: '2026-04-10T00:00:00.000Z'");
		expect(updatedSpec).toContain('package.json');
		expect(updatedSpec).toMatch(/updated_at:\s+'?\d{4}-\d{2}-\d{2}T/);
		expect(checkResult.issues).toEqual([]);
	});
});
