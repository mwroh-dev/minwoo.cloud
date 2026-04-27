import Link from 'next/link';

import { ArrowRight, ArrowUpRight } from 'lucide-react';

import { BLOG_COPY, getPostDateLabel, getReadingTimeLabel } from '@/lib/i18n';
import { getGroupedPosts } from '@/lib/post';
import { IGroupedPosts, IPost } from '@/types/post';

const copy = BLOG_COPY['ko'];

function ArchiveGroupSection({ group }: { group: IGroupedPosts }) {
	const postItems = group.posts.map(post => (
		<li key={post.href}>
			<Link
				href={post.href}
				className="group grid gap-4 rounded-2xl px-4 py-4 transition-all duration-200 hover:translate-x-1 hover:bg-white/65 sm:grid-cols-[170px_1fr_auto]"
			>
				<div className="font-mono text-xs uppercase tracking-[0.22em] text-stone-500">
					<div>{getPostDateLabel({ date: post.date })}</div>
					<div className="mt-2">{getReadingTimeLabel({ minutes: post.readingTimeMinutes })}</div>
				</div>
				<div className="space-y-2">
					<p className="font-serif text-2xl leading-snug text-stone-950">{post.title}</p>
					<p className="max-w-2xl text-sm leading-6 text-stone-600">{post.description}</p>
				</div>
				<div className="hidden items-center justify-end text-stone-400 transition-colors duration-200 group-hover:text-orange-700 sm:flex">
					<ArrowRight size={18} strokeWidth={1.8} />
				</div>
			</Link>
		</li>
	));

	return (
		<div className="grid gap-6 border-t border-stone-200 pt-5 lg:grid-cols-[220px_1fr]">
			<h3 className="font-serif text-2xl text-stone-950">{group.name}</h3>
			<ul className="divide-y divide-stone-200">{postItems}</ul>
		</div>
	);
}

function EmptyArchiveState({ message }: { message: string }) {
	return (
		<div className="border-t border-stone-200 pt-5">
			<p className="max-w-2xl text-sm leading-6 text-stone-600">{message}</p>
		</div>
	);
}

function renderArchiveContent({ message, posts }: { message: string; posts: IPost[] }) {
	if (posts.length === 0) {
		return <EmptyArchiveState message={message} />;
	}

	const groupedPosts = getGroupedPosts(posts);
	if (groupedPosts.length === 0) {
		return <EmptyArchiveState message={message} />;
	}

	return groupedPosts.map(group => <ArchiveGroupSection key={group.name} group={group} />);
}

export default function BlogIndex({ posts }: { posts: IPost[] }) {
	const featuredPost = posts.find(post => post.featured) ?? posts[0];
	const isSecondaryArchiveAvailable = Boolean(featuredPost) && posts.length > 1;
	const archivePosts = isSecondaryArchiveAvailable
		? posts.filter(post => post.slug !== featuredPost.slug)
		: posts;

	const archiveContent = renderArchiveContent({
		message: copy.emptyDescription,
		posts: archivePosts,
	});
	const focusItems = copy.focus.map(item => <li key={item}>{item}</li>);

	return (
		<section className="px-6 pb-20 pt-24 sm:px-8">
			<div className="mx-auto max-w-6xl">
				<div className="flex flex-col gap-6 border-t border-stone-300 pt-4">
					<p className="text-xs uppercase tracking-[0.28em] text-stone-500">{copy.eyebrow}</p>
					<div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr]">
						<div className="space-y-6">
							<h1 className="max-w-4xl font-serif text-4xl leading-[0.95] text-stone-950 sm:text-6xl">
								{copy.title}
							</h1>
							<p className="max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
								{copy.description}
							</p>
						</div>
						<ul className="space-y-3 border-t border-stone-200 pt-4 text-sm leading-6 text-stone-600 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
							{focusItems}
						</ul>
					</div>
				</div>

				{featuredPost ? (
					<section className="mt-18 border-t border-stone-300 pt-5 sm:mt-20">
						<p className="text-xs uppercase tracking-[0.22em] text-stone-500">
							{copy.featuredLabel}
						</p>
						<div className="mt-6 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
							<div className="space-y-3">
								<p className="text-sm text-stone-500">
									{getPostDateLabel({ date: featuredPost.date })} /{' '}
									{getReadingTimeLabel({ minutes: featuredPost.readingTimeMinutes })}
								</p>
								<h2 className="max-w-2xl font-serif text-3xl leading-snug text-stone-950 sm:text-5xl sm:leading-snug">
									{featuredPost.title}
								</h2>
							</div>
							<div className="space-y-5">
								<p className="max-w-xl text-base leading-7 text-stone-600">
									{featuredPost.description}
								</p>
								<Link
									href={featuredPost.href}
									className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/80 px-4 py-2 text-sm uppercase tracking-[0.22em] text-stone-950 transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-700 hover:text-orange-700"
								>
									{copy.readMore}
									<ArrowUpRight size={15} strokeWidth={1.8} />
								</Link>
							</div>
						</div>
					</section>
				) : (
					<section className="mt-20 border-t border-stone-300 pt-6">
						<h2 className="font-serif text-3xl text-stone-950">{copy.emptyTitle}</h2>
						<p className="mt-4 max-w-2xl text-base leading-7 text-stone-600">
							{copy.emptyDescription}
						</p>
					</section>
				)}

				<section className="mt-20 border-t border-stone-300 pt-5">
					<p className="text-xs uppercase tracking-[0.22em] text-stone-500">{copy.sectionLabel}</p>
					<div className="mt-10 space-y-14">{archiveContent}</div>
				</section>
			</div>
		</section>
	);
}
