import { expect, test } from '@playwright/test';

test('home renders and links to the default writings archive @smoke', async ({ page }) => {
	await page.goto('/');

	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

	const archiveLink = page.getByRole('link', { name: '글 읽기' });
	await expect(archiveLink).toHaveAttribute('href', '/blog');

	await archiveLink.click();
	await expect(page).toHaveURL('/blog');
});

test('home preview link reaches the localized sample post @smoke', async ({ page }) => {
	await page.goto('/');

	const previewLink = page.getByRole('link', { name: '최신 글 미리 보기' });
	await expect(previewLink).toHaveAttribute('href', '/blog/survivorship-bias-and-failure-hooks');

	await previewLink.click();
	await expect(page).toHaveURL('/ko/blog/survivorship-bias-and-failure-hooks');
});

test('default archive renders the Korean writings view @smoke', async ({ page }) => {
	await page.goto('/blog');

	await expect(page.getByRole('heading', { level: 1 })).toContainText('개발자의 사고력 키우기');
	await expect(page.getByText('메모와 기록')).toBeVisible();
	await expect(page.getByRole('link', { name: 'EN' })).toBeVisible();
});

test('korean locale archive redirects to the default archive route @smoke', async ({ page }) => {
	await page.goto('/ko/blog');

	await expect(page).toHaveURL('/blog');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('개발자의 사고력 키우기');
});

test('english archive is reachable from its localized route @smoke', async ({ page }) => {
	await page.goto('/en/blog');

	await expect(page.getByRole('heading', { level: 1 })).toContainText(
		'Sharpening developer thinking.',
	);
	await expect(page.getByRole('link', { name: 'KO' })).toBeVisible();
});

test('archive locale toggles keep localized routes reachable @smoke', async ({ page }) => {
	await page.goto('/en/blog');

	await page.getByRole('link', { name: 'KO' }).click();
	await expect(page).toHaveURL('/blog');

	await page.getByRole('link', { name: 'EN' }).click();
	await expect(page).toHaveURL('/en/blog');
});

test('korean sample post detail renders on the localized route @smoke', async ({ page }) => {
	await page.goto('/ko/blog/survivorship-bias-and-failure-hooks');

	await expect(page.getByRole('heading', { level: 1 })).toContainText(
		'레시피의 시대에 더 자주 떠올리는 것, 생존자 편향',
	);
	await expect(page.getByText('Translate')).toBeVisible();
});

test('detail translation toggle disables missing alternates @smoke', async ({ page }) => {
	await page.goto('/ko/blog/survivorship-bias-and-failure-hooks');

	await expect(page.getByText('Translate')).toBeVisible();
	await expect(page.locator('span[aria-disabled="true"]')).toContainText('EN');
	await expect(page.getByRole('link', { name: 'EN' })).toHaveCount(0);
});

test('legacy blog slug redirects to the localized detail route @smoke', async ({ page }) => {
	await page.goto('/blog/survivorship-bias-and-failure-hooks');

	await expect(page).toHaveURL(/\/ko\/blog\/survivorship-bias-and-failure-hooks$/);
	await expect(page.getByRole('heading', { level: 1 })).toContainText('생존자 편향');
});

test('invalid localized archive routes render a 404 page @smoke', async ({ page }) => {
	const response = await page.goto('/jp/blog');

	expect(response?.status()).toBe(404);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('404');
});

test('invalid localized detail routes render a 404 page @smoke', async ({ page }) => {
	const response = await page.goto('/en/blog/missing-note');

	expect(response?.status()).toBe(404);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('404');
});
