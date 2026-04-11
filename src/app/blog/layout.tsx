import { Metadata } from 'next';

import { DEFAULT_LOCALE, SITE_COPY } from '@/lib/i18n';
import { buildMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata({
	title: SITE_COPY[DEFAULT_LOCALE].metadata.blogTitle,
	description: SITE_COPY[DEFAULT_LOCALE].metadata.blogDescription,
});

export default function BlogLayout({ children }: { children: React.ReactNode }) {
	return <section className="min-h-[calc(100vh-73px)]">{children}</section>;
}
