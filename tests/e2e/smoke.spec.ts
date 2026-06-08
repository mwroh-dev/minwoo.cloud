import { expect, test } from '@playwright/test';

test('home renders and links to the default writings archive @smoke', async ({ page }) => {
	await page.goto('/');

	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

	const archiveLink = page.getByRole('link', { name: '글 읽기' });
	await expect(archiveLink).toHaveAttribute('href', '/blog');

	await archiveLink.click();
	await expect(page).toHaveURL('/blog');
});

test('home preview link reaches the sample post @smoke', async ({ page }) => {
	await page.goto('/');

	const previewLink = page.getByRole('link', { name: '최신 글 미리 보기' });
	await expect(previewLink).toHaveAttribute('href', '/blog/growth-team-mindset');

	await previewLink.click();
	await expect(page).toHaveURL('/blog/growth-team-mindset');
});

test('default archive renders the Korean writings view @smoke', async ({ page }) => {
	await page.goto('/blog');

	await expect(page.getByRole('heading', { level: 1 })).toContainText(
		'에이전트 시대의 판단력 키우기',
	);
	await expect(page.getByText('메모와 기록')).toBeVisible();
});

test('sample post detail renders on the canonical route @smoke', async ({ page }) => {
	await page.goto('/blog/growth-team-mindset');

	await expect(page.getByRole('heading', { level: 1 })).toContainText(
		'구현을 위임할수록 앞단은 무거워야한다',
	);
});

test('missing blog post renders a 404 page @smoke', async ({ page }) => {
	const response = await page.goto('/blog/missing-note');

	expect(response?.status()).toBe(404);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('404');
});
