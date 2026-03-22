import { notFound, permanentRedirect } from 'next/navigation';

import BlogIndex from '@/components/blog/blog-index';
import { DEFAULT_LOCALE, getLocaleBlogPath, isLocale } from '@/lib/i18n';
import { getPostsByLocale } from '@/lib/post';

export default async function LocaleBlogPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;

	if (!isLocale(locale)) {
		notFound();
	}

	if (locale === DEFAULT_LOCALE) {
		permanentRedirect(getLocaleBlogPath(locale));
	}

	const posts = getPostsByLocale(locale);

	return <BlogIndex locale={locale} posts={posts} />;
}
