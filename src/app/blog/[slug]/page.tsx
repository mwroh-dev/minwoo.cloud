import { notFound, permanentRedirect } from 'next/navigation';

import { getPostBySlug } from '@/lib/post';

export default async function LegacyBlogPostPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const post = getPostBySlug({ slug: decodeURIComponent(slug) });

	if (!post) {
		notFound();
	}

	permanentRedirect(post.href);
}
