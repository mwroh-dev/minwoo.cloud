import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './tests/e2e',
	retries: process.env.CI ? 1 : 0,
	fullyParallel: false,
	use: { baseURL: 'http://127.0.0.1:3001', trace: 'retain-on-failure' },
	webServer: {
		command: 'npx next start -p 3001',
		url: 'http://127.0.0.1:3001',
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
