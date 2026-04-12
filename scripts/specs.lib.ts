import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import matter from 'gray-matter';

import { specsCheckConfig, type SpecsCheckConfig } from './specs.config';

const SPEC_ISSUE_CATEGORY = {
	LOGICAL_ERROR: 'LOGICAL_ERROR',
	PHYSICAL_ERROR: 'PHYSICAL_ERROR',
} as const;

const SPEC_ISSUE_CODE = {
	CURRENT_SPEC_FILE_MISSING: 'CURRENT_SPEC_FILE_MISSING',
	CURRENT_SPEC_INDEX_INVALID: 'CURRENT_SPEC_INDEX_INVALID',
	INVALID_CONTEXT_MODE: 'INVALID_CONTEXT_MODE',
	INVALID_SCOPE_PATH: 'INVALID_SCOPE_PATH',
	INVALID_SPEC_FRONTMATTER: 'INVALID_SPEC_FRONTMATTER',
	INVALID_TIMESTAMP: 'INVALID_TIMESTAMP',
	MISSING_REQUIRED_SECTION: 'MISSING_REQUIRED_SECTION',
	UNCOVERED_CHANGED_FILE: 'UNCOVERED_CHANGED_FILE',
	UNSUPPORTED_STATUS: 'UNSUPPORTED_STATUS',
} as const;

type SpecFrontmatter = {
	branch?: string;
	created_at?: string;
	context_mode?: string;
	merged_at?: string;
	scope_paths?: string[];
	spec_version?: number;
	status?: string;
	updated_at?: string;
};

export type CurrentSpecIndex = { currentSpec: string; path: string };

export type ChangedPathsSnapshot = {
	baseRef?: string;
	mode: 'base' | 'explicit' | 'staged';
	paths: string[];
};

export type SpecDocument = {
	body: string;
	content: string;
	frontmatter: SpecFrontmatter;
	headings: string[];
	path: string;
};

export type SpecIssue = {
	category: (typeof SPEC_ISSUE_CATEGORY)[keyof typeof SPEC_ISSUE_CATEGORY];
	code: (typeof SPEC_ISSUE_CODE)[keyof typeof SPEC_ISSUE_CODE];
	detail: string;
	file?: string;
};

export type SpecsCheckResult = {
	changedPaths: ChangedPathsSnapshot;
	currentSpecPath: string | null;
	issues: SpecIssue[];
	nonExemptChangedPaths: string[];
};

type ChangedPathsInput = {
	baseRef?: string;
	changedPaths?: string[];
	cwd: string;
	isStaged?: boolean;
};

type LoadSpecDocumentInput = { cwd: string; filePath: string };

type ReadCurrentSpecIndexInput = { config: SpecsCheckConfig; cwd: string };

type RunSpecsCheckInput = {
	baseRef?: string;
	changedPaths?: string[];
	config?: SpecsCheckConfig;
	cwd: string;
	isStaged?: boolean;
};

type SpecDraftInput = {
	branch: string;
	changedPaths: string[];
	config?: SpecsCheckConfig;
	slug: string;
	title?: string;
};

type UpdateExistingSpecContentInput = {
	branch: string;
	config: SpecsCheckConfig;
	currentTimestamp: string;
	document: SpecDocument;
	scopePaths: string[];
};

type WriteSpecDraftInput = {
	baseRef?: string;
	changedPaths?: string[];
	config?: SpecsCheckConfig;
	cwd: string;
	isStaged?: boolean;
	slug?: string;
	title?: string;
};

function addIssue(input: { issue: SpecIssue; issues: SpecIssue[] }) {
	input.issues.push(input.issue);
}

function dedupePaths(input: { paths: string[] }) {
	return [...new Set(input.paths.map((filePath) => normalizePath({ filePath })))].sort(sortPaths);
}

function getGitOutput(input: { args: string[]; cwd: string }) {
	return execFileSync('git', input.args, { cwd: input.cwd, encoding: 'utf8' }).trim();
}

