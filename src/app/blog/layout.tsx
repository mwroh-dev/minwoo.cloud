import { Metadata } from 'next';

import { SITE_COPY } from '@/lib/i18n';
import { buildMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata({
	title: SITE_COPY.metadata.blogTitle,
	description: SITE_COPY.metadata.blogDescription,
});

export default function BlogLayout({ children }: { children: React.ReactNode }) {
	return <section className="min-h-0 flex-1">{children}</section>;
}
