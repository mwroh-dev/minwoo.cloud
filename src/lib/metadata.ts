import { Metadata } from 'next';

import { BLOG_URL } from '@/lib/post';

const baseTitle = 'Minwoo Roh | AI-Era Developer Notes';
const baseDescription =
	'Editorial notes on software craft, AI-native workflows, and how developers stay useful as agents get stronger.';
const baseThumbnail = '/og.png';

type MetadataInput = {
	description?: string;
	thumbnail?: string;
	title?: string;
	url?: string;
};

export const buildMetadata = (input?: MetadataInput): Metadata => {
	const description = input?.description || baseDescription;
	const thumbnail = input?.thumbnail || baseThumbnail;
	const title = input?.title || baseTitle;
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
