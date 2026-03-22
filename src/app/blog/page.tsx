import BlogIndex from '@/components/blog/blog-index';
import { getPostsByLocale } from '@/lib/post';

export default function BlogPage() {
	const posts = getPostsByLocale('ko');

	return <BlogIndex locale="ko" posts={posts} />;
}
