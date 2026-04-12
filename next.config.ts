import type { NextConfig } from 'next';

import createMDX from '@next/mdx';

export const CONTENT_SECURITY_POLICY = [
	"default-src 'self'",
	"base-uri 'self'",
	"form-action 'self'",
	"frame-ancestors 'none'",
	"object-src 'none'",
	"script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' data: blob: https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com",
	"font-src 'self' data:",
	"connect-src 'self' https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com",
	"media-src 'self' blob:",
	'upgrade-insecure-requests',
].join('; ');

export const SECURITY_HEADERS = [
	{ key: 'Content-Security-Policy', value: CONTENT_SECURITY_POLICY },
	{
		key: 'Permissions-Policy',
		value: 'camera=(), geolocation=(), microphone=(), payment=(), usb=()',
	},
	{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
	{ key: 'X-Content-Type-Options', value: 'nosniff' },
	{ key: 'X-Frame-Options', value: 'DENY' },
] as const;

const nextConfig: NextConfig = {
	async headers() {
		return [{ source: '/(.*)', headers: [...SECURITY_HEADERS] }];
	},
	pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
	reactStrictMode: true,
	experimental: { optimizeCss: true },
};

const withMDX = createMDX({ extension: /\.mdx?$/ });

export default withMDX(nextConfig);
