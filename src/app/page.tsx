import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

export default function Home() {
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
							AI 시대 개발자 노트
						</p>
						<h1 className="font-serif text-5xl leading-[0.92] text-stone-950 sm:text-7xl">
							에이전트가 코드를 쓰는 시대에, 개발자가 어떤 감각으로 남아야 하는지 기록합니다.
						</h1>
						<p className="max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
							Cielo.dev는 예전 커리어 아카이브에서 벗어나, 판단력과 시스템 감각, 그리고
							반복 가능한 작업 습관을 다루는 에디토리얼 홈으로 바뀌고 있습니다.
						</p>
						<div className="flex flex-wrap items-center gap-4 pt-2">
							<Link
								href="/blog"
								className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm uppercase tracking-[0.22em] text-stone-50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-700"
							>
								글 읽기
								<ArrowRight size={16} strokeWidth={1.8} />
							</Link>
						</div>
					</div>

					<div className="space-y-7 lg:ml-auto lg:max-w-xl">
						<div className="space-y-2">
							<p className="text-xs uppercase tracking-[0.24em] text-stone-500">
								지금 붙잡고 있는 질문
							</p>
							<p className="font-serif text-2xl leading-tight text-stone-950">
								생산성 담론보다 더 오래 남는 건, 실패를 회수하고 감각으로 바꾸는 작업 방식인지
								모릅니다.
							</p>
						</div>
						<ul className="space-y-3 text-sm leading-6 text-stone-600">
							<li>코드 생성이 기본값이 된 뒤에도 개발자 레버리지는 어디에 남는가.</li>
							<li>좋은 레시피보다 실패를 붙잡는 기록 습관이 왜 더 중요해지는가.</li>
							<li>도구 활용을 넘어 실제 제품 감각과 운영 감각은 어떻게 쌓이는가.</li>
						</ul>
						<Link
							href="/blog/survivorship-bias-and-failure-hooks"
							className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/80 px-4 py-2 text-sm uppercase tracking-[0.22em] text-stone-950 transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-700 hover:text-orange-700"
						>
							최신 글 미리 보기
							<ArrowUpRight size={15} strokeWidth={1.8} />
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
