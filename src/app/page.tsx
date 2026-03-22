import Link from 'next/link';

export default function Home() {
	return (
		<section className="px-6 pb-20 pt-20 sm:px-8 sm:pt-24">
			<div className="mx-auto grid min-h-[calc(100svh-96px)] max-w-6xl gap-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
				<div className="space-y-8">
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
					<div className="flex flex-wrap items-center gap-6 pt-4">
						<Link
							href="/blog"
							className="inline-flex items-center gap-3 border-b border-stone-900 pb-1 text-sm uppercase tracking-[0.24em] text-stone-950 transition-colors duration-200 hover:border-orange-700 hover:text-orange-700"
						>
							Enter writings
						</Link>
						<Link
							href="/en/blog"
							className="text-sm uppercase tracking-[0.24em] text-stone-500 transition-colors duration-200 hover:text-stone-950"
						>
							English edition
						</Link>
						<Link
							href="/ko/blog"
							className="text-sm uppercase tracking-[0.24em] text-stone-500 transition-colors duration-200 hover:text-stone-950"
						>
							Korean edition
						</Link>
					</div>
				</div>

				<div className="space-y-8 border-t border-stone-300 pt-6 lg:pb-6">
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
		</section>
	);
}
