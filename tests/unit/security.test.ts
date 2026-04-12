import { describe, expect, it } from 'vitest';

import nextConfig, { CONTENT_SECURITY_POLICY, SECURITY_HEADERS } from '../../next.config';
import { getSafeHref, isExternalHttpHref, isSafeHref } from '@/lib/security';

function getHeaderValue(key: string) {
	return SECURITY_HEADERS.find((header) => header.key === key)?.value;
}

describe('security link helpers', () => {
	it('allows safe internal and absolute hrefs', () => {
		expect(isSafeHref('/ko/blog')).toBe(true);
		expect(isSafeHref('./relative-note')).toBe(true);
		expect(isSafeHref('../archive')).toBe(true);
		expect(isSafeHref('#footnote-1')).toBe(true);
		expect(isSafeHref('https://example.com')).toBe(true);
		expect(isSafeHref('mailto:test@example.com')).toBe(true);
		expect(getSafeHref('tel:+821012345678')).toBe('tel:+821012345678');
	});

	it('rejects unsafe href schemes', () => {
		expect(isSafeHref('//evil.example.com')).toBe(false);
		expect(isSafeHref('javascript:alert(1)')).toBe(false);
		expect(isSafeHref('data:text/html;base64,PHNjcmlwdD4=')).toBe(false);
		expect(getSafeHref('javascript:alert(1)')).toBeUndefined();
	});

	it('detects only external http links as tab-opening candidates', () => {
		expect(isExternalHttpHref('https://example.com')).toBe(true);
		expect(isExternalHttpHref('http://example.com')).toBe(true);
		expect(isExternalHttpHref('/ko/blog')).toBe(false);
		expect(isExternalHttpHref('mailto:test@example.com')).toBe(false);
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
