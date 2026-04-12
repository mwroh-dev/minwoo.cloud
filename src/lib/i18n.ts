export const LOCALE_VALUES = { ENGLISH: 'en', KOREAN: 'ko' } as const;

type LocaleKey = keyof typeof LOCALE_VALUES;
export type Locale = (typeof LOCALE_VALUES)[LocaleKey];

export const ENGLISH_LOCALE = LOCALE_VALUES.ENGLISH;
export const KOREAN_LOCALE = LOCALE_VALUES.KOREAN;
export const DEFAULT_LOCALE = LOCALE_VALUES.KOREAN;
export const LOCALES = Object.values(LOCALE_VALUES) as Locale[];

export const LOCALE_LABEL: Record<Locale, string> = {
	[ENGLISH_LOCALE]: 'English',
	[KOREAN_LOCALE]: '한국어',
};

export const LOCALE_CODE_LABEL: Record<Locale, string> = {
	[ENGLISH_LOCALE]: 'EN',
	[KOREAN_LOCALE]: 'KO',
};

export const SITE_COPY = {
	[ENGLISH_LOCALE]: {
		footer: {
			copyright: 'Copyright © 2026 Minwoo Roh',
			description:
				'Editorial notes on software craft, career durability, and building with AI-native tools.',
			githubAriaLabel: 'GitHub',
			linkedinAriaLabel: 'LinkedIn',
			title: 'Cielo.dev',
		},
		header: { homeLabel: 'Home', writingsLabel: 'Writings' },
		home: {
			ctaLabel: 'Read writings',
			eyebrow: 'Developer notes for the AI era',
			previewLabel: 'Preview latest note',
			questionEyebrow: 'Questions I keep thinking about',
			questionItems: [
				'How far should a desired result be decomposed before an agent stops drifting?',
				'Which conditions and boundaries decide implementation quality before code is written?',
				'How can individual clarity reduce team bottlenecks?',
			],
			questionTitle: 'Can individual clarity really become team trust and fewer bottlenecks?',
			title: 'I keep thinking about what developers should focus on in the agentic era.',
			description:
				'I think developer leverage now comes from problem framing, task decomposition, specs, and making outcomes explainable. This is where I keep notes on sharpening individual thinking and on how that clarity can reduce team bottlenecks.',
		},
		metadata: {
			baseDescription:
				'Editorial notes on software craft, AI-native workflows, and how developers stay useful as agents get stronger.',
			baseTitle: 'Minwoo Roh | AI-Era Developer Notes',
			blogDescription:
				'A bilingual editorial blog about problem framing, task decomposition, and clearer developer workflows in the age of AI agents.',
			blogTitle: 'Minwoo Roh | Writings',
		},
	},
	[KOREAN_LOCALE]: {
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
	},
} satisfies Record<
	Locale,
	{
		footer: {
			copyright: string;
			description: string;
			githubAriaLabel: string;
			linkedinAriaLabel: string;
			title: string;
		};
		header: { homeLabel: string; writingsLabel: string };
		home: {
			ctaLabel: string;
			description: string;
			eyebrow: string;
			previewLabel: string;
			questionEyebrow: string;
			questionItems: string[];
			questionTitle: string;
			title: string;
		};
		metadata: {
			baseDescription: string;
			baseTitle: string;
			blogDescription: string;
			blogTitle: string;
		};
	}
>;

export const BLOG_COPY = {
	[ENGLISH_LOCALE]: {
		backToIndex: 'Back to archive',
		description:
			'I think developer leverage now comes from problem framing, task decomposition, specs, and making outcomes explainable. This archive is where I keep notes on sharpening individual thinking and on how that clarity can reduce team bottlenecks.',
		emptyDescription:
			'The Korean reading view is ready. The first essays will land here as the new direction takes shape.',
		emptyTitle: 'The Korean edition is still being assembled.',
		eyebrow: 'Notes and records',
		featuredLabel: 'Featured thread',
		focus: [
			'How far should a task be decomposed before an agent stops drifting?',
			'Which conditions and boundaries decide implementation quality before code is written?',
			'How does individual clarity reduce team bottlenecks?',
		],
		portalDescription:
			'A bilingual reading structure for essays, field notes, and slower opinions about building in the AI era.',
		portalLabel: 'Writings',
		portalLatestLabel: 'Latest',
		portalNoPosts:
			'No localized posts yet. This view is prepared so new essays can be published without reworking the structure later.',
		portalOpenLabel: 'Open edition',
		portalPublishedCount: (count: number) => `${count} published piece${count === 1 ? '' : 's'}`,
		portalTitle: 'Choose a reading edition.',
		readInLabel: 'Read in',
		readMore: 'Read essay',
		sectionLabel: 'Archive by thread',
		statusActive: 'Available now',
		statusSoon: 'Preparing now',
		switchLabel: 'View',
		title: 'Sharpening developer thinking.',
		translateLabel: 'Translate',
	},
	[KOREAN_LOCALE]: {
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
		portalDescription:
			'에세이와 필드 노트, 그리고 AI 시대 개발자의 생존 전략을 담기 위한 이중 언어형 블로그 구조입니다.',
		portalLabel: 'Writings',
		portalLatestLabel: '가장 최근 글',
		portalNoPosts:
			'아직 한국어 글은 없습니다. 다만 이후 글이 추가되어도 구조를 다시 뜯어고치지 않도록 에디션 뷰를 먼저 준비해두었습니다.',
		portalOpenLabel: '에디션 열기',
		portalPublishedCount: (count: number) => `게시된 글 ${count}개`,
		portalTitle: '읽을 에디션을 고르세요.',
		readInLabel: '다른 언어로 읽기',
		readMore: '글 읽기',
		sectionLabel: '주제별 아카이브',
		statusActive: '지금 읽을 수 있음',
		statusSoon: '준비 중',
		switchLabel: 'View',
		title: '개발자의 사고력 키우기',
		translateLabel: 'Translate',
	},
} satisfies Record<
	Locale,
	{
		backToIndex: string;
		description: string;
		emptyDescription: string;
		emptyTitle: string;
		eyebrow: string;
		featuredLabel: string;
		focus: string[];
		portalDescription: string;
		portalLabel: string;
		portalLatestLabel: string;
		portalNoPosts: string;
		portalOpenLabel: string;
		portalPublishedCount: (count: number) => string;
		portalTitle: string;
		readInLabel: string;
		readMore: string;
		sectionLabel: string;
		statusActive: string;
		statusSoon: string;
		switchLabel: string;
		title: string;
		translateLabel: string;
	}
>;

export function isLocale(value: string): value is Locale {
	return LOCALES.includes(value as Locale);
}

export function getPostDateLabel({ date, locale }: { date: string; locale: Locale }) {
	return new Intl.DateTimeFormat(locale === KOREAN_LOCALE ? 'ko-KR' : 'en-US', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	}).format(new Date(`${date}T00:00:00`));
}

export function getReadingTimeLabel({ locale, minutes }: { locale: Locale; minutes: number }) {
	return locale === KOREAN_LOCALE ? `${minutes}분 읽기` : `${minutes} min read`;
}

export function getAlternateLocale(locale: Locale): Locale {
	return locale === ENGLISH_LOCALE ? KOREAN_LOCALE : ENGLISH_LOCALE;
}

export function getLocaleBlogPath(locale: Locale) {
	return locale === DEFAULT_LOCALE ? '/blog' : `/${locale}/blog`;
}

export function getLocalizedBlogPostPath({ locale, slug }: { locale: Locale; slug: string }) {
	const archivePath = getLocaleBlogPath(locale);

	return `${archivePath}/${slug}`;
}
