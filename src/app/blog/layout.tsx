import { Metadata } from 'next';

import { generateMetadata } from '@/lib/metadata';

export const metadata: Metadata = generateMetadata({
	title: 'Minwoo Roh | Writings',
	description:
		'A bilingual editorial blog about AI-native software work, systems taste, and durable developer judgment.',
});

export default function BlogLayout({ children }: { children: React.ReactNode }) {
	return <section className="min-h-[calc(100vh-73px)]">{children}</section>;
}
