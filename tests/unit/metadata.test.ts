import { afterEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_LOCALE, SITE_COPY } from '@/lib/i18n';
import { buildMetadata } from '@/lib/metadata';
import { BLOG_URL } from '@/lib/post';

afterEach(() => {
	vi.unstubAllEnvs();
});

describe('buildMetadata', () => {
	it('uses the default site metadata outside production', () => {
		vi.stubEnv('NODE_ENV', 'development');

		const metadata = buildMetadata();
		const defaultMetadataCopy = SITE_COPY[DEFAULT_LOCALE].metadata;

		expect(metadata.metadataBase?.toString()).toBe('http://localhost:3000/');
		expect(metadata.title).toBe(defaultMetadataCopy.baseTitle);
		expect(metadata.description).toBe(defaultMetadataCopy.baseDescription);
		expect(metadata.openGraph).toMatchObject({
			description: defaultMetadataCopy.baseDescription,
			title: defaultMetadataCopy.baseTitle,
			type: 'website',
			url: BLOG_URL,
		});
		expect(metadata.twitter).toMatchObject({
			card: 'summary_large_image',
			description: defaultMetadataCopy.baseDescription,
			title: defaultMetadataCopy.baseTitle,
		});
	});

	it('builds production metadata from explicit overrides', () => {
		vi.stubEnv('NODE_ENV', 'production');

		const metadata = buildMetadata({
			description: 'Custom description',
			thumbnail: '/custom-og.png',
			title: 'Custom title',
			url: `${BLOG_URL}/en/blog/custom-note`,
		});

		expect(metadata.metadataBase?.toString()).toBe(`${BLOG_URL}/`);
		expect(metadata.openGraph).toMatchObject({
			description: 'Custom description',
			title: 'Custom title',
			type: 'website',
			url: `${BLOG_URL}/en/blog/custom-note`,
		});
		expect(metadata.openGraph?.images).toEqual([
			{ alt: 'Custom title', height: 630, url: '/custom-og.png', width: 1200 },
		]);
		expect(metadata.twitter).toMatchObject({
			card: 'summary_large_image',
			description: 'Custom description',
			title: 'Custom title',
		});
	});
});
