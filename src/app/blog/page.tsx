import BlogIndex from '@/components/blog/blog-index';
import { getAllPosts } from '@/lib/post';

export default function BlogPage() {
	const posts = getAllPosts();

	return <BlogIndex posts={posts} />;
}
