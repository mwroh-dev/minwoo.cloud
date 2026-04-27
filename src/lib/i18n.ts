export const SITE_COPY = {
	footer: {
		copyright: 'Copyright © 2026 Minwoo Roh',
		description: '문제 정의와 협업, 그리고 AI 시대의 개발 작업 방식을 기록합니다.',
		githubAriaLabel: '깃허브',
		linkedinAriaLabel: '링크드인',
		title: 'Cielo.dev',
	},
	header: { homeLabel: '홈', writingsLabel: '기록' },
	home: {
		ctaLabel: '글 읽기',
		eyebrow: 'AI 시대 개발자 노트',
		previewLabel: '최신 글 미리 보기',
		questionEyebrow: '요즘 자주 생각하는 질문',
		questionItems: [
			'원하는 결과를 어디까지 쪼개야 에이전트가 헛돌지 않는가.',
			'좋은 구현은 코드보다 먼저 어떤 조건과 범위에서 결정되는가.',
			'개인의 명확함은 어떻게 팀의 병목 감소로 이어지는가.',
		],
		questionTitle: '개인의 명확함은 결국 팀의 신뢰와 병목 감소로 이어질 수 있을까.',
		title: 'Agentic 시대 개발자는 무엇을 집중 해야할지 고민 하고 학습합니다.',
		description:
			'이제는 개발자의 경쟁력은 문제 정의, 작업 분해, 명세, 그리고 결과를 설명 가능한 형태로 만드는 데서 성과를 만든다고 생각합니다. 이곳에는 개인의 사고를 더 또렷하게 만들고, 그 또렷함이 팀의 병목을 어떻게 줄일 수 있는지에 대한 기록을 남기고 있습니다.',
	},
	metadata: {
		baseDescription: '문제 정의, 작업 분해, 명세, 그리고 AI 시대의 개발 협업 방식에 대한 기록.',
		baseTitle: 'Minwoo Roh | AI 시대 개발자 노트',
		blogDescription:
			'문제 정의, 작업 분해, 명세, 그리고 개인의 명확함이 팀의 병목을 어떻게 줄이는지에 대한 기록.',
		blogTitle: 'Minwoo Roh | Writings',
	},
};

export const BLOG_COPY = {
	backToIndex: '목록으로 돌아가기',
	description:
		'이제는 개발자의 경쟁력은 문제 정의, 작업 분해, 명세, 그리고 결과를 설명 가능한 형태로 만드는 데서 성과를 만든다고 생각합니다. 이곳에는 개인의 사고를 더 또렷하게 만들고, 그 또렷함이 팀의 병목을 어떻게 줄일 수 있는지에 대한 기록을 남기고 있습니다.',
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
	title: '개발자의 사고력 키우기',
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
