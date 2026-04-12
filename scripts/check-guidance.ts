import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { guidanceCheckConfig, type GuidanceCheckConfig } from './guidance-check.config';

const GUIDANCE_ISSUE_CATEGORY = { LOGICAL_ERROR: 'LOGICAL_ERROR' } as const;

const GUIDANCE_ISSUE_CODE = {
	CLAUDE_FILE_LINE_LIMIT_EXCEEDED: 'CLAUDE_FILE_LINE_LIMIT_EXCEEDED',
	CLAUDE_RULE_LINE_LIMIT_EXCEEDED: 'CLAUDE_RULE_LINE_LIMIT_EXCEEDED',
	CODEX_EFFECTIVE_CHAIN_LIMIT_EXCEEDED: 'CODEX_EFFECTIVE_CHAIN_LIMIT_EXCEEDED',
	REPO_RULE_LINE_LIMIT_EXCEEDED: 'REPO_RULE_LINE_LIMIT_EXCEEDED',
} as const;

const FILESYSTEM_SCAN_IGNORE_DIRECTORIES = new Set([
	'.git',
	'.next',
	'coverage',
	'dist',
	'node_modules',
]);

type GuidanceIssue = {
	category: (typeof GUIDANCE_ISSUE_CATEGORY)[keyof typeof GUIDANCE_ISSUE_CATEGORY];
	code: (typeof GUIDANCE_ISSUE_CODE)[keyof typeof GUIDANCE_ISSUE_CODE];
	detail: string;
	file?: string;
};

export type GuidanceFile = { content: string; path: string };

export type GuidanceSnapshot = {
	directories: string[];
	files: GuidanceFile[];
	mode: 'filesystem' | 'staged';
};

export type CodexChainReport = { byteCount: number; directory: string; files: string[] };

export type GuidanceCheckResult = {
	claudeFilesChecked: number;
	claudeRuleFilesChecked: number;
	codexChainReports: CodexChainReport[];
	codexInstructionFilesChecked: number;
	issues: GuidanceIssue[];
	repoRuleFilesChecked: number;
	worstCodexChain: CodexChainReport | null;
};

type GuidanceCheckInput = { config?: GuidanceCheckConfig; cwd: string; isStaged?: boolean };

type GuidanceAnalysisInput = { config: GuidanceCheckConfig; snapshot: GuidanceSnapshot };

type GuidanceFileKind = 'claudeFile' | 'claudeRule' | 'codexFile' | 'repoRule';

type GuidanceFileEntry = { content: string; kind: GuidanceFileKind; path: string };

type SnapshotLoadInput = { config: GuidanceCheckConfig; cwd: string };

function addDirectoryPath(input: { directories: Set<string>; filePath: string }) {
	const normalizedPath = toPosixPath(input.filePath);
	const relativeDirectory = path.posix.dirname(normalizedPath);

	if (relativeDirectory === '.') {
		return;
	}

	let currentDirectory = '';
	for (const segment of relativeDirectory.split('/')) {
		currentDirectory = currentDirectory ? `${currentDirectory}/${segment}` : segment;
		input.directories.add(currentDirectory);
	}
}

function addIssue(input: { issues: GuidanceIssue[]; issue: GuidanceIssue }) {
	input.issues.push(input.issue);
}

export function buildCodexChainReports(input: GuidanceAnalysisInput) {
	const codexFiles = input.snapshot.files.filter(({ path: filePath }) =>
		isCodexInstructionPath({ config: input.config, filePath }),
	);
	const codexFileMap = new Map(codexFiles.map((file) => [file.path, file.content]));
	const codexSelectionByDirectory = getCodexInstructionSelections({
		config: input.config,
		files: codexFiles,
	});
	const codexChainReports: CodexChainReport[] = [];

	for (const directory of [...input.snapshot.directories].sort(sortDirectories)) {
		const files: string[] = [];

		for (const ancestor of getDirectoryAncestors({ directory })) {
			const selectedFile = codexSelectionByDirectory.get(ancestor);
			if (selectedFile) {
				files.push(selectedFile);
			}
		}

		codexChainReports.push({
			byteCount: getMergedContentByteCount({ fileMap: codexFileMap, paths: files }),
			directory,
			files,
		});
	}

	return codexChainReports;
}

