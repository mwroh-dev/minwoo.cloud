import { describe, expect, it } from 'vitest';

import nextConfig, { CONTENT_SECURITY_POLICY, SECURITY_HEADERS } from '../../next.config';
import { getSafeHref, isExternalHttpHref, isSafeHref } from '@/lib/security';

function getHeaderValue(key: string) {
	return SECURITY_HEADERS.find(header => header.key === key)?.value;
}

describe('security link helpers', () => {
	it.each([
		{ href: '/ko/blog', safeHref: '/ko/blog' },
		{ href: './relative-note', safeHref: './relative-note' },
		{ href: '../archive', safeHref: '../archive' },
		{ href: '#footnote-1', safeHref: '#footnote-1' },
		{ href: 'https://example.com', safeHref: 'https://example.com' },
		{ href: 'mailto:test@example.com', safeHref: 'mailto:test@example.com' },
		{ href: 'tel:+821012345678', safeHref: 'tel:+821012345678' },
	])('accepts safe href %s', ({ href, safeHref }) => {
		expect(isSafeHref(href)).toBe(true);
		expect(getSafeHref(href)).toBe(safeHref);
	});

	it.each([
		'//evil.example.com',
		'javascript:alert(1)',
		'data:text/html;base64,PHNjcmlwdD4=',
		undefined,
	])('rejects unsafe href %s', href => {
		expect(isSafeHref(href)).toBe(false);
		expect(getSafeHref(href)).toBeUndefined();
	});

	it.each([
		{ expected: true, href: 'https://example.com' },
		{ expected: true, href: 'http://example.com' },
		{ expected: false, href: '/ko/blog' },
		{ expected: false, href: 'mailto:test@example.com' },
	])('classifies external http candidate %s', ({ expected, href }) => {
		expect(isExternalHttpHref(href)).toBe(expected);
	});
});

describe('next security headers', () => {
	it('builds a content security policy for runtime assets and analytics', () => {
		expect(CONTENT_SECURITY_POLICY).toContain("default-src 'self'");
		expect(CONTENT_SECURITY_POLICY).toContain("frame-ancestors 'none'");
		expect(CONTENT_SECURITY_POLICY).toContain('https://www.googletagmanager.com');
		expect(CONTENT_SECURITY_POLICY).toContain('https://*.google-analytics.com');
	});

	it('applies hardening headers to all routes', async () => {
		const headers = await nextConfig.headers?.();

		expect(headers).toEqual([{ source: '/(.*)', headers: [...SECURITY_HEADERS] }]);
		expect(getHeaderValue('X-Content-Type-Options')).toBe('nosniff');
		expect(getHeaderValue('X-Frame-Options')).toBe('DENY');
		expect(getHeaderValue('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
	});
});
