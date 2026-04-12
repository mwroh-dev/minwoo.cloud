import { describe, expect, it } from 'vitest';

import {
	BLOG_COPY,
	ENGLISH_LOCALE,
	getAlternateLocale,
	getLocaleBlogPath,
	getLocalizedBlogPostPath,
	getPostDateLabel,
	getReadingTimeLabel,
	isLocale,
	KOREAN_LOCALE,
	LOCALE_CODE_LABEL,
	LOCALE_LABEL,
	SITE_COPY,
} from '@/lib/i18n';

describe('locale helpers', () => {
	it.each([
		{ expected: true, value: ENGLISH_LOCALE },
		{ expected: true, value: KOREAN_LOCALE },
		{ expected: false, value: 'jp' },
		{ expected: false, value: 'english' },
	])('classifies $value as locale = $expected', ({ expected, value }) => {
		expect(isLocale(value)).toBe(expected);
	});

	it('returns the opposite locale for alternates', () => {
		expect(getAlternateLocale(ENGLISH_LOCALE)).toBe(KOREAN_LOCALE);
		expect(getAlternateLocale(KOREAN_LOCALE)).toBe(ENGLISH_LOCALE);
	});

	it.each([
		{ expected: '/blog', locale: KOREAN_LOCALE },
		{ expected: '/en/blog', locale: ENGLISH_LOCALE },
	])('builds the archive path for $locale', ({ expected, locale }) => {
		expect(getLocaleBlogPath(locale)).toBe(expected);
	});

	it.each([
		{ expected: '/blog/shared-note', locale: KOREAN_LOCALE, slug: 'shared-note' },
		{ expected: '/en/blog/shared-note', locale: ENGLISH_LOCALE, slug: 'shared-note' },
	])('builds the localized post path for $locale', ({ expected, locale, slug }) => {
		expect(getLocalizedBlogPostPath({ locale, slug })).toBe(expected);
	});

	it('formats post dates for Korean and English readers', () => {
		expect(getPostDateLabel({ date: '2026-04-11', locale: ENGLISH_LOCALE })).toBe('Apr 11, 2026');
		expect(getPostDateLabel({ date: '2026-04-11', locale: KOREAN_LOCALE })).toBe('2026년 4월 11일');
	});

	it.each([
		{ expected: '5 min read', locale: ENGLISH_LOCALE, minutes: 5 },
		{ expected: '7분 읽기', locale: KOREAN_LOCALE, minutes: 7 },
	])('formats reading time labels for $locale', ({ expected, locale, minutes }) => {
		expect(getReadingTimeLabel({ locale, minutes })).toBe(expected);
	});

	it('exposes locale labels for archive and detail switches', () => {
		expect(LOCALE_LABEL[ENGLISH_LOCALE]).toBe('English');
		expect(LOCALE_LABEL[KOREAN_LOCALE]).toBe('한국어');
		expect(LOCALE_CODE_LABEL[ENGLISH_LOCALE]).toBe('EN');
		expect(LOCALE_CODE_LABEL[KOREAN_LOCALE]).toBe('KO');
	});

	it('keeps localized home and archive copy aligned with the updated editorial framing', () => {
		expect(SITE_COPY[ENGLISH_LOCALE].home.questionEyebrow).toBe('Questions I keep thinking about');
		expect(SITE_COPY[ENGLISH_LOCALE].home.title).toBe(
			'I keep thinking about what developers should focus on in the agentic era.',
		);
		expect(BLOG_COPY[ENGLISH_LOCALE].title).toBe('Sharpening developer thinking.');
		expect(SITE_COPY[KOREAN_LOCALE].home.questionEyebrow).toBe('요즘 자주 생각하는 질문');
		expect(BLOG_COPY[KOREAN_LOCALE].title).toBe('개발자의 사고력 키우기');
	});
});
