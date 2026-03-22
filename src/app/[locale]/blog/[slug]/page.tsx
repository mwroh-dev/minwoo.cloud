import React from 'react';

import { MDXComponents } from 'mdx/types';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import * as runtime from 'react/jsx-runtime';
import rehypePrism from 'rehype-prism-plus';
import remarkGfm from 'remark-gfm';

import {
	getPostDateLabel,
	getReadingTimeLabel,
	isLocale,
	LOCALE_LABEL,
	type Locale,
} from '@/lib/i18n';
import { generateMetadata as generate } from '@/lib/metadata';
import { BLOG_URL, getAllPosts, getAlternatePosts, getPostDocument } from '@/lib/post';
import { evaluate } from '@mdx-js/mdx';

function useMDXComponents(components: MDXComponents = {}): MDXComponents {
	return {
		...components,
		a: ({ href, children }) => (
			<a
				href={href}
				className="transition-colors duration-200 hover:text-orange-700"
				target={href?.startsWith('http') ? '_blank' : undefined}
				rel={href?.startsWith('http') ? 'noreferrer' : undefined}
			>
				{children}
			</a>
		),
		blockquote: ({ children }) => <blockquote>{children}</blockquote>,
		li: ({ children }) => <li>{children}</li>,
	};
}

function getCanonicalUrl(locale: Locale, slug: string) {
	return `${BLOG_URL}/${locale}/blog/${slug}`;
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
	const { locale, slug } = await params;

	if (!isLocale(locale)) {
		notFound();
	}

	const document = getPostDocument(locale, decodeURIComponent(slug));

	if (!document) {
		notFound();
	}

	return generate({
		description: document.post.description,
		thumbnail: document.post.thumbnail,
		title: `${document.post.title} | Minwoo Roh`,
		url: getCanonicalUrl(locale, document.post.slug),
	});
}

export async function generateStaticParams() {
	return getAllPosts().map((post) => ({
		locale: post.locale,
		slug: post.slug,
	}));
}

export default async function LocalizedBlogPostPage({
	params,
}: {
	params: Promise<{ locale: string; slug: string }>;
}) {
	const { locale, slug } = await params;

	if (!isLocale(locale)) {
		notFound();
	}

	const document = getPostDocument(locale, decodeURIComponent(slug));

	if (!document) {
		notFound();
	}

	const { content, post } = document;
	const alternates = getAlternatePosts(post);
	const compiledMDX = await evaluate(content, {
		...runtime,
		useMDXComponents: () => useMDXComponents(),
		remarkPlugins: [[remarkGfm, { singleTilde: false }]],
		rehypePlugins: [[rehypePrism, { ignoreMissing: true }]],
	});

	return (
		<section className="px-6 pb-20 pt-16 sm:px-8 sm:pt-20">
			<article className="mx-auto max-w-3xl" lang={locale}>
				<Link
					href={`/${locale}/blog`}
					className="text-xs uppercase tracking-[0.24em] text-stone-500 transition-colors duration-200 hover:text-stone-950"
				>
					Back to {LOCALE_LABEL[locale]}
				</Link>

				<header className="mt-8 border-t border-stone-300 pt-6">
					<p className="text-xs uppercase tracking-[0.24em] text-stone-500">{post.series}</p>
					<h1 className="mt-6 font-serif text-4xl leading-tight text-stone-950 sm:text-6xl">
						{post.title}
					</h1>
					<div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-stone-500">
						<span>{getPostDateLabel(post.date, locale)}</span>
						<span>{getReadingTimeLabel(post.readingTimeMinutes, locale)}</span>
						<span>{LOCALE_LABEL[locale]}</span>
					</div>
					{alternates.length > 0 && (
						<div className="mt-4 flex flex-wrap gap-4 text-sm text-stone-500">
							{alternates.map((alternate) => (
								<Link
									key={alternate.href}
									href={alternate.href}
									className="transition-colors duration-200 hover:text-stone-950"
								>
									Read in {LOCALE_LABEL[alternate.locale]}
								</Link>
							))}
						</div>
					)}
					<p className="mt-8 text-lg leading-8 text-stone-600">{post.description}</p>
				</header>

				<div className="blog-prose mt-12">{compiledMDX.default({})}</div>
			</article>
		</section>
	);
}
