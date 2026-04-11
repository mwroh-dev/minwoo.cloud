import './globals.css';

import type { Metadata } from 'next';
import { Geist, Geist_Mono, Newsreader } from 'next/font/google';

import Footer from '@/components/footer';
import Header from '@/components/header';
import { DEFAULT_LOCALE } from '@/lib/i18n';
import { buildMetadata } from '@/lib/metadata';
import { GoogleAnalytics as NextGA } from '@next/third-parties/google';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const newsreader = Newsreader({ variable: '--font-newsreader', subsets: ['latin'] });

export const metadata: Metadata = buildMetadata();

function GoogleAnalytics() {
	const isProd = process.env.NODE_ENV === 'production';
	if (!isProd) return null;

	const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS;
	if (!gaId) {
		return null;
	}

	return <NextGA gaId={gaId} />;
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html
			lang={DEFAULT_LOCALE}
			className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable}`}
			suppressHydrationWarning
		>
			<body>
				<main className="flex min-h-screen flex-col">
					<Header />
					{children}
					<Footer />
				</main>
			</body>
			<GoogleAnalytics />
		</html>
	);
}
