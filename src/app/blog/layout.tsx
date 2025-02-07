import { Metadata } from 'next';
import { Geist_Mono } from 'next/font/google';

import { generateMetadata } from '@/lib/metadata';

export const metadata: Metadata = generateMetadata({
	title: 'Minwoo.Roh | Blog',
	description:
		'Sharing challenges and lessons from web development, along with small insights from solving complex problems.',
});

const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export default function BlogLayout({ children }: { children: React.ReactNode }) {
	return (
		<section className={`pt-12 min-h-[calc(100vh-72px)] ${geistMono.variable}`}>{children}</section>
	);
}
