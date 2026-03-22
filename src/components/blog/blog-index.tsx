import Link from 'next/link';

import { ArrowRight, ArrowUpRight } from 'lucide-react';

import {
	BLOG_COPY,
	getLocaleBlogPath,
	getPostDateLabel,
	getReadingTimeLabel,
	LOCALE_CODE_LABEL,
	type Locale,
} from '@/lib/i18n';
import { getGroupedPosts } from '@/lib/post';
import { IPost } from '@/types/post';

import LanguageToggle from './language-toggle';

type BlogIndexProps = {
	locale: Locale;
	posts: IPost[];
};

export default function BlogIndex({ locale, posts }: BlogIndexProps) {
	const copy = BLOG_COPY[locale];
	const featuredPost = posts.find((post) => post.featured) ?? posts[0];
	const groupedPosts = getGroupedPosts(
		featuredPost && posts.length > 1
			? posts.filter((post) => post.slug !== featuredPost.slug)
			: posts
	);

	return (
		<section className="px-6 pb-20 pt-24 sm:px-8">
			<div className="mx-auto max-w-6xl">
				<div className="flex flex-col gap-6 border-t border-stone-300 pt-4">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
						<p className="text-xs uppercase tracking-[0.28em] text-stone-500">{copy.eyebrow}</p>
						<LanguageToggle
							label={copy.switchLabel}
							items={[
								{
									active: locale === 'ko',
									href: getLocaleBlogPath('ko'),
									label: LOCALE_CODE_LABEL.ko,
								},
								{
									active: locale === 'en',
									href: getLocaleBlogPath('en'),
									label: LOCALE_CODE_LABEL.en,
								},
							]}
						/>
					</div>
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
							{copy.focus.map((item) => (
								<li key={item}>{item}</li>
							))}
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
									{getPostDateLabel(featuredPost.date, locale)} /{' '}
									{getReadingTimeLabel(featuredPost.readingTimeMinutes, locale)}
								</p>
								<h2 className="max-w-2xl font-serif text-3xl leading-tight text-stone-950 sm:text-5xl">
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
					<p className="text-xs uppercase tracking-[0.22em] text-stone-500">
						{copy.sectionLabel}
					</p>
					<div className="mt-10 space-y-14">
						{groupedPosts.length > 0 ? (
							groupedPosts.map((group) => (
								<div
									key={group.name}
									className="grid gap-6 border-t border-stone-200 pt-5 lg:grid-cols-[220px_1fr]"
								>
									<h3 className="font-serif text-2xl text-stone-950">{group.name}</h3>
									<ul className="divide-y divide-stone-200">
										{group.posts.map((post) => (
											<li key={post.href}>
												<Link
													href={post.href}
													className="group grid gap-4 rounded-2xl px-4 py-4 transition-all duration-200 hover:translate-x-1 hover:bg-white/65 sm:grid-cols-[170px_1fr_auto]"
												>
													<div className="font-mono text-xs uppercase tracking-[0.22em] text-stone-500">
														<div>{getPostDateLabel(post.date, locale)}</div>
														<div className="mt-2">
															{getReadingTimeLabel(post.readingTimeMinutes, locale)}
														</div>
													</div>
													<div className="space-y-2">
														<p className="font-serif text-2xl leading-tight text-stone-950">
															{post.title}
														</p>
														<p className="max-w-2xl text-sm leading-6 text-stone-600">
															{post.description}
														</p>
													</div>
													<div className="hidden items-center justify-end text-stone-400 transition-colors duration-200 group-hover:text-orange-700 sm:flex">
														<ArrowRight size={18} strokeWidth={1.8} />
													</div>
												</Link>
											</li>
										))}
									</ul>
								</div>
							))
						) : (
							<div className="border-t border-stone-200 pt-5">
								<p className="max-w-2xl text-sm leading-6 text-stone-600">
									{copy.emptyDescription}
								</p>
							</div>
						)}
					</div>
				</section>
			</div>
		</section>
	);
}