function createGuidanceFileEntry(input: {
	config: GuidanceCheckConfig;
	content: string;
	filePath: string;
}): GuidanceFileEntry | null {
	const isCodexInstructionFile = isCodexInstructionPath({
		config: input.config,
		filePath: input.filePath,
	});
	if (isCodexInstructionFile) {
		return { content: input.content, kind: 'codexFile', path: input.filePath };
	}

	const isClaudeRuleFile = isClaudeRulePath({ filePath: input.filePath });
	if (isClaudeRuleFile) {
		return { content: input.content, kind: 'claudeRule', path: input.filePath };
	}

	const isClaudeInstructionFile = isClaudeInstructionPath({ filePath: input.filePath });
	if (isClaudeInstructionFile) {
		return { content: input.content, kind: 'claudeFile', path: input.filePath };
	}

	const isRepoRuleFile = isRepoRulePath({ config: input.config, filePath: input.filePath });
	if (isRepoRuleFile) {
		return { content: input.content, kind: 'repoRule', path: input.filePath };
	}

	return null;
}

function formatDirectoryLabel(input: { directory: string }) {
	return input.directory || '.';
}

function formatIssue(issue: GuidanceIssue) {
	const issueHeader = `[${issue.category}:${issue.code}] ${issue.detail}`;

	if (issue.file) {
		return `${issueHeader}\n  ${issue.file}`;
	}

	return issueHeader;
}

function getCodexInstructionSelections(input: {
	config: GuidanceCheckConfig;
	files: GuidanceFile[];
}) {
	const selections = new Map<string, string>();
	const filesByDirectory = new Map<string, Set<string>>();

	for (const file of input.files) {
		const directory = getFileDirectory({ filePath: file.path });
		const directoryFiles = filesByDirectory.get(directory) ?? new Set<string>();

		directoryFiles.add(path.posix.basename(file.path));
		filesByDirectory.set(directory, directoryFiles);
	}

	for (const [directory, directoryFiles] of filesByDirectory.entries()) {
		if (directoryFiles.has('AGENTS.override.md')) {
			selections.set(
				directory,
				joinDirectoryAndFileName({ directory, fileName: 'AGENTS.override.md' }),
			);
			continue;
		}

		if (directoryFiles.has('AGENTS.md')) {
			selections.set(directory, joinDirectoryAndFileName({ directory, fileName: 'AGENTS.md' }));
			continue;
		}

		for (const fallbackFileName of input.config.codexFallbackFilenames) {
			if (directoryFiles.has(fallbackFileName)) {
				selections.set(
					directory,
					joinDirectoryAndFileName({ directory, fileName: fallbackFileName }),
				);
				break;
			}
		}
	}

	return selections;
}

function getDirectoryAncestors(input: { directory: string }) {
	if (!input.directory) {
		return [''];
	}

	const segments = input.directory.split('/');
	const ancestors = [''];
	let currentDirectory = '';

	for (const segment of segments) {
		currentDirectory = currentDirectory ? `${currentDirectory}/${segment}` : segment;
		ancestors.push(currentDirectory);
	}

	return ancestors;
}

function getFileDirectory(input: { filePath: string }) {
	const directory = path.posix.dirname(input.filePath);
	return directory === '.' ? '' : directory;
}

function getGitCachedPaths(input: { cwd: string }) {
	const rawPaths = execFileSync('git', ['ls-files', '--cached', '-z'], {
		cwd: input.cwd,
		encoding: 'utf8',
	});

	return rawPaths
		.split('\0')
		.map((filePath) => filePath.trim())
		.filter(Boolean)
		.map((filePath) => toPosixPath(filePath));
}

function getGitIndexFileContents(input: { cwd: string; filePath: string }) {
	return execFileSync('git', ['show', `:${input.filePath}`], { cwd: input.cwd, encoding: 'utf8' });
}

