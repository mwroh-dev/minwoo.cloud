import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

import { afterEach, describe, expect, it } from 'vitest';

import {
	analyzeGuidanceSnapshot,
	buildCodexChainReports,
	loadFilesystemSnapshot,
	loadStagedSnapshot,
	runGuidanceCheck,
	type GuidanceSnapshot,
} from '../../scripts/check-guidance';
import { guidanceCheckConfig, type GuidanceCheckConfig } from '../../scripts/guidance-check.config';

const tempRoots: string[] = [];

function createConfig(overrides: Partial<GuidanceCheckConfig> = {}): GuidanceCheckConfig {
	return { ...guidanceCheckConfig, ...overrides };
}

function createLineBlock(count: number) {
	return Array.from({ length: count }, (_, index) => `line ${index + 1}`).join('\n');
}

function createSnapshot(input: {
	directories?: string[];
	files?: Array<{ content: string; path: string }>;
	mode?: GuidanceSnapshot['mode'];
}): GuidanceSnapshot {
	return {
		directories: input.directories ?? [''],
		files: input.files ?? [],
		mode: input.mode ?? 'filesystem',
	};
}

function createWorkspaceRoot() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cielo-guidance-'));
	tempRoots.push(root);
	return root;
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

describe('analyzeGuidanceSnapshot', () => {
	it('accepts a CLAUDE.md file at 200 lines and rejects one at 201 lines', () => {
		const config = createConfig();
		const passingResult = analyzeGuidanceSnapshot({
			config,
			snapshot: createSnapshot({ files: [{ content: createLineBlock(200), path: 'CLAUDE.md' }] }),
		});
		const failingResult = analyzeGuidanceSnapshot({
			config,
			snapshot: createSnapshot({ files: [{ content: createLineBlock(201), path: 'CLAUDE.md' }] }),
		});

		expect(passingResult.issues).toEqual([]);
		expect(failingResult.issues).toHaveLength(1);
		expect(failingResult.issues[0]?.code).toBe('CLAUDE_FILE_LINE_LIMIT_EXCEEDED');
	});

	it('rejects repo guidance files over the shared line limit', () => {
		const result = analyzeGuidanceSnapshot({
			config: createConfig(),
			snapshot: createSnapshot({
				files: [{ content: createLineBlock(201), path: 'docs/agent-rules/validation.md' }],
			}),
		});

		expect(result.issues).toHaveLength(1);
		expect(result.issues[0]?.code).toBe('REPO_RULE_LINE_LIMIT_EXCEEDED');
	});

	it('builds Codex chains with directory precedence and fallback ordering', () => {
		const config = createConfig({ codexFallbackFilenames: ['TEAM_GUIDE.md'] });
		const codexChainReports = buildCodexChainReports({
			config,
			snapshot: createSnapshot({
				directories: ['', 'services', 'services/payments'],
				files: [
					{ content: 'root agents', path: 'AGENTS.md' },
					{ content: 'root fallback', path: 'TEAM_GUIDE.md' },
					{ content: 'services agents', path: 'services/AGENTS.md' },
					{ content: 'payments agents', path: 'services/payments/AGENTS.md' },
					{ content: 'payments override', path: 'services/payments/AGENTS.override.md' },
				],
			}),
		});

		const paymentsReport = codexChainReports.find(
			report => report.directory === 'services/payments',
		);

		expect(paymentsReport?.files).toEqual([
			'AGENTS.md',
			'services/AGENTS.md',
			'services/payments/AGENTS.override.md',
		]);
	});

	it('rejects a Codex chain that exceeds the effective byte budget', () => {
		const result = analyzeGuidanceSnapshot({
			config: createConfig(),
			snapshot: createSnapshot({ files: [{ content: 'a'.repeat(33000), path: 'AGENTS.md' }] }),
		});

		expect(result.issues).toHaveLength(1);
		expect(result.issues[0]?.code).toBe('CODEX_EFFECTIVE_CHAIN_LIMIT_EXCEEDED');
	});
});

describe('snapshot loading', () => {
	it('discovers nested .claude/rules markdown files recursively', () => {
		const root = createWorkspaceRoot();
		writeWorkspaceFile({
			content: '# frontend rule\n',
			filePath: '.claude/rules/frontend/testing.md',
			root,
		});

		const snapshot = loadFilesystemSnapshot({ config: createConfig(), cwd: root });

		expect(snapshot.files.some(file => file.path === '.claude/rules/frontend/testing.md')).toBe(
			true,
		);
	});

	it('reads staged content from the git index instead of the working tree', () => {
		const root = createWorkspaceRoot();
		writeWorkspaceFile({ content: '# short guidance\n', filePath: 'AGENTS.md', root });

		execFileSync('git', ['init'], { cwd: root, encoding: 'utf8' });
		execFileSync('git', ['add', 'AGENTS.md'], { cwd: root, encoding: 'utf8' });

		writeWorkspaceFile({ content: 'a'.repeat(33000), filePath: 'AGENTS.md', root });

		const stagedResult = analyzeGuidanceSnapshot({
			config: createConfig(),
			snapshot: loadStagedSnapshot({ config: createConfig(), cwd: root }),
		});
		const filesystemResult = analyzeGuidanceSnapshot({
			config: createConfig(),
			snapshot: loadFilesystemSnapshot({ config: createConfig(), cwd: root }),
		});

		expect(stagedResult.issues).toEqual([]);
		expect(filesystemResult.issues[0]?.code).toBe('CODEX_EFFECTIVE_CHAIN_LIMIT_EXCEEDED');
	});

	it('passes for the current repository guidance files', () => {
		const result = runGuidanceCheck({ config: createConfig(), cwd: process.cwd() });

		expect(result.issues).toEqual([]);
	});
});
