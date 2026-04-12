import { MetadataRoute } from 'next';

import { BLOG_URL, getAllPosts } from '@/lib/post';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const posts = await getAllPosts();
	const modified = posts.map(post => ({
		url: `${BLOG_URL}${post.href}`,
		lastModified: new Date(post.date).toISOString(),
	}));

	return [
		...modified,
		{ url: `${BLOG_URL}/`, lastModified: new Date().toISOString() },
		{ url: `${BLOG_URL}/blog`, lastModified: new Date().toISOString() },
		{ url: `${BLOG_URL}/en/blog`, lastModified: new Date().toISOString() },
		{ url: `${BLOG_URL}/ko/blog`, lastModified: new Date().toISOString() },
	];
}
