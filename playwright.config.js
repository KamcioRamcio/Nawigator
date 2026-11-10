import {defineConfig, devices} from '@playwright/test';

const PORT = 8899;

export default defineConfig({
    testDir: './e2e',
    fullyParallel: false,
    workers: 1, // one shared database
    retries: 0,
    reporter: [['list'], ['html', {open: 'never'}]],
    use: {
        baseURL: `http://localhost:${PORT}`,
        locale: 'pl-PL',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: [
        {name: 'desktop', use: {...devices['Desktop Chrome'], viewport: {width: 1366, height: 768}}},
    ],
    webServer: {
        command: 'npm run build && node e2e/start-server.mjs',
        url: `http://localhost:${PORT}/api/health`,
        reuseExistingServer: false,
        timeout: 120_000,
        env: {PORT: String(PORT)},
    },
});
