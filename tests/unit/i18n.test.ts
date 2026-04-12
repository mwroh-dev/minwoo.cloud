import { describe, expect, it } from 'vitest';

import {
	ENGLISH_LOCALE,
	getAlternateLocale,
	getLocaleBlogPath,
	getLocalizedBlogPostPath,
	getPostDateLabel,
	getReadingTimeLabel,
	isLocale,
	KOREAN_LOCALE,
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
});
