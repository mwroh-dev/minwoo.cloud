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
							에이전트가 코드를 쓰는 시대에, 개발자는 무엇을 더 잘해야 하는지 계속
							생각하고 있습니다.
						</h1>
						<p className="max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
							저는 요즘 개발자의 경쟁력이 구현 속도보다 문제 정의, 작업 분해, 명세,
							그리고 결과를 설명 가능한 형태로 만드는 데서 갈린다고 생각합니다.
							이곳에는 개인의 사고를 더 또렷하게 만들고, 그 또렷함이 팀의 병목을
							어떻게 줄일 수 있는지에 대한 기록을 남기고 있습니다.
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
								요즘 자주 돌아오는 질문
							</p>
							<p className="font-serif text-2xl leading-tight text-stone-950">
								개인의 명확함은 결국 팀의 신뢰와 병목 감소로 이어질 수 있을까.
							</p>
						</div>
						<ul className="space-y-3 text-sm leading-6 text-stone-600">
							<li>원하는 결과를 어디까지 쪼개야 에이전트가 헛돌지 않는가.</li>
							<li>좋은 구현은 코드보다 먼저 어떤 조건과 범위에서 결정되는가.</li>
							<li>개인의 명확함은 어떻게 팀의 병목 감소로 이어지는가.</li>
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
