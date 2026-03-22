import Link from 'next/link';

import { BLOG_COPY, LOCALE_LABEL, LOCALES, type Locale } from '@/lib/i18n';
import { IPost } from '@/types/post';

type BlogDirectoryProps = {
	postsByLocale: Record<Locale, IPost[]>;
};

export default function BlogDirectory({ postsByLocale }: BlogDirectoryProps) {
	return (
		<section className="px-6 pb-20 pt-28 sm:px-8">
			<div className="mx-auto max-w-6xl">
				<div className="flex flex-col gap-6 border-t border-stone-300 pt-4">
					<p className="text-xs uppercase tracking-[0.28em] text-stone-500">
						{BLOG_COPY.en.portalLabel}
					</p>
					<div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr]">
						<div className="space-y-6">
							<h1 className="max-w-4xl font-serif text-4xl leading-[0.95] text-stone-950 sm:text-6xl">
								{BLOG_COPY.en.portalTitle}
							</h1>
							<p className="max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
								{BLOG_COPY.en.portalDescription}
							</p>
						</div>
						<ul className="space-y-3 border-t border-stone-200 pt-4 text-sm leading-6 text-stone-600 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
							{BLOG_COPY.en.focus.map((item) => (
								<li key={item}>{item}</li>
							))}
						</ul>
					</div>
				</div>

				<div className="mt-20 grid gap-16 lg:grid-cols-2">
					{LOCALES.map((locale) => {
						const posts = postsByLocale[locale];
						const latest = posts[0];
						const copy = BLOG_COPY[locale];

						return (
							<section key={locale} className="border-t border-stone-300 pt-5">
								<div className="flex items-baseline justify-between gap-4">
									<p className="text-sm uppercase tracking-[0.26em] text-stone-500">
										{LOCALE_LABEL[locale]}
									</p>
									<span className="text-xs text-stone-500">
										{latest ? copy.statusActive : copy.statusSoon}
									</span>
								</div>
								<div className="mt-8 space-y-4">
									<h2 className="font-serif text-3xl leading-tight text-stone-950">
										{copy.title}
									</h2>
									<p className="max-w-xl text-base leading-7 text-stone-600">
										{copy.description}
									</p>
								</div>
								<div className="mt-10 border-t border-stone-200 pt-5">
									<p className="text-xs uppercase tracking-[0.22em] text-stone-500">
										{copy.portalPublishedCount(posts.length)}
									</p>
									{latest ? (
										<div className="mt-5 space-y-2">
											<p className="text-sm text-stone-500">{copy.portalLatestLabel}</p>
											<p className="font-serif text-2xl text-stone-950">{latest.title}</p>
											<p className="max-w-lg text-sm leading-6 text-stone-600">
												{latest.description}
											</p>
										</div>
									) : (
										<p className="mt-5 max-w-lg text-sm leading-6 text-stone-600">
											{copy.portalNoPosts}
										</p>
									)}
								</div>
								<div className="mt-10">
									<Link
										href={`/${locale}/blog`}
										className="inline-flex items-center gap-3 border-b border-stone-900 pb-1 text-sm uppercase tracking-[0.24em] text-stone-950 transition-colors duration-200 hover:text-orange-700 hover:border-orange-700"
									>
										{copy.portalOpenLabel} {LOCALE_LABEL[locale]}
									</Link>
								</div>
							</section>
						);
					})}
				</div>
			</div>
		</section>
	);
}
