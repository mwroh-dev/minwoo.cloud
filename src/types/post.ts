import type { Locale } from '@/lib/i18n';

export interface IPost {
	date: string;
	description: string;
	featured: boolean;
	href: string;
	locale: Locale;
	readingTimeMinutes: number;
	series: string;
	slug: string;
	sourcePath: string;
	tags: string[];
	thumbnail?: string;
	title: string;
	translationKey: string;
}

export interface IGroupedPosts {
	name: string;
	posts: IPost[];
}
