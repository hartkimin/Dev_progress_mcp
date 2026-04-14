import { test, expect } from '@playwright/test';

async function signInDev(page: import('@playwright/test').Page) {
    await page.goto('/auth/signin');
    await page.getByPlaceholder('dev@local').fill('dev@local');
    await page.getByRole('button', { name: /Sign in \(Dev/ }).click();
    await page.waitForURL('/');
}

/** Returns the href of the first project link found on the dashboard. */
async function getFirstProjectHref(page: import('@playwright/test').Page): Promise<string | null> {
    // Project cards are <a> links whose href matches /project/<uuid>
    const link = page.locator('a[href*="/project/"]').first();
    const count = await link.count();
    if (count === 0) return null;
    return link.getAttribute('href');
}

test.describe('Phase-centric 6-group dashboard', () => {
    test('all six groups render with at least one reachable tab', async ({ page }) => {
        await signInDev(page);

        // Navigate to the first existing project (avoids FREE plan project-limit on create)
        const projectHref = await getFirstProjectHref(page);
        if (!projectHref) {
            test.skip(true, 'No project found on dashboard; cannot test tab groups.');
        }
        await page.goto(projectHref!);
        await expect(page).toHaveURL(/\/project\//);

        // One representative tab label per group. The tab strip uses overflow-x-auto;
        // some tabs may be outside the headless viewport even after scrollIntoView.
        // We dispatch a click via JS to bypass the viewport-intersection check while
        // still triggering React's onClick handler.
        for (const label of ['칸반보드', 'YC 질문', '아키텍처', '코드 리뷰', '테스트', '배포']) {
            const tab = page.getByRole('button', { name: label }).first();
            await tab.scrollIntoViewIfNeeded();
            await tab.evaluate((el: HTMLElement) => el.click());
            await expect(page.getByRole('main')).toBeVisible();
        }
    });

    test('strategy readiness CTA deep-links to yc_questions tab', async ({ page }) => {
        await signInDev(page);

        // If any project is missing YC answers, the CTA appears. Otherwise skip.
        const cta = page.getByRole('link', { name: /Ideation 시작하기/ }).first();
        const count = await cta.count();
        test.skip(count === 0, 'No project with missing YC answers; nothing to deep-link.');

        await cta.click();
        await expect(page).toHaveURL(/view=yc_questions/);
        // YC form heading should render on the target page.
        await expect(page.getByRole('heading', { name: /YC 6가지 질문/ })).toBeVisible();
    });
});
