export const LOCALES = ['en', 'ko'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'ko';

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
			'Essays on judgment, systems taste, and the parts of software work that stay stubbornly human.',
		emptyDescription:
			'The Korean reading view is ready. The first essays will land here as the new direction takes shape.',
		emptyTitle: 'The Korean edition is still being assembled.',
		eyebrow: 'Editorial notebook',
		featuredLabel: 'Featured thread',
		focus: [
			'Agent workflows and where developer leverage still compounds',
			'Operational taste: shipping software beyond prompt demos',
			'Career durability in an industry rewritten by models',
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
		title: 'Notes for developers learning to operate in the age of AI agents.',
		translateLabel: 'Translate',
	},
	ko: {
		backToIndex: '목록으로 돌아가기',
		description:
			'AI 시대에 개발자가 어떤 감각을 지켜야 하는지, 어떤 역량이 더 중요해지는지에 대한 글을 담아갑니다.',
		emptyDescription:
			'구조는 먼저 준비해두었습니다. 한국어 에세이와 노트는 이 리뉴얼 방향에 맞춰 곧 채워질 예정입니다.',
		emptyTitle: '한국어 에디션은 이제 막 틀을 잡고 있습니다.',
		eyebrow: '에디토리얼 노트북',
		featuredLabel: '대표 글',
		focus: [
			'에이전트 워크플로우 안에서 개발자 레버리지가 남는 지점',
			'프롬프트 데모를 넘어 실제 소프트웨어를 만드는 운영 감각',
			'모델이 바꾸는 산업 안에서 오래가는 커리어 전략',
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
		title: 'AI 에이전트의 시대를 통과하는 개발자를 위한 메모.',
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
