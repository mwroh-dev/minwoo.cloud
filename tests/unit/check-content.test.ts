import fs from 'fs';
import os from 'os';
import path from 'path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { CONTENT_ISSUE_CODE, runContentCheck } from '../../scripts/check-content';

const tempRoots: string[] = [];

function createValidationRoot() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cielo-content-check-'));
	const contentRoot = path.join(root, 'content');
	const publicRoot = path.join(root, 'public');

	fs.mkdirSync(contentRoot, { recursive: true });
	fs.mkdirSync(publicRoot, { recursive: true });
	tempRoots.push(root);

	return { contentRoot, publicRoot };
}

function ensureLocaleDirectories(contentRoot: string) {
	for (const locale of ['en', 'ko']) {
		fs.mkdirSync(path.join(contentRoot, locale), { recursive: true });
	}
}

function writePost(input: {
	body?: string;
	contentRoot: string;
	filename: string;
	frontmatter: {
		date?: string;
		description?: string;
		featured?: boolean;
		series?: string;
		tags?: string[];
		title?: string;
		translationKey?: string;
	};
	locale: 'en' | 'ko';
}) {
	const localeDir = path.join(input.contentRoot, input.locale);
	fs.mkdirSync(localeDir, { recursive: true });

	const frontmatterLines = [
		input.frontmatter.title ? `title: '${input.frontmatter.title}'` : '',
		input.frontmatter.date ? `date: '${input.frontmatter.date}'` : '',
		input.frontmatter.description ? `description: '${input.frontmatter.description}'` : '',
		input.frontmatter.series ? `series: '${input.frontmatter.series}'` : '',
		typeof input.frontmatter.featured === 'boolean'
			? `featured: ${input.frontmatter.featured}`
			: '',
		input.frontmatter.tags?.length
			? `tags: [${input.frontmatter.tags.map((tag) => `'${tag}'`).join(', ')}]`
			: '',
		input.frontmatter.translationKey ? `translationKey: '${input.frontmatter.translationKey}'` : '',
	]
		.filter(Boolean)
		.join('\n');

	fs.writeFileSync(
		path.join(localeDir, `${input.filename}.mdx`),
		`---\n${frontmatterLines}\n---\n\n${input.body ?? 'Body copy'}\n`,
		'utf8',
	);
}

function writePublicAsset(input: { publicRoot: string; relativePath: string }) {
	const assetPath = path.join(input.publicRoot, input.relativePath);
	fs.mkdirSync(path.dirname(assetPath), { recursive: true });
	fs.writeFileSync(assetPath, 'asset', 'utf8');
}

afterEach(() => {
	for (const root of tempRoots.splice(0)) {
		fs.rmSync(root, { force: true, recursive: true });
	}
});