function getGuidanceFileEntries(input: GuidanceAnalysisInput) {
	return input.snapshot.files
		.map((file) =>
			createGuidanceFileEntry({ config: input.config, content: file.content, filePath: file.path }),
		)
		.filter((file): file is GuidanceFileEntry => file !== null);
}

function getLineCount(input: { content: string }) {
	if (!input.content) {
		return 0;
	}

	const normalizedContent = input.content.replace(/\r\n/g, '\n');
	const trimmedContent = normalizedContent.endsWith('\n')
		? normalizedContent.slice(0, -1)
		: normalizedContent;

	return trimmedContent.split('\n').length;
}

function getMergedContentByteCount(input: { fileMap: Map<string, string>; paths: string[] }) {
	const nonEmptyContents = input.paths
		.map((filePath) => input.fileMap.get(filePath) ?? '')
		.filter((content) => Buffer.byteLength(content, 'utf8') > 0);

	if (nonEmptyContents.length === 0) {
		return 0;
	}

	const separatorBytes = Buffer.byteLength('\n\n', 'utf8') * (nonEmptyContents.length - 1);
	const contentBytes = nonEmptyContents.reduce((total, content) => {
		return total + Buffer.byteLength(content, 'utf8');
	}, 0);

	return contentBytes + separatorBytes;
}

function isClaudeInstructionPath(input: { filePath: string }) {
	const baseName = path.posix.basename(input.filePath);

	return baseName === 'CLAUDE.md' || baseName === 'CLAUDE.local.md';
}

function isClaudeRulePath(input: { filePath: string }) {
	const normalizedPath = toPosixPath(input.filePath);

	return (
		normalizedPath.endsWith('.md') &&
		(normalizedPath.startsWith('.claude/rules/') || normalizedPath.includes('/.claude/rules/'))
	);
}

function isCodexInstructionPath(input: { config: GuidanceCheckConfig; filePath: string }) {
	const baseName = path.posix.basename(input.filePath);

	return (
		baseName === 'AGENTS.md' ||
		baseName === 'AGENTS.override.md' ||
		input.config.codexFallbackFilenames.includes(baseName)
	);
}

function isRepoRulePath(input: { config: GuidanceCheckConfig; filePath: string }) {
	return input.config.repoRuleGlobs.some((glob) =>
		getGlobMatcher({ glob }).test(toPosixPath(input.filePath)),
	);
}

function joinDirectoryAndFileName(input: { directory: string; fileName: string }) {
	return input.directory ? `${input.directory}/${input.fileName}` : input.fileName;
}

export function loadFilesystemSnapshot(input: SnapshotLoadInput): GuidanceSnapshot {
	const directories = new Set<string>(['']);
	const files: GuidanceFile[] = [];

	walkDirectory({
		config: input.config,
		cwd: input.cwd,
		directories,
		files,
		relativeDirectory: '',
	});

	return { directories: [...directories], files, mode: 'filesystem' };
}

export function loadStagedSnapshot(input: SnapshotLoadInput): GuidanceSnapshot {
	const directories = new Set<string>(['']);
	const files: GuidanceFile[] = [];

	for (const filePath of getGitCachedPaths({ cwd: input.cwd })) {
		addDirectoryPath({ directories, filePath });

		const guidanceFileEntry = createGuidanceFileEntry({
			config: input.config,
			content: '',
			filePath,
		});
		if (!guidanceFileEntry) {
			continue;
		}

		files.push({ content: getGitIndexFileContents({ cwd: input.cwd, filePath }), path: filePath });
	}

	return { directories: [...directories], files, mode: 'staged' };
}

