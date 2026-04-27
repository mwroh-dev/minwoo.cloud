export interface IPost {
	date: string;
	description: string;
	featured: boolean;
	href: string;
	readingTimeMinutes: number;
	series: string;
	slug: string;
	sourcePath: string;
	tags: string[];
	thumbnail?: string;
	title: string;
}

export interface IGroupedPosts {
	name: string;
	posts: IPost[];
}