describe('runContentCheck', () => {
	it('passes for valid localized content and existing assets', () => {
		const { contentRoot, publicRoot } = createValidationRoot();
		ensureLocaleDirectories(contentRoot);
		writePublicAsset({ publicRoot, relativePath: 'images/cover.png' });
		writePost({
			contentRoot,
			locale: 'ko',
			filename: 'survivorship-note',
			frontmatter: {
				title: '생존자 편향',
				date: '2026-04-11',
				description: 'Korean entry',
				series: 'Notes',
				translationKey: 'survivorship-note',
			},
			body: '본문 [홈](/blog) [이미지](/images/cover.png)',
		});
		writePost({
			contentRoot,
			locale: 'en',
			filename: 'survivorship-note-en',
			frontmatter: {
				title: 'Survivorship note',
				date: '2026-04-11',
				description: 'English entry',
				series: 'Notes',
				translationKey: 'survivorship-note',
			},
			body: 'Body [Localized](/ko/blog/survivorship-note)',
		});

		expect(runContentCheck({ contentPath: contentRoot, publicPath: publicRoot })).toEqual({
			issues: [],
			postsChecked: 2,
		});
	});

	it('reports missing locale directories', () => {
		const { contentRoot, publicRoot } = createValidationRoot();
		writePost({
			contentRoot,
			locale: 'en',
			filename: 'english-only',
			frontmatter: {
				title: 'English only',
				date: '2026-04-11',
				description: 'Only English content exists',
				series: 'Notes',
			},
		});

		const result = runContentCheck({ contentPath: contentRoot, publicPath: publicRoot });

		expect(result.issues.map((issue) => issue.code)).toContain(
			CONTENT_ISSUE_CODE.MISSING_LOCALE_DIRECTORY,
		);
	});

	it('reports invalid frontmatter', () => {
		const { contentRoot, publicRoot } = createValidationRoot();
		ensureLocaleDirectories(contentRoot);
		writePost({
			contentRoot,
			locale: 'ko',
			filename: 'broken-post',
			frontmatter: { title: 'Broken post', description: 'Missing date metadata' },
		});
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

		const result = runContentCheck({ contentPath: contentRoot, publicPath: publicRoot });

		expect(result.issues.map((issue) => issue.code)).toContain(
			CONTENT_ISSUE_CODE.INVALID_FRONTMATTER,
		);
		consoleError.mockRestore();
	});

	it('reports duplicate slugs across locales', () => {
		const { contentRoot, publicRoot } = createValidationRoot();
		ensureLocaleDirectories(contentRoot);
		writePost({
			contentRoot,
			locale: 'ko',
			filename: 'shared-slug',
			frontmatter: {
				title: '공유 슬러그',
				date: '2026-04-11',
				description: 'Korean entry',
				series: 'Notes',
			},
		});
		writePost({
			contentRoot,
			locale: 'en',
			filename: 'shared-slug',
			frontmatter: {
				title: 'Shared slug',
				date: '2026-04-11',
				description: 'English entry',
				series: 'Notes',
			},
		});

		const issueCodes = runContentCheck({
			contentPath: contentRoot,
			publicPath: publicRoot,
		}).issues.map((issue) => issue.code);

		expect(issueCodes).toContain(CONTENT_ISSUE_CODE.DUPLICATE_SLUG);
		expect(issueCodes).toContain(CONTENT_ISSUE_CODE.GLOBAL_SLUG_UNIQUENESS_CHECK_FAILED);
	});

	it('reports duplicate translation keys within the same locale', () => {
		const { contentRoot, publicRoot } = createValidationRoot();
		ensureLocaleDirectories(contentRoot);
		writePost({
			contentRoot,
			locale: 'ko',
			filename: 'alpha',
			frontmatter: {
				title: 'Alpha',
				date: '2026-04-10',
				description: 'First entry',
				series: 'Notes',
				translationKey: 'shared-key',
			},
		});
		writePost({
			contentRoot,
			locale: 'ko',
			filename: 'beta',
			frontmatter: {
				title: 'Beta',
				date: '2026-04-11',
				description: 'Second entry',
				series: 'Notes',
				translationKey: 'shared-key',
			},
		});

		expect(
			runContentCheck({ contentPath: contentRoot, publicPath: publicRoot }).issues.map(
				(issue) => issue.code,
			),
		).toContain(CONTENT_ISSUE_CODE.DUPLICATE_TRANSLATION_KEY);
	});

	it('reports broken localized and legacy blog links', () => {
		const { contentRoot, publicRoot } = createValidationRoot();
		ensureLocaleDirectories(contentRoot);
		writePost({
			contentRoot,
			locale: 'ko',
			filename: 'link-check',
			frontmatter: {
				title: 'Link check',
				date: '2026-04-11',
				description: 'Broken links',
				series: 'Notes',
			},
			body: '본문 [Localized](/en/blog/missing-note) [Legacy](/blog/missing-note)',
		});

		const issueCodes = runContentCheck({
			contentPath: contentRoot,
			publicPath: publicRoot,
		}).issues.map((issue) => issue.code);

		expect(issueCodes).toContain(CONTENT_ISSUE_CODE.BROKEN_LOCALIZED_BLOG_LINK);
		expect(issueCodes).toContain(CONTENT_ISSUE_CODE.BROKEN_LEGACY_BLOG_LINK);
	});

	it('reports missing public assets referenced from content', () => {
		const { contentRoot, publicRoot } = createValidationRoot();
		ensureLocaleDirectories(contentRoot);
		writePost({
			contentRoot,
			locale: 'ko',
			filename: 'missing-asset',
			frontmatter: {
				title: 'Missing asset',
				date: '2026-04-11',
				description: 'References a missing asset',
				series: 'Notes',
			},
			body: '본문 [Asset](/images/missing-cover.png)',
		});

		expect(
			runContentCheck({ contentPath: contentRoot, publicPath: publicRoot }).issues.map(
				(issue) => issue.code,
			),
		).toContain(CONTENT_ISSUE_CODE.MISSING_PUBLIC_ASSET);
	});
});