export function analyzeGuidanceSnapshot(input: GuidanceAnalysisInput): GuidanceCheckResult {
	const issues: GuidanceIssue[] = [];
	const guidanceFiles = getGuidanceFileEntries(input);
	const claudeFiles = guidanceFiles.filter(({ kind }) => kind === 'claudeFile');
	const claudeRuleFiles = guidanceFiles.filter(({ kind }) => kind === 'claudeRule');
	const repoRuleFiles = guidanceFiles.filter(({ kind }) => kind === 'repoRule');
	const codexInstructionFiles = guidanceFiles.filter(({ kind }) => kind === 'codexFile');
	const codexChainReports = buildCodexChainReports(input);
	const worstCodexChain =
		codexChainReports.length > 0
			? [...codexChainReports].sort((left, right) => {
					if (right.byteCount !== left.byteCount) {
						return right.byteCount - left.byteCount;
					}

					return sortDirectories(left.directory, right.directory);
				})[0]
			: null;

	for (const file of claudeFiles) {
		const lineCount = getLineCount({ content: file.content });
		if (lineCount <= input.config.sharedPerFileLineLimit) {
			continue;
		}

		addIssue({
			issues,
			issue: {
				category: GUIDANCE_ISSUE_CATEGORY.LOGICAL_ERROR,
				code: GUIDANCE_ISSUE_CODE.CLAUDE_FILE_LINE_LIMIT_EXCEEDED,
				detail: `${lineCount} lines exceeds the ${input.config.sharedPerFileLineLimit}-line limit. Split project-wide instructions with imports or path-scoped .claude/rules files.`,
				file: file.path,
			},
		});
	}

	for (const file of claudeRuleFiles) {
		const lineCount = getLineCount({ content: file.content });
		if (lineCount <= input.config.sharedPerFileLineLimit) {
			continue;
		}

		addIssue({
			issues,
			issue: {
				category: GUIDANCE_ISSUE_CATEGORY.LOGICAL_ERROR,
				code: GUIDANCE_ISSUE_CODE.CLAUDE_RULE_LINE_LIMIT_EXCEEDED,
				detail: `${lineCount} lines exceeds the ${input.config.sharedPerFileLineLimit}-line limit. Split .claude/rules content into smaller topic or path-scoped files.`,
				file: file.path,
			},
		});
	}

	for (const file of repoRuleFiles) {
		const lineCount = getLineCount({ content: file.content });
		if (lineCount <= input.config.sharedPerFileLineLimit) {
			continue;
		}

		addIssue({
			issues,
			issue: {
				category: GUIDANCE_ISSUE_CATEGORY.LOGICAL_ERROR,
				code: GUIDANCE_ISSUE_CODE.REPO_RULE_LINE_LIMIT_EXCEEDED,
				detail: `${lineCount} lines exceeds the ${input.config.sharedPerFileLineLimit}-line limit. Split shared guidance into narrower docs/agent-rules topic files.`,
				file: file.path,
			},
		});
	}

	if (worstCodexChain && worstCodexChain.byteCount > input.config.codexProjectDocMaxBytes) {
		addIssue({
			issues,
			issue: {
				category: GUIDANCE_ISSUE_CATEGORY.LOGICAL_ERROR,
				code: GUIDANCE_ISSUE_CODE.CODEX_EFFECTIVE_CHAIN_LIMIT_EXCEEDED,
				detail: `${worstCodexChain.byteCount} bytes exceeds the ${input.config.codexProjectDocMaxBytes}-byte effective chain limit for ${formatDirectoryLabel({ directory: worstCodexChain.directory })}. Move specialized instructions into deeper AGENTS.md files or configured fallback files.`,
			},
		});
	}

	return {
		claudeFilesChecked: claudeFiles.length,
		claudeRuleFilesChecked: claudeRuleFiles.length,
		codexChainReports,
		codexInstructionFilesChecked: codexInstructionFiles.length,
		issues,
		repoRuleFilesChecked: repoRuleFiles.length,
		worstCodexChain,
	};
}

export function runGuidanceCheck(input: GuidanceCheckInput): GuidanceCheckResult {
	const config = input.config ?? guidanceCheckConfig;
	const snapshot = input.isStaged
		? loadStagedSnapshot({ config, cwd: input.cwd })
		: loadFilesystemSnapshot({ config, cwd: input.cwd });

	return analyzeGuidanceSnapshot({ config, snapshot });
}

