export const SITE_COPY = {
	footer: {
		copyright: 'Copyright © 2026 Minwoo Roh',
		description: 'AI와 함께 일하기 위한 기준과 맥락을 정리합니다.',
		githubAriaLabel: '깃허브',
		linkedinAriaLabel: '링크드인',
		title: 'Cielo.dev',
	},
	header: { homeLabel: '홈', writingsLabel: '기록' },
	home: {
		ctaLabel: '글 읽기',
		eyebrow: 'AI 시대의 판단 기록',
		previewLabel: '최신 글 미리 보기',
		questionEyebrow: '요즘 자주 생각하는 질문',
		questionItems: [
			'원하는 결과를 어디까지 쪼개야 에이전트가 헛돌지 않는가.',
			'좋은 구현은 코드보다 먼저 어떤 조건과 범위에서 결정되는가.',
			'개인의 명확함은 어떻게 팀의 병목 감소로 이어지는가.',
		],
		questionTitle: '사람의 판단은 에이전트 실행의 어디에 남아야 할까.',
		title: '에이전트에게 맡길수록, 무엇을 먼저 정해야 하는지 배웁니다.',
		description:
			'에이전트가 실행을 맡는 시대에는 사람의 판단이 실행의 앞과 뒤에 더 선명하게 남아야 한다고 생각합니다. 이곳에는 기준을 세우고, 제약을 정하고, 결과를 검증 가능한 흐름으로 남기는 과정을 기록합니다.',
	},
	metadata: {
		baseDescription: 'AI와 함께 일하기 위한 기준, 맥락, 검증 흐름에 대한 기록.',
		baseTitle: 'Minwoo Roh | AI 시대의 판단 기록',
		blogDescription: 'AI와 함께 일하기 위한 기준, 맥락, 검증 흐름에 대한 기록.',
		blogTitle: 'Minwoo Roh | Writings',
	},
};

export const BLOG_COPY = {
	backToIndex: '목록으로 돌아가기',
	description:
		'에이전트가 실행을 맡는 시대에는 사람의 판단이 실행의 앞과 뒤에 더 선명하게 남아야 한다고 생각합니다. 이곳에는 기준을 세우고, 제약을 정하고, 결과를 검증 가능한 흐름으로 남기는 과정을 기록합니다.',
	emptyDescription:
		'구조는 먼저 준비해두었습니다. 한국어 에세이와 노트는 이 리뉴얼 방향에 맞춰 곧 채워질 예정입니다.',
	emptyTitle: '한국어 에디션은 이제 막 틀을 잡고 있습니다.',
	eyebrow: '메모와 기록',
	featuredLabel: '대표 글',
	focus: [
		'원하는 결과를 어디까지 쪼개야 에이전트가 헛돌지 않는가.',
		'좋은 구현은 코드보다 먼저 어떤 조건과 범위에서 결정되는가.',
		'개인의 명확함은 어떻게 팀의 병목 감소로 이어지는가.',
	],
	readMore: '글 읽기',
	sectionLabel: '주제별 아카이브',
	title: '에이전트 시대의 판단력 키우기',
};

export function getPostDateLabel({ date }: { date: string }) {
	return new Intl.DateTimeFormat('ko-KR', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	}).format(new Date(`${date}T00:00:00`));
}

export function getReadingTimeLabel({ minutes }: { minutes: number }) {
	return `${minutes}분 읽기`;
}

export function getBlogPostPath({ slug }: { slug: string }) {
	return `/blog/${slug}`;
}
