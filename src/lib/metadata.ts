import { Metadata } from 'next';

import { BLOG_URL } from '@/lib/post';

const baseTitle = 'Minwoo.Roh | Web Developer';
const baseDescription =
	'Seasoned in React.js & Experienced Nest.js | Problem-Solver Exploring Complex Domains';
const baseThumbnail = '/og.png';

type TInput = {
	description?: string;
	thumbnail?: string;
	title?: string;
	url?: string;
};

export const generateMetadata = (input?: TInput): Metadata => {
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
