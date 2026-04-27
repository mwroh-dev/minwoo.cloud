import React from 'react';

import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { evaluate } from '@mdx-js/mdx';
import { MDXComponents } from 'mdx/types';
import * as runtime from 'react/jsx-runtime';
import rehypePrism from 'rehype-prism-plus';
import remarkGfm from 'remark-gfm';

import { BLOG_COPY } from '@/lib/i18n';
import { buildMetadata } from '@/lib/metadata';
import { BLOG_URL, getAllPosts, getPostDocument } from '@/lib/post';
import { getSafeHref, isExternalHttpHref } from '@/lib/security';

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const document = getPostDocument({ slug: decodeURIComponent(slug) });
	if (!document) {
		notFound();
	}

	return buildMetadata({
		description: document.post.description,
		thumbnail: document.post.thumbnail,
		title: `${document.post.title} | Minwoo Roh`,
		url: `${BLOG_URL}/blog/${document.post.slug}`,
	});
}

export async function generateStaticParams() {
	return getAllPosts().map(post => ({ slug: post.slug }));
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

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const document = getPostDocument({ slug: decodeURIComponent(slug) });
	if (!document) {
		notFound();
	}

	const { content, post } = document;
	const copy = BLOG_COPY;
	const compiledMDX = await evaluate(content, {
		...runtime,
		useMDXComponents: () => useMDXComponents(),
		remarkPlugins: [[remarkGfm, { singleTilde: false }]],
		rehypePlugins: [[rehypePrism, { ignoreMissing: true }]],
	});

	return (
		<section className="px-6 pb-20 pt-16 sm:px-8 sm:pt-20">
			<article className="mx-auto max-w-4xl" lang="ko">
				<Link
					href="/blog"
					className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.22em] text-stone-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-stone-950 hover:text-stone-950"
				>
					<ArrowLeft size={14} strokeWidth={1.8} />
					{copy.backToIndex}
				</Link>

				<header className="mt-8 border-t border-stone-300 pt-6">
					<p className="text-xs uppercase tracking-[0.24em] text-stone-500">{post.series}</p>
					<h1 className="mt-6 font-serif text-4xl leading-snug text-stone-950 sm:text-5xl sm:leading-snug">
						{post.title}
					</h1>
					<div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-stone-500">
						<span>
							{new Intl.DateTimeFormat('ko-KR', {
								day: 'numeric',
								month: 'short',
								year: 'numeric',
							}).format(new Date(`${post.date}T00:00:00`))}
						</span>
						<span>{post.readingTimeMinutes}분 읽기</span>
					</div>
					<aside className="mt-10 border-t border-stone-300 pt-5">
						<p className="font-serif text-base italic leading-8 text-stone-600">
							이 글은 작성자의 초안 아이디어를 LLM과의 심층 문답으로 확장하고, 최종적으로 작성자가
							검토·편집한 글입니다.
						</p>
					</aside>
				</header>

				<div className="blog-prose mt-12">{compiledMDX.default({})}</div>
			</article>
		</section>
	);
}
