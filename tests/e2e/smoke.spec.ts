import { expect, test } from '@playwright/test';

test('home renders and links to the default writings archive @smoke', async ({ page }) => {
	await page.goto('/');

	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

	const archiveLink = page.getByRole('link', { name: '글 읽기' });
	await expect(archiveLink).toHaveAttribute('href', '/blog');

	await archiveLink.click();
	await expect(page).toHaveURL('/blog');
});

test('default archive renders the Korean writings view @smoke', async ({ page }) => {
	await page.goto('/blog');

	await expect(page.getByRole('heading', { level: 1 })).toContainText(
		'문제를 잘게 쪼개고 조건을 더 또렷하게 만들기 위해 남기는 메모',
	);
	await expect(page.getByText('메모와 기록')).toBeVisible();
	await expect(page.getByRole('link', { name: 'EN' })).toBeVisible();
});

test('english archive is reachable from its localized route @smoke', async ({ page }) => {
	await page.goto('/en/blog');

	await expect(page.getByRole('heading', { level: 1 })).toContainText(
		'Notes from trying to break problems into clearer tasks and conditions.',
	);
	await expect(page.getByRole('link', { name: 'KO' })).toBeVisible();
});

test('korean sample post detail renders on the localized route @smoke', async ({ page }) => {
	await page.goto('/ko/blog/survivorship-bias-and-failure-hooks');

	await expect(page.getByRole('heading', { level: 1 })).toContainText(
		'레시피의 시대에 더 자주 떠올리는 것, 생존자 편향',
	);
	await expect(page.getByText('Translate')).toBeVisible();
});

test('legacy blog slug redirects to the localized detail route @smoke', async ({ page }) => {
	await page.goto('/blog/survivorship-bias-and-failure-hooks');

	await expect(page).toHaveURL(/\/ko\/blog\/survivorship-bias-and-failure-hooks$/);
	await expect(page.getByRole('heading', { level: 1 })).toContainText('생존자 편향');
});
