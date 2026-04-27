import { describe, expect, it } from 'vitest';

import {
	BLOG_COPY,
	getLocaleBlogPath,
	getLocalizedBlogPostPath,
	getPostDateLabel,
	getReadingTimeLabel,
	KOREAN_LOCALE,
	LOCALE_LABEL,
	SITE_COPY,
} from '@/lib/i18n';

describe('locale helpers', () => {
	it('returns the blog archive path', () => {
		expect(getLocaleBlogPath()).toBe('/blog');
	});

	it('builds the post path', () => {
		expect(getLocalizedBlogPostPath({ slug: 'shared-note' })).toBe('/blog/shared-note');
	});

	it('formats post dates for Korean readers', () => {
		expect(getPostDateLabel({ date: '2026-04-11' })).toBe('2026년 4월 11일');
	});

	it('formats reading time in Korean', () => {
		expect(getReadingTimeLabel({ minutes: 7 })).toBe('7분 읽기');
	});

	it('exposes the Korean locale label', () => {
		expect(LOCALE_LABEL[KOREAN_LOCALE]).toBe('한국어');
	});

	it('keeps Korean home and blog copy aligned with the editorial framing', () => {
		expect(SITE_COPY[KOREAN_LOCALE].home.questionEyebrow).toBe('요즘 자주 생각하는 질문');
		expect(SITE_COPY[KOREAN_LOCALE].home.title).toBe(
			'Agentic 시대 개발자는 무엇을 집중 해야할지 고민 하고 학습합니다.',
		);
		expect(BLOG_COPY[KOREAN_LOCALE].title).toBe('개발자의 사고력 키우기');
	});
});