function getGitPaths(input: { args: string[]; cwd: string }) {
	const rawOutput = getGitOutput(input);
	if (!rawOutput) {
		return [];
	}

	return dedupePaths({ paths: rawOutput.split('\n').filter(Boolean) });
}

function getHeadingNames(input: { content: string }) {
	return [...input.content.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1].trim());
}

export function getSpecIssueCode() {
	return SPEC_ISSUE_CODE;
}

function getCurrentTimestamp() {
	return new Date().toISOString();
}

function getWorkingTreeChangedPaths(input: { cwd: string }) {
	return dedupePaths({
		paths: [
			...getGitPaths({
				args: ['diff', '--name-only', 'HEAD', '--diff-filter=ACMRD'],
				cwd: input.cwd,
			}),
			...getGitPaths({ args: ['ls-files', '--others', '--exclude-standard'], cwd: input.cwd }),
		],
	});
}

function hasGitRef(input: { cwd: string; ref: string }) {
	try {
		execFileSync('git', ['rev-parse', '--verify', input.ref], { cwd: input.cwd, stdio: 'ignore' });
		return true;
	} catch {
		return false;
	}
}

function humanizeSlug(input: { slug: string }) {
	return input.slug
		.split('-')
		.filter(Boolean)
		.map((segment) => segment[0].toUpperCase() + segment.slice(1))
		.join(' ');
}

function isExemptChangedPath(input: { config: SpecsCheckConfig; filePath: string }) {
	if (input.config.exactExemptPaths.includes(input.filePath)) {
		return true;
	}

	const hasExemptSuffix = input.config.exemptFileSuffixes.some((suffix) =>
		input.filePath.endsWith(suffix),
	);
	if (hasExemptSuffix) {
		return true;
	}

	return input.config.exemptPathPrefixes.some((prefix) => input.filePath.startsWith(prefix));
}

function isNonEmptyString(value: unknown): value is string {
	return typeof value === 'string' && value.trim().length > 0;
}

function normalizeTimestampValue(value: unknown) {
	if (value instanceof Date && !Number.isNaN(value.getTime())) {
		return value.toISOString();
	}

	if (!isNonEmptyString(value)) {
		return null;
	}

	return value;
}

function isIsoTimestamp(value: unknown) {
	const normalizedValue = normalizeTimestampValue(value);
	if (!normalizedValue) {
		return false;
	}

	return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/.test(
		normalizedValue,
	);
}

function loadSpecDocument(input: LoadSpecDocumentInput): SpecDocument {
	const absolutePath = path.join(input.cwd, input.filePath);
	const content = fs.readFileSync(absolutePath, 'utf8');
	const parsed = matter(content);

	return {
		body: parsed.content,
		content,
		frontmatter: parsed.data as SpecFrontmatter,
		headings: getHeadingNames({ content: parsed.content }),
		path: normalizePath({ filePath: input.filePath }),
	};
}

function matchScopePath(input: { changedPath: string; scopePath: string }) {
	const normalizedScopePath = normalizePath({ filePath: input.scopePath });

	if (normalizedScopePath.endsWith('/')) {
		return input.changedPath.startsWith(normalizedScopePath);
	}

	return input.changedPath === normalizedScopePath;
}

