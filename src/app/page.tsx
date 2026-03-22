import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

export default function Home() {
	return (
		<section className="px-6 pb-16 pt-14 sm:px-8 sm:pt-16">
			<div className="mx-auto grid min-h-[calc(100svh-140px)] max-w-6xl gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
				<div className="space-y-7 pt-4 sm:space-y-8">
					<p className="text-xs uppercase tracking-[0.3em] text-stone-500">
						Developer notes for the AI era
					</p>
					<h1 className="max-w-4xl font-serif text-5xl leading-[0.92] text-stone-950 sm:text-7xl">
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
						<div className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-white/70 p-1">
							<Link
								href="/blog"
								className="inline-flex min-w-12 items-center justify-center rounded-full bg-stone-950 px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] text-stone-50"
							>
								KO
							</Link>
							<Link
								href="/en/blog"
								className="inline-flex min-w-12 items-center justify-center rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] text-stone-600 transition-colors duration-200 hover:bg-stone-100 hover:text-stone-950"
							>
								EN
							</Link>
						</div>
					</div>
				</div>

				<div className="space-y-7 border-t border-stone-300 pt-6 lg:mt-8">
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
					<Link
						href="/blog/survivorship-bias-and-failure-hooks"
						className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/80 px-4 py-2 text-sm uppercase tracking-[0.22em] text-stone-950 transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-700 hover:text-orange-700"
					>
						Preview latest note
						<ArrowUpRight size={15} strokeWidth={1.8} />
					</Link>
				</div>
			</div>
		</section>
	);
}
