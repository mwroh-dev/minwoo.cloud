import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

export default function Home() {
	return (
		<section className="px-6 pb-16 pt-14 sm:px-8 sm:pt-16">
			<div className="mx-auto flex min-h-[calc(100svh-132px)] max-w-6xl flex-col">
				<div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
					<div className="max-w-4xl space-y-7 pt-2 sm:space-y-8">
						<p className="text-xs uppercase tracking-[0.3em] text-stone-500">
							Developer notes for the AI era
						</p>
						<h1 className="font-serif text-5xl leading-[0.92] text-stone-950 sm:text-7xl">
							Writing about how developers stay sharp when agents can already ship.
						</h1>
						<p className="max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
							Cielo.dev is shifting from a career archive into a quieter editorial home for essays
							on judgment, systems taste, and durable developer leverage.
						</p>
						<div className="flex flex-wrap items-center gap-4 pt-2">
							<Link
								href="/blog"
								className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm uppercase tracking-[0.22em] text-stone-50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-700"
							>
								Read writings
								<ArrowRight size={16} strokeWidth={1.8} />
							</Link>
						</div>
					</div>
				</div>

				<div className="flex flex-1 items-center py-8 sm:py-10 lg:py-12">
					<div className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-stone-200/80 bg-stone-100/60 shadow-[0_18px_40px_rgba(28,25,23,0.08)]">
						<video
							autoPlay
							muted
							loop
							playsInline
							className="h-[180px] w-full object-cover sm:h-[220px] lg:h-[250px]"
						>
							<source src="/cielo.mp4" type="video/mp4" />
						</video>
						<div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[rgba(246,242,234,0.14)] via-transparent to-[rgba(246,242,234,0.28)]" />
					</div>
				</div>

				<div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
					<div className="flex items-start">
						<Link
							href="/blog/survivorship-bias-and-failure-hooks"
							className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/80 px-4 py-2 text-sm uppercase tracking-[0.22em] text-stone-950 transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-700 hover:text-orange-700"
						>
							Preview latest note
							<ArrowUpRight size={15} strokeWidth={1.8} />
						</Link>
					</div>

					<div className="space-y-7 border-t border-stone-300 pt-6 lg:ml-auto lg:max-w-xl">
						<div className="space-y-2">
							<p className="text-xs uppercase tracking-[0.24em] text-stone-500">Now focusing</p>
							<p className="font-serif text-2xl leading-tight text-stone-950">
								Agent-native workflow design, long-term career signals, and the parts of software
								work that still reward taste.
							</p>
						</div>
						<ul className="space-y-3 text-sm leading-6 text-stone-600">
							<li>How to stay useful when code generation becomes table stakes.</li>
							<li>Why product judgment and operational thinking matter more than ever.</li>
							<li>What kind of technical depth compounds in an AI-saturated market.</li>
						</ul>
					</div>
				</div>
			</div>
		</section>
	);
}
