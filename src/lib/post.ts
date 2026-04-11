import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import { z } from 'zod';

import { LOCALES, type Locale } from '@/lib/i18n';
import { IGroupedPosts, IPost } from '@/types/post';

export const CONTENT_PATH = path.join(process.cwd(), 'src', 'content');
export const BLOG_URL = 'https://minwoo.cloud';

export const PostFrontmatterSchema = z.object({
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	description: z.string(),
	featured: z.boolean().optional(),
	series: z.string().optional(),
	tags: z.array(z.string()).optional(),
	thumbnail: z.string().optional(),
	title: z.string(),
	translationKey: z.string().optional(),
});

function getLocaleDirectory({
	contentPath = CONTENT_PATH,
	locale,
}: {
	contentPath?: string;
	locale: Locale;
}) {
	return path.join(contentPath, locale);
}

function getLocalePostPaths({
	contentPath = CONTENT_PATH,
	locale,
}: {
	contentPath?: string;
	locale: Locale;
}) {
	const directory = getLocaleDirectory({ contentPath, locale });
	if (!fs.existsSync(directory)) {
		return [];
	}

	return fs
		.readdirSync(directory)
		.filter((file) => file.endsWith('.mdx'))
		.map((file) => path.join(directory, file));
}

function estimateReadingTime({ content, locale }: { content: string; locale: Locale }) {
	const words = content.trim().split(/\s+/).filter(Boolean).length;
	const wordsPerMinute = locale === 'ko' ? 260 : 220;

	return Math.max(1, Math.round(words / wordsPerMinute));
}

function sortPosts(posts: IPost[]) {
	return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function getSeriesLabel({
	series,
	tags,
}: {
	series: string | undefined;
	tags: string[] | undefined;
}) {
	if (series?.trim()) {
		return series;
	}

	return tags?.[0] ?? 'Archive';
}

export function buildPostFromSource({
	fileContents,
	locale,
	slug,
	sourcePath,
}: {
	fileContents: string;
	locale: Locale;
	slug: string;
	sourcePath: string;
}): IPost | null {
	const { content, data } = matter(fileContents);
	const parsed = PostFrontmatterSchema.safeParse({
		date: data.date,
		description: data.description,
		featured: data.featured,
		series: data.series,
		tags: data.tags,
		thumbnail: data.thumbnail,
		title: data.title,
		translationKey: data.translationKey,
	});

	if (!parsed.success) {
		console.error(`Invalid metadata in ${sourcePath}`, parsed.error);
		return null;
	}

	return {
		date: parsed.data.date,
		description: parsed.data.description,
		featured: parsed.data.featured ?? false,
		href: `/${locale}/blog/${slug}`,
		locale,
		readingTimeMinutes: estimateReadingTime({ content, locale }),
		series: getSeriesLabel({
			series: parsed.data.series,
			tags: parsed.data.tags,
		}),
		slug,
		sourcePath,
		tags: parsed.data.tags ?? [],
		thumbnail: parsed.data.thumbnail,
		title: parsed.data.title,
		translationKey: parsed.data.translationKey ?? slug,
	};
}

function parsePostFile({ filePath, locale }: { filePath: string; locale: Locale }): IPost | null {
	const fileContents = fs.readFileSync(filePath, 'utf8');
	const slug = path.basename(filePath, '.mdx');

	return buildPostFromSource({
		fileContents,
		locale,
		slug,
		sourcePath: filePath,
	});
}

function loadPosts({
	contentPath = CONTENT_PATH,
	locale,
}: {
	contentPath?: string;
	locale: Locale;
}) {
	return sortPosts(
		getLocalePostPaths({ contentPath, locale })
			.map((filePath) => parsePostFile({ filePath, locale }))
			.filter((post): post is IPost => post !== null),
	);
}

export function getAllPosts(contentPath = CONTENT_PATH) {
	return sortPosts(LOCALES.flatMap((locale) => loadPosts({ contentPath, locale })));
}

export function getPostsByLocale(locale: Locale, contentPath = CONTENT_PATH) {
	return loadPosts({ contentPath, locale });
}

export function getPostByLocaleAndSlug({
	contentPath = CONTENT_PATH,
	locale,
	slug,
}: {
	contentPath?: string;
	locale: Locale;
	slug: string;
}) {
	return loadPosts({ contentPath, locale }).find((post) => post.slug === slug) ?? null;
}

export function getPostBySlug({
	contentPath = CONTENT_PATH,
	slug,
}: {
	contentPath?: string;
	slug: string;
}) {
	return getAllPosts(contentPath).find((post) => post.slug === slug) ?? null;
}

export function getPostDocument({
	contentPath = CONTENT_PATH,
	locale,
	slug,
}: {
	contentPath?: string;
	locale: Locale;
	slug: string;
}) {
	const post = getPostByLocaleAndSlug({
		contentPath,
		locale,
		slug,
	});
	if (!post) {
		return null;
	}

	const fileContents = fs.readFileSync(post.sourcePath, 'utf8');
	const { content } = matter(fileContents);

	return {
		content,
		post,
	};
}

export function getAlternatePosts({
	contentPath = CONTENT_PATH,
	post,
}: {
	contentPath?: string;
	post: IPost;
}) {
	return getAllPosts(contentPath).filter(
		(candidate) =>
			candidate.translationKey === post.translationKey && candidate.locale !== post.locale,
	);
}

export function getGroupedPosts(posts: IPost[]): IGroupedPosts[] {
	const groups = new Map<string, IPost[]>();

	for (const post of posts) {
		if (!groups.has(post.series)) {
			groups.set(post.series, []);
		}

		groups.get(post.series)?.push(post);
	}

	return Array.from(groups.entries())
		.map(([name, seriesPosts]) => ({
			name,
			posts: sortPosts(seriesPosts),
		}))
		.sort(
			(a, b) =>
				new Date(b.posts[0]?.date ?? 0).getTime() - new Date(a.posts[0]?.date ?? 0).getTime(),
		);
}
