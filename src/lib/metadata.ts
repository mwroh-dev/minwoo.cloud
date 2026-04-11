import { Metadata } from 'next';

import { DEFAULT_LOCALE, SITE_COPY } from '@/lib/i18n';
import { BLOG_URL } from '@/lib/post';

const defaultMetadataCopy = SITE_COPY[DEFAULT_LOCALE].metadata;
const baseThumbnail = '/og.png';

export const buildMetadata = (input?: {
	description?: string;
	thumbnail?: string;
	title?: string;
	url?: string;
}): Metadata => {
	const description = input?.description || defaultMetadataCopy.baseDescription;
	const thumbnail = input?.thumbnail || baseThumbnail;
	const title = input?.title || defaultMetadataCopy.baseTitle;
	const url = input?.url || BLOG_URL;

	const isProd = process.env.NODE_ENV === 'production';
	const metadataBase = new URL(isProd ? BLOG_URL : 'http://localhost:3000');

	return {
		metadataBase,
		title,
		description,
		openGraph: {
			title,
			description,
			url,
			type: 'website',
			images: [
				{
					url: thumbnail,
					width: 1200,
					height: 630,
					alt: title,
				},
			],
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
		},
	};
};
