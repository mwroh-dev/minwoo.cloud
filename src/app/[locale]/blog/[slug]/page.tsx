import React from 'react';

import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { evaluate } from '@mdx-js/mdx';
import { MDXComponents } from 'mdx/types';
import * as runtime from 'react/jsx-runtime';
import rehypePrism from 'rehype-prism-plus';
import remarkGfm from 'remark-gfm';

import LanguageToggle from '@/components/blog/language-toggle';
import {
	BLOG_COPY,
	LOCALES,
	LOCALE_CODE_LABEL,
	getLocaleBlogPath,
	getPostDateLabel,
	getReadingTimeLabel,
	isLocale,
	LOCALE_LABEL,
	type Locale,
} from '@/lib/i18n';
import { buildMetadata } from '@/lib/metadata';
import { BLOG_URL, getAllPosts, getAlternatePosts, getPostDocument } from '@/lib/post';
import { getSafeHref, isExternalHttpHref } from '@/lib/security';

function getCanonicalUrl({ locale, slug }: { locale: Locale; slug: string }) {
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
	const document = getPostDocument({ locale, slug: decodeURIComponent(slug) });
	if (!document) {
		notFound();
	}

	return buildMetadata({
		description: document.post.description,
		thumbnail: document.post.thumbnail,
		title: `${document.post.title} | Minwoo Roh`,
		url: getCanonicalUrl({ locale, slug: document.post.slug }),
	});
}

export async function generateStaticParams() {
	return getAllPosts().map(post => ({ locale: post.locale, slug: post.slug }));
}

function useMDXComponents(components: MDXComponents = {}): MDXComponents {
	return {
		...components,
		a: ({ href, children }) => {
			const safeHref = getSafeHref(typeof href === 'string' ? href : undefined);
			const isExternalHref = isExternalHttpHref(safeHref);
			const rel = isExternalHref ? 'noopener noreferrer' : undefined;
			const target = isExternalHref ? '_blank' : undefined;

			return (
				<a
					href={safeHref}
					className="transition-colors duration-200 hover:text-orange-700"
					target={target}
					rel={rel}
				>
					{children}
				</a>
			);
		},
		blockquote: ({ children }) => <blockquote>{children}</blockquote>,
		li: ({ children }) => <li>{children}</li>,
	};
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
	const document = getPostDocument({ locale, slug: decodeURIComponent(slug) });
	if (!document) {
		notFound();
	}

	const { content, post } = document;
	const copy = BLOG_COPY[locale];
	const alternates = getAlternatePosts({ post });
	const alternateMap = new Map(alternates.map(alternate => [alternate.locale, alternate]));
	const translationToggleItems = LOCALES.map(candidateLocale => ({
		href: alternateMap.get(candidateLocale)?.href,
		isActive: candidateLocale === locale,
		isDisabled: candidateLocale !== locale && !alternateMap.get(candidateLocale)?.href,
		label: LOCALE_CODE_LABEL[candidateLocale],
	}));
	const alternateLinks = alternates.map(alternate => (
		<Link
			key={alternate.href}
			href={alternate.href}
			className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-white/80 px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-stone-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-700 hover:text-orange-700"
		>
			{LOCALE_LABEL[alternate.locale]}
			<ArrowUpRight size={14} strokeWidth={1.8} />
		</Link>
	));
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
					href={getLocaleBlogPath(locale)}
					className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.22em] text-stone-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-stone-950 hover:text-stone-950"
				>
					<ArrowLeft size={14} strokeWidth={1.8} />
					{copy.backToIndex}
				</Link>

				<header className="mt-8 border-t border-stone-300 pt-6">
					<p className="text-xs uppercase tracking-[0.24em] text-stone-500">{post.series}</p>
					<h1 className="mt-6 font-serif text-4xl leading-tight text-stone-950 sm:text-6xl">
						{post.title}
					</h1>
					<div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-stone-500">
						<span>{getPostDateLabel({ date: post.date, locale })}</span>
						<span>{getReadingTimeLabel({ locale, minutes: post.readingTimeMinutes })}</span>
						<span>{LOCALE_LABEL[locale]}</span>
					</div>
					<div className="mt-5">
						<LanguageToggle label={copy.translateLabel} items={translationToggleItems} />
					</div>
					<p className="mt-8 text-lg leading-8 text-stone-600">{post.description}</p>
				</header>

				<div className="blog-prose mt-12">{compiledMDX.default({})}</div>

				<div className="mt-14 border-t border-stone-200 pt-6">
					<div className="flex flex-wrap items-center gap-3">
						<span className="text-[11px] uppercase tracking-[0.24em] text-stone-500">
							{copy.readInLabel}
						</span>
						{alternates.length > 0 ? (
							alternateLinks
						) : (
							<span className="rounded-full border border-stone-200 px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-stone-300">
								{LOCALE_LABEL[locale]}
							</span>
						)}
					</div>
				</div>
			</article>
		</section>
	);
}
