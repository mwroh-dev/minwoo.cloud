import fs from 'fs';
import os from 'os';
import path from 'path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildPostFromSource, getAllPosts, getGroupedPosts, getPostBySlug } from '@/lib/post';

const tempRoots: string[] = [];

function createContentRoot() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cielo-content-'));
	tempRoots.push(root);
	return root;
}

function writePost(
	root: string,
	filename: string,
	frontmatter: {
		date?: string;
		description?: string;
		featured?: boolean;
		series?: string;
		tags?: string[];
		title?: string;
	},
	body = 'Sample content for the post body.',
) {
	const frontmatterLines = [
		frontmatter.title ? `title: '${frontmatter.title}'` : '',
		frontmatter.date ? `date: '${frontmatter.date}'` : '',
		frontmatter.description ? `description: '${frontmatter.description}'` : '',
		frontmatter.series ? `series: '${frontmatter.series}'` : '',
		typeof frontmatter.featured === 'boolean' ? `featured: ${frontmatter.featured}` : '',
		frontmatter.tags?.length ? `tags: [${frontmatter.tags.map(tag => `'${tag}'`).join(', ')}]` : '',
	]
		.filter(Boolean)
		.join('\n');

	fs.writeFileSync(
		path.join(root, `${filename}.mdx`),
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
---

Body copy`,
			slug: 'valid-post',
			sourcePath: '/tmp/valid-post.mdx',
		});

		expect(post).not.toBeNull();
		expect(post?.href).toBe('/blog/valid-post');
		expect(post?.series).toBe('Notes');
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
			slug: 'broken-post',
			sourcePath: '/tmp/broken-post.mdx',
		});

		expect(post).toBeNull();
		consoleError.mockRestore();
	});
});

describe('post loaders', () => {
	it('loads posts in descending date order', () => {
		const root = createContentRoot();

		writePost(root, 'older-post', {
			title: 'Older post',
			date: '2026-04-09',
			description: 'Old entry',
			series: 'Log',
		});
		writePost(root, 'newer-post', {
			title: 'Newer post',
			date: '2026-04-11',
			description: 'New entry',
			series: 'Log',
		});

		const posts = getAllPosts(root);

		expect(posts.map(post => post.slug)).toEqual(['newer-post', 'older-post']);
	});

	it('groups posts by series while preserving newest-first order inside a group', () => {
		const root = createContentRoot();

		writePost(root, 'alpha-1', {
			title: 'Alpha 1',
			date: '2026-04-08',
			description: 'Alpha entry',
			series: 'Alpha',
		});
		writePost(root, 'alpha-2', {
			title: 'Alpha 2',
			date: '2026-04-10',
			description: 'Alpha newest entry',
			series: 'Alpha',
		});
		writePost(root, 'beta-1', {
			title: 'Beta 1',
			date: '2026-04-09',
			description: 'Beta entry',
			series: 'Beta',
		});

		const groups = getGroupedPosts(getAllPosts(root));

		expect(groups[0]?.name).toBe('Alpha');
		expect(groups[0]?.posts.map(post => post.slug)).toEqual(['alpha-2', 'alpha-1']);
		expect(groups[1]?.name).toBe('Beta');
	});

	it('returns an empty list when the content directory does not exist', () => {
		const root = createContentRoot();

		expect(getAllPosts(path.join(root, 'missing'))).toEqual([]);
	});

	it('looks up a post by slug', () => {
		const root = createContentRoot();

		writePost(root, 'shared-note', {
			title: '공유 노트',
			date: '2026-04-12',
			description: '한국어 본문',
			series: 'Notes',
		});

		const post = getPostBySlug({ contentPath: root, slug: 'shared-note' });

		expect(post?.slug).toBe('shared-note');
	});
});
