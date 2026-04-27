import fs from 'fs';
import os from 'os';
import path from 'path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildPostFromSource, getGroupedPosts, getPostBySlug, getPostsByLocale } from '@/lib/post';

const tempRoots: string[] = [];

function createContentRoot() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cielo-content-'));
	tempRoots.push(root);
	return root;
}

function writePost(
	root: string,
	locale: 'en' | 'ko',
	filename: string,
	frontmatter: {
		date?: string;
		description?: string;
		featured?: boolean;
		series?: string;
		tags?: string[];
		title?: string;
		translationKey?: string;
	},
	body = 'Sample content for the post body.',
) {
	const localeDir = path.join(root, locale);
	fs.mkdirSync(localeDir, { recursive: true });

	const frontmatterLines = [
		frontmatter.title ? `title: '${frontmatter.title}'` : '',
		frontmatter.date ? `date: '${frontmatter.date}'` : '',
		frontmatter.description ? `description: '${frontmatter.description}'` : '',
		frontmatter.series ? `series: '${frontmatter.series}'` : '',
		typeof frontmatter.featured === 'boolean' ? `featured: ${frontmatter.featured}` : '',
		frontmatter.tags?.length ? `tags: [${frontmatter.tags.map(tag => `'${tag}'`).join(', ')}]` : '',
		frontmatter.translationKey ? `translationKey: '${frontmatter.translationKey}'` : '',
	]
		.filter(Boolean)
		.join('\n');

	fs.writeFileSync(
		path.join(localeDir, `${filename}.mdx`),
		`---\n${frontmatterLines}\n---\n\n${body}\n`,
		'utf8',
	);
}

afterEach(() => {
	for (const root of tempRoots.splice(0)) {
		fs.rmSync(root, { recursive: true, force: true });
	}
});

describe('buildPostFromSource', () => {
	it('parses valid frontmatter into a post object', () => {
		const post = buildPostFromSource({
			fileContents: `---
title: 'Valid post'
date: '2026-04-11'
description: 'Valid description'
series: 'Notes'
translationKey: 'valid-post'
---

Body copy`,
			locale: 'ko',
			slug: 'valid-post',
			sourcePath: '/tmp/valid-post.mdx',
		});

		expect(post).not.toBeNull();
		expect(post?.href).toBe('/blog/valid-post');
		expect(post?.series).toBe('Notes');
		expect(post?.translationKey).toBe('valid-post');
		expect(post?.readingTimeMinutes).toBeGreaterThanOrEqual(1);
	});

	it('returns null when required frontmatter is missing', () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const post = buildPostFromSource({
			fileContents: `---
title: 'Missing date'
description: 'Broken'
---

Body copy`,
			locale: 'ko',
			slug: 'broken-post',
			sourcePath: '/tmp/broken-post.mdx',
		});

		expect(post).toBeNull();
		consoleError.mockRestore();
	});
});

describe('post loaders', () => {
	it('loads locale posts in descending date order', () => {
		const root = createContentRoot();

		writePost(root, 'ko', 'older-post', {
			title: 'Older post',
			date: '2026-04-09',
			description: 'Old entry',
			series: 'Log',
		});
		writePost(root, 'ko', 'newer-post', {
			title: 'Newer post',
			date: '2026-04-11',
			description: 'New entry',
			series: 'Log',
		});

		const posts = getPostsByLocale('ko', root);

		expect(posts.map(post => post.slug)).toEqual(['newer-post', 'older-post']);
	});

	it('groups posts by series while preserving newest-first order inside a group', () => {
		const root = createContentRoot();

		writePost(root, 'ko', 'alpha-1', {
			title: 'Alpha 1',
			date: '2026-04-08',
			description: 'Alpha entry',
			series: 'Alpha',
		});
		writePost(root, 'ko', 'alpha-2', {
			title: 'Alpha 2',
			date: '2026-04-10',
			description: 'Alpha newest entry',
			series: 'Alpha',
		});
		writePost(root, 'ko', 'beta-1', {
			title: 'Beta 1',
			date: '2026-04-09',
			description: 'Beta entry',
			series: 'Beta',
		});

		const groups = getGroupedPosts(getPostsByLocale('ko', root));

		expect(groups[0]?.name).toBe('Alpha');
		expect(groups[0]?.posts.map(post => post.slug)).toEqual(['alpha-2', 'alpha-1']);
		expect(groups[1]?.name).toBe('Beta');
	});

	it('returns an empty list when the ko directory does not exist', () => {
		const root = createContentRoot();

		expect(getPostsByLocale('ko', root)).toEqual([]);
	});

	it('looks up a post by slug', () => {
		const root = createContentRoot();

		writePost(root, 'ko', 'shared-note', {
			title: '공유 노트',
			date: '2026-04-12',
			description: '한국어 본문',
			series: 'Notes',
		});

		const post = getPostBySlug({ contentPath: root, slug: 'shared-note' });

		expect(post?.locale).toBe('ko');
		expect(post?.slug).toBe('shared-note');
	});
});