function normalizePath(input: { filePath: string }) {
	return input.filePath.replace(/\\/g, '/').replace(/^\.\//, '');
}

function readCurrentSpecIndex(input: ReadCurrentSpecIndexInput) {
	const absoluteIndexPath = path.join(input.cwd, input.config.activeIndexPath);
	const issues: SpecIssue[] = [];

	if (!fs.existsSync(absoluteIndexPath)) {
		addIssue({
			issue: {
				category: SPEC_ISSUE_CATEGORY.PHYSICAL_ERROR,
				code: SPEC_ISSUE_CODE.CURRENT_SPEC_INDEX_INVALID,
				detail: 'Missing current spec index file',
				file: input.config.activeIndexPath,
			},
			issues,
		});
		return { index: null, issues };
	}

	const parsed = matter(fs.readFileSync(absoluteIndexPath, 'utf8'));
	const rawCurrentSpec = parsed.data[input.config.currentSpecField];
	const currentSpecFromField = isNonEmptyString(rawCurrentSpec)
		? normalizePath({ filePath: rawCurrentSpec })
		: null;
	const rawLegacyActiveSpecs = parsed.data[input.config.legacyActiveSpecsField];
	const legacyActiveSpecs = Array.isArray(rawLegacyActiveSpecs)
		? rawLegacyActiveSpecs.filter(isNonEmptyString).map((filePath) => normalizePath({ filePath }))
		: [];
	const hasSingleLegacySpec = legacyActiveSpecs.length === 1;
	const currentSpec = currentSpecFromField ?? (hasSingleLegacySpec ? legacyActiveSpecs[0] : null);

	if (!currentSpec) {
		addIssue({
			issue: {
				category: SPEC_ISSUE_CATEGORY.LOGICAL_ERROR,
				code: SPEC_ISSUE_CODE.CURRENT_SPEC_INDEX_INVALID,
				detail: `Expected \`${input.config.currentSpecField}\` or exactly one legacy \`${input.config.legacyActiveSpecsField}\` entry`,
				file: input.config.activeIndexPath,
			},
			issues,
		});
	}

	return {
		index: currentSpec ? { currentSpec, path: input.config.activeIndexPath } : null,
		issues,
	};
}

function resolveBaseRef(input: { baseRef?: string; cwd: string }) {
	const hasExplicitBaseRef = input.baseRef
		? hasGitRef({ cwd: input.cwd, ref: input.baseRef })
		: false;
	if (hasExplicitBaseRef && input.baseRef) {
		return input.baseRef;
	}

	const githubBaseRef = process.env.GITHUB_BASE_REF;
	if (githubBaseRef) {
		const remoteBaseRef = `origin/${githubBaseRef}`;
		const hasRemoteBaseRef = hasGitRef({ cwd: input.cwd, ref: remoteBaseRef });
		if (hasRemoteBaseRef) {
			return remoteBaseRef;
		}
	}

	for (const candidate of ['origin/main', 'origin/master', 'main', 'master']) {
		const hasCandidateRef = hasGitRef({ cwd: input.cwd, ref: candidate });
		if (hasCandidateRef) {
			return candidate;
		}
	}

	return null;
}

function sanitizeBranchName(input: { branchName: string }) {
	return input.branchName
		.trim()
		.replace(/^[./]+/, '')
		.replace(/[^\w/-]+/g, '-')
		.replace(/\//g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

function sortPaths(left: string, right: string) {
	return left.localeCompare(right);
}

function updateExistingSpecContent(input: UpdateExistingSpecContentInput) {
	const existingScopePaths = Array.isArray(input.document.frontmatter.scope_paths)
		? input.document.frontmatter.scope_paths.filter(isNonEmptyString)
		: [];
	const normalizedCreatedAt = normalizeTimestampValue(input.document.frontmatter.created_at);
	const createdAt =
		normalizedCreatedAt && isIsoTimestamp(normalizedCreatedAt)
			? normalizedCreatedAt
			: input.currentTimestamp;

	return matter.stringify(input.document.body, {
		...input.document.frontmatter,
		branch: input.branch,
		created_at: createdAt,
		context_mode: input.config.requiredContextMode,
		scope_paths: dedupePaths({ paths: [...existingScopePaths, ...input.scopePaths] }),
		spec_version: 1,
		status: 'active',
		updated_at: input.currentTimestamp,
	});
}

function validateSpecDocument(input: { config: SpecsCheckConfig; document: SpecDocument }) {
	const issues: SpecIssue[] = [];
	const { context_mode, created_at, merged_at, scope_paths, spec_version, status, updated_at } =
		input.document.frontmatter;

	if (spec_version !== 1) {
		addIssue({
			issue: {
				category: SPEC_ISSUE_CATEGORY.LOGICAL_ERROR,
				code: SPEC_ISSUE_CODE.INVALID_SPEC_FRONTMATTER,
				detail: 'Expected `spec_version: 1`',
				file: input.document.path,
			},
			issues,
		});
	}

	if (!isNonEmptyString(status) || !input.config.supportedStatuses.includes(status)) {
		addIssue({
			issue: {
				category: SPEC_ISSUE_CATEGORY.LOGICAL_ERROR,
				code: SPEC_ISSUE_CODE.UNSUPPORTED_STATUS,
				detail: `Unsupported status: ${String(status)}`,
				file: input.document.path,
			},
			issues,
		});
	}

	if (context_mode !== input.config.requiredContextMode) {
		addIssue({
			issue: {
				category: SPEC_ISSUE_CATEGORY.LOGICAL_ERROR,
				code: SPEC_ISSUE_CODE.INVALID_CONTEXT_MODE,
				detail: `Expected context_mode: ${input.config.requiredContextMode}`,
				file: input.document.path,
			},
			issues,
		});
	}

	const timestampsByField = { created_at, merged_at, updated_at };
	for (const requiredTimestampField of input.config.requiredTimestampFields) {
		const timestampValue =
			timestampsByField[requiredTimestampField as keyof typeof timestampsByField];
		const hasValidTimestamp = isIsoTimestamp(timestampValue);
		if (!hasValidTimestamp) {
			addIssue({
				issue: {
					category: SPEC_ISSUE_CATEGORY.LOGICAL_ERROR,
					code: SPEC_ISSUE_CODE.INVALID_TIMESTAMP,
					detail: `Missing or invalid timestamp: ${requiredTimestampField}`,
					file: input.document.path,
				},
				issues,
			});
		}
	}

	const hasMergedStatus = status === 'merged';
	const hasMergedTimestamp = merged_at !== undefined;
	if (hasMergedStatus && !isIsoTimestamp(merged_at)) {
		addIssue({
			issue: {
				category: SPEC_ISSUE_CATEGORY.LOGICAL_ERROR,
				code: SPEC_ISSUE_CODE.INVALID_TIMESTAMP,
				detail: 'Missing or invalid timestamp: merged_at',
				file: input.document.path,
			},
			issues,
		});
	}

	if (!hasMergedStatus && hasMergedTimestamp && !isIsoTimestamp(merged_at)) {
		addIssue({
			issue: {
				category: SPEC_ISSUE_CATEGORY.LOGICAL_ERROR,
				code: SPEC_ISSUE_CODE.INVALID_TIMESTAMP,
				detail: 'Invalid timestamp: merged_at',
				file: input.document.path,
			},
			issues,
		});
	}

	const isMissingScopePaths = !Array.isArray(scope_paths) || scope_paths.length === 0;
	if (isMissingScopePaths) {
		addIssue({
			issue: {
				category: SPEC_ISSUE_CATEGORY.LOGICAL_ERROR,
				code: SPEC_ISSUE_CODE.INVALID_SCOPE_PATH,
				detail: 'Expected a non-empty `scope_paths` array',
				file: input.document.path,
			},
			issues,
		});
	} else if (scope_paths.some((scopePath) => !isNonEmptyString(scopePath))) {
		addIssue({
			issue: {
				category: SPEC_ISSUE_CATEGORY.LOGICAL_ERROR,
				code: SPEC_ISSUE_CODE.INVALID_SCOPE_PATH,
				detail: 'Every `scope_paths` entry must be a non-empty string',
				file: input.document.path,
			},
			issues,
		});
	}

	const headings = new Set(input.document.headings.map((heading) => heading.toLowerCase()));
	for (const requiredSection of input.config.requiredSections) {
		const hasRequiredSection = headings.has(requiredSection.toLowerCase());
		if (!hasRequiredSection) {
			addIssue({
				issue: {
					category: SPEC_ISSUE_CATEGORY.LOGICAL_ERROR,
					code: SPEC_ISSUE_CODE.MISSING_REQUIRED_SECTION,
					detail: `Missing section: ${requiredSection}`,
					file: input.document.path,
				},
				issues,
			});
		}
	}

	return issues;
}

export function buildCurrentSpecIndexDocument(input: {
	config?: SpecsCheckConfig;
	currentSpec: string;
}) {
	const config = input.config ?? specsCheckConfig;
	const currentSpec = normalizePath({ filePath: input.currentSpec });
	const bodyLines = [
		'# Current Branch Spec',
		'',
		'## Current spec',
		'',
		`- \`${currentSpec}\``,
		'',
		'## Status',
		'',
		'- The current spec is the umbrella document for the active branch.',
		'- Every non-exempt changed file must be covered by the current spec through its `scope_paths`.',
		'',
		'## Required verification',
		'',
		...config.defaultVerificationCommands.map((command) => `- \`${command}\``),
		'',
		'## Notes',
		'',
		'- Add new work-level specs under `specs/`.',
		'- Keep this file short; use it as the branch pointer, not the detailed implementation document.',
	];

	return matter.stringify(bodyLines.join('\n'), { [config.currentSpecField]: currentSpec });
}

export function buildSpecDraft(input: SpecDraftInput) {
	const config = input.config ?? specsCheckConfig;
	const scopePaths = dedupePaths({ paths: input.changedPaths });
	const title = input.title?.trim() || humanizeSlug({ slug: input.slug });
	const currentTimestamp = getCurrentTimestamp();
	const bodyLines = [
		`# ${title}`,
		'',
		'## Goal',
		'',
		'- Describe the branch goal in standalone terms.',
		`- Initial umbrella draft generated from branch \`${input.branch}\` and ${scopePaths.length} detected changed path(s).`,
		'',
		'## Non-goals',
		'',
		'- Do not use this document as a changelog entry.',
		'- Do not rely on hidden chat or PR context to explain the change.',
		'',
		'## Scope',
		'',
		...scopePaths.map((scopePath) => `- \`${scopePath}\``),
		'',
		'## Constraints',
		'',
		'- Keep the document understandable without reading the PR discussion first.',
		'- Keep `scope_paths` aligned with the branch-wide changed-file set.',
		'',
		'## Verification',
		'',
		...config.defaultVerificationCommands.map((command) => `- \`${command}\``),
		'',
		'## Rollback',
		'',
		'- Revert the branch work and restore the previous branch pointer if this workflow proves too noisy.',
	];

	return matter.stringify(bodyLines.join('\n'), {
		branch: input.branch,
		created_at: currentTimestamp,
		context_mode: config.requiredContextMode,
		scope_paths: scopePaths,
		spec_version: 1,
		status: 'active',
		updated_at: currentTimestamp,
	});
}

export function formatSpecIssue(input: { issue: SpecIssue }) {
	if (input.issue.file) {
		return `[${input.issue.category}:${input.issue.code}] ${input.issue.detail}\n  ${input.issue.file}`;
	}

	return `[${input.issue.category}:${input.issue.code}] ${input.issue.detail}`;
}

export function resolveChangedPaths(input: ChangedPathsInput): ChangedPathsSnapshot {
	if (input.changedPaths && input.changedPaths.length > 0) {
		return { mode: 'explicit', paths: dedupePaths({ paths: input.changedPaths }) };
	}

	if (input.isStaged) {
		return {
			mode: 'staged',
			paths: getGitPaths({
				args: ['diff', '--cached', '--name-only', '--diff-filter=ACMRD'],
				cwd: input.cwd,
			}),
		};
	}

	const baseRef = resolveBaseRef({ baseRef: input.baseRef, cwd: input.cwd });
	const workingTreeChangedPaths = getWorkingTreeChangedPaths({ cwd: input.cwd });

	if (!baseRef) {
		return { mode: 'base', paths: workingTreeChangedPaths };
	}

	const mergeBase = getGitOutput({ args: ['merge-base', baseRef, 'HEAD'], cwd: input.cwd });
	const committedChangedPaths = getGitPaths({
		args: ['diff', '--name-only', '--diff-filter=ACMRD', `${mergeBase}...HEAD`],
		cwd: input.cwd,
	});

	return {
		baseRef,
		mode: 'base',
		paths: dedupePaths({ paths: [...committedChangedPaths, ...workingTreeChangedPaths] }),
	};
}

export function runSpecsCheck(input: RunSpecsCheckInput): SpecsCheckResult {
	const config = input.config ?? specsCheckConfig;
	const issues: SpecIssue[] = [];
	const changedPaths = resolveChangedPaths({
		baseRef: input.baseRef,
		changedPaths: input.changedPaths,
		cwd: input.cwd,
		isStaged: input.isStaged,
	});
	const nonExemptChangedPaths = changedPaths.paths.filter(
		(filePath) => !isExemptChangedPath({ config, filePath }),
	);
	const { index, issues: indexIssues } = readCurrentSpecIndex({ config, cwd: input.cwd });

	issues.push(...indexIssues);

	if (!index) {
		return { changedPaths, currentSpecPath: null, issues, nonExemptChangedPaths };
	}

	const absolutePath = path.join(input.cwd, index.currentSpec);
	if (!fs.existsSync(absolutePath)) {
		addIssue({
			issue: {
				category: SPEC_ISSUE_CATEGORY.PHYSICAL_ERROR,
				code: SPEC_ISSUE_CODE.CURRENT_SPEC_FILE_MISSING,
				detail: 'Current spec file not found',
				file: index.currentSpec,
			},
			issues,
		});
		return { changedPaths, currentSpecPath: index.currentSpec, issues, nonExemptChangedPaths };
	}

	const document = loadSpecDocument({ cwd: input.cwd, filePath: index.currentSpec });
	issues.push(...validateSpecDocument({ config, document }));

	const scopePaths = Array.isArray(document.frontmatter.scope_paths)
		? document.frontmatter.scope_paths
		: [];

	for (const filePath of nonExemptChangedPaths) {
		const isCovered = scopePaths.some((scopePath) =>
			matchScopePath({ changedPath: filePath, scopePath }),
		);
		if (!isCovered) {
			addIssue({
				issue: {
					category: SPEC_ISSUE_CATEGORY.LOGICAL_ERROR,
					code: SPEC_ISSUE_CODE.UNCOVERED_CHANGED_FILE,
					detail: filePath,
				},
				issues,
			});
		}
	}

	return { changedPaths, currentSpecPath: index.currentSpec, issues, nonExemptChangedPaths };
}

export function writeSpecDraft(input: WriteSpecDraftInput) {
	const config = input.config ?? specsCheckConfig;
	const currentTimestamp = getCurrentTimestamp();
	const branch =
		sanitizeBranchName({
			branchName:
				getGitOutput({ args: ['branch', '--show-current'], cwd: input.cwd }) || 'detached-head',
		}) || 'work-item';
	const slug = input.slug?.trim() || branch;
	const changedPaths = resolveChangedPaths({
		baseRef: input.baseRef,
		changedPaths: input.changedPaths,
		cwd: input.cwd,
		isStaged: input.isStaged,
	}).paths;

	if (changedPaths.length === 0) {
		throw new Error('Cannot generate a spec draft without changed paths.');
	}

	const specFilePath = `specs/${slug}.md`;
	const draftScopePaths = dedupePaths({
		paths: [...changedPaths, config.activeIndexPath, specFilePath],
	});
	const absoluteSpecPath = path.join(input.cwd, specFilePath);
	const hasExistingSpec = fs.existsSync(absoluteSpecPath);

	const specContent = hasExistingSpec
		? updateExistingSpecContent({
				branch,
				config,
				currentTimestamp,
				document: loadSpecDocument({ cwd: input.cwd, filePath: specFilePath }),
				scopePaths: draftScopePaths,
			})
		: buildSpecDraft({ branch, changedPaths: draftScopePaths, config, slug, title: input.title });

	fs.mkdirSync(path.dirname(absoluteSpecPath), { recursive: true });
	fs.writeFileSync(absoluteSpecPath, specContent, 'utf8');
	fs.writeFileSync(
		path.join(input.cwd, config.activeIndexPath),
		buildCurrentSpecIndexDocument({ config, currentSpec: specFilePath }),
		'utf8',
	);

	return { changedPaths, specFilePath };
}
