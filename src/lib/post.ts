import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import { z } from 'zod';

import { IGroupedPosts, IPost } from '@/types/post';

export const CONTENT_PATH = path.join(process.cwd(), 'src', 'content');
export const BLOG_URL = 'https://minwoo.cloud';

const WORDS_PER_MINUTE = 260;

const PostFrontmatterSchema = z.object({
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	description: z.string(),
	featured: z.boolean().optional(),
	series: z.string().optional(),
	tags: z.array(z.string()).optional(),
	thumbnail: z.string().optional(),
	title: z.string(),
});

function getPostPaths({ contentPath = CONTENT_PATH }: { contentPath?: string }) {
	if (!fs.existsSync(contentPath)) {
		return [];
	}

	return fs
		.readdirSync(contentPath, { withFileTypes: true })
		.filter(entry => entry.isFile() && entry.name.endsWith('.mdx'))
		.map(entry => path.join(contentPath, entry.name));
}

function estimateReadingTime(content: string) {
	const words = content.trim().split(/\s+/).filter(Boolean).length;

	return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
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
	slug,
	sourcePath,
}: {
	fileContents: string;
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
	});

	if (!parsed.success) {
		console.error(`Invalid metadata in ${sourcePath}`, parsed.error);
		return null;
	}

	return {
		date: parsed.data.date,
		description: parsed.data.description,
		featured: parsed.data.featured ?? false,
		href: `/blog/${slug}`,
		readingTimeMinutes: estimateReadingTime(content),
		series: getSeriesLabel({ series: parsed.data.series, tags: parsed.data.tags }),
		slug,
		sourcePath,
		tags: parsed.data.tags ?? [],
		thumbnail: parsed.data.thumbnail,
		title: parsed.data.title,
	};
}

function parsePostFile(filePath: string): IPost | null {
	const fileContents = fs.readFileSync(filePath, 'utf8');
	const slug = path.basename(filePath, '.mdx');

	return buildPostFromSource({ fileContents, slug, sourcePath: filePath });
}

function loadPosts(contentPath = CONTENT_PATH) {
	return sortPosts(
		getPostPaths({ contentPath })
			.map(filePath => parsePostFile(filePath))
			.filter((post): post is IPost => post !== null),
	);
}

export function getAllPosts(contentPath = CONTENT_PATH) {
	return loadPosts(contentPath);
}

export function getPostBySlug({
	contentPath = CONTENT_PATH,
	slug,
}: {
	contentPath?: string;
	slug: string;
}) {
	return getAllPosts(contentPath).find(post => post.slug === slug) ?? null;
}

export function getPostDocument({
	contentPath = CONTENT_PATH,
	slug,
}: {
	contentPath?: string;
	slug: string;
}) {
	const post = getPostBySlug({ contentPath, slug });
	if (!post) {
		return null;
	}

	const fileContents = fs.readFileSync(post.sourcePath, 'utf8');
	const { content } = matter(fileContents);

	return { content, post };
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
		.map(([name, seriesPosts]) => ({ name, posts: sortPosts(seriesPosts) }))
		.sort(
			(a, b) =>
				new Date(b.posts[0]?.date ?? 0).getTime() - new Date(a.posts[0]?.date ?? 0).getTime(),
		);
}
