import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { guidanceCheckConfig, type GuidanceCheckConfig } from './guidance-check.config';

const CURRENT_DIRECTORY_SEGMENT = '.';
const EMPTY_FILE_CONTENT = '';
const GUIDANCE_ISSUE_CATEGORY = { LOGICAL_ERROR: 'LOGICAL_ERROR' } as const;

const GUIDANCE_ISSUE_CODE = {
	CLAUDE_FILE_LINE_LIMIT_EXCEEDED: 'CLAUDE_FILE_LINE_LIMIT_EXCEEDED',
	CLAUDE_RULE_LINE_LIMIT_EXCEEDED: 'CLAUDE_RULE_LINE_LIMIT_EXCEEDED',
	CODEX_EFFECTIVE_CHAIN_LIMIT_EXCEEDED: 'CODEX_EFFECTIVE_CHAIN_LIMIT_EXCEEDED',
	REPO_RULE_LINE_LIMIT_EXCEEDED: 'REPO_RULE_LINE_LIMIT_EXCEEDED',
} as const;

const GUIDANCE_FILE_KIND = {
	CLAUDE_FILE: 'claudeFile',
	CLAUDE_RULE: 'claudeRule',
	CODEX_FILE: 'codexFile',
	REPO_RULE: 'repoRule',
} as const;

const FILESYSTEM_SCAN_IGNORE_DIRECTORIES = new Set([
	'.git',
	'.next',
	'coverage',
	'dist',
	'node_modules',
]);

const ROOT_DIRECTORY = '';

type GuidanceIssue = {
	category: (typeof GUIDANCE_ISSUE_CATEGORY)[keyof typeof GUIDANCE_ISSUE_CATEGORY];
	code: (typeof GUIDANCE_ISSUE_CODE)[keyof typeof GUIDANCE_ISSUE_CODE];
	detail: string;
	file?: string;
};

type GuidanceFile = { content: string; path: string };

export type GuidanceSnapshot = {
	directories: string[];
	files: GuidanceFile[];
	mode: 'filesystem' | 'staged';
};

type CodexChainReport = { byteCount: number; directory: string; files: string[] };

