import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

import { getBlogPostPath, SITE_COPY } from '@/lib/i18n';

export default function Home() {
	const defaultHomeCopy = SITE_COPY.home;
	const questionItems = defaultHomeCopy.questionItems.map(item => <li key={item}>{item}</li>);

	return (
		<section className="px-6 pb-16 pt-10 sm:px-8 sm:pt-12">
			<div className="mx-auto flex min-h-[calc(100svh-128px)] max-w-6xl flex-col">
				<div className="flex flex-1 items-center justify-center">
					<div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-[2.2rem] border border-stone-200/80 bg-stone-100/60 shadow-[0_24px_60px_rgba(28,25,23,0.08)]">
						<video
							autoPlay
							muted
							loop
							playsInline
							className="h-[220px] w-full object-cover sm:h-[280px] lg:h-[340px]"
						>
							<source src="/cielo.mp4" type="video/mp4" />
						</video>
						<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[rgba(246,242,234,0.08)] via-transparent to-[rgba(246,242,234,0.2)]" />
					</div>
				</div>

				<div className="grid gap-10 border-t border-stone-300 pt-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
					<div className="max-w-4xl space-y-7">
						<p className="text-xs uppercase tracking-[0.3em] text-stone-500">
							{defaultHomeCopy.eyebrow}
						</p>
						<h1 className="font-serif text-5xl leading-[0.92] text-stone-950 sm:text-7xl">
							{defaultHomeCopy.title}
						</h1>
						<p className="max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
							{defaultHomeCopy.description}
						</p>
						<div className="flex flex-wrap items-center gap-4 pt-2">
							<Link
								href="/blog"
								className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm uppercase tracking-[0.22em] text-stone-50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-700"
							>
								{defaultHomeCopy.ctaLabel}
								<ArrowRight size={16} strokeWidth={1.8} />
							</Link>
						</div>
					</div>

					<div className="space-y-7 lg:ml-auto lg:max-w-xl">
						<div className="space-y-2">
							<p className="text-xs uppercase tracking-[0.24em] text-stone-500">
								{defaultHomeCopy.questionEyebrow}
							</p>
							<p className="font-serif text-2xl leading-tight text-stone-950">
								{defaultHomeCopy.questionTitle}
							</p>
						</div>
						<ul className="space-y-3 text-sm leading-6 text-stone-600">{questionItems}</ul>
						<Link
							href={getBlogPostPath({ slug: 'growth-team-mindset' })}
							className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/80 px-4 py-2 text-sm uppercase tracking-[0.22em] text-stone-950 transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-700 hover:text-orange-700"
						>
							{defaultHomeCopy.previewLabel}
							<ArrowUpRight size={15} strokeWidth={1.8} />
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
