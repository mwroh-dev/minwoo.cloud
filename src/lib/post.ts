import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import { z } from 'zod';

import { LOCALES, type Locale } from '@/lib/i18n';
import { IGroupedPosts, IPost } from '@/types/post';

export const CONTENT_PATH = path.join(process.cwd(), 'src', 'content');
export const BLOG_URL = 'https://minwoo.cloud';

const PostSchema = z.object({
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	description: z.string(),
	featured: z.boolean().optional(),
	series: z.string().optional(),
	tags: z.array(z.string()).optional(),
	thumbnail: z.string().optional(),
	title: z.string(),
	translationKey: z.string().optional(),
});

function getLocaleDirectory(locale: Locale) {
	return path.join(CONTENT_PATH, locale);
}

function getLocalePostPaths(locale: Locale) {
	const directory = getLocaleDirectory(locale);
	if (!fs.existsSync(directory)) {
		return [];
	}

	return fs
		.readdirSync(directory)
		.filter((file) => file.endsWith('.mdx'))
		.map((file) => path.join(directory, file));
}

function estimateReadingTime(content: string, locale: Locale) {
	const words = content.trim().split(/\s+/).filter(Boolean).length;
	const wordsPerMinute = locale === 'ko' ? 260 : 220;

	return Math.max(1, Math.round(words / wordsPerMinute));
}

function sortPosts(posts: IPost[]) {
	return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function getSeriesLabel(series: string | undefined, tags: string[] | undefined) {
	if (series?.trim()) {
		return series;
	}

	return tags?.[0] ?? 'Archive';
}

function parsePostFile(filePath: string, locale: Locale): IPost | null {
	const fileContents = fs.readFileSync(filePath, 'utf8');
	const { content, data } = matter(fileContents);
	const slug = path.basename(filePath, '.mdx');

	const parsed = PostSchema.safeParse({
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
		console.error(`Invalid metadata in ${filePath}`, parsed.error);
		return null;
	}

	return {
		date: parsed.data.date,
		description: parsed.data.description,
		featured: parsed.data.featured ?? false,
		href: `/${locale}/blog/${slug}`,
		locale,
		readingTimeMinutes: estimateReadingTime(content, locale),
		series: getSeriesLabel(parsed.data.series, parsed.data.tags),
		slug,
		sourcePath: filePath,
		tags: parsed.data.tags ?? [],
		thumbnail: parsed.data.thumbnail,
		title: parsed.data.title,
		translationKey: parsed.data.translationKey ?? slug,
	};
}

function loadPosts(locale: Locale) {
	return sortPosts(
		getLocalePostPaths(locale)
			.map((filePath) => parsePostFile(filePath, locale))
			.filter((post): post is IPost => post !== null)
	);
}

export function getAllPosts() {
	return sortPosts(LOCALES.flatMap((locale) => loadPosts(locale)));
}

export function getPostsByLocale(locale: Locale) {
	return loadPosts(locale);
}

export function getPostByLocaleAndSlug(locale: Locale, slug: string) {
	return loadPosts(locale).find((post) => post.slug === slug) ?? null;
}

export function getPostBySlug(slug: string) {
	return getAllPosts().find((post) => post.slug === slug) ?? null;
}

export function getPostDocument(locale: Locale, slug: string) {
	const post = getPostByLocaleAndSlug(locale, slug);
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

export function getAlternatePosts(post: IPost) {
	return getAllPosts().filter(
		(candidate) =>
			candidate.translationKey === post.translationKey && candidate.locale !== post.locale
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
				new Date(b.posts[0]?.date ?? 0).getTime() - new Date(a.posts[0]?.date ?? 0).getTime()
		);
}