type GuidanceCheckResult = {
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

type GuidanceFileKind = (typeof GUIDANCE_FILE_KIND)[keyof typeof GUIDANCE_FILE_KIND];

type GuidanceFileEntry = { content: string; kind: GuidanceFileKind; path: string };

type SnapshotLoadInput = { config: GuidanceCheckConfig; cwd: string };

function addDirectoryPath({
	directories,
	filePath,
}: {
	directories: Set<string>;
	filePath: string;
}) {
	const normalizedPath = toPosixPath(filePath);
	const relativeDirectory = path.posix.dirname(normalizedPath);

	if (relativeDirectory === CURRENT_DIRECTORY_SEGMENT) return;

	let currentDirectory = ROOT_DIRECTORY;
	for (const segment of relativeDirectory.split('/')) {
		currentDirectory = currentDirectory ? `${currentDirectory}/${segment}` : segment;
		directories.add(currentDirectory);
	}
}

export function buildCodexChainReports({ config, snapshot }: GuidanceAnalysisInput) {
	const codexFiles = snapshot.files.filter(({ path: filePath }) =>
		isCodexInstructionPath({ config, filePath }),
	);
	const codexFileMap = new Map(codexFiles.map(file => [file.path, file.content]));
	const codexSelectionByDirectory = getCodexInstructionSelections({ config, files: codexFiles });
	const codexChainReports: CodexChainReport[] = [];

	for (const directory of [...snapshot.directories].sort(sortDirectories)) {
		const files: string[] = [];

		for (const ancestor of getDirectoryAncestors(directory)) {
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

function createGuidanceFileEntry({
	config,
	content,
	filePath,
}: {
	config: GuidanceCheckConfig;
	content: string;
	filePath: string;
}): GuidanceFileEntry | null {
	const isCodexInstructionFile = isCodexInstructionPath({ config, filePath });
	if (isCodexInstructionFile) {
		return { content, kind: GUIDANCE_FILE_KIND.CODEX_FILE, path: filePath };
	}

	const isClaudeRuleFile = isClaudeRulePath(filePath);
	if (isClaudeRuleFile) {
		return { content, kind: GUIDANCE_FILE_KIND.CLAUDE_RULE, path: filePath };
	}

	const isClaudeInstructionFile = isClaudeInstructionPath(filePath);
	if (isClaudeInstructionFile) {
		return { content, kind: GUIDANCE_FILE_KIND.CLAUDE_FILE, path: filePath };
	}

	const isRepoRuleFile = isRepoRulePath({ config, filePath });
	if (isRepoRuleFile) {
		return { content, kind: GUIDANCE_FILE_KIND.REPO_RULE, path: filePath };
	}

	return null;
}

function formatDirectoryLabel(directory: string) {
	return directory || CURRENT_DIRECTORY_SEGMENT;
}

function formatIssue(issue: GuidanceIssue) {
	const issueHeader = `[${issue.category}:${issue.code}] ${issue.detail}`;

	if (issue.file) {
		return `${issueHeader}\n  ${issue.file}`;
	}

	return issueHeader;
}

function getCodexInstructionSelections({
	config,
	files,
}: {
	config: GuidanceCheckConfig;
	files: GuidanceFile[];
}) {
	const selections = new Map<string, string>();
	const filesByDirectory = new Map<string, Set<string>>();

	for (const file of files) {
		const directory = getFileDirectory(file.path);
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

		for (const fallbackFileName of config.codexFallbackFilenames) {
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

function getDirectoryAncestors(directory: string) {
	if (!directory) return [ROOT_DIRECTORY];

	const segments = directory.split('/');
	const ancestors = [ROOT_DIRECTORY];
	let currentDirectory = ROOT_DIRECTORY;

	for (const segment of segments) {
		currentDirectory = currentDirectory ? `${currentDirectory}/${segment}` : segment;
		ancestors.push(currentDirectory);
	}

	return ancestors;
}

function getFileDirectory(filePath: string) {
	const directory = path.posix.dirname(filePath);
	return directory === CURRENT_DIRECTORY_SEGMENT ? ROOT_DIRECTORY : directory;
}

function getGitCachedPaths(cwd: string) {
	const rawPaths = execFileSync('git', ['ls-files', '--cached', '-z'], { cwd, encoding: 'utf8' });

	return rawPaths
		.split('\0')
		.map(filePath => filePath.trim())
		.filter(Boolean)
		.map(filePath => toPosixPath(filePath));
}

function getGitIndexFileContents({ cwd, filePath }: { cwd: string; filePath: string }) {
	return execFileSync('git', ['show', `:${filePath}`], { cwd, encoding: 'utf8' });
}

function getGuidanceFileEntries({ config, snapshot }: GuidanceAnalysisInput) {
	return snapshot.files
		.map(file => createGuidanceFileEntry({ config, content: file.content, filePath: file.path }))
		.filter((file): file is GuidanceFileEntry => file !== null);
}

function getLineCount(content: string) {
	if (!content) return 0;

	const normalizedContent = content.replace(/\r\n/g, '\n');
	const trimmedContent = normalizedContent.endsWith('\n')
		? normalizedContent.slice(0, -1)
		: normalizedContent;

	return trimmedContent.split('\n').length;
}

function getMergedContentByteCount({
	fileMap,
	paths,
}: {
	fileMap: Map<string, string>;
	paths: string[];
}) {
	const nonEmptyContents = paths
		.map(filePath => fileMap.get(filePath) ?? EMPTY_FILE_CONTENT)
		.filter(content => Buffer.byteLength(content, 'utf8') > 0);

	if (nonEmptyContents.length === 0) {
		return 0;
	}

	const separatorBytes = Buffer.byteLength('\n\n', 'utf8') * (nonEmptyContents.length - 1);
	const contentBytes = nonEmptyContents.reduce((total, content) => {
		return total + Buffer.byteLength(content, 'utf8');
	}, 0);

	return contentBytes + separatorBytes;
}

function isClaudeInstructionPath(filePath: string) {
	const baseName = path.posix.basename(filePath);

	return baseName === 'CLAUDE.md' || baseName === 'CLAUDE.local.md';
}

function isClaudeRulePath(filePath: string) {
	const normalizedPath = toPosixPath(filePath);

	return (
		normalizedPath.endsWith('.md') &&
		(normalizedPath.startsWith('.claude/rules/') || normalizedPath.includes('/.claude/rules/'))
	);
}

function isCodexInstructionPath({
	config,
	filePath,
}: {
	config: GuidanceCheckConfig;
	filePath: string;
}) {
	const baseName = path.posix.basename(filePath);

	return (
		baseName === 'AGENTS.md' ||
		baseName === 'AGENTS.override.md' ||
		config.codexFallbackFilenames.includes(baseName)
	);
}

function isRepoRulePath({ config, filePath }: { config: GuidanceCheckConfig; filePath: string }) {
	return config.repoRuleGlobs.some(glob => getGlobMatcher(glob).test(toPosixPath(filePath)));
}

function joinDirectoryAndFileName({
	directory,
	fileName,
}: {
	directory: string;
	fileName: string;
}) {
	return directory ? `${directory}/${fileName}` : fileName;
}

export function loadFilesystemSnapshot({ config, cwd }: SnapshotLoadInput): GuidanceSnapshot {
	const directories = new Set<string>([ROOT_DIRECTORY]);
	const files: GuidanceFile[] = [];

	walkDirectory({ config, cwd, directories, files, relativeDirectory: ROOT_DIRECTORY });

	return { directories: [...directories], files, mode: 'filesystem' };
}

export function loadStagedSnapshot({ config, cwd }: SnapshotLoadInput): GuidanceSnapshot {
	const directories = new Set<string>([ROOT_DIRECTORY]);
	const files: GuidanceFile[] = [];

	for (const filePath of getGitCachedPaths(cwd)) {
		addDirectoryPath({ directories, filePath });

		const guidanceFileEntry = createGuidanceFileEntry({
			config,
			content: EMPTY_FILE_CONTENT,
			filePath,
		});
		if (!guidanceFileEntry) continue;

		files.push({ content: getGitIndexFileContents({ cwd, filePath }), path: filePath });
	}

	return { directories: [...directories], files, mode: 'staged' };
}

export function analyzeGuidanceSnapshot({
	config,
	snapshot,
}: GuidanceAnalysisInput): GuidanceCheckResult {
	const issues: GuidanceIssue[] = [];
	const guidanceFiles = getGuidanceFileEntries({ config, snapshot });
	const claudeFiles = guidanceFiles.filter(({ kind }) => kind === GUIDANCE_FILE_KIND.CLAUDE_FILE);
	const claudeRuleFiles = guidanceFiles.filter(
		({ kind }) => kind === GUIDANCE_FILE_KIND.CLAUDE_RULE,
	);
	const repoRuleFiles = guidanceFiles.filter(({ kind }) => kind === GUIDANCE_FILE_KIND.REPO_RULE);
	const codexInstructionFiles = guidanceFiles.filter(
		({ kind }) => kind === GUIDANCE_FILE_KIND.CODEX_FILE,
	);
	const codexChainReports = buildCodexChainReports({ config, snapshot });
	const worstCodexChain = getWorstCodexChain(codexChainReports);

	for (const file of claudeFiles) {
		const lineCount = getLineCount(file.content);
		if (lineCount <= config.sharedPerFileLineLimit) continue;

		issues.push({
			category: GUIDANCE_ISSUE_CATEGORY.LOGICAL_ERROR,
			code: GUIDANCE_ISSUE_CODE.CLAUDE_FILE_LINE_LIMIT_EXCEEDED,
			detail: `${lineCount} lines exceeds the ${config.sharedPerFileLineLimit}-line limit. Split project-wide instructions with imports or path-scoped .claude/rules files.`,
			file: file.path,
		});
	}

	for (const file of claudeRuleFiles) {
		const lineCount = getLineCount(file.content);
		if (lineCount <= config.sharedPerFileLineLimit) continue;

		issues.push({
			category: GUIDANCE_ISSUE_CATEGORY.LOGICAL_ERROR,
			code: GUIDANCE_ISSUE_CODE.CLAUDE_RULE_LINE_LIMIT_EXCEEDED,
			detail: `${lineCount} lines exceeds the ${config.sharedPerFileLineLimit}-line limit. Split .claude/rules content into smaller topic or path-scoped files.`,
			file: file.path,
		});
	}

	for (const file of repoRuleFiles) {
		const lineCount = getLineCount(file.content);
		if (lineCount <= config.sharedPerFileLineLimit) continue;

		issues.push({
			category: GUIDANCE_ISSUE_CATEGORY.LOGICAL_ERROR,
			code: GUIDANCE_ISSUE_CODE.REPO_RULE_LINE_LIMIT_EXCEEDED,
			detail: `${lineCount} lines exceeds the ${config.sharedPerFileLineLimit}-line limit. Split shared guidance into narrower docs/agent-rules topic files.`,
			file: file.path,
		});
	}

	if (worstCodexChain && worstCodexChain.byteCount > config.codexProjectDocMaxBytes) {
		issues.push({
			category: GUIDANCE_ISSUE_CATEGORY.LOGICAL_ERROR,
			code: GUIDANCE_ISSUE_CODE.CODEX_EFFECTIVE_CHAIN_LIMIT_EXCEEDED,
			detail: `${worstCodexChain.byteCount} bytes exceeds the ${config.codexProjectDocMaxBytes}-byte effective chain limit for ${formatDirectoryLabel(worstCodexChain.directory)}. Move specialized instructions into deeper AGENTS.md files or configured fallback files.`,
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

export function runGuidanceCheck({
	config: configOverride,
	cwd,
	isStaged,
}: GuidanceCheckInput): GuidanceCheckResult {
	const config = configOverride ?? guidanceCheckConfig;
	const snapshot = isStaged
		? loadStagedSnapshot({ config, cwd })
		: loadFilesystemSnapshot({ config, cwd });

	return analyzeGuidanceSnapshot({ config, snapshot });
}

function getGlobMatcher(glob: string) {
	const regexParts: string[] = ['^'];

	for (let index = 0; index < glob.length; index += 1) {
		const character = glob[index];
		const nextCharacter = glob[index + 1];

		if (character === '*' && nextCharacter === '*') {
			const followingCharacter = glob[index + 2];
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

		regexParts.push(escapeRegexCharacter(character));
	}

	regexParts.push('$');

	return new RegExp(regexParts.join(''));
}

function escapeRegexCharacter(character: string) {
	if (/[$()*+.?[\\\]^{|}]/.test(character)) {
		return `\\${character}`;
	}

	return character;
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

function getWorstCodexChain(codexChainReports: CodexChainReport[]) {
	if (codexChainReports.length === 0) {
		return null;
	}

	return [...codexChainReports].sort(sortCodexChainReports)[0] ?? null;
}

function sortCodexChainReports(left: CodexChainReport, right: CodexChainReport) {
	if (right.byteCount !== left.byteCount) {
		return right.byteCount - left.byteCount;
	}

	return sortDirectories(left.directory, right.directory);
}

function walkDirectory({
	config,
	cwd,
	directories,
	files,
	relativeDirectory,
}: {
	config: GuidanceCheckConfig;
	cwd: string;
	directories: Set<string>;
	files: GuidanceFile[];
	relativeDirectory: string;
}) {
	const absoluteDirectory = path.join(cwd, relativeDirectory);
	const directoryEntries = fs.readdirSync(absoluteDirectory, { withFileTypes: true });

	for (const entry of directoryEntries) {
		if (entry.isDirectory() && FILESYSTEM_SCAN_IGNORE_DIRECTORIES.has(entry.name)) {
			continue;
		}

		const relativePath = relativeDirectory
			? path.posix.join(relativeDirectory, entry.name)
			: entry.name;

		if (entry.isDirectory()) {
			directories.add(relativePath);
			walkDirectory({ config, cwd, directories, files, relativeDirectory: relativePath });
			continue;
		}

		const guidanceFileEntry = createGuidanceFileEntry({
			config,
			content: EMPTY_FILE_CONTENT,
			filePath: relativePath,
		});
		if (!guidanceFileEntry) continue;

		files.push({
			content: fs.readFileSync(path.join(cwd, relativePath), 'utf8'),
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
				`\nWorst Codex chain: ${formatDirectoryLabel(result.worstCodexChain.directory)} (${result.worstCodexChain.byteCount}/${guidanceCheckConfig.codexProjectDocMaxBytes} bytes)`,
			);
		}

		process.exit(1);
	}

	const worstCodexChainSummary = result.worstCodexChain
		? `${formatDirectoryLabel(result.worstCodexChain.directory)} ${result.worstCodexChain.byteCount}/${guidanceCheckConfig.codexProjectDocMaxBytes} bytes`
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
