import React from 'react';

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const navigationMocks = vi.hoisted(() => ({
	notFound: vi.fn(() => {
		throw new Error('NOT_FOUND');
	}),
}));

const postModuleMocks = vi.hoisted(() => ({
	getAllPosts: vi.fn(),
	getPostDocument: vi.fn(),
	getPostsByLocale: vi.fn(),
}));

vi.mock('next/navigation', () => navigationMocks);

vi.mock('@/lib/post', async () => {
	const actual = await vi.importActual<typeof import('@/lib/post')>('@/lib/post');

	return {
		...actual,
		getAllPosts: postModuleMocks.getAllPosts,
		getPostDocument: postModuleMocks.getPostDocument,
		getPostsByLocale: postModuleMocks.getPostsByLocale,
	};
});

import { generateMetadata, generateStaticParams } from '../../src/app/blog/[slug]/page';
import robots from '../../src/app/robots';
import sitemap from '../../src/app/sitemap';

beforeAll(() => {
	vi.stubGlobal('React', React);
});

beforeEach(() => {
	vi.clearAllMocks();
	vi.useRealTimers();
});

afterAll(() => {
	vi.unstubAllGlobals();
});

describe('blog post metadata and static params', () => {
	it('builds metadata from the resolved post document', async () => {
		postModuleMocks.getPostDocument.mockReturnValue({
			content: '# note',
			post: { description: '설명', slug: 'test-post', thumbnail: '/og.png', title: '테스트 글' },
		});

		const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'test-post' }) });

		expect(postModuleMocks.getPostDocument).toHaveBeenCalledWith({
			locale: 'ko',
			slug: 'test-post',
		});
		expect(metadata.title).toBe('테스트 글 | Minwoo Roh');
		expect(metadata.description).toBe('설명');
		expect(metadata.openGraph).toMatchObject({
			title: '테스트 글 | Minwoo Roh',
			description: '설명',
			url: 'https://minwoo.cloud/blog/test-post',
		});
	});

	it('calls notFound from generateMetadata when the document is missing', async () => {
		postModuleMocks.getPostDocument.mockReturnValue(null);

		await expect(
			generateMetadata({ params: Promise.resolve({ slug: 'missing-post' }) }),
		).rejects.toThrow('NOT_FOUND');

		expect(navigationMocks.notFound).toHaveBeenCalledTimes(1);
	});

	it('returns every ko post as a static route param', async () => {
		postModuleMocks.getAllPosts.mockReturnValue([
			{ locale: 'ko', slug: 'first-post' },
			{ locale: 'ko', slug: 'second-post' },
		]);

		expect(await generateStaticParams()).toEqual([{ slug: 'first-post' }, { slug: 'second-post' }]);
	});
});

describe('route metadata files', () => {
	it('builds the robots document from the site url', () => {
		expect(robots()).toEqual({
			rules: { allow: '/', userAgent: '*' },
			sitemap: 'https://minwoo.cloud/sitemap.xml',
		});
	});

	it('builds the sitemap from posts plus static routes', async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-04-12T00:00:00.000Z'));
		postModuleMocks.getAllPosts.mockReturnValue([{ date: '2026-04-11', href: '/blog/first-post' }]);

		expect(await sitemap()).toEqual([
			{ lastModified: '2026-04-11T00:00:00.000Z', url: 'https://minwoo.cloud/blog/first-post' },
			{ lastModified: '2026-04-12T00:00:00.000Z', url: 'https://minwoo.cloud/' },
			{ lastModified: '2026-04-12T00:00:00.000Z', url: 'https://minwoo.cloud/blog' },
		]);
	});
});