function getGlobMatcher(input: { glob: string }) {
	const regexParts: string[] = ['^'];

	for (let index = 0; index < input.glob.length; index += 1) {
		const character = input.glob[index];
		const nextCharacter = input.glob[index + 1];

		if (character === '*' && nextCharacter === '*') {
			const followingCharacter = input.glob[index + 2];
			if (followingCharacter === '/') {
				regexParts.push('(?:.*/)?');
				index += 2;
				continue;
			}

			regexParts.push('.*');
			index += 1;
			continue;
		}

		if (character === '*') {
			regexParts.push('[^/]*');
			continue;
		}

		if (character === '?') {
			regexParts.push('[^/]');
			continue;
		}

		regexParts.push(escapeRegexCharacter({ character }));
	}

	regexParts.push('$');

	return new RegExp(regexParts.join(''));
}

function escapeRegexCharacter(input: { character: string }) {
	if (/[$()*+.?[\\\]^{|}]/.test(input.character)) {
		return `\\${input.character}`;
	}

	return input.character;
}

function sortDirectories(left: string, right: string) {
	if (left.split('/').length !== right.split('/').length) {
		return left.split('/').length - right.split('/').length;
	}

	return left.localeCompare(right);
}

function toPosixPath(filePath: string) {
	return filePath.split(path.sep).join(path.posix.sep);
}

function walkDirectory(input: {
	config: GuidanceCheckConfig;
	cwd: string;
	directories: Set<string>;
	files: GuidanceFile[];
	relativeDirectory: string;
}) {
	const absoluteDirectory = path.join(input.cwd, input.relativeDirectory);
	const directoryEntries = fs.readdirSync(absoluteDirectory, { withFileTypes: true });

	for (const entry of directoryEntries) {
		if (entry.isDirectory() && FILESYSTEM_SCAN_IGNORE_DIRECTORIES.has(entry.name)) {
			continue;
		}

		const relativePath = input.relativeDirectory
			? path.posix.join(input.relativeDirectory, entry.name)
			: entry.name;

		if (entry.isDirectory()) {
			input.directories.add(relativePath);
			walkDirectory({
				config: input.config,
				cwd: input.cwd,
				directories: input.directories,
				files: input.files,
				relativeDirectory: relativePath,
			});
			continue;
		}

		const guidanceFileEntry = createGuidanceFileEntry({
			config: input.config,
			content: '',
			filePath: relativePath,
		});
		if (!guidanceFileEntry) {
			continue;
		}

		input.files.push({
			content: fs.readFileSync(path.join(input.cwd, relativePath), 'utf8'),
			path: relativePath,
		});
	}
}

function main() {
	const isStaged = process.argv.includes('--staged');
	const result = runGuidanceCheck({ cwd: process.cwd(), isStaged });

	if (result.issues.length > 0) {
		console.error('\nGuidance validation failed.\n');
		for (const issue of result.issues) {
			console.error(`- ${formatIssue(issue)}`);
		}

		if (result.worstCodexChain) {
			console.error(
				`\nWorst Codex chain: ${formatDirectoryLabel({ directory: result.worstCodexChain.directory })} (${result.worstCodexChain.byteCount}/${guidanceCheckConfig.codexProjectDocMaxBytes} bytes)`,
			);
		}

		process.exit(1);
	}

	const worstCodexChainSummary = result.worstCodexChain
		? `${formatDirectoryLabel({ directory: result.worstCodexChain.directory })} ${result.worstCodexChain.byteCount}/${guidanceCheckConfig.codexProjectDocMaxBytes} bytes`
		: `none 0/${guidanceCheckConfig.codexProjectDocMaxBytes} bytes`;

	console.log(
		[
			'Guidance validation passed.',
			`Codex instruction files: ${result.codexInstructionFilesChecked}`,
			`Codex worst-case chain: ${worstCodexChainSummary}`,
			`Claude instruction files: ${result.claudeFilesChecked}`,
			`Claude rule files: ${result.claudeRuleFilesChecked}`,
			`Repo rule files: ${result.repoRuleFilesChecked}`,
		].join('\n'),
	);
}

const isEntrypoint =
	process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isEntrypoint) {
	main();
}
