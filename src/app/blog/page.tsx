import BlogDirectory from '@/components/blog/blog-directory';
import { getPostsByLocale } from '@/lib/post';

export default function BlogPage() {
	const postsByLocale = {
		en: getPostsByLocale('en'),
		ko: getPostsByLocale('ko'),
	};

	return <BlogDirectory postsByLocale={postsByLocale} />;
}
