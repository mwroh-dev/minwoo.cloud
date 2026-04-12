import React from 'react';

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { ENGLISH_LOCALE, KOREAN_LOCALE } from '@/lib/i18n';

const navigationMocks = vi.hoisted(() => ({
	notFound: vi.fn(() => {
		throw new Error('NOT_FOUND');
	}),
	permanentRedirect: vi.fn((href: string) => {
		throw new Error(`REDIRECT:${href}`);
	}),
}));

const blogIndexMock = vi.hoisted(() => vi.fn());

const postModuleMocks = vi.hoisted(() => ({
	getAllPosts: vi.fn(),
	getAlternatePosts: vi.fn(() => []),
	getPostByLocaleAndSlug: vi.fn(),
	getPostBySlug: vi.fn(),
	getPostDocument: vi.fn(),
	getPostsByLocale: vi.fn(),
}));

vi.mock('next/navigation', () => navigationMocks);

vi.mock('@/components/blog/blog-index', () => ({ default: blogIndexMock }));

vi.mock('@/lib/post', async () => {
	const actual = await vi.importActual<typeof import('@/lib/post')>('@/lib/post');

	return {
		...actual,
		getAllPosts: postModuleMocks.getAllPosts,
		getAlternatePosts: postModuleMocks.getAlternatePosts,
		getPostByLocaleAndSlug: postModuleMocks.getPostByLocaleAndSlug,
		getPostBySlug: postModuleMocks.getPostBySlug,
		getPostDocument: postModuleMocks.getPostDocument,
		getPostsByLocale: postModuleMocks.getPostsByLocale,
	};
});

import LocaleBlogPage from '../../src/app/[locale]/blog/page';
import { generateMetadata, generateStaticParams } from '../../src/app/[locale]/blog/[slug]/page';
import LegacyBlogPostPage from '../../src/app/blog/[slug]/page';
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

describe('localized archive routes', () => {
	it('renders the English archive with locale-specific posts', async () => {
		const posts = [{ slug: 'shared-note' }];
		postModuleMocks.getPostsByLocale.mockReturnValue(posts);

		const page = await LocaleBlogPage({ params: Promise.resolve({ locale: ENGLISH_LOCALE }) });

		expect(postModuleMocks.getPostsByLocale).toHaveBeenCalledWith(ENGLISH_LOCALE);
		expect(page.props.locale).toBe(ENGLISH_LOCALE);
		expect(page.props.posts).toBe(posts);
	});

	it('calls notFound for an unsupported locale', async () => {
		await expect(LocaleBlogPage({ params: Promise.resolve({ locale: 'jp' }) })).rejects.toThrow(
			'NOT_FOUND',
		);

		expect(navigationMocks.notFound).toHaveBeenCalledTimes(1);
	});

	it('redirects the Korean locale route to the default archive path', async () => {
		await expect(
			LocaleBlogPage({ params: Promise.resolve({ locale: KOREAN_LOCALE }) }),
		).rejects.toThrow('REDIRECT:/blog');

		expect(navigationMocks.permanentRedirect).toHaveBeenCalledWith('/blog');
	});
});

describe('legacy blog redirects', () => {
	it('redirects an existing slug to its localized detail route', async () => {
		postModuleMocks.getPostBySlug.mockReturnValue({ href: '/ko/blog/shared-note' });

		await expect(
			LegacyBlogPostPage({ params: Promise.resolve({ slug: 'shared-note' }) }),
		).rejects.toThrow('REDIRECT:/ko/blog/shared-note');

		expect(postModuleMocks.getPostBySlug).toHaveBeenCalledWith({ slug: 'shared-note' });
	});

	it('calls notFound when a legacy slug does not resolve', async () => {
		postModuleMocks.getPostBySlug.mockReturnValue(null);

		await expect(
			LegacyBlogPostPage({ params: Promise.resolve({ slug: 'missing-note' }) }),
		).rejects.toThrow('NOT_FOUND');

		expect(navigationMocks.notFound).toHaveBeenCalledTimes(1);
	});
});

describe('localized post metadata and static params', () => {
	it('builds metadata from the resolved post document', async () => {
		postModuleMocks.getPostDocument.mockReturnValue({
			content: '# note',
			post: {
				description: 'Custom description',
				slug: 'shared-note-en',
				thumbnail: '/custom-og.png',
				title: 'Shared note',
			},
		});

		const metadata = await generateMetadata({
			params: Promise.resolve({ locale: ENGLISH_LOCALE, slug: 'shared-note-en' }),
		});

		expect(postModuleMocks.getPostDocument).toHaveBeenCalledWith({
			locale: ENGLISH_LOCALE,
			slug: 'shared-note-en',
		});
		expect(metadata.title).toBe('Shared note | Minwoo Roh');
		expect(metadata.description).toBe('Custom description');
		expect(metadata.openGraph).toMatchObject({
			title: 'Shared note | Minwoo Roh',
			description: 'Custom description',
			url: 'https://minwoo.cloud/en/blog/shared-note-en',
		});
	});

	it('calls notFound from generateMetadata when the document is missing', async () => {
		postModuleMocks.getPostDocument.mockReturnValue(null);

		await expect(
			generateMetadata({
				params: Promise.resolve({ locale: ENGLISH_LOCALE, slug: 'missing-note' }),
			}),
		).rejects.toThrow('NOT_FOUND');

		expect(navigationMocks.notFound).toHaveBeenCalledTimes(1);
	});

	it('returns every post as a static route param', async () => {
		postModuleMocks.getAllPosts.mockReturnValue([
			{ locale: KOREAN_LOCALE, slug: 'korean-note' },
			{ locale: ENGLISH_LOCALE, slug: 'english-note' },
		]);

		expect(await generateStaticParams()).toEqual([
			{ locale: KOREAN_LOCALE, slug: 'korean-note' },
			{ locale: ENGLISH_LOCALE, slug: 'english-note' },
		]);
	});
});

describe('route metadata files', () => {
	it('builds the robots document from the site url', () => {
		expect(robots()).toEqual({
			rules: { allow: '/', userAgent: '*' },
			sitemap: 'https://minwoo.cloud/sitemap.xml',
		});
	});

	it('builds the sitemap from posts plus static archive routes', async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-04-12T00:00:00.000Z'));
		postModuleMocks.getAllPosts.mockReturnValue([
			{ date: '2026-04-11', href: '/ko/blog/korean-note' },
			{ date: '2026-04-10', href: '/en/blog/english-note' },
		]);

		expect(await sitemap()).toEqual([
			{ lastModified: '2026-04-11T00:00:00.000Z', url: 'https://minwoo.cloud/ko/blog/korean-note' },
			{
				lastModified: '2026-04-10T00:00:00.000Z',
				url: 'https://minwoo.cloud/en/blog/english-note',
			},
			{ lastModified: '2026-04-12T00:00:00.000Z', url: 'https://minwoo.cloud/' },
			{ lastModified: '2026-04-12T00:00:00.000Z', url: 'https://minwoo.cloud/blog' },
			{ lastModified: '2026-04-12T00:00:00.000Z', url: 'https://minwoo.cloud/en/blog' },
			{ lastModified: '2026-04-12T00:00:00.000Z', url: 'https://minwoo.cloud/ko/blog' },
		]);
	});
});
