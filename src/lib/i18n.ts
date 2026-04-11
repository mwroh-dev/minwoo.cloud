export const LOCALES = ['en', 'ko'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'ko';
export const ENGLISH_LOCALE: Locale = 'en';
export const KOREAN_LOCALE: Locale = 'ko';

export const LOCALE_LABEL: Record<Locale, string> = {
	en: 'English',
	ko: '한국어',
};

export const LOCALE_CODE_LABEL: Record<Locale, string> = {
	en: 'EN',
	ko: 'KO',
};

export const BLOG_COPY = {
	en: {
		backToIndex: 'Back to archive',
		description:
			'I have been thinking a lot about how developer leverage is shifting away from typing speed and toward problem framing, task decomposition, specs, verification, and making outcomes explainable. This archive is where I keep notes on how individual clarity can turn into team trust and fewer bottlenecks.',
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
		title: 'Notes from trying to break problems into clearer tasks and conditions.',
		translateLabel: 'Translate',
	},
	ko: {
		backToIndex: '목록으로 돌아가기',
		description:
			'저는 요즘 개발자의 경쟁력이 구현 속도보다 문제 정의, 작업 분해, 명세, 검증, 그리고 결과를 설명 가능한 상태로 만드는 데서 갈린다고 생각합니다. 이곳에는 개인의 명확함이 어떻게 팀의 신뢰와 병목 감소로 이어지는지에 대한 기록을 남기고 있습니다.',
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
		title: '문제를 잘게 쪼개고 조건을 더 또렷하게 만들기 위해 남기는 메모',
		translateLabel: 'Translate',
	},
} satisfies Record<
	Locale,
	{
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
		backToIndex: string;
	}
>;

export function isLocale(value: string): value is Locale {
	return LOCALES.includes(value as Locale);
}

export function getPostDateLabel(date: string, locale: Locale) {
	return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	}).format(new Date(`${date}T00:00:00`));
}

export function getReadingTimeLabel(minutes: number, locale: Locale) {
	return locale === 'ko' ? `${minutes}분 읽기` : `${minutes} min read`;
}

export function getAlternateLocale(locale: Locale): Locale {
	return locale === 'en' ? 'ko' : 'en';
}

export function getLocaleBlogPath(locale: Locale) {
	return locale === DEFAULT_LOCALE ? '/blog' : `/${locale}/blog`;
}

export function getLocalizedBlogPostPath(locale: Locale, slug: string) {
	const archivePath = getLocaleBlogPath(locale);

	return `${archivePath}/${slug}`;
}
